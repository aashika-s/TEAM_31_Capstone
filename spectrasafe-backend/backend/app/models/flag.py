"""
A shopkeeper flagging a specific scan as suspicious for FSSAI review.
Kept separate from Scan/compliance_status on purpose: compliance_status
is the system's automated read of a label; a Flag is a human (the
shopkeeper) saying "I want a regulator to look at this specific one,"
which can happen independent of what the automated status says (a
NEEDS_REVIEW scan might not warrant a flag, and a shopkeeper might have
reason to flag something the automated check called COMPLIANT).
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Text, Enum

from app.core.database import Base
from app.models.scan import GUID


class FlagStatus(str, enum.Enum):
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"


class Flag(Base):
    __tablename__ = "flags"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    # No FK constraint -- same reasoning as Scan.matched_product_id: this
    # is a point-in-time record, not a relationship that should cascade.
    scan_id = Column(GUID(), nullable=False, index=True)
    flagged_by_user_id = Column(GUID(), nullable=False, index=True)

    reason = Column(String, nullable=False)
    observations = Column(Text, nullable=True)
    status = Column(Enum(FlagStatus), nullable=False, default=FlagStatus.OPEN, index=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)