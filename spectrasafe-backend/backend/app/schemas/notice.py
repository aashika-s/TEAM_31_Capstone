import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.notice import NoticeType


class NoticeCreate(BaseModel):
    manufacturer_name: str
    fssai_license: str | None = None
    notice_type: NoticeType
    details: str
    flag_id: uuid.UUID | None = None


class NoticeOut(BaseModel):
    id: uuid.UUID
    manufacturer_name: str
    fssai_license: str | None
    notice_type: NoticeType
    details: str
    flag_id: uuid.UUID | None
    issued_by_user_id: uuid.UUID
    pdf_filename: str | None
    created_at: datetime

    class Config:
        from_attributes = True