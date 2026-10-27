"""
An uploaded image (logo, product photo) attached to a Label. Stored as
an actual file on disk, referenced by ID -- NOT as base64 inside the
Label.layout JSON blob, which would bloat every row and every API
response with binary data encoded as text, with no caching benefit.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime

from app.core.database import Base
from app.models.scan import GUID


class LabelAsset(Base):
    __tablename__ = "label_assets"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    label_id = Column(GUID(), nullable=False, index=True)
    filename = Column(String, nullable=False)  # the actual file on disk, e.g. "<id>.png"
    content_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))