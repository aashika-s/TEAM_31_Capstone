"""
POST /api/v1/notices          — issue a formal notice against a manufacturer, generates a PDF (FSSAI only)
GET  /api/v1/notices          — list all notices (FSSAI only)
GET  /api/v1/notices/{id}     — notice detail (FSSAI only)
GET  /api/v1/notices/{id}/pdf — download the generated PDF (FSSAI only)
"""
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_role
from app.models.notice import Notice
from app.models.user import User, UserRole
from app.schemas.notice import NoticeCreate, NoticeOut
from app.services import notice_pdf_service

router = APIRouter(prefix="/api/v1/notices", tags=["notices"])

_require_fssai = require_role(UserRole.FSSAI)

_NOTICES_DIR = Path("app/data/notices")
_NOTICES_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/", response_model=NoticeOut)
def create_notice(
    payload: NoticeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_fssai),
):
    notice = Notice(
        id=uuid.uuid4(),
        manufacturer_name=payload.manufacturer_name,
        fssai_license=payload.fssai_license,
        notice_type=payload.notice_type,
        details=payload.details,
        flag_id=payload.flag_id,
        issued_by_user_id=current_user.id,
    )
    db.add(notice)
    db.commit()
    db.refresh(notice)

    pdf_filename = f"{notice.id}.pdf"
    notice_pdf_service.generate_notice_pdf(notice, _NOTICES_DIR / pdf_filename)

    notice.pdf_filename = pdf_filename
    db.commit()
    db.refresh(notice)
    return notice


@router.get("/", response_model=list[NoticeOut])
def list_notices(
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_fssai),
    limit: int = 50,
):
    return db.query(Notice).order_by(Notice.created_at.desc()).limit(limit).all()


@router.get("/{notice_id}", response_model=NoticeOut)
def get_notice(
    notice_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_fssai),
):
    notice = db.get(Notice, notice_id)
    if notice is None:
        raise HTTPException(404, "Notice not found")
    return notice


@router.get("/{notice_id}/pdf")
def download_notice_pdf(
    notice_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_fssai),
):
    notice = db.get(Notice, notice_id)
    if notice is None or not notice.pdf_filename:
        raise HTTPException(404, "Notice PDF not found")
    pdf_path = _NOTICES_DIR / notice.pdf_filename
    if not pdf_path.exists():
        raise HTTPException(404, "Notice PDF not found on disk")
    return FileResponse(pdf_path, media_type="application/pdf", filename=pdf_path.name)