"""
POST   /api/v1/labels                — create a new label draft (BRAND only)
GET    /api/v1/labels                — list this brand's labels
GET    /api/v1/labels/{id}           — full label detail
PATCH  /api/v1/labels/{id}           — save an edit (creates a new version)
GET    /api/v1/labels/{id}/versions  — version history
GET    /api/v1/labels/{id}/compliance — live check against every rule sheet
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
from fastapi import UploadFile, File
from fastapi.responses import FileResponse
import shutil

from app.core.database import get_db
from app.core.deps import require_role
from app.models.label import Label, LabelVersion
from app.models.user import User, UserRole
from app.schemas.label import LabelCreate, LabelUpdate, LabelOut, LabelSummary, LabelVersionOut, ComplianceCheckResult
from app.services.label_compliance_engine import check_label_all_countries
from pydantic import BaseModel
from app.services import label_draft_service
from app.models.label_asset import LabelAsset
from app.schemas.label import LabelAssetOut

router = APIRouter(prefix="/api/v1/labels", tags=["labels"])
_require_brand = require_role(UserRole.BRAND)
_ASSETS_DIR = Path("app/data/label_assets")
_ASSETS_DIR.mkdir(parents=True, exist_ok=True)
_ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
_MAX_ASSET_BYTES = 5 * 1024 * 1024  # 5MB -- generous for a logo, prevents someone dumping a huge file into a label


@router.post("/", response_model=LabelOut)
def create_label(payload: LabelCreate, db: Session = Depends(get_db), current_user: User = Depends(_require_brand)):
    label = Label(
        id=uuid.uuid4(), brand_user_id=current_user.id, product_id=payload.product_id,
        title=payload.title, current_version=1, data=payload.data, layout=payload.layout,
    )
    db.add(label)
    db.flush()
    version = LabelVersion(id=uuid.uuid4(), label_id=label.id, version_number=1, data=payload.data)
    db.add(version)
    db.commit()
    db.refresh(label)
    return label


@router.get("/", response_model=list[LabelSummary])
def list_labels(
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_brand),
):
    return (
        db.query(Label)
        .filter(Label.brand_user_id == current_user.id)
        .order_by(Label.updated_at.desc())
        .all()
    )


@router.get("/{label_id}", response_model=LabelOut)
def get_label(
    label_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_brand),
):
    label = db.get(Label, label_id)
    if label is None or label.brand_user_id != current_user.id:
        raise HTTPException(404, "Label not found")
    return label


@router.patch("/{label_id}", response_model=LabelOut)
def update_label(label_id: uuid.UUID, payload: LabelUpdate, db: Session = Depends(get_db), current_user: User = Depends(_require_brand)):
    label = db.get(Label, label_id)
    if label is None or label.brand_user_id != current_user.id:
        raise HTTPException(404, "Label not found")
    label.data = payload.data
    if payload.layout is not None:
        label.layout = payload.layout
    label.current_version += 1
    version = LabelVersion(id=uuid.uuid4(), label_id=label.id, version_number=label.current_version, data=payload.data)
    db.add(version)
    db.commit()
    db.refresh(label)
    return label


@router.get("/{label_id}/versions", response_model=list[LabelVersionOut])
def list_versions(
    label_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_brand),
):
    label = db.get(Label, label_id)
    if label is None or label.brand_user_id != current_user.id:
        raise HTTPException(404, "Label not found")
    return (
        db.query(LabelVersion)
        .filter(LabelVersion.label_id == label_id)
        .order_by(LabelVersion.version_number.desc())
        .all()
    )

@router.get("/{label_id}/compliance", response_model=dict[str, ComplianceCheckResult])
def check_compliance(
    label_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_brand),
):
    label = db.get(Label, label_id)
    if label is None or label.brand_user_id != current_user.id:
        raise HTTPException(404, "Label not found")

    all_results = check_label_all_countries(label.data)
    markets = label.target_markets or ["FSSAI"]  # default: domestic only if brand hasn't chosen export markets
    return {code: result for code, result in all_results.items() if code in markets}

class DraftRequest(BaseModel):
    description: str

@router.post("/generate-draft")
def generate_draft(
    payload: DraftRequest,
    current_user: User = Depends(_require_brand),
):
    try:
        return label_draft_service.generate_draft(payload.description)
    except Exception as e:
        raise HTTPException(500, f"Draft generation failed: {e}")


@router.post("/{label_id}/assets", response_model=LabelAssetOut)
def upload_asset(
    label_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_brand),
):
    label = db.get(Label, label_id)
    if label is None or label.brand_user_id != current_user.id:
        raise HTTPException(404, "Label not found")

    if file.content_type not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, f"Unsupported image type '{file.content_type}'. Use PNG, JPEG, or WEBP.")

    asset_id = uuid.uuid4()
    suffix = Path(file.filename or "").suffix or ".png"
    stored_filename = f"{asset_id}{suffix}"
    dest_path = _ASSETS_DIR / stored_filename

    size = 0
    with open(dest_path, "wb") as out:
        while chunk := file.file.read(1024 * 1024):
            size += len(chunk)
            if size > _MAX_ASSET_BYTES:
                out.close()
                dest_path.unlink(missing_ok=True)
                raise HTTPException(413, "Image too large (max 5MB)")
            out.write(chunk)

    asset = LabelAsset(id=asset_id, label_id=label_id, filename=stored_filename, content_type=file.content_type)
    db.add(asset)
    db.commit()

    return LabelAssetOut(id=asset_id, label_id=label_id, url=f"/api/v1/labels/assets/{asset_id}")




@router.get("/assets/{asset_id}")
def get_asset(asset_id: uuid.UUID, db: Session = Depends(get_db)):
    # Deliberately public/unauthenticated -- a <canvas> Image element and
    # a plain <img> tag can't attach an Authorization header, so this
    # endpoint has to be reachable without a token for the editor's live
    # preview and exported PNG to actually load the image. These are
    # label graphics, not sensitive scan data, so that tradeoff is fine.
    asset = db.get(LabelAsset, asset_id)
    if asset is None:
        raise HTTPException(404, "Asset not found")
    path = _ASSETS_DIR / asset.filename
    if not path.exists():
        raise HTTPException(404, "Asset file missing on disk")
    return FileResponse(path, media_type=asset.content_type)