"""
An editable food label a Brand builds for a product. Two tables:
Label holds the CURRENT state (what the editor loads and saves back to),
LabelVersion is an append-only history -- every save creates a new
version rather than overwriting history, so a Brand can see what
changed and roll back if needed. Same "point-in-time record" philosophy
used elsewhere in this app (Scan.matched_product_id, Notice), applied
here to editing history instead of a foreign relationship.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, JSON, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.scan import GUID


class Label(Base):
    __tablename__ = "labels"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    brand_user_id = Column(GUID(), nullable=False, index=True)
    # Optional link to an existing registered Product -- a label can be
    # drafted standalone before a product is registered, so this is
    # nullable rather than required.
    product_id = Column(GUID(), nullable=True, index=True)

    title = Column(String, nullable=False)
    current_version = Column(Integer, nullable=False, default=1)

    # All editable field values live here as one JSON blob (product_name,
    # ingredients_list, allergens, nutrients, manufacturer_name, etc.) --
    # matches the field keys referenced across the label_rules rule
    # sheets, so the compliance engine can check this dict directly.
    data = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    versions = relationship("LabelVersion", back_populates="label", cascade="all, delete-orphan", order_by="LabelVersion.version_number")
        # Canvas element positions/sizes/rotation -- purely visual, kept
    # separate from `data`. Compliance checking only ever reads `data`;
    # layout has no bearing on whether required fields are present.
    layout = Column(JSON, nullable=True)
        # Which markets this label needs to comply with. Empty/null means
    # "domestic only" (India/FSSAI) -- explicit opt-in to export markets,
    # not a default assumption.
    target_markets = Column(JSON, nullable=True)


class LabelVersion(Base):
    __tablename__ = "label_versions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    label_id = Column(GUID(), ForeignKey("labels.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    label = relationship("Label", back_populates="versions")