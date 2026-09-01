"""
A formal notice FSSAI issues against a manufacturer: show-cause, stop-
sale, or recall. Separate from Flag on purpose -- a Flag is a shopkeeper
raising something for review; a Notice is FSSAI's own regulatory action,
which may or may not trace back to a specific flag (an officer can issue
one off aggregate manufacturer history, not just one incident).
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Text, Enum

from app.core.database import Base
from app.models.scan import GUID


class NoticeType(str, enum.Enum):
    SHOW_CAUSE = "SHOW_CAUSE"
    STOP_SALE = "STOP_SALE"
    RECALL = "RECALL"


class Notice(Base):
    __tablename__ = "notices"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    manufacturer_name = Column(String, nullable=False, index=True)
    # Denormalized from Product when known -- same "point in time record,
    # not a live FK" reasoning used on Scan.matched_product_id.
    fssai_license = Column(String, nullable=True)

    notice_type = Column(Enum(NoticeType), nullable=False)
    details = Column(Text, nullable=False)

    # Optional -- a notice can be issued from the manufacturer tracker
    # (aggregate history) without one specific flag behind it.
    flag_id = Column(GUID(), nullable=True, index=True)

    issued_by_user_id = Column(GUID(), nullable=False, index=True)

    pdf_filename = Column(String, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)