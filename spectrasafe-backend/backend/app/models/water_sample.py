import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, ForeignKey, Index, String, Text

from app.core.database import Base
from app.models.scan import GUID


class WaterSample(Base):
    """One laser-spectrum water photo + the deterministic classifier's verdict.

    `result` is the model output (unsafe / no_contaminant_detected / inconclusive).
    `state` is the Indian state/UT the sample was taken in (reverse-geocoded) and is
    what FSSAI officers are scoped by, same as Scan.state.
    """

    __tablename__ = "water_samples"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    captured_at = Column(DateTime, nullable=True)

    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    site_name = Column(String(120), nullable=True)
    notes = Column(Text, nullable=True)
    state = Column(String(64), nullable=True, index=True)

    result = Column(String(32), nullable=False, index=True)
    p_unsafe = Column(Float, nullable=True)
    novelty_z = Column(Float, nullable=True)
    quality = Column(JSON, nullable=True)
    model_version = Column(String(80), nullable=False)

    image_filename = Column(String(200), nullable=False)
    image_sha256 = Column(String(64), nullable=False, index=True)
    visible = Column(Boolean, default=True, nullable=False, index=True)

    __table_args__ = (Index("ix_water_samples_latlon", "lat", "lon"),)
