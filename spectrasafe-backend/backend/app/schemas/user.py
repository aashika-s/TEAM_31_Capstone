"""Pydantic request/response models for auth."""
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str
    role: UserRole
    organization: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    role: UserRole
    organization: str | None
    phone: str | None = None
    officer_id: str | None = None
    address_line: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    notify_email: bool = True
    notify_scan_alerts: bool = True
    notify_weekly_digest: bool = False
    data_sharing_opt_in: bool = True
    created_at: datetime

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ProfileUpdate(BaseModel):
    """'Store details' (Shopkeeper/Brand) / 'Officer ID & credentials' (FSSAI)."""
    name: str | None = None
    organization: str | None = None
    phone: str | None = None
    officer_id: str | None = None


class LocationUpdate(BaseModel):
    """'Location settings' (Shopkeeper/Brand) / 'Jurisdiction zone' (FSSAI)."""
    address_line: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class NotificationsUpdate(BaseModel):
    notify_email: bool
    notify_scan_alerts: bool
    notify_weekly_digest: bool


class PrivacyUpdate(BaseModel):
    data_sharing_opt_in: bool


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str
    role: UserRole
    organization: str | None = None
    state: str | None = None  # required in practice for FSSAI, enforced in the route

class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    role: UserRole
    organization: str | None
    state: str | None
    created_at: datetime
    class Config:
        from_attributes = True