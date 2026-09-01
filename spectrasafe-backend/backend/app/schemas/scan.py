"""Pydantic request/response models for the /scans API."""
import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel

from app.models.scan import ComplianceStatus


class ScanOut(BaseModel):
    id: uuid.UUID
    image_filename: str
    fssai_license: str | None
    matched_product_id: uuid.UUID | None
    scanned_by_user_id: uuid.UUID | None
    compliance_status: ComplianceStatus
    compliance_score: float
    location_text: str | None
    latitude: float | None
    longitude: float | None
    violation_types: list[str] = []
    ocr_result: dict[str, Any]
    compliance_result: dict[str, Any]
    product_verification: dict[str, Any] | None
    created_at: datetime

    class Config:
        from_attributes = True


class ScanSummary(BaseModel):
    """Lighter shape for list views — skips the big JSON blobs."""
    id: uuid.UUID
    image_filename: str
    fssai_license: str | None
    matched_product_id: uuid.UUID | None
    scanned_by_user_id: uuid.UUID | None
    compliance_status: ComplianceStatus
    compliance_score: float
    location_text: str | None
    latitude: float | None
    longitude: float | None
    violation_types: list[str] = []
    created_at: datetime

    class Config:
        from_attributes = True