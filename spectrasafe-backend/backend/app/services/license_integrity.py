"""
Registry-side FSSAI license checks at product registration time.

Scope note: this does NOT verify a license against FSSAI's own records --
FoSCoS has no free public API, and license issuance is already verified
by FSSAI itself during the FBO application process, upstream of this
system. What this catches is internal contradiction: malformed numbers,
and one license number claimed by parties that can't all legitimately
hold it. A license is issued to one FBO at one premises, so two
different manufacturer names on one number is a contradiction in the
data regardless of what FSSAI's records say.
"""
import re

from sqlalchemy.orm import Session

from app.models.product import Product

_LICENSE_RE = re.compile(r"^\d{14}$")


def is_valid_format(license_value: str) -> bool:
    return bool(_LICENSE_RE.match((license_value or "").strip()))


def detect_conflicts(license_value: str, manufacturer_name: str, brand_user_id, db: Session) -> dict | None:
    """
    Returns a conflict record if this license is already registered in a
    way that contradicts the incoming registration, else None.

    Two severities, deliberately distinguished:
    - MANUFACTURER_MISMATCH: same license, different manufacturer name.
      One license belongs to one FBO -- this cannot be legitimate.
    - CROSS_ACCOUNT: same license and same manufacturer, different brand
      account. Plausibly two employees of one company (no team/multi-user
      support exists yet), so it's surfaced rather than treated as fraud.
    """
    existing = db.query(Product).filter(Product.fssai_license == license_value).all()
    if not existing:
        return None

    other_manufacturers = {
        p.manufacturer_name for p in existing if p.manufacturer_name.strip().lower() != manufacturer_name.strip().lower()
    }
    if other_manufacturers:
        return {
            "type": "MANUFACTURER_MISMATCH",
            "detail": (
                f"FSSAI license {license_value} is already registered to a different manufacturer: "
                f"{', '.join(sorted(other_manufacturers))}"
            ),
            "conflicting_product_ids": [str(p.id) for p in existing if p.manufacturer_name.strip().lower() != manufacturer_name.strip().lower()],
        }

    other_accounts = [p for p in existing if p.brand_user_id != brand_user_id]
    if other_accounts:
        return {
            "type": "CROSS_ACCOUNT",
            "detail": (
                f"FSSAI license {license_value} is already registered under a different brand account "
                f"for the same manufacturer name"
            ),
            "conflicting_product_ids": [str(p.id) for p in other_accounts],
        }

    return None