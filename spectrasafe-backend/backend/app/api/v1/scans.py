"""
POST /api/v1/scans      — upload a label photo, run OCR + compliance, persist it (SHOPKEEPER only)
GET  /api/v1/scans       — list scans: SHOPKEEPER sees their own, FSSAI sees all
GET  /api/v1/scans/{id}  — full detail for one scan (same scoping as list)
"""
import shutil
import tempfile
import uuid
from pathlib import Path
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse


from app.core.database import get_db
from app.core.deps import require_role
from app.models.scan import Scan, ComplianceStatus
from app.models.user import User, UserRole
from app.schemas.scan import ScanOut, ScanSummary
from app.services import ocr_pipeline
from app.services.compliance_service import run_compliance_check, classify_violation_types
from app.services.verification_service import verify_against_registry
from app.services import geocoding_service
from app.models.scan import Scan, ComplianceStatus

router = APIRouter(prefix="/api/v1/scans", tags=["scans"])

_ALLOWED_SUFFIXES = {".jpg", ".jpeg", ".png"}
_require_shopkeeper = require_role(UserRole.SHOPKEEPER)
_require_shopkeeper_or_fssai = require_role(UserRole.SHOPKEEPER, UserRole.FSSAI)


@router.post("/", response_model=ScanOut)
def create_scan(
    file: UploadFile = File(...),
    location: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_shopkeeper),
):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in _ALLOWED_SUFFIXES:
        raise HTTPException(400, f"Unsupported file type '{suffix}'. Use jpg/jpeg/png.")

    # The pipeline reads from a real file path (cv2.imread), so the
    # upload has to hit disk before run_pipeline() can use it.
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        extracted = ocr_pipeline.run_pipeline(tmp_path)
    except Exception as e:
        raise HTTPException(500, f"OCR pipeline failed: {e}")
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    compliance = run_compliance_check(extracted)
    violation_types = classify_violation_types(compliance)
    verification = verify_against_registry(extracted, db)

    # A registered product's own data disagreeing with what was scanned is
    # a stronger signal than anything label-only compliance checks can
    # see -- escalate to SUSPICIOUS rather than leaving it at whatever
    # run_compliance_check() decided from the label alone. NOT_REGISTERED
    # is deliberately NOT escalated the same way: a sparsely-populated
    # registry means most scans won't match yet, and that alone isn't
    # evidence of anything wrong with the product.
    status = ComplianceStatus(compliance["status"])
    if verification["status"] == "MATCHED_WITH_DISCREPANCIES":
        status = ComplianceStatus.SUSPICIOUS

    coords = geocoding_service.geocode(location)

    scan = Scan(
        id=uuid.uuid4(),
        image_filename=file.filename,
        fssai_license=extracted.get("fssai_license"),
        matched_product_id=verification.get("matched_product_id"),
        scanned_by_user_id=current_user.id,
        compliance_status=status,
        compliance_score=compliance["score"],
        violation_types=violation_types,
        location_text=location,
        latitude=coords[0] if coords else None,
        longitude=coords[1] if coords else None,
        ocr_result=extracted,
        compliance_result=compliance,
        product_verification=verification,
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return scan


@router.patch("/{scan_id}/license", response_model=ScanOut)
def rescan_license(
    scan_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_shopkeeper),
):
    scan = db.get(Scan, scan_id)
    if scan is None or scan.scanned_by_user_id != current_user.id:
        raise HTTPException(404, "Scan not found")

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in _ALLOWED_SUFFIXES:
        raise HTTPException(400, f"Unsupported file type '{suffix}'. Use jpg/jpeg/png.")

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        license_value = ocr_pipeline.rescan_fssai_license(tmp_path)
    except Exception as e:
        raise HTTPException(500, f"License rescan failed: {e}")
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    if not license_value:
        raise HTTPException(
            422,
            "No FSSAI license number detected in this photo. Try a clearer, closer shot of just the license text.",
        )

    # Recompute compliance/verification with the corrected license,
    # without re-running the full OCR pipeline on the original image --
    # everything else it extracted (ingredients, nutrients, banned-term
    # hits, trans-fat check) is unaffected by this correction.
    extracted = dict(scan.ocr_result)
    extracted["fssai_license"] = license_value

    compliance = run_compliance_check(extracted)
    violation_types = classify_violation_types(compliance)
    verification = verify_against_registry(extracted, db)

    status = ComplianceStatus(compliance["status"])
    if verification["status"] == "MATCHED_WITH_DISCREPANCIES":
        status = ComplianceStatus.SUSPICIOUS

    scan.fssai_license = license_value
    scan.ocr_result = extracted
    scan.compliance_result = compliance
    scan.compliance_status = status
    scan.compliance_score = compliance["score"]
    scan.violation_types = violation_types
    scan.matched_product_id = verification.get("matched_product_id")
    scan.product_verification = verification

    db.commit()
    db.refresh(scan)
    return scan

@router.post("/batch")
def create_batch_scan(
    files: list[UploadFile] = File(...),
    location: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_shopkeeper),
):
    if len(files) > 20:
        raise HTTPException(400, "Maximum 20 files per batch")

    # Geocode once for the whole batch -- same shop visit, same location,
    # no reason to hit Nominatim per file.
    coords = geocoding_service.geocode(location)

    scans_out = []
    errors = []

    for file in files:
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in _ALLOWED_SUFFIXES:
            errors.append({"filename": file.filename, "error": f"Unsupported file type '{suffix}'"})
            continue

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        try:
            extracted = ocr_pipeline.run_pipeline(tmp_path)
        except Exception as e:
            errors.append({"filename": file.filename, "error": f"OCR pipeline failed: {e}"})
            continue
        finally:
            Path(tmp_path).unlink(missing_ok=True)

        try:
            compliance = run_compliance_check(extracted)
            violation_types = classify_violation_types(compliance)
            verification = verify_against_registry(extracted, db)

            status = ComplianceStatus(compliance["status"])
            if verification["status"] == "MATCHED_WITH_DISCREPANCIES":
                status = ComplianceStatus.SUSPICIOUS

            scan = Scan(
                id=uuid.uuid4(),
                image_filename=file.filename,
                fssai_license=extracted.get("fssai_license"),
                matched_product_id=verification.get("matched_product_id"),
                scanned_by_user_id=current_user.id,
                compliance_status=status,
                compliance_score=compliance["score"],
                violation_types=violation_types,
                location_text=location,
                latitude=coords[0] if coords else None,
                longitude=coords[1] if coords else None,
                ocr_result=extracted,
                compliance_result=compliance,
                product_verification=verification,
            )
            db.add(scan)
            db.commit()
            db.refresh(scan)
            scans_out.append(ScanOut.model_validate(scan))
        except Exception as e:
            db.rollback()
            errors.append({"filename": file.filename, "error": str(e)})

    return JSONResponse(
        content=[s.model_dump(mode="json") for s in scans_out],
        headers={"X-Batch-Errors": json.dumps(errors)},
    )

@router.get("/", response_model=list[ScanSummary])
def list_scans(
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_shopkeeper_or_fssai),
    limit: int = 50,
    status: ComplianceStatus | None = None,
):
    query = db.query(Scan)
    if current_user.role == UserRole.SHOPKEEPER:
        query = query.filter(Scan.scanned_by_user_id == current_user.id)
    if status is not None:
        query = query.filter(Scan.compliance_status == status)
    return query.order_by(Scan.created_at.desc()).limit(limit).all()


@router.get("/{scan_id}", response_model=ScanOut)
def get_scan(
    scan_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_shopkeeper_or_fssai),
):
    scan = db.get(Scan, scan_id)
    if scan is None:
        raise HTTPException(404, "Scan not found")
    if current_user.role == UserRole.SHOPKEEPER and scan.scanned_by_user_id != current_user.id:
        raise HTTPException(404, "Scan not found")
    return scan