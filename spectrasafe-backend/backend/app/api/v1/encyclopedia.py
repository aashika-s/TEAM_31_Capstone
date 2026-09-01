"""
GET /api/v1/encyclopedia/search?q=...   — search the ingredient encyclopedia
GET /api/v1/encyclopedia/{slug}          — full detail for one entry

For the "look it up yourself" flow: whenever the pipeline doesn't
automatically match an ingredient or INS code, a person should still be
able to search this data manually. Open to any authenticated role -- it's
read-only reference data, not something that needs role restriction.
"""
from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_current_user
from app.models.user import User
from app.services import encyclopedia_service

router = APIRouter(prefix="/api/v1/encyclopedia", tags=["encyclopedia"])


@router.get("/search")
def search(q: str, current_user: User = Depends(get_current_user)):
    if not q or not q.strip():
        return []
    results = encyclopedia_service.search_encyclopedia(q)
    return [
        {"name": r["name"], "category": r["category"], "summary": r["summary"], "slug": r["slug"]}
        for r in results
    ]


@router.get("/{slug}")
def get_entry(slug: str, current_user: User = Depends(get_current_user)):
    record = encyclopedia_service.get_by_slug(slug)
    if record is None:
        raise HTTPException(404, "Not found")
    return {
        "name": record["name"],
        "category": record["category"],
        "slug": record["slug"],
        "text": record["text"],
        "description": record["description"],
        "keywords": record["keywords"],
    }