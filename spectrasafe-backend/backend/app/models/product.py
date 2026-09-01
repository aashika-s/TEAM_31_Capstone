"""
Brand-side product registry. Deliberately minimal for this phase:

- No Manufacturer/Brand as separate normalized tables yet -- those fields
  live directly on Product. There's no auth/brand-user model yet either
  (that's a later phase), so there's nothing real to normalize against;
  splitting this out now would just be unused structure. Add a
  brand_user_id FK here once auth exists instead of reworking the schema.
- No Label/LabelVersion tables -- the label studio/AI generator is a
  separate, already-in-progress piece (being built elsewhere), out of
  scope for this phase.
- Batch is separate from Product because a product design is registered
  once but produced in many batches over time, each with its own
  manufacturing/expiry dates -- exactly what a shopkeeper scan needs to
  check a specific pack against.
"""
import enum
import uuid
from datetime import datetime, date, timezone

from sqlalchemy import Column, String, DateTime, Date, JSON, Enum, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.scan import GUID  # shared portable-UUID type (SQLite/Postgres)


class VegStatus(str, enum.Enum):
    VEG = "VEG"
    NON_VEG = "NON_VEG"


class Product(Base):
    __tablename__ = "products"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    product_name = Column(String, nullable=False)
    brand_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    ingredients_raw = Column(Text, nullable=True)
    allergens = Column(JSON, nullable=True)      # list[str]
    nutrition = Column(JSON, nullable=True)       # dict, same shape as Scan.ocr_result["nutrients"]

    net_quantity = Column(String, nullable=True)
    mrp = Column(String, nullable=True)
    veg_status = Column(Enum(VegStatus), nullable=True)

    manufacturer_name = Column(String, nullable=False)
    manufacturer_address = Column(Text, nullable=True)
    # Indexed: this is the field a shopkeeper scan will look a product up
    # by, since it's the most reliably-extracted field from a label photo.
    fssai_license = Column(String, nullable=False, index=True)

    # Which Brand account registered this -- now that auth exists. No hard
    # FK constraint (same pattern as Scan.matched_product_id) so a user
    # being deleted later doesn't cascade-delete or block on their products.
    brand_user_id = Column(GUID(), nullable=False, index=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    batches = relationship("Batch", back_populates="product", cascade="all, delete-orphan")


class Batch(Base):
    __tablename__ = "batches"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    product_id = Column(GUID(), ForeignKey("products.id"), nullable=False, index=True)

    batch_number = Column(String, nullable=False, index=True)
    manufacturing_date = Column(Date, nullable=True)
    best_before_date = Column(Date, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    product = relationship("Product", back_populates="batches")