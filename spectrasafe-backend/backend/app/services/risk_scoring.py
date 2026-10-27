"""
Deterministic risk triage for new product registrations -- modeled on
how real marketplace trust & safety systems (Stripe Radar, Amazon
seller vetting) work: a small set of named, explainable rule-based
signals combined into a score and a tier. Not a black-box number --
every flag has a human-readable reason, because an officer reviewing
the queue needs to see WHY something was flagged to make (and later
justify) a decision.

This does not verify anything against FSSAI's own records -- no free
public API exists for that (see license_integrity.py). What it does is
prioritize a human's limited review time toward the registrations
statistically most likely to be fraudulent, rather than a first-come
queue that treats a scam and a legitimate business identically.
"""
from datetime import datetime, timezone, timedelta

from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.user import User

_NEW_ACCOUNT_WINDOW_DAYS = 7
_VELOCITY_WINDOW_HOURS = 1
_VELOCITY_THRESHOLD = 5

_WEIGHTS = {
    "LICENSE_CONFLICT": 50,
    "HIGH_VELOCITY": 30,
    "NEW_ACCOUNT": 10,
    "UNKNOWN_MANUFACTURER": 10,
}


def assess_risk(brand_user: User, manufacturer_name: str, license_conflict: dict | None, db: Session) -> dict:
    flags = []

    if license_conflict is not None:
        flags.append({
            "code": "LICENSE_CONFLICT",
            "label": "License number conflict",
            "detail": license_conflict["detail"],
        })

    created_at = brand_user.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    account_age = datetime.now(timezone.utc) - created_at
    if account_age < timedelta(days=_NEW_ACCOUNT_WINDOW_DAYS):
        flags.append({
            "code": "NEW_ACCOUNT",
            "label": "New account",
            "detail": f"Account created {account_age.days} day(s) ago",
        })

    recent_count = (
        db.query(Product)
        .filter(
            Product.brand_user_id == brand_user.id,
            Product.created_at >= datetime.now(timezone.utc) - timedelta(hours=_VELOCITY_WINDOW_HOURS),
        )
        .count()
    )
    if recent_count >= _VELOCITY_THRESHOLD:
        flags.append({
            "code": "HIGH_VELOCITY",
            "label": "Unusual registration velocity",
            "detail": f"{recent_count} product(s) registered by this account in the last {_VELOCITY_WINDOW_HOURS} hour(s)",
        })

    known_manufacturer = db.query(Product).filter(Product.manufacturer_name == manufacturer_name).first()
    if known_manufacturer is None:
        flags.append({
            "code": "UNKNOWN_MANUFACTURER",
            "label": "First-seen manufacturer",
            "detail": f"'{manufacturer_name}' has no prior registrations in the system",
        })

    score = sum(_WEIGHTS[f["code"]] for f in flags)
    tier = "HIGH" if score >= 50 else "MEDIUM" if score >= 20 else "LOW"

    return {"score": score, "tier": tier, "flags": flags}


def apply_retroactive_conflict_flag(product: Product, detail: str) -> None:
    """
    Called when a NEW registration creates a conflict with an already-
    existing product. The existing product's risk_score/risk_flags were
    computed at ITS OWN registration time, before this conflict existed --
    without this, only the newer half of a conflicting pair would ever
    show LICENSE_CONFLICT in the review queue, and the earlier one would
    sit at whatever lower score it started with despite being just as
    implicated.
    """
    existing_flags = product.risk_flags or []
    if any(f.get("code") == "LICENSE_CONFLICT" for f in existing_flags):
        return  # already flagged -- don't double-count if this runs twice
    product.risk_flags = existing_flags + [{
        "code": "LICENSE_CONFLICT",
        "label": "License number conflict",
        "detail": detail,
    }]
    product.risk_score = product.risk_score + _WEIGHTS["LICENSE_CONFLICT"]