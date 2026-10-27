"""
Demo data seeder for SpectraSafe.

Everything this creates is SYNTHETIC: fictional brands, made-up FSSAI
numbers, made-up scan results. Do not present any of it as real data.

Put this file at  backend/app/seed_demo.py  and run from the backend
folder (the one that contains `app/`):

    python -m app.seed_demo            # add demo data (aborts if already seeded)
    python -m app.seed_demo --reset    # DROP ALL TABLES first, then seed

Scan results are produced by running the app's own functions
(run_compliance_check, classify_violation_types, verify_against_registry,
license_integrity, risk_scoring) on synthetic label data, so statuses,
scores, violation types and risk flags follow your real rules instead of
being typed in by hand.
"""
import random
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from app.core.database import Base, get_db

from app.models.user import User, UserRole
from app.models.product import Product, Batch, VerificationStatus, VegStatus
from app.models.scan import Scan, ComplianceStatus
from app.models.flag import Flag, FlagStatus
from app.models.notice import Notice, NoticeType
from app.models.label import Label, LabelVersion

try:  # optional tables -- imported only so create_all() sees them
    import app.models.label_asset  # noqa: F401
    import app.models.push_subscription  # noqa: F401
except ImportError:
    pass

from app.services.auth_service import hash_password
from app.services.compliance_service import run_compliance_check, classify_violation_types
from app.services.verification_service import verify_against_registry

try:
    from app.services import license_integrity, risk_scoring
except ImportError:
    license_integrity = risk_scoring = None

try:
    from app.services import notice_pdf_service
except ImportError:
    notice_pdf_service = None


PASSWORD = "Demo1234!"
rng = random.Random(42)  # fixed seed: same data every run
NOW = datetime.now(timezone.utc)

_warned = set()


def make(model, **kw):
    """Build a model instance, skipping any keyword that isn't a column on
    it (so the script survives schema differences instead of crashing)."""
    cols = set(model.__table__.columns.keys())
    clean = {}
    for k, v in kw.items():
        if k in cols:
            clean[k] = v
        elif (model.__name__, k) not in _warned:
            _warned.add((model.__name__, k))
            print(f"  note: {model.__name__} has no column '{k}' -- skipped")
    return model(**clean)


def days_ago(n, hours=0):
    return NOW - timedelta(days=n, hours=hours)


# --------------------------------------------------------------------------
# USERS
# --------------------------------------------------------------------------
USER_SPECS = [
    # key, name, email, role, organization, state, account age (days)
    ("brand_a", "Ravi Kumar", "ravi.demo@spectrasafe.com", UserRole.BRAND, "CrunchBite Foods Pvt Ltd", None, 45),
    ("brand_b", "Meera Joshi", "meera.demo@spectrasafe.com", UserRole.BRAND, "Hearth & Grain Bakery", None, 45),
    ("brand_c", "Karan Malhotra", "karan.demo@spectrasafe.com", UserRole.BRAND, "Golden Harvest Snacks", None, 1),
    ("shop_ka", "Suresh Kumar", "suresh.demo@spectrasafe.com", UserRole.SHOPKEEPER, "Sharma Kirana Store, Bengaluru", None, 60),
    ("shop_mh", "Pooja Patil", "pooja.demo@spectrasafe.com", UserRole.SHOPKEEPER, "Patil General Store, Mumbai", None, 60),
    ("shop_dl", "Imran Khan", "imran.demo@spectrasafe.com", UserRole.SHOPKEEPER, "Khan Provision Store, Delhi", None, 60),
    ("fssai_ka", "Anita Rao", "anita.demo@spectrasafe.com", UserRole.FSSAI, "South Zone, Karnataka", "Karnataka", 90),
    ("fssai_mh", "Rahul Deshmukh", "rahul.demo@spectrasafe.com", UserRole.FSSAI, "Western Zone, Maharashtra", "Maharashtra", 90),
    ("fssai_central", "Dr. S. Iyer", "central.demo@spectrasafe.com", UserRole.FSSAI, "FSSAI Central Office", "CENTRAL", 90),
]

# --------------------------------------------------------------------------
# PRODUCTS (registered in this order -- order matters for conflict detection)
# All FSSAI numbers below are invented 14-digit strings, not real licences.
# --------------------------------------------------------------------------
PRODUCT_SPECS = [
    dict(key="granola", owner="brand_a", product_name="Mixed Berry Granola", brand_name="CrunchBite",
         manufacturer_name="CrunchBite Foods Pvt Ltd",
         manufacturer_address="Plot 21, Peenya Industrial Area, Bengaluru, Karnataka 560058",
         state="Karnataka", fssai_license="10020042000222",
         ingredients_raw="Rolled oats, honey, dried berries, almonds, sunflower oil, salt",
         allergens=["tree nuts"], net_quantity="250 g", mrp="Rs. 249", veg=VegStatus.VEG,
         status=VerificationStatus.VERIFIED, reviewer="fssai_ka", age=30),
    dict(key="biscuit", owner="brand_a", product_name="Crunchy Wheat Biscuits", brand_name="CrunchBite",
         manufacturer_name="CrunchBite Foods Pvt Ltd",
         manufacturer_address="Plot 21, Peenya Industrial Area, Bengaluru, Karnataka 560058",
         state="Karnataka", fssai_license="10020042000111",
         ingredients_raw="Wheat flour, sugar, palm oil, invert syrup, milk solids, salt, emulsifier (INS 322)",
         allergens=["wheat", "milk", "soy"], net_quantity="200 g", mrp="Rs. 40", veg=VegStatus.VEG,
         status=VerificationStatus.PENDING, reviewer=None, age=6),
    dict(key="yogurt", owner="brand_a", product_name="Strawberry Low-Fat Yogurt", brand_name="CrunchBite",
         manufacturer_name="CrunchBite Foods Pvt Ltd",
         manufacturer_address="Plot 21, Peenya Industrial Area, Bengaluru, Karnataka 560058",
         state="Karnataka", fssai_license="10020042000333",
         ingredients_raw="Skimmed milk, strawberry puree, sugar, live yogurt cultures, pectin",
         allergens=["milk"], net_quantity="400 g", mrp="Rs. 90", veg=VegStatus.VEG,
         status=VerificationStatus.VERIFIED, reviewer="fssai_ka", age=22),
    dict(key="cookies", owner="brand_b", product_name="Classic Chocolate Chip Cookies", brand_name="Hearth & Grain",
         manufacturer_name="Hearth & Grain Bakery",
         manufacturer_address="Unit 4, MIDC Andheri East, Mumbai, Maharashtra 400093",
         state="Maharashtra", fssai_license="11521001000444",
         ingredients_raw="Wheat flour, butter, sugar, chocolate chips, eggs, baking soda, salt, vanilla extract",
         allergens=["wheat", "milk", "egg", "soy"], net_quantity="150 g", mrp="Rs. 149", veg=VegStatus.NON_VEG,
         status=VerificationStatus.VERIFIED, reviewer="fssai_mh", age=28),
    dict(key="sauce", owner="brand_b", product_name="Organic Tomato Basil Pasta Sauce", brand_name="Hearth & Grain",
         manufacturer_name="Hearth & Grain Bakery",
         manufacturer_address="Unit 4, MIDC Andheri East, Mumbai, Maharashtra 400093",
         state="Maharashtra", fssai_license="11521001000555",
         ingredients_raw="Tomatoes, onion, basil, olive oil, garlic, salt, black pepper",
         allergens=[], net_quantity="500 g", mrp="Rs. 220", veg=VegStatus.VEG,
         status=VerificationStatus.PENDING, reviewer=None, age=2),
    dict(key="bread", owner="brand_b", product_name="Multigrain Sourdough Bread", brand_name="Hearth & Grain",
         manufacturer_name="Hearth & Grain Bakery",
         manufacturer_address="Unit 4, MIDC Andheri East, Mumbai, Maharashtra 400093",
         state="Maharashtra", fssai_license="11521001000666",
         ingredients_raw="Whole wheat flour, water, sourdough starter, flaxseed, sesame seeds, salt",
         allergens=["wheat", "sesame"], net_quantity="400 g", mrp="Rs. 110", veg=VegStatus.VEG,
         status=VerificationStatus.VERIFIED, reviewer="fssai_mh", age=20),
    # Same licence number as the CrunchBite biscuit, different manufacturer:
    # this is the deliberate licence-conflict case.
    dict(key="coconut", owner="brand_c", product_name="Premium Coconut Cookies", brand_name="Golden Harvest",
         manufacturer_name="Golden Harvest Snacks",
         manufacturer_address="12 Hosur Road, Bengaluru, Karnataka 560068",
         state="Karnataka", fssai_license="10020042000111",
         ingredients_raw="Wheat flour, coconut, sugar, vegetable fat, milk solids, salt",
         allergens=["wheat", "milk"], net_quantity="180 g", mrp="Rs. 85", veg=VegStatus.VEG,
         status=VerificationStatus.PENDING, reviewer=None, age=1),
    dict(key="sweetmix", owner="brand_c", product_name="Royal Sweet Mix", brand_name="Golden Harvest",
         manufacturer_name="Golden Harvest Snacks",
         manufacturer_address="12 Hosur Road, Bengaluru, Karnataka 560068",
         state="Karnataka", fssai_license="10020099000777",
         ingredients_raw="Sugar, refined flour, vegetable fat, milk powder, artificial colour",
         allergens=["wheat", "milk"], net_quantity="300 g", mrp="Rs. 160", veg=VegStatus.VEG,
         status=VerificationStatus.REJECTED, reviewer="fssai_ka", age=1),
]

NUTRITION_PER_100G = {
    "Energy (kcal)": "430", "Protein(g)": "8.5", "Total Fat (g)": "16.0",
    "Saturated Fat(g)": "6.5", "Trans Fat(g)": "0.1", "Total Carbs (g)": "62.0",
    "Total Sugar(g)": "18.0", "Sodium (mg)": "320",
}

# --------------------------------------------------------------------------
# SCAN LOCATIONS: (text, lat, lng, state, violation probability, scan count, shopkeeper)
# Several tight clusters so the density heatmap has real hot spots.
# --------------------------------------------------------------------------
LOCATIONS = [
    ("Koramangala, Bengaluru", 12.9352, 77.6245, "Karnataka", 0.60, 24, "shop_ka"),
    ("Indiranagar, Bengaluru", 12.9784, 77.6408, "Karnataka", 0.40, 15, "shop_ka"),
    ("Jayanagar, Bengaluru", 12.9250, 77.5938, "Karnataka", 0.50, 13, "shop_ka"),
    ("Whitefield, Bengaluru", 12.9698, 77.7500, "Karnataka", 0.30, 10, "shop_ka"),
    ("Malleshwaram, Bengaluru", 13.0035, 77.5710, "Karnataka", 0.20, 8, "shop_ka"),
    ("Andheri, Mumbai", 19.1197, 72.8464, "Maharashtra", 0.55, 17, "shop_mh"),
    ("Bandra, Mumbai", 19.0596, 72.8295, "Maharashtra", 0.35, 10, "shop_mh"),
    ("Connaught Place, Delhi", 28.6315, 77.2167, "Delhi", 0.50, 12, "shop_dl"),
    ("Banjara Hills, Hyderabad", 17.4156, 78.4347, "Telangana", 0.40, 8, "shop_dl"),
    ("T. Nagar, Chennai", 13.0418, 80.2341, "Tamil Nadu", 0.30, 8, "shop_dl"),
]

GENERIC_INGREDIENTS = [
    "Wheat flour, sugar, palm oil, milk solids, salt, emulsifier (INS 322)",
    "Rolled oats, honey, almonds, peanut, sunflower oil",
    "Maida, vegetable fat, soya flour, sugar, yeast, salt",
    "Rice flour, gram flour, edible vegetable oil, spices, salt",
    "Skimmed milk, sugar, cocoa solids, vegetable fat, soy lecithin",
]
ALLERGEN_WORDS = ["milk", "wheat", "soy", "soya", "peanut", "egg", "gluten"]

VIOLATION_SCENARIOS = [
    ("allergen_undeclared", 30), ("license_missing", 18), ("license_missing_severe", 7),
    ("license_invalid", 8), ("banned_term", 10), ("trans_fat", 12), ("rejected_match", 15),
]
OK_SCENARIOS = [("compliant_registered", 55), ("compliant_unregistered", 30), ("needs_review_ins", 15)]

REGULATION_TEXT = "FSSAI limit on industrial trans fatty acids"


def pick(weighted):
    names, weights = zip(*weighted)
    return rng.choices(names, weights=weights, k=1)[0]


def fake_license():
    return "9" + "".join(str(rng.randint(0, 9)) for _ in range(13))  # starts with 9: never collides with registry


def nutrients(trans=0.1):
    fat = round(rng.uniform(8, 24), 1)
    return {
        "Energy (kcal)": str(rng.randint(380, 520)),
        "Protein(g)": f"{rng.uniform(4, 14):.1f}",
        "Total Fat (g)": f"{fat:.1f}",
        "Saturated Fat(g)": f"{fat * 0.35:.1f}",
        "Trans Fat(g)": f"{trans:.2f}",
        "Total Carbs (g)": f"{rng.uniform(40, 70):.1f}",
        "Total Sugar(g)": f"{rng.uniform(2, 25):.1f}",
        "Sodium (mg)": str(rng.randint(80, 600)),
    }


def allergen_line(raw):
    found = sorted({w for w in ALLERGEN_WORDS if w in raw.lower()})
    return ("Contains: " + ", ".join(found)) if found else "Contains no major allergens"


def extracted_for(scenario, products):
    verified = [p for p in products.values() if p.verification_status == VerificationStatus.VERIFIED]
    if scenario in ("compliant_registered", "rejected_match"):
        p = products["sweetmix"] if scenario == "rejected_match" else rng.choice(verified)
        raw, lic = p.ingredients_raw, p.fssai_license
        allergens = allergen_line(raw)
    else:
        raw, lic = rng.choice(GENERIC_INGREDIENTS), fake_license()
        allergens = allergen_line(raw)

    ex = {
        "ingredients": [i.strip() for i in raw.split(",")],
        "ingredients_raw": raw,
        "allergen_info": allergens,
        "nutrients": nutrients(),
        "fssai_license": lic,
        "banned_term_hits": [],
        "trans_fat_check": {"status": "compliant", "trans_fat_pct_of_declared_total_fat": 0.5,
                            "limit_pct": 2.0, "regulation": REGULATION_TEXT},
        "ins_details": [],
    }

    if scenario == "allergen_undeclared":
        ex["ingredients_raw"] = "Wheat flour, sugar, milk solids, soy lecithin, palm oil, salt"
        ex["ingredients"] = [i.strip() for i in ex["ingredients_raw"].split(",")]
        ex["allergen_info"] = ""
    elif scenario == "license_missing":
        ex["fssai_license"] = None
    elif scenario == "license_missing_severe":
        ex["fssai_license"] = None
        ex["nutrients"] = {}
    elif scenario == "license_invalid":
        ex["fssai_license"] = "1122334455"
    elif scenario == "banned_term":
        ex["banned_term_hits"] = [{"term": "potassium bromate"}]
    elif scenario == "trans_fat":
        ex["trans_fat_check"] = {"status": "exceeds_limit", "trans_fat_pct_of_declared_total_fat": 3.8,
                                 "limit_pct": 2.0, "regulation": REGULATION_TEXT}
    elif scenario == "needs_review_ins":
        ex["ins_details"] = [{"code": "999", "names": None, "not_found": True}]
    return ex


# --------------------------------------------------------------------------
def main():
    reset = "--reset" in sys.argv

    db = next(get_db())
    bind = db.get_bind()
    db.close()

    if reset:
        if input("--reset DROPS ALL TABLES and all data in them. Type 'yes' to continue: ").strip() != "yes":
            print("Cancelled.")
            return
        Base.metadata.drop_all(bind)
    Base.metadata.create_all(bind)

    db = next(get_db())
    try:
        if db.query(User).filter(User.email == USER_SPECS[0][2]).first():
            print("Demo data already present. Re-run with --reset to wipe everything and reseed.")
            return

        # ---- users ----
        pw_hash = hash_password(PASSWORD)
        users = {}
        for key, name, email, role, org, state, age in USER_SPECS:
            u = make(User, id=uuid.uuid4(), email=email, password_hash=pw_hash, name=name,
                     role=role, organization=org, state=state, created_at=days_ago(age))
            db.add(u)
            users[key] = u
        db.commit()
        print(f"Users: {len(users)}")

        # ---- products (same flow as the create_product endpoint) ----
        products = {}
        for spec in PRODUCT_SPECS:
            owner = users[spec["owner"]]
            conflict = None
            risk = {"score": 0, "flags": []}
            if license_integrity:
                conflict = license_integrity.detect_conflicts(
                    spec["fssai_license"], spec["manufacturer_name"], owner.id, db)
            if risk_scoring:
                risk = risk_scoring.assess_risk(owner, spec["manufacturer_name"], conflict, db)

            p = make(
                Product, id=uuid.uuid4(), brand_user_id=owner.id,
                product_name=spec["product_name"], brand_name=spec["brand_name"],
                description=f"{spec['product_name']} by {spec['brand_name']}.",
                ingredients_raw=spec["ingredients_raw"], allergens=spec["allergens"],
                nutrition=NUTRITION_PER_100G, net_quantity=spec["net_quantity"], mrp=spec["mrp"],
                veg_status=spec["veg"], manufacturer_name=spec["manufacturer_name"],
                manufacturer_address=spec["manufacturer_address"], state=spec["state"],
                fssai_license=spec["fssai_license"], license_conflict=conflict,
                verification_status=VerificationStatus.PENDING,
                risk_score=risk["score"], risk_flags=risk["flags"], created_at=days_ago(spec["age"]),
            )
            db.add(p)
            db.flush()
            products[spec["key"]] = p

            if conflict:
                for pid in conflict["conflicting_product_ids"]:
                    other = db.get(Product, uuid.UUID(pid))
                    if other is not None and other.license_conflict is None:
                        detail = f"FSSAI license {spec['fssai_license']} is also registered by another party"
                        other.license_conflict = {"type": conflict["type"], "detail": detail,
                                                  "conflicting_product_ids": [str(p.id)]}
                        if risk_scoring and hasattr(risk_scoring, "apply_retroactive_conflict_flag"):
                            risk_scoring.apply_retroactive_conflict_flag(other, detail)

        # final review state
        for spec in PRODUCT_SPECS:
            p = products[spec["key"]]
            p.verification_status = spec["status"]
            if spec["reviewer"]:
                if hasattr(p, "reviewed_by_user_id"):
                    p.reviewed_by_user_id = users[spec["reviewer"]].id
                if hasattr(p, "reviewed_at"):
                    p.reviewed_at = days_ago(max(spec["age"] - 1, 0), hours=3)
        db.commit()
        print(f"Products: {len(products)}")

        # ---- batches ----
        n_batches = 0
        for spec in PRODUCT_SPECS:
            if spec["status"] != VerificationStatus.VERIFIED:
                continue
            p = products[spec["key"]]
            for i in range(1, 3):
                mfg = (NOW - timedelta(days=20 * i)).date()
                db.add(make(Batch, id=uuid.uuid4(), product_id=p.id,
                            batch_number=f"{spec['key'][:3].upper()}-2026-{i:03d}",
                            manufacturing_date=mfg, best_before_date=mfg + timedelta(days=180),
                            created_at=days_ago(20 * i)))
                n_batches += 1
        db.commit()
        print(f"Batches: {n_batches}")

        # ---- scans ----
        scans = []
        for text, lat, lng, state, viol_p, count, shop_key in LOCATIONS:
            for _ in range(count):
                scenario = pick(VIOLATION_SCENARIOS) if rng.random() < viol_p else pick(OK_SCENARIOS)
                extracted = extracted_for(scenario, products)
                compliance = run_compliance_check(extracted)
                vtypes = classify_violation_types(compliance)
                verification = verify_against_registry(extracted, db)

                status = ComplianceStatus(compliance["status"])
                if verification["status"] in ("MATCHED_WITH_DISCREPANCIES", "MATCHED_REJECTED_PRODUCT"):
                    status = ComplianceStatus.SUSPICIOUS

                s = make(
                    Scan, id=uuid.uuid4(),
                    image_filename=f"IMG_{rng.randint(8000, 9999)}.{rng.choice(['jpg', 'png', 'jpeg'])}",
                    stored_image_filename=None,
                    fssai_license=extracted.get("fssai_license"),
                    matched_product_id=verification.get("matched_product_id"),
                    scanned_by_user_id=users[shop_key].id,
                    compliance_status=status, compliance_score=compliance["score"],
                    violation_types=vtypes, location_text=text,
                    latitude=lat + rng.gauss(0, 0.0045), longitude=lng + rng.gauss(0, 0.0045),
                    state=state, ocr_result=extracted, compliance_result=compliance,
                    product_verification=verification,
                    created_at=days_ago(rng.randint(0, 29), hours=rng.randint(0, 23)),
                )
                db.add(s)
                scans.append(s)
        db.commit()
        print(f"Scans: {len(scans)}")

        # ---- flags ----
        reasons = [
            "FSSAI license number not visible on pack",
            "Allergen not declared despite milk/wheat in ingredients",
            "Label looks reprinted - license number blurred",
            "Product registered under a different manufacturer",
            "Best-before date missing on shelf stock",
        ]
        flaggable = [s for s in scans if s.compliance_status in (ComplianceStatus.SUSPICIOUS, ComplianceStatus.NON_COMPLIANT)]
        flags = []
        for s in rng.sample(flaggable, min(12, len(flaggable))):
            f = make(Flag, id=uuid.uuid4(), scan_id=s.id, flagged_by_user_id=s.scanned_by_user_id,
                     reason=rng.choice(reasons), observations="[DEMO DATA] Seeded observation.",
                     status=rng.choices([FlagStatus.OPEN, FlagStatus.UNDER_REVIEW, FlagStatus.RESOLVED],
                                        weights=[50, 25, 25])[0],
                     created_at=s.created_at + timedelta(hours=1))
            db.add(f)
            flags.append(f)
        db.commit()
        print(f"Flags: {len(flags)}")

        # ---- notices (+ real PDFs, clearly marked as demo) ----
        notice_specs = [
            (NoticeType.SHOW_CAUSE, "Golden Harvest Snacks", "10020042000111",
             "[DEMO DATA - fictional company] FSSAI license number 10020042000111 is registered to more than "
             "one manufacturer in the registry. Explain the discrepancy within the stipulated period."),
            (NoticeType.STOP_SALE, "Golden Harvest Snacks", "10020099000777",
             "[DEMO DATA - fictional company] Registration for 'Royal Sweet Mix' was rejected on review. "
             "Sale of this product is to stop pending resolution."),
        ]
        notices_dir = Path("app/data/notices")
        notices_dir.mkdir(parents=True, exist_ok=True)
        n_pdfs = 0
        for ntype, mfr, lic, details in notice_specs:
            n = make(Notice, id=uuid.uuid4(), manufacturer_name=mfr, fssai_license=lic, notice_type=ntype,
                     details=details, flag_id=None, issued_by_user_id=users["fssai_ka"].id,
                     created_at=days_ago(1))
            if notice_pdf_service:
                try:
                    fname = f"{n.id}.pdf"
                    notice_pdf_service.generate_notice_pdf(n, notices_dir / fname)
                    n.pdf_filename = fname
                    n_pdfs += 1
                except Exception as e:  # missing reportlab etc. -- notice still saved
                    print(f"  note: PDF skipped ({e})")
            db.add(n)
        db.commit()
        print(f"Notices: {len(notice_specs)} ({n_pdfs} PDFs)")

        # ---- labels ----
        def label_data(p, **extra):
            d = {
                "product_name": p.product_name, "brand_name": p.brand_name,
                "ingredients_list": p.ingredients_raw, "allergens": p.allergens,
                "nutrients": NUTRITION_PER_100G, "net_quantity": p.net_quantity, "mrp": p.mrp,
                "manufacturer_name": p.manufacturer_name, "manufacturer_address": p.manufacturer_address,
                "fssai_license": p.fssai_license, "veg_status": "VEG" if p.veg_status == VegStatus.VEG else "NON_VEG",
                "country_of_origin": "India", "storage_conditions": "Store in a cool, dry place",
            }
            d.update(extra)
            return d

        label_specs = [
            ("brand_a", products["granola"], "Mixed Berry Granola - EU export",
             label_data(products["granola"], date_of_manufacture=str((NOW - timedelta(days=10)).date()),
                        best_before_date=str((NOW + timedelta(days=170)).date()), batch_number="GRA-2026-001"),
             ["FSSAI", "EU_1169"]),
            ("brand_b", products["cookies"], "Classic Chocolate Chip Cookies",
             label_data(products["cookies"]),  # deliberately no dates/batch: shows failing checks
             ["FSSAI"]),
        ]
        for owner_key, prod, title, data, markets in label_specs:
            lab = make(Label, id=uuid.uuid4(), brand_user_id=users[owner_key].id, product_id=prod.id,
                       title=title, current_version=1, data=data, layout=None, target_markets=markets)
            db.add(lab)
            db.flush()
            db.add(make(LabelVersion, id=uuid.uuid4(), label_id=lab.id, version_number=1, data=data))
        db.commit()
        print(f"Labels: {len(label_specs)}")

        by_status = {}
        for s in scans:
            by_status[s.compliance_status.value] = by_status.get(s.compliance_status.value, 0) + 1
        print("\nScan status mix:", by_status)

        print(f"\nAll demo accounts use the password:  {PASSWORD}")
        for key, name, email, role, org, state, _ in USER_SPECS:
            print(f"  {role.value:<11} {email:<34} {org}")
        print("\nDone.")
    finally:
        db.close()


if __name__ == "__main__":
    main()