"""Additive demo data for the water module (does NOT wipe anything).

    python -m app.seed_water --images "C:/path/to/combined_water_dataset"
    python -m app.seed_water --images ... --reset-water   # delete previously seeded water samples first

Creates (if missing) three demo officials -- password Demo1234!
    spcb.karnataka.demo@spectrasafe.test   SPCB, Karnataka
    spcb.maharashtra.demo@spectrasafe.test SPCB, Maharashtra
    cpcb.demo@spectrasafe.test             CPCB, national
then classifies real spectrum photos from the dataset folder with the REAL model and drops
them at plausible water-body locations so the map has hot spots to screenshot.

HONESTY NOTE: these photos are the model's own training images, so the results look better than
they would on new samples. Every seeded row is tagged "[DEMO DATA]" in its notes.
"""
import argparse
import hashlib
import random
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import cv2
import numpy as np

from app.core.database import Base, get_db
from app.models.user import User, UserRole
from app.models.water_sample import WaterSample
from app.services.auth_service import hash_password
from app.services.water.predictor import get_predictor, load_error
from app.api.v1.water import IMAGES_DIR

PASSWORD = "Demo1234!"
TAG = "[DEMO DATA]"

OFFICIALS = [
    ("Karnataka SPCB Officer", "spcb.karnataka.demo@spectrasafe.com", UserRole.SPCB, "Karnataka State Pollution Control Board", "Karnataka"),
    ("Maharashtra SPCB Officer", "spcb.maharashtra.demo@spectrasafe.com", UserRole.SPCB, "Maharashtra Pollution Control Board", "Maharashtra"),
    ("CPCB Officer", "cpcb.demo@spectrasafe.com", UserRole.CPCB, "Central Pollution Control Board", "CENTRAL"),
]

# name, lat, lon, state, share of samples, probability a sample there is a "risk" photo, submitted by (email)
KA, MH, CP = OFFICIALS[0][1], OFFICIALS[1][1], OFFICIALS[2][1]
SITES = [
    ("Bellandur Lake",        12.9352, 77.6700, "Karnataka",   7, 0.90, KA),
    ("Varthur Lake",          12.9380, 77.7420, "Karnataka",   6, 0.85, KA),
    ("Ulsoor Lake",           12.9830, 77.6180, "Karnataka",   4, 0.50, KA),
    ("Hebbal Lake",           13.0450, 77.5950, "Karnataka",   4, 0.40, KA),
    ("Sankey Tank",           13.0090, 77.5700, "Karnataka",   3, 0.25, KA),
    ("Kukkarahalli Lake",     12.3050, 76.6350, "Karnataka",   3, 0.10, KA),
    ("Netravati River, Mangaluru", 12.8700, 74.8450, "Karnataka", 2, 0.05, KA),
    ("Mithi River, Bandra",   19.0650, 72.8650, "Maharashtra", 6, 0.90, MH),
    ("Powai Lake",            19.1260, 72.9050, "Maharashtra", 4, 0.45, MH),
    ("Ulhas River, Kalyan",   19.2400, 73.1300, "Maharashtra", 4, 0.70, MH),
    ("Mula-Mutha, Pune",      18.5300, 73.8550, "Maharashtra", 4, 0.60, MH),
    ("Ambazari Lake, Nagpur", 21.1280, 79.0450, "Maharashtra", 2, 0.20, MH),
    ("Yamuna at Wazirabad",   28.6600, 77.2300, "Delhi",       5, 0.95, CP),
    ("Ganga at Kanpur",       26.4700, 80.3500, "Uttar Pradesh", 4, 0.75, CP),
    ("Hussain Sagar",         17.4230, 78.4730, "Telangana",   4, 0.65, CP),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--images", required=True, help="folder containing safe_reference/ and potential_risk/")
    ap.add_argument("--reset-water", action="store_true")
    a = ap.parse_args()
    root = Path(a.images)
    safe = sorted((root / "safe_reference").glob("*.jp*g"))
    risk = sorted((root / "potential_risk").glob("*.jp*g"))
    if not safe or not risk:
        sys.exit(f"Expected safe_reference/ and potential_risk/ with .jpg files inside {root}")

    pred = get_predictor()
    if pred is None:
        sys.exit(f"Water model not available: {load_error()}")

    rng = random.Random(7)
    db = next(get_db())
    Base.metadata.create_all(db.get_bind())
    try:
        if a.reset_water:
            n = db.query(WaterSample).filter(WaterSample.notes.like(f"{TAG}%")).delete(synchronize_session=False)
            db.commit(); print(f"Removed {n} previously seeded water samples.")

        pw = hash_password(PASSWORD)
        users = {}
        for name, email, role, org, state in OFFICIALS:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                cols = set(User.__table__.columns.keys())
                kw = dict(id=uuid.uuid4(), email=email, password_hash=pw, name=name, role=role, organization=org, state=state)
                u = User(**{k: v for k, v in kw.items() if k in cols})
                db.add(u); db.flush()
            users[email] = u
        db.commit()

        rng.shuffle(safe); rng.shuffle(risk)
        si = ri = 0
        made = skipped = 0
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        for name, lat, lon, state, n, p_risk, who in SITES:
            for _ in range(n):
                use_risk = rng.random() < p_risk
                if use_risk and ri < len(risk): path = risk[ri]; ri += 1
                elif si < len(safe): path = safe[si]; si += 1
                elif ri < len(risk): path = risk[ri]; ri += 1
                else: continue
                arr = cv2.imread(str(path), cv2.IMREAD_COLOR)
                if arr is None: continue
                ok, buf = cv2.imencode(".jpg", arr, [cv2.IMWRITE_JPEG_QUALITY, 92])
                jpg = buf.tobytes(); sha = hashlib.sha256(jpg).hexdigest()
                if db.query(WaterSample).filter(WaterSample.image_sha256 == sha).first():
                    skipped += 1; continue
                res = pred.predict(cv2.cvtColor(arr, cv2.COLOR_BGR2RGB))
                sid = uuid.uuid4(); fn = f"{sid}.jpg"
                (IMAGES_DIR / fn).write_bytes(jpg)
                when = now - timedelta(days=rng.randint(0, 29), hours=rng.randint(0, 23))
                db.add(WaterSample(
                    id=sid, user_id=users[who].id, created_at=when, captured_at=when,
                    lat=round(lat + rng.gauss(0, 0.004), 5), lon=round(lon + rng.gauss(0, 0.004), 5),
                    site_name=name, notes=f"{TAG} training-set photo, not a real field sample", state=state,
                    result=res["result"], p_unsafe=res["p_unsafe"], novelty_z=res["novelty_z"], quality=res["quality"],
                    model_version=pred.version, image_filename=fn, image_sha256=sha, visible=True))
                made += 1
        db.commit()
        tally = {}
        for (r,) in db.query(WaterSample.result).filter(WaterSample.notes.like(f"{TAG}%")).all():
            tally[r] = tally.get(r, 0) + 1
        print(f"Seeded {made} water samples ({skipped} duplicates skipped): {tally}")
        print("\nLogins (password Demo1234!):")
        for name, email, role, org, state in OFFICIALS:
            print(f"  {role.value:5} {email:42} {state}")
        print("\nNOTE: demo photos are training images, so accuracy here is NOT representative.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
