# """
# POST /api/v1/products                        — register a product (BRAND only)
# GET  /api/v1/products                          — list the caller's own products (BRAND only)
# GET  /api/v1/products/{id}                     — product detail
# POST /api/v1/products/{product_id}/batches     — register a batch (BRAND only, must own the product)
# GET  /api/v1/products/{product_id}/batches     — list a product's batches
# """
# import uuid

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session

# from app.core.database import get_db
# from app.core.deps import require_role
# from app.models.product import Product, Batch
# from app.models.user import User, UserRole
# from app.schemas.product import ProductCreate, ProductOut, ProductSummary, BatchCreate, BatchOut

# router = APIRouter(prefix="/api/v1/products", tags=["products"])

# _require_brand = require_role(UserRole.BRAND)


# @router.post("/", response_model=ProductOut)
# def create_product(
#     payload: ProductCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(_require_brand),
# ):
#     product = Product(id=uuid.uuid4(), brand_user_id=current_user.id, **payload.model_dump())
#     db.add(product)
#     db.commit()
#     db.refresh(product)
#     return product


# @router.get("/", response_model=list[ProductSummary])
# def list_products(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(_require_brand),
#     limit: int = 50,
# ):
#     # Scoped to the caller's own products -- per the original spec,
#     # "Brand users should only access their own products."
#     return (
#         db.query(Product)
#         .filter(Product.brand_user_id == current_user.id)
#         .order_by(Product.created_at.desc())
#         .limit(limit)
#         .all()
#     )


# @router.get("/{product_id}", response_model=ProductOut)
# def get_product(
#     product_id: uuid.UUID,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(_require_brand),
# ):
#     product = db.get(Product, product_id)
#     if product is None or product.brand_user_id != current_user.id:
#         # Same 404 whether the product doesn't exist or belongs to someone
#         # else -- don't leak which one it is to an unauthorized caller.
#         raise HTTPException(404, "Product not found")
#     return product


# @router.post("/{product_id}/batches", response_model=BatchOut)
# def create_batch(
#     product_id: uuid.UUID,
#     payload: BatchCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(_require_brand),
# ):
#     product = db.get(Product, product_id)
#     if product is None or product.brand_user_id != current_user.id:
#         raise HTTPException(404, "Product not found")
#     batch = Batch(id=uuid.uuid4(), product_id=product_id, **payload.model_dump())
#     db.add(batch)
#     db.commit()
#     db.refresh(batch)
#     return batch


# @router.get("/{product_id}/batches", response_model=list[BatchOut])
# def list_batches(
#     product_id: uuid.UUID,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(_require_brand),
# ):
#     product = db.get(Product, product_id)
#     if product is None or product.brand_user_id != current_user.id:
#         raise HTTPException(404, "Product not found")
#     return (
#         db.query(Batch)
#         .filter(Batch.product_id == product_id)
#         .order_by(Batch.created_at.desc())
#         .all()
#     )


















"""
POST /api/v1/products
    — register a product (BRAND only)

GET /api/v1/products
    — list products:
      BRAND sees their own
      FSSAI sees products within their jurisdiction
      CENTRAL FSSAI sees all

GET /api/v1/products/{id}
    — product detail with the same access rules

POST /api/v1/products/{product_id}/batches
    — register a batch (BRAND only, must own product)

GET /api/v1/products/{product_id}/batches
    — list a product's batches with the same jurisdiction rules
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_role

from app.models.product import (
    Product,
    Batch,
    VerificationStatus,
)

from app.models.user import (
    User,
    UserRole,
)

from app.schemas.product import (
    ProductCreate,
    ProductOut,
    ProductSummary,
    BatchCreate,
    BatchOut,
    ProductReviewAction,
)

from app.services import (
    license_integrity,
    risk_scoring,
)


router = APIRouter(
    prefix="/api/v1/products",
    tags=["products"],
)


# ============================================================
# ROLE DEPENDENCIES
# ============================================================

_require_brand = require_role(
    UserRole.BRAND
)

_require_brand_or_fssai = require_role(
    UserRole.BRAND,
    UserRole.FSSAI,
)


# ============================================================
# JURISDICTION HELPER
# ============================================================

def _apply_jurisdiction(
    query,
    current_user: User,
):
    """
    Apply FSSAI jurisdiction filtering.

    BRAND:
        handled separately by brand_user_id filtering.

    FSSAI CENTRAL:
        can see all products.

    State-level FSSAI:
        can only see products whose state matches
        the officer's state.
    """

    if (
        current_user.role == UserRole.FSSAI
        and current_user.state != "CENTRAL"
    ):
        query = query.filter(
            Product.state == current_user.state
        )

    return query


# ============================================================
# CREATE PRODUCT
# ============================================================

@router.post(
    "/",
    response_model=ProductOut,
)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_brand),
):
    """
    BRAND registers a new product.

    The FSSAI license must be exactly 14 digits.

    If the license is already associated with another
    manufacturer, a license conflict is created and the
    existing product(s) are retroactively flagged as well.
    """

    data = payload.model_dump()

    # --------------------------------------------------------
    # Validate FSSAI license
    # --------------------------------------------------------

    license_value = (
        data.get("fssai_license") or ""
    ).strip()

    if not license_integrity.is_valid_format(
        license_value
    ):
        raise HTTPException(
            422,
            "FSSAI license must be exactly 14 digits",
        )

    data["fssai_license"] = license_value

    # --------------------------------------------------------
    # Detect license conflicts
    # --------------------------------------------------------

    conflict = (
        license_integrity.detect_conflicts(
            license_value,
            data["manufacturer_name"],
            current_user.id,
            db,
        )
    )

    # --------------------------------------------------------
    # Calculate risk
    # --------------------------------------------------------

    risk = risk_scoring.assess_risk(
        current_user,
        data["manufacturer_name"],
        conflict,
        db,
    )

    # --------------------------------------------------------
    # Create product
    # --------------------------------------------------------

    product = Product(
        id=uuid.uuid4(),
        brand_user_id=current_user.id,

        license_conflict=conflict,

        verification_status=(
            VerificationStatus.PENDING
        ),

        risk_score=risk["score"],
        risk_flags=risk["flags"],

        **data,
    )

    db.add(product)

    # --------------------------------------------------------
    # Retroactively mark conflicting products
    # --------------------------------------------------------

    if conflict:
        for pid in conflict.get(
            "conflicting_product_ids",
            [],
        ):
            try:
                conflicting_product_id = uuid.UUID(pid)
            except (ValueError, TypeError):
                continue

            other = db.get(
                Product,
                conflicting_product_id,
            )

            if other is None:
                continue

            detail = (
                f"FSSAI license {license_value} is also "
                f"registered by another party"
            )

            # Do not destroy an existing conflict object.
            # Preserve it while adding/updating the
            # current conflicting product ID.
            existing_conflict = (
                other.license_conflict
                or {}
            )

            conflicting_ids = list(
                existing_conflict.get(
                    "conflicting_product_ids",
                    [],
                )
            )

            new_product_id = str(
                product.id
            )

            if new_product_id not in conflicting_ids:
                conflicting_ids.append(
                    new_product_id
                )

            other.license_conflict = {
                "type": conflict.get(
                    "type",
                    "LICENSE_CONFLICT",
                ),
                "detail": detail,
                "conflicting_product_ids": (
                    conflicting_ids
                ),
            }

            # Add LICENSE_CONFLICT to the
            # existing product's risk flags.
            risk_scoring.apply_retroactive_conflict_flag(
                other,
                detail,
            )

    # --------------------------------------------------------
    # Save everything
    # --------------------------------------------------------

    db.commit()
    db.refresh(product)

    return product


# ============================================================
# LIST PRODUCTS
# ============================================================

@router.get(
    "/",
    response_model=list[ProductSummary],
)
def list_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        _require_brand_or_fssai
    ),
    limit: int = 200,
    manufacturer: str | None = None,
):
    """
    BRAND:
        sees only their own products.

    State-level FSSAI:
        sees products from their state.

    CENTRAL FSSAI:
        sees all products.
    """

    query = db.query(Product)

    # --------------------------------------------------------
    # BRAND ownership restriction
    # --------------------------------------------------------

    if current_user.role == UserRole.BRAND:
        query = query.filter(
            Product.brand_user_id
            == current_user.id
        )

    # --------------------------------------------------------
    # FSSAI jurisdiction restriction
    # --------------------------------------------------------

    query = _apply_jurisdiction(
        query,
        current_user,
    )

    # --------------------------------------------------------
    # Optional manufacturer filter
    # --------------------------------------------------------

    if manufacturer:
        query = query.filter(
            Product.manufacturer_name
            == manufacturer
        )

    return (
        query
        .order_by(
            Product.created_at.desc()
        )
        .limit(limit)
        .all()
    )


# ============================================================
# FSSAI REVIEW QUEUE
# ============================================================

@router.get(
    "/queue",
    response_model=list[ProductSummary],
)
def review_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.FSSAI)
    ),
    limit: int = 100,
):
    """
    FSSAI review queue.

    Only PENDING products are shown.

    CENTRAL:
        all pending products.

    State-level FSSAI:
        only pending products belonging to
        the officer's state.

    Highest-risk products appear first.
    """

    query = (
        db.query(Product)
        .filter(
            Product.verification_status
            == VerificationStatus.PENDING
        )
    )

    query = _apply_jurisdiction(
        query,
        current_user,
    )

    return (
        query
        .order_by(
            Product.risk_score.desc(),
            Product.created_at.desc(),
        )
        .limit(limit)
        .all()
    )


# ============================================================
# GET PRODUCT
# ============================================================

@router.get(
    "/{product_id}",
    response_model=ProductOut,
)
def get_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        _require_brand_or_fssai
    ),
):
    product = db.get(
        Product,
        product_id,
    )

    if product is None:
        raise HTTPException(
            404,
            "Product not found",
        )

    # --------------------------------------------------------
    # BRAND ownership
    # --------------------------------------------------------

    if (
        current_user.role == UserRole.BRAND
        and product.brand_user_id
        != current_user.id
    ):
        raise HTTPException(
            404,
            "Product not found",
        )

    # --------------------------------------------------------
    # FSSAI jurisdiction
    # --------------------------------------------------------

    if (
        current_user.role == UserRole.FSSAI
        and current_user.state != "CENTRAL"
        and product.state
        != current_user.state
    ):
        raise HTTPException(
            404,
            "Product not found",
        )

    return product


# ============================================================
# REVIEW PRODUCT
# ============================================================

@router.patch(
    "/{product_id}/review",
    response_model=ProductOut,
)
def review_product(
    product_id: uuid.UUID,
    payload: ProductReviewAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.FSSAI)
    ),
):
    """
    FSSAI officer verifies or rejects a product.

    State-level officers can only review products
    belonging to their jurisdiction.

    CENTRAL officers can review all products.
    """

    product = db.get(
        Product,
        product_id,
    )

    if product is None:
        raise HTTPException(
            404,
            "Product not found",
        )

    # --------------------------------------------------------
    # FSSAI jurisdiction
    # --------------------------------------------------------

    if (
        current_user.state != "CENTRAL"
        and product.state
        != current_user.state
    ):
        raise HTTPException(
            404,
            "Product not found",
        )

    # --------------------------------------------------------
    # Validate review status
    # --------------------------------------------------------

    if payload.verification_status not in (
        VerificationStatus.VERIFIED,
        VerificationStatus.REJECTED,
    ):
        raise HTTPException(
            400,
            "verification_status must be VERIFIED or REJECTED",
        )

    # --------------------------------------------------------
    # Apply review
    # --------------------------------------------------------

    product.verification_status = (
        payload.verification_status
    )

    product.reviewed_by_user_id = (
        current_user.id
    )

    product.reviewed_at = (
        datetime.now(timezone.utc)
    )

    db.commit()
    db.refresh(product)

    return product


# ============================================================
# CREATE BATCH
# ============================================================

@router.post(
    "/{product_id}/batches",
    response_model=BatchOut,
)
def create_batch(
    product_id: uuid.UUID,
    payload: BatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        _require_brand
    ),
):
    """
    BRAND can create a batch only for their own product.
    """

    product = db.get(
        Product,
        product_id,
    )

    if (
        product is None
        or product.brand_user_id
        != current_user.id
    ):
        raise HTTPException(
            404,
            "Product not found",
        )

    batch = Batch(
        id=uuid.uuid4(),
        product_id=product_id,
        **payload.model_dump(),
    )

    db.add(batch)
    db.commit()
    db.refresh(batch)

    return batch


# ============================================================
# LIST BATCHES
# ============================================================

@router.get(
    "/{product_id}/batches",
    response_model=list[BatchOut],
)
def list_batches(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        _require_brand_or_fssai
    ),
):
    """
    BRAND:
        can view batches for their own product.

    State-level FSSAI:
        can view batches only for products in their state.

    CENTRAL FSSAI:
        can view batches for all products.
    """

    product = db.get(
        Product,
        product_id,
    )

    if product is None:
        raise HTTPException(
            404,
            "Product not found",
        )

    # --------------------------------------------------------
    # BRAND ownership
    # --------------------------------------------------------

    if (
        current_user.role == UserRole.BRAND
        and product.brand_user_id
        != current_user.id
    ):
        raise HTTPException(
            404,
            "Product not found",
        )

    # --------------------------------------------------------
    # FSSAI jurisdiction
    # --------------------------------------------------------

    if (
        current_user.role == UserRole.FSSAI
        and current_user.state != "CENTRAL"
        and product.state
        != current_user.state
    ):
        raise HTTPException(
            404,
            "Product not found",
        )

    # --------------------------------------------------------
    # Get batches
    # --------------------------------------------------------

    return (
        db.query(Batch)
        .filter(
            Batch.product_id
            == product_id
        )
        .order_by(
            Batch.created_at.desc()
        )
        .all()
    )