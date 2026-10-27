"""Water-quality screening (laser diffraction-spectrum photos).

Roles (water has its own officials; food roles have no access)
  SPCB : State Pollution Control Board officer. Submits samples; sees samples in their state
         (User.state) plus anything they submitted themselves.
  CPCB : Central Pollution Control Board officer. Submits samples; sees every state.
Results are screening only. The label for a good result is "no contaminant detected",
never "safe" -- the model is not a drinking-water certification.
"""
import hashlib
import uuid
from datetime import datetime, timezone
from pathlib import Path

import cv2
import numpy as np
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.water_sample import WaterSample
from app.schemas.water import WaterModelInfo, WaterSampleOut, WaterStats
from app.services.water.predictor import get_predictor, load_error

router = APIRouter(prefix="/api/v1/water", tags=["water"])

MAX_BYTES = 15 * 1024 * 1024
MIN_SHORT_SIDE = 480
IMAGES_DIR = Path(__file__).resolve().parents[2] / "data" / "water_images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

RESULTS = ("unsafe", "no_contaminant_detected", "inconclusive")

# Who may use the water module. Change this one line to widen/narrow access.
WATER_ROLES = (UserRole.SPCB, UserRole.CPCB)


def _scope(query, user: User):
    """Jurisdiction rule: CPCB sees everything; SPCB sees their state plus their own submissions.
    An SPCB account with no state set sees only its own submissions (fails closed, never open)."""
    query = query.filter(WaterSample.visible.is_(True))
    if user.role == UserRole.CPCB:
        return query
    state = getattr(user, "state", None)
    own = WaterSample.user_id == user.id
    if state and state != "CENTRAL":
        return query.filter(or_(WaterSample.state == state, own))
    return query.filter(own)


def _out(s: WaterSample, db: Session) -> WaterSampleOut:
    out = WaterSampleOut.model_validate(s)
    owner = db.get(User, s.user_id)
    out.submitted_by = getattr(owner, "name", None)
    return out


@router.get("/model-info", response_model=WaterModelInfo)
def model_info(user: User = Depends(get_current_user)):
    p = get_predictor()
    if p is None:
        return WaterModelInfo(loaded=False, error=load_error() or "Model not loaded")
    return WaterModelInfo(loaded=True, version=p.version, metrics=p.metrics)


@router.post("/samples", response_model=WaterSampleOut)
async def create_sample(
    image: UploadFile = File(...),
    lat: float = Form(...),
    lon: float = Form(...),
    site_name: str | None = Form(None),
    notes: str | None = Form(None),
    captured_at: str | None = Form(None),
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*WATER_ROLES)),
):
    predictor = get_predictor()
    if predictor is None:
        raise HTTPException(503, f"Water model not available: {load_error() or 'not loaded'}")
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise HTTPException(422, "lat/lon out of range.")

    raw = await image.read()
    if len(raw) > MAX_BYTES:
        raise HTTPException(413, "Image larger than 15 MB.")
    arr = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    if arr is None:
        raise HTTPException(422, "File is not a readable image.")
    if min(arr.shape[:2]) < MIN_SHORT_SIDE:
        raise HTTPException(422, f"Image too small (need at least {MIN_SHORT_SIDE}px on the short side).")

    ok, buf = cv2.imencode(".jpg", arr, [cv2.IMWRITE_JPEG_QUALITY, 92])  # re-encode: strips EXIF/GPS
    if not ok:
        raise HTTPException(422, "Could not process image.")
    jpg = buf.tobytes()
    sha = hashlib.sha256(jpg).hexdigest()

    dup = db.query(WaterSample).filter(WaterSample.image_sha256 == sha).first()
    if dup:
        raise HTTPException(409, "This exact image was already submitted.")

    res = predictor.predict(cv2.cvtColor(arr, cv2.COLOR_BGR2RGB))

    state = None
    try:
        from app.services.geocoding_service import reverse_geocode_state
        state = reverse_geocode_state(lat, lon)
    except Exception:  # noqa: BLE001  (geocoding is best-effort; never block a submission)
        pass

    cap = None
    if captured_at:
        try:
            cap = datetime.fromisoformat(captured_at.replace("Z", "+00:00")).replace(tzinfo=None)
        except ValueError:
            pass

    sid = uuid.uuid4()
    filename = f"{sid}.jpg"
    (IMAGES_DIR / filename).write_bytes(jpg)

    s = WaterSample(
        id=sid, user_id=user.id, lat=round(lat, 5), lon=round(lon, 5),
        site_name=(site_name or "").strip()[:120] or None,
        notes=(notes or "").strip()[:1000] or None,
        captured_at=cap, state=state,
        result=res["result"], p_unsafe=res["p_unsafe"], novelty_z=res["novelty_z"],
        quality=res["quality"], model_version=predictor.version,
        image_filename=filename, image_sha256=sha,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return _out(s, db)


@router.get("/samples", response_model=list[WaterSampleOut])
def list_samples(
    result: str | None = Query(None),
    limit: int = Query(500, le=2000),
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*WATER_ROLES)),
):
    if result and result not in RESULTS:
        raise HTTPException(422, f"result must be one of {RESULTS}")
    q = _scope(db.query(WaterSample), user)
    if result:
        q = q.filter(WaterSample.result == result)
    rows = q.order_by(WaterSample.created_at.desc()).limit(limit).all()
    return [_out(s, db) for s in rows]


@router.get("/stats", response_model=WaterStats)
def stats(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*WATER_ROLES)),
):
    rows = (
        _scope(db.query(WaterSample.result, func.count()), user)
        .group_by(WaterSample.result)
        .all()
    )
    d = {k: v for k, v in rows}
    return WaterStats(
        total=sum(d.values()),
        unsafe=d.get("unsafe", 0),
        no_contaminant_detected=d.get("no_contaminant_detected", 0),
        inconclusive=d.get("inconclusive", 0),
    )


@router.get("/samples/{sample_id}", response_model=WaterSampleOut)
def get_sample(
    sample_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_role(*WATER_ROLES)),
):
    s = _scope(db.query(WaterSample), user).filter(WaterSample.id == sample_id).first()
    if not s:
        raise HTTPException(404, "Sample not found")
    return _out(s, db)


@router.get("/images/{filename}")
def get_image(filename: str):
    # Same approach as scan images: unguessable UUID filenames, <img> tags can't send auth headers.
    safe = Path(filename).name
    path = IMAGES_DIR / safe
    if not path.exists():
        raise HTTPException(404, "Image not found")
    return FileResponse(path, media_type="image/jpeg", headers={"Cache-Control": "private, max-age=86400"})
