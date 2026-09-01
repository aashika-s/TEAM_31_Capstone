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
POST /api/v1/products                        — register a product (BRAND only)
GET  /api/v1/products                          — list products: BRAND sees their own, FSSAI sees all
GET  /api/v1/products/{id}                     — product detail (same scoping as list)
POST /api/v1/products/{product_id}/batches     — register a batch (BRAND only, must own the product)
GET  /api/v1/products/{product_id}/batches     — list a product's batches (same scoping as product detail)
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_role
from app.models.product import Product, Batch
from app.models.user import User, UserRole
from app.schemas.product import ProductCreate, ProductOut, ProductSummary, BatchCreate, BatchOut

router = APIRouter(prefix="/api/v1/products", tags=["products"])

_require_brand = require_role(UserRole.BRAND)
_require_brand_or_fssai = require_role(UserRole.BRAND, UserRole.FSSAI)


@router.post("/", response_model=ProductOut)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_brand),
):
    # Registration stays BRAND-only -- FSSAI's role here is oversight, not
    # creating registry entries.
    product = Product(id=uuid.uuid4(), brand_user_id=current_user.id, **payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/", response_model=list[ProductSummary])
def list_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_brand_or_fssai),
    limit: int = 200,
    manufacturer: str | None = None,
):
    query = db.query(Product)
    if current_user.role == UserRole.BRAND:
        # "Brand users should only access their own products" (per spec).
        query = query.filter(Product.brand_user_id == current_user.id)
    # FSSAI: no ownership filter -- regulatory oversight needs to see
    # every registered product, same reasoning as Scan's FSSAI access.
    if manufacturer:
        query = query.filter(Product.manufacturer_name == manufacturer)
    return query.order_by(Product.created_at.desc()).limit(limit).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_brand_or_fssai),
):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(404, "Product not found")
    if current_user.role == UserRole.BRAND and product.brand_user_id != current_user.id:
        # Same 404 whether the product doesn't exist or belongs to someone
        # else -- don't leak which one it is to an unauthorized caller.
        raise HTTPException(404, "Product not found")
    return product


@router.post("/{product_id}/batches", response_model=BatchOut)
def create_batch(
    product_id: uuid.UUID,
    payload: BatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_brand),
):
    product = db.get(Product, product_id)
    if product is None or product.brand_user_id != current_user.id:
        raise HTTPException(404, "Product not found")
    batch = Batch(id=uuid.uuid4(), product_id=product_id, **payload.model_dump())
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch


@router.get("/{product_id}/batches", response_model=list[BatchOut])
def list_batches(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_brand_or_fssai),
):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(404, "Product not found")
    if current_user.role == UserRole.BRAND and product.brand_user_id != current_user.id:
        raise HTTPException(404, "Product not found")
    return (
        db.query(Batch)
        .filter(Batch.product_id == product_id)
        .order_by(Batch.created_at.desc())
        .all()
    )