# """
# POST /api/v1/auth/register — create an account, returns a token immediately
# POST /api/v1/auth/login    — verify credentials, returns a token
# GET  /api/v1/auth/me       — whoami, given a valid Bearer token
# """
# import uuid

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.exc import IntegrityError
# from sqlalchemy.orm import Session

# from app.core.database import get_db
# from app.core.deps import get_current_user
# from app.models.user import User
# from app.schemas.user import UserRegister, UserLogin, UserOut, TokenOut
# from app.services.auth_service import hash_password, verify_password, create_access_token

# router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


# @router.post("/register", response_model=TokenOut)
# def register(payload: UserRegister, db: Session = Depends(get_db)):
#     user = User(
#         id=uuid.uuid4(),
#         email=payload.email,
#         password_hash=hash_password(payload.password),
#         name=payload.name,
#         role=payload.role,
#         organization=payload.organization,
#     )
#     db.add(user)
#     try:
#         db.commit()
#     except IntegrityError:
#         db.rollback()
#         raise HTTPException(409, "An account with this email already exists")
#     db.refresh(user)

#     token = create_access_token(str(user.id), user.role.value)
#     return TokenOut(access_token=token, user=user)


# @router.post("/login", response_model=TokenOut)
# def login(payload: UserLogin, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.email == payload.email).first()
#     if user is None or not verify_password(payload.password, user.password_hash):
#         raise HTTPException(401, "Incorrect email or password")

#     token = create_access_token(str(user.id), user.role.value)
#     return TokenOut(access_token=token, user=user)


# @router.get("/me", response_model=UserOut)
# def me(current_user: User = Depends(get_current_user)):
#     return current_user




















# """
# POST /api/v1/auth/register — create an account, returns a token immediately
# POST /api/v1/auth/login    — verify credentials, returns a token
# GET  /api/v1/auth/me       — whoami, given a valid Bearer token
# """
# import uuid

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.exc import IntegrityError
# from sqlalchemy.orm import Session

# from app.core.database import get_db
# from app.core.deps import get_current_user
# from app.models.user import User
# from app.schemas.user import (
#     UserRegister,
#     UserLogin,
#     UserOut,
#     TokenOut,
#     ProfileUpdate,
#     LocationUpdate,
#     NotificationsUpdate,
#     PrivacyUpdate,
#     PasswordChange,
# )
# from app.services.auth_service import hash_password, verify_password, create_access_token

# router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


# @router.post("/register", response_model=TokenOut)
# def register(payload: UserRegister, db: Session = Depends(get_db)):
#     user = User(
#         id=uuid.uuid4(),
#         email=payload.email,
#         password_hash=hash_password(payload.password),
#         name=payload.name,
#         role=payload.role,
#         organization=payload.organization,
#     )
#     db.add(user)
#     try:
#         db.commit()
#     except IntegrityError:
#         db.rollback()
#         raise HTTPException(409, "An account with this email already exists")
#     db.refresh(user)

#     token = create_access_token(str(user.id), user.role.value)
#     return TokenOut(access_token=token, user=user)


# @router.post("/login", response_model=TokenOut)
# def login(payload: UserLogin, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.email == payload.email).first()
#     if user is None or not verify_password(payload.password, user.password_hash):
#         raise HTTPException(401, "Incorrect email or password")

#     token = create_access_token(str(user.id), user.role.value)
#     return TokenOut(access_token=token, user=user)


# @router.get("/me", response_model=UserOut)
# def me(current_user: User = Depends(get_current_user)):
#     return current_user


# @router.patch("/me/profile", response_model=UserOut)
# def update_profile(
#     payload: ProfileUpdate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     """'Store details' (Shopkeeper/Brand) / 'Officer ID & credentials' (FSSAI)."""
#     for field, value in payload.model_dump(exclude_unset=True).items():
#         setattr(current_user, field, value)
#     db.commit()
#     db.refresh(current_user)
#     return current_user


# @router.patch("/me/location", response_model=UserOut)
# def update_location(
#     payload: LocationUpdate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     """'Location settings' (Shopkeeper/Brand) / 'Jurisdiction zone' (FSSAI)."""
#     for field, value in payload.model_dump(exclude_unset=True).items():
#         setattr(current_user, field, value)
#     db.commit()
#     db.refresh(current_user)
#     return current_user


# @router.patch("/me/notifications", response_model=UserOut)
# def update_notifications(
#     payload: NotificationsUpdate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     for field, value in payload.model_dump().items():
#         setattr(current_user, field, value)
#     db.commit()
#     db.refresh(current_user)
#     return current_user


# @router.patch("/me/privacy", response_model=UserOut)
# def update_privacy(
#     payload: PrivacyUpdate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     current_user.data_sharing_opt_in = payload.data_sharing_opt_in
#     db.commit()
#     db.refresh(current_user)
#     return current_user


# @router.patch("/me/password")
# def change_password(
#     payload: PasswordChange,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     if not verify_password(payload.current_password, current_user.password_hash):
#         raise HTTPException(401, "Current password is incorrect")
#     current_user.password_hash = hash_password(payload.new_password)
#     db.commit()
#     return {"status": "ok"}


# @router.get("/me/export")
# def export_my_data(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     """'Data & privacy' -- lets a user download everything SpectraSafe
#     holds on their account, in one JSON file, before deleting it or just
#     to see what's stored."""
#     from app.models.scan import Scan
#     from app.models.product import Product
#     from app.models.flag import Flag

#     data = {"account": UserOut.model_validate(current_user).model_dump(mode="json")}

#     if current_user.role.value == "SHOPKEEPER":
#         scans = db.query(Scan).filter(Scan.scanned_by_user_id == current_user.id).all()
#         flags = db.query(Flag).filter(Flag.flagged_by_user_id == current_user.id).all()
#         data["scans"] = [{"id": str(s.id), "created_at": s.created_at.isoformat() if s.created_at else None,
#                            "compliance_status": s.compliance_status.value if s.compliance_status else None}
#                           for s in scans]
#         data["flags"] = [{"id": str(f.id), "reason": f.reason} for f in flags]
#     elif current_user.role.value == "BRAND":
#         products = db.query(Product).filter(Product.brand_user_id == current_user.id).all()
#         data["products"] = [{"id": str(p.id), "name": p.product_name} for p in products]

#     return data


# @router.delete("/me", status_code=204)
# def delete_account(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ):
#     """'Data & privacy' -- permanently deletes the account. Doesn't cascade
#     into the user's scans/products/flags (those stay for audit/regulatory
#     history), only the account row itself."""
#     db.delete(current_user)
#     db.commit()
#     return None


















"""
POST /api/v1/auth/register — create an account, returns a token immediately
POST /api/v1/auth/login    — verify credentials, returns a token
GET  /api/v1/auth/me       — whoami, given a valid Bearer token
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserOut,
    TokenOut,
    ProfileUpdate,
    LocationUpdate,
    NotificationsUpdate,
    PrivacyUpdate,
    PasswordChange,
)
from app.services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# Officials are scoped by jurisdiction. FSSAI may be a state or "CENTRAL" (nationwide);
# SPCB (state water board) must be a real state; CPCB (central water board) is always "CENTRAL".
STATE_REQUIRED_ROLES = (UserRole.FSSAI, UserRole.SPCB)


def _resolve_state(role: UserRole, state: str | None) -> str | None:
    state = (state or "").strip() or None
    if role == UserRole.CPCB:
        return "CENTRAL"
    if role == UserRole.SPCB:
        if not state or state == "CENTRAL":
            raise HTTPException(422, "SPCB officials must select their state")
        return state
    if role == UserRole.FSSAI:
        if not state:
            raise HTTPException(422, "FSSAI officials must select a jurisdiction")
        return state
    return None   # brands / shopkeepers have no jurisdiction (scan state comes from the scan location)


@router.post("/register", response_model=TokenOut)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    state = _resolve_state(payload.role, getattr(payload, "state", None))
    user = User(
        id=uuid.uuid4(),
        email=payload.email,
        password_hash=hash_password(payload.password),
        name=payload.name,
        role=payload.role,
        organization=payload.organization,
    )
    if hasattr(User, "state"):
        user.state = state
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "An account with this email already exists")
    db.refresh(user)

    token = create_access_token(str(user.id), user.role.value)
    return TokenOut(access_token=token, user=user)


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")

    token = create_access_token(str(user.id), user.role.value)
    return TokenOut(access_token=token, user=user)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me/profile", response_model=UserOut)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """'Store details' (Shopkeeper/Brand) / 'Officer ID & credentials' (FSSAI)."""
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/me/location", response_model=UserOut)
def update_location(
    payload: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """'Location settings' (Shopkeeper/Brand) / 'Jurisdiction zone' (FSSAI)."""
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/me/notifications", response_model=UserOut)
def update_notifications(
    payload: NotificationsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in payload.model_dump().items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/me/privacy", response_model=UserOut)
def update_privacy(
    payload: PrivacyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.data_sharing_opt_in = payload.data_sharing_opt_in
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch("/me/password")
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(401, "Current password is incorrect")
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"status": "ok"}


@router.get("/me/export")
def export_my_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """'Data & privacy' -- lets a user download everything SpectraSafe
    holds on their account, in one JSON file, before deleting it or just
    to see what's stored."""
    from app.models.scan import Scan
    from app.models.product import Product
    from app.models.flag import Flag

    data = {"account": UserOut.model_validate(current_user).model_dump(mode="json")}

    if current_user.role.value == "SHOPKEEPER":
        scans = db.query(Scan).filter(Scan.scanned_by_user_id == current_user.id).all()
        flags = db.query(Flag).filter(Flag.flagged_by_user_id == current_user.id).all()
        data["scans"] = [{"id": str(s.id), "created_at": s.created_at.isoformat() if s.created_at else None,
                           "compliance_status": s.compliance_status.value if s.compliance_status else None}
                          for s in scans]
        data["flags"] = [{"id": str(f.id), "reason": f.reason} for f in flags]
    elif current_user.role.value == "BRAND":
        products = db.query(Product).filter(Product.brand_user_id == current_user.id).all()
        data["products"] = [{"id": str(p.id), "name": p.product_name} for p in products]
    elif current_user.role.value in ("SPCB", "CPCB"):
        from app.models.water_sample import WaterSample

        samples = db.query(WaterSample).filter(WaterSample.user_id == current_user.id).all()
        data["water_samples"] = [
            {"id": str(w.id), "created_at": w.created_at.isoformat() if w.created_at else None,
             "site_name": w.site_name, "result": w.result, "state": w.state}
            for w in samples
        ]

    return data


@router.delete("/me", status_code=204)
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """'Data & privacy' -- permanently deletes the account. Doesn't cascade
    into the user's scans/products/flags (those stay for audit/regulatory
    history), only the account row itself."""
    db.delete(current_user)
    db.commit()
    return None