# """
# POST /api/v1/flags       — flag a scan for FSSAI review (SHOPKEEPER only, must own the scan)
# GET  /api/v1/flags       — list flags: SHOPKEEPER sees their own, FSSAI sees all
# GET  /api/v1/flags/{id}  — flag detail (same scoping as list)
# """
# import uuid

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from app.core.database import get_db
# from app.core.deps import require_role
# from app.models.flag import Flag
# from app.models.scan import Scan
# from app.models.user import User, UserRole
# from app.schemas.flag import FlagCreate, FlagOut

# router = APIRouter(prefix="/api/v1/flags", tags=["flags"])

# _require_shopkeeper = require_role(UserRole.SHOPKEEPER)
# _require_shopkeeper_or_fssai = require_role(UserRole.SHOPKEEPER, UserRole.FSSAI)


# @router.post("/", response_model=FlagOut)
# def create_flag(
#     payload: FlagCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(_require_shopkeeper),
# ):
#     scan = db.get(Scan, payload.scan_id)
#     if scan is None or scan.scanned_by_user_id != current_user.id:
#         # A shopkeeper can only flag a scan that's actually theirs -- same
#         # "don't leak which reason" 404 pattern used elsewhere.
#         raise HTTPException(404, "Scan not found")

#     flag = Flag(
#         id=uuid.uuid4(),
#         scan_id=payload.scan_id,
#         flagged_by_user_id=current_user.id,
#         reason=payload.reason,
#         observations=payload.observations,
#     )
#     db.add(flag)
#     db.commit()
#     db.refresh(flag)
#     return flag


# @router.get("/", response_model=list[FlagOut])
# def list_flags(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(_require_shopkeeper_or_fssai),
#     limit: int = 50,
# ):
#     query = db.query(Flag)
#     if current_user.role == UserRole.SHOPKEEPER:
#         query = query.filter(Flag.flagged_by_user_id == current_user.id)
#     return query.order_by(Flag.created_at.desc()).limit(limit).all()


# @router.get("/{flag_id}", response_model=FlagOut)
# def get_flag(
#     flag_id: uuid.UUID,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(_require_shopkeeper_or_fssai),
# ):
#     flag = db.get(Flag, flag_id)
#     if flag is None:
#         raise HTTPException(404, "Flag not found")
#     if current_user.role == UserRole.SHOPKEEPER and flag.flagged_by_user_id != current_user.id:
#         raise HTTPException(404, "Flag not found")
#     return flag













"""
POST /api/v1/scans           — upload one label photo, run OCR + compliance, persist it (SHOPKEEPER only)
POST /api/v1/scans/batch     — same, for up to 20 photos in one request
GET  /api/v1/scans           — list scans: SHOPKEEPER sees their own, FSSAI sees all
GET  /api/v1/scans/{id}      — full detail for one scan (same scoping as list)
# """
# import json
# import shutil
# import tempfile
# import uuid
# from pathlib import Path

# from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
# from fastapi.encoders import jsonable_encoder
# from fastapi.responses import JSONResponse
# from sqlalchemy.orm import Session

# from app.core.database import get_db
# from app.core.deps import require_role
# from app.models.scan import Scan, ComplianceStatus
# from app.models.user import User, UserRole
# from app.schemas.scan import ScanOut, ScanSummary
# from app.services import ocr_pipeline
# from app.services.compliance_service import run_compliance_check
# from app.services.verification_service import verify_against_registry

# router = APIRouter(prefix="/api/v1/scans", tags=["scans"])

# _ALLOWED_SUFFIXES = {".jpg", ".jpeg", ".png"}
# _MAX_BATCH_SIZE = 20
# _require_shopkeeper = require_role(UserRole.SHOPKEEPER)
# _require_shopkeeper_or_fssai = require_role(UserRole.SHOPKEEPER, UserRole.FSSAI)


# def _process_one_scan(file: UploadFile, db: Session, current_user: User) -> Scan:
#     """Shared by both the single-scan and batch-scan endpoints, so batch
#     scanning is genuinely the same pipeline run per image, not a separate
#     reimplementation that could quietly drift out of sync with it."""
#     suffix = Path(file.filename or "").suffix.lower()
#     if suffix not in _ALLOWED_SUFFIXES:
#         raise HTTPException(400, f"Unsupported file type '{suffix}' for '{file.filename}'. Use jpg/jpeg/png.")

#     with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
#         shutil.copyfileobj(file.file, tmp)
#         tmp_path = tmp.name

#     try:
#         extracted = ocr_pipeline.run_pipeline(tmp_path)
#     except Exception as e:
#         raise HTTPException(500, f"OCR pipeline failed on '{file.filename}': {e}")
#     finally:
#         Path(tmp_path).unlink(missing_ok=True)

#     compliance = run_compliance_check(extracted)
#     verification = verify_against_registry(extracted, db)

#     status = ComplianceStatus(compliance["status"])
#     if verification["status"] == "MATCHED_WITH_DISCREPANCIES":
#         status = ComplianceStatus.SUSPICIOUS

#     scan = Scan(
#         id=uuid.uuid4(),
#         image_filename=file.filename,
#         fssai_license=extracted.get("fssai_license"),
#         matched_product_id=verification.get("matched_product_id"),
#         scanned_by_user_id=current_user.id,
#         compliance_status=status,
#         compliance_score=compliance["score"],
#         ocr_result=extracted,
#         compliance_result=compliance,
#         product_verification=verification,
#     )
#     db.add(scan)
#     return scan


# @router.post("/", response_model=ScanOut)
# def create_scan(
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db),
#     current_user: User = Depends(_require_shopkeeper),
# ):
#     scan = _process_one_scan(file, db, current_user)
#     db.commit()
#     db.refresh(scan)
#     return scan


# @router.post("/batch", response_model=list[ScanOut])
# def create_batch_scan(
#     files: list[UploadFile] = File(...),
#     db: Session = Depends(get_db),
#     current_user: User = Depends(_require_shopkeeper),
# ):
#     if len(files) == 0:
#         raise HTTPException(400, "No files uploaded")
#     if len(files) > _MAX_BATCH_SIZE:
#         raise HTTPException(400, f"Batch limited to {_MAX_BATCH_SIZE} images per request")

#     # One bad image shouldn't fail the whole batch -- process every file,
#     # commit whatever succeeded, and report failures alongside the
#     # successful scans rather than raising on the first error.
#     scans = []
#     errors = []
#     for file in files:
#         try:
#             scans.append(_process_one_scan(file, db, current_user))
#         except HTTPException as e:
#             errors.append({"filename": file.filename, "error": e.detail})

#     db.commit()
#     for scan in scans:
#         db.refresh(scan)

#     if not scans and errors:
#         raise HTTPException(500, f"All {len(errors)} image(s) in this batch failed: {errors}")
#     # Partial failures are returned as a header rather than silently
#     # dropped -- the frontend can surface them next to the successful results.
#     if errors:
#         return JSONResponse(
#             content=jsonable_encoder(scans),
#             headers={"X-Batch-Errors": json.dumps(errors)},
#         )
#     return scans


# @router.get("/", response_model=list[ScanSummary])
# def list_scans(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(_require_shopkeeper_or_fssai),
#     limit: int = 50,
#     offset: int = 0,
#     status: ComplianceStatus | None = None,
# ):
#     query = db.query(Scan)
#     if current_user.role == UserRole.SHOPKEEPER:
#         # "Shopkeepers should only access their store/scans" (per spec) --
#         # FSSAI officials fall through with no filter, since regulatory
#         # oversight needs to see everything.
#         query = query.filter(Scan.scanned_by_user_id == current_user.id)
#     if status is not None:
#         query = query.filter(Scan.compliance_status == status)
#     return query.order_by(Scan.created_at.desc()).offset(offset).limit(limit).all()


# @router.get("/{scan_id}", response_model=ScanOut)
# def get_scan(
#     scan_id: uuid.UUID,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(_require_shopkeeper_or_fssai),
# ):
#     scan = db.get(Scan, scan_id)
#     if scan is None:
#         raise HTTPException(404, "Scan not found")
#     if current_user.role == UserRole.SHOPKEEPER and scan.scanned_by_user_id != current_user.id:
#         raise HTTPException(404, "Scan not found")
#     return scan












"""
POST  /api/v1/flags       — flag a scan for FSSAI review (SHOPKEEPER only, must own the scan)
GET   /api/v1/flags       — list flags: SHOPKEEPER sees their own, FSSAI sees all
GET   /api/v1/flags/{id}  — flag detail (same scoping as list)
PATCH /api/v1/flags/{id}  — update a flag's status (FSSAI only)
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_role
from app.models.flag import Flag
from app.models.scan import Scan
from app.models.user import User, UserRole
from app.schemas.flag import FlagCreate, FlagOut, FlagStatusUpdate

router = APIRouter(prefix="/api/v1/flags", tags=["flags"])

_require_shopkeeper = require_role(UserRole.SHOPKEEPER)
_require_fssai = require_role(UserRole.FSSAI)
_require_shopkeeper_or_fssai = require_role(UserRole.SHOPKEEPER, UserRole.FSSAI)


@router.post("/", response_model=FlagOut)
def create_flag(
    payload: FlagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_shopkeeper),
):
    scan = db.get(Scan, payload.scan_id)
    if scan is None or scan.scanned_by_user_id != current_user.id:
        # A shopkeeper can only flag a scan that's actually theirs -- same
        # "don't leak which reason" 404 pattern used elsewhere.
        raise HTTPException(404, "Scan not found")

    flag = Flag(
        id=uuid.uuid4(),
        scan_id=payload.scan_id,
        flagged_by_user_id=current_user.id,
        reason=payload.reason,
        observations=payload.observations,
    )
    db.add(flag)
    db.commit()
    db.refresh(flag)
    return flag


@router.get("/", response_model=list[FlagOut])
def list_flags(
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_shopkeeper_or_fssai),
    limit: int = 50,
):
    query = db.query(Flag)
    if current_user.role == UserRole.SHOPKEEPER:
        query = query.filter(Flag.flagged_by_user_id == current_user.id)
    return query.order_by(Flag.created_at.desc()).limit(limit).all()


@router.get("/{flag_id}", response_model=FlagOut)
def get_flag(
    flag_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_shopkeeper_or_fssai),
):
    flag = db.get(Flag, flag_id)
    if flag is None:
        raise HTTPException(404, "Flag not found")
    if current_user.role == UserRole.SHOPKEEPER and flag.flagged_by_user_id != current_user.id:
        raise HTTPException(404, "Flag not found")
    return flag


@router.patch("/{flag_id}", response_model=FlagOut)
def update_flag_status(
    flag_id: uuid.UUID,
    payload: FlagStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_fssai),
):
    # Only FSSAI can change a flag's status -- a shopkeeper raising a flag
    # shouldn't be able to mark their own report resolved.
    flag = db.get(Flag, flag_id)
    if flag is None:
        raise HTTPException(404, "Flag not found")
    flag.status = payload.status
    db.commit()
    db.refresh(flag)
    return flag