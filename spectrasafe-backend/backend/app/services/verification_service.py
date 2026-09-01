"""
Compares a scan's extracted OCR data against the Brand-registered product
with the same FSSAI license.

Scoped honestly to what the pipeline actually extracts today: license,
ingredients text, allergen text, nutrients. It does NOT compare product
name, manufacturer name, or batch number against the registry, because
ocr_pipeline.py doesn't extract those fields from the label at all yet --
claiming to check them would be reporting a check that isn't really
happening. Extend this once the pipeline extracts those fields.
"""
import re

from sqlalchemy.orm import Session

from app.models.product import Product

_STOPWORDS_MIN_LEN = 3


def verify_against_registry(extracted: dict, db: Session) -> dict:
    result = {
        "status": "NOT_CHECKED",
        "matched_product_id": None,
        "matched_product_name": None,
        "mismatches": [],
        "notes": [],
    }

    license_value = (extracted.get("fssai_license") or "").strip()
    if not license_value or license_value.startswith("⚠️"):
        result["status"] = "NO_LICENSE_EXTRACTED"
        result["notes"].append(
            "No valid 14-digit FSSAI license was extracted from this scan, "
            "so it can't be looked up against the product registry."
        )
        return result

    product = db.query(Product).filter(Product.fssai_license == license_value).first()
    if product is None:
        result["status"] = "NOT_REGISTERED"
        result["notes"].append(
            f"No product is registered under FSSAI license {license_value}."
        )
        return result

    result["status"] = "MATCHED"
    result["matched_product_id"] = str(product.id)
    result["matched_product_name"] = product.product_name

    # Ingredients consistency -- crude token-overlap ratio rather than an
    # exact match, since OCR wording will never exactly match the
    # registered text verbatim (word order, punctuation, minor misreads).
    scanned_ing = (extracted.get("ingredients_raw") or "").lower()
    registered_ing = (product.ingredients_raw or "").lower()
    if registered_ing and scanned_ing:
        reg_tokens = {w for w in re.findall(r'[a-z]+', registered_ing) if len(w) >= _STOPWORDS_MIN_LEN}
        scan_tokens = {w for w in re.findall(r'[a-z]+', scanned_ing) if len(w) >= _STOPWORDS_MIN_LEN}
        if reg_tokens:
            overlap = len(reg_tokens & scan_tokens) / len(reg_tokens)
            if overlap < 0.5:
                result["mismatches"].append(
                    f"Scanned ingredients overlap only {overlap:.0%} with the "
                    f"registered ingredients for '{product.product_name}' -- "
                    "possible mismatch, misprint, or wrong product scanned."
                )

    # Allergen declaration presence -- every allergen the Brand declared at
    # registration should show up somewhere in the scanned allergen text.
    if product.allergens:
        declared = {a.lower() for a in product.allergens}
        scan_allergen_text = (extracted.get("allergen_info") or "").lower()
        missing_declared = sorted(a for a in declared if a not in scan_allergen_text)
        if missing_declared:
            result["mismatches"].append(
                "Registered allergen(s) not found in this scan's allergen "
                f"declaration: {', '.join(missing_declared)}"
            )

    if result["mismatches"]:
        result["status"] = "MATCHED_WITH_DISCREPANCIES"

    return result