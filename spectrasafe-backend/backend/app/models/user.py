# """
# Auth/roles. One User table covers all three roles (Brand/Shopkeeper/
# FSSAI) rather than three separate tables -- the fields that actually
# differ per role (company name vs. store name vs. jurisdiction zone) are
# few enough that a single nullable `organization` string covers all three
# without real normalization loss. Split it out later if a role needs
# enough role-specific fields to justify it.
# """
# import enum
# import uuid
# from datetime import datetime, timezone

# from sqlalchemy import Column, String, DateTime, Enum

# from app.core.database import Base
# from app.models.scan import GUID


# class UserRole(str, enum.Enum):
#     BRAND = "BRAND"
#     SHOPKEEPER = "SHOPKEEPER"
#     FSSAI = "FSSAI"


# class User(Base):
#     __tablename__ = "users"

#     id = Column(GUID(), primary_key=True, default=uuid.uuid4)
#     email = Column(String, nullable=False, unique=True, index=True)
#     password_hash = Column(String, nullable=False)
#     name = Column(String, nullable=False)
#     role = Column(Enum(UserRole), nullable=False, index=True)

#     # Loosely: Brand's company name, Shopkeeper's store name (+ area),
#     # FSSAI officer's zone. Optional -- profile screens can prompt for it
#     # later if left blank at registration.
#     organization = Column(String, nullable=True)

#     created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))















"""
Auth/roles. One User table covers all three roles (Brand/Shopkeeper/
FSSAI) rather than three separate tables -- the fields that actually
differ per role (company name vs. store name vs. jurisdiction zone) are
few enough that a single nullable `organization` string covers all three
without real normalization loss. Split it out later if a role needs
enough role-specific fields to justify it.
"""
import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Enum, Float, Boolean

from app.core.database import Base
from app.models.scan import GUID


class UserRole(str, enum.Enum):
    BRAND = "BRAND"
    SHOPKEEPER = "SHOPKEEPER"
    FSSAI = "FSSAI"
    SPCB = "SPCB"
    CPCB = "CPCB"


class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, index=True)

    # Loosely: Brand's company name, Shopkeeper's store name (+ area),
    # FSSAI officer's zone. Optional -- profile screens can prompt for it
    # later if left blank at registration.
    organization = Column(String, nullable=True)

    # --- Profile: Store details / Officer credentials ---
    phone = Column(String, nullable=True)
    officer_id = Column(String, nullable=True)  # FSSAI-only, blank for other roles

    # --- Profile: Location settings / Jurisdiction zone ---
    address_line = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # --- Profile: Notifications ---
    notify_email = Column(Boolean, nullable=False, default=True)
    notify_scan_alerts = Column(Boolean, nullable=False, default=True)
    notify_weekly_digest = Column(Boolean, nullable=False, default=False)

    # --- Profile: Data & privacy ---
    data_sharing_opt_in = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # FSSAI officer's assigned jurisdiction -- a real state name, or the
    # sentinel "CENTRAL" for nationwide oversight (mirrors the actual
    # Central vs. State FSSAI licensing authority split). Unused/null for
    # BRAND and SHOPKEEPER roles.
    state = Column(String, nullable=True)