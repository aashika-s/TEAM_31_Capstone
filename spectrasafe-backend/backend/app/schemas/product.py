"""Pydantic request/response models for the /products and nested /batches API."""
import uuid
from datetime import datetime, date
from typing import Any

from pydantic import BaseModel

from app.models.product import VegStatus


class ProductCreate(BaseModel):
    product_name: str
    brand_name: str
    description: str | None = None
    ingredients_raw: str | None = None
    allergens: list[str] | None = None
    nutrition: dict[str, Any] | None = None
    net_quantity: str | None = None
    mrp: str | None = None
    veg_status: VegStatus | None = None
    manufacturer_name: str
    manufacturer_address: str | None = None
    fssai_license: str


class ProductOut(ProductCreate):
    id: uuid.UUID
    brand_user_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ProductSummary(BaseModel):
    id: uuid.UUID
    product_name: str
    brand_name: str
    manufacturer_name: str
    fssai_license: str
    created_at: datetime

    class Config:
        from_attributes = True


class BatchCreate(BaseModel):
    batch_number: str
    manufacturing_date: date | None = None
    best_before_date: date | None = None


class BatchOut(BatchCreate):
    id: uuid.UUID
    product_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True