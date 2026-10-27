"""
Content-hash cache for OCR pipeline output. run_pipeline() is the slow
step (YOLO + PaddleOCR/EasyOCR ensemble) -- re-scanning the exact same
image (e.g. during a demo rehearsal) shouldn't re-run it every time.
Keyed by the raw image bytes' SHA-256, so any byte-identical re-upload
hits the cache regardless of filename. Persisted to disk, not just
in-memory, so it survives uvicorn's auto-reload on every file save.
"""
import hashlib
import json
from pathlib import Path

_CACHE_DIR = Path("app/data/ocr_cache")
_CACHE_DIR.mkdir(parents=True, exist_ok=True)


def _hash_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def get_cached(image_bytes: bytes) -> dict | None:
    path = _CACHE_DIR / f"{_hash_bytes(image_bytes)}.json"
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text())
    except Exception:
        return None


def set_cached(image_bytes: bytes, extracted: dict) -> None:
    path = _CACHE_DIR / f"{_hash_bytes(image_bytes)}.json"
    try:
        path.write_text(json.dumps(extracted, default=str))
    except Exception:
        pass  # caching is a nice-to-have -- never fail a scan over it