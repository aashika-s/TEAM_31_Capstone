from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel


class WaterSampleOut(BaseModel):
    id: UUID
    created_at: datetime
    captured_at: datetime | None = None
    lat: float
    lon: float
    site_name: str | None = None
    notes: str | None = None
    state: str | None = None
    result: str
    p_unsafe: float | None = None
    novelty_z: float | None = None
    quality: dict[str, Any] | None = None
    model_version: str
    image_filename: str
    submitted_by: str | None = None

    model_config = {"from_attributes": True}


class WaterStats(BaseModel):
    total: int
    unsafe: int
    no_contaminant_detected: int
    inconclusive: int


class WaterModelInfo(BaseModel):
    loaded: bool
    version: str | None = None
    metrics: dict[str, Any] | None = None
    error: str | None = None
