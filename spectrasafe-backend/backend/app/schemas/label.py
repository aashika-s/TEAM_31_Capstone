import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class LabelCreate(BaseModel):
    title: str
    product_id: uuid.UUID | None = None
    data: dict[str, Any]
    layout: dict | list | None = None
    target_markets: list[str] | None = None


class LabelUpdate(BaseModel):
    data: dict[str, Any]
    layout: dict | list | None = None
    target_markets: list[str] | None = None


class LabelVersionOut(BaseModel):
    id: uuid.UUID
    version_number: int
    data: dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class LabelOut(BaseModel):
    id: uuid.UUID
    brand_user_id: uuid.UUID
    product_id: uuid.UUID | None
    title: str
    current_version: int
    data: dict[str, Any]
    created_at: datetime
    updated_at: datetime
    layout: dict | list | None = None
    target_markets: list[str] | None = None

    class Config:
        from_attributes = True


class LabelSummary(BaseModel):
    id: uuid.UUID
    title: str
    current_version: int
    updated_at: datetime

    class Config:
        from_attributes = True


class FieldCheck(BaseModel):
    label: str
    key: str
    present: bool

class ComplianceCheckResult(BaseModel):
    country: str
    authority: str | None = None
    status: str
    score_pct: float | None = None
    field_checklist: list[FieldCheck] = []
    missing_nutrients: list[str]
    missing_allergens: list[str]
    source: str | None = None
    message: str | None = None

class LabelAssetOut(BaseModel):
    id: uuid.UUID
    label_id: uuid.UUID
    url: str  # relative API path the frontend loads the image from

    class Config:
        from_attributes = True