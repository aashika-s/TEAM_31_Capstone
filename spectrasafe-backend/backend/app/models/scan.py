"""
Scan is the core table for the shopkeeper flow: a shopkeeper uploads a
label photo, the OCR pipeline extracts fields, the compliance engine
scores it, and (now that the product registry exists) it's checked
against any registered product with a matching FSSAI license.

matched_product_id is nullable -- most scans won't match a registered
product until the registry has real coverage, and that's a legitimate
outcome to record, not an error.
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, JSON, Enum, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.types import TypeDecorator, CHAR

from app.core.database import Base


class GUID(TypeDecorator):
    """Portable UUID: native UUID type on Postgres, CHAR(36) on SQLite —
    so local dev (SQLite) and prod (Postgres) use the same model code."""
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        return uuid.UUID(str(value))


class ComplianceStatus(str, enum.Enum):
    COMPLIANT = "COMPLIANT"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    NON_COMPLIANT = "NON_COMPLIANT"
    SUSPICIOUS = "SUSPICIOUS"


class Scan(Base):
    __tablename__ = "scans"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    image_filename = Column(String, nullable=False)

    # Denormalized for fast filtering/search without unpacking JSON.
    fssai_license = Column(String, nullable=True, index=True)
    compliance_status = Column(Enum(ComplianceStatus), nullable=False, index=True)
    compliance_score = Column(Float, nullable=False)

    # No FK constraint on purpose -- a matched product could later be
    # deleted/re-registered, and this column is a point-in-time record of
    # what matched at scan time, not a live relationship that should
    # cascade or break if the product changes later.
    matched_product_id = Column(GUID(), nullable=True, index=True)

    # Which Shopkeeper account performed this scan. Nullable for now so
    # existing rows from before auth existed don't break; new scans always
    # set it (enforced in the API, not the DB).
    scanned_by_user_id = Column(GUID(), nullable=True, index=True)
    # Manual entry by the shopkeeper at scan time (e.g. "Koramangala,
    # Bengaluru"). latitude/longitude are geocoded from this text via
    # Nominatim -- both nullable since geocoding can fail silently and
    # that shouldn't block the scan itself.
    location_text = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Denormalized from compliance_result the same way fssai_license is --
    # so the heatmap can filter by violation category without unpacking
    # the full JSON blob for every scan. Computed once at scan creation
    # via classify_violation_types(); empty list if nothing matched.
    violation_types = Column(JSON, nullable=True)

    # Full structured payloads for the detail view.
    ocr_result = Column(JSON, nullable=False)
    compliance_result = Column(JSON, nullable=False)
    product_verification = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)