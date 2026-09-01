# """
# Wraps the real compliance engine now that it's part of ocr_pipeline.py
# (run_pipeline() already calls run_compliance_checks() internally, so the
# `extracted` dict passed in here already has ins_details/banned_term_hits/
# trans_fat_check on it — this module's job is just turning those into the
# status/score shape the Scan model and API expect).
# """
# from app.models.scan import ComplianceStatus

# _MANDATORY_FIELDS = [
#     ("ingredients", "Ingredients list"),
#     ("nutrients", "Nutrition information"),
#     ("fssai_license", "FSSAI license number"),
# ]

# _COMMON_ALLERGENS = ["milk", "wheat", "soy", "soya", "peanut", "tree nut", "egg", "gluten"]


# def run_compliance_check(extracted: dict) -> dict:
#     missing_fields: list[str] = []
#     violations: list[str] = []
#     warnings: list[str] = []

#     for key, label in _MANDATORY_FIELDS:
#         if not extracted.get(key):
#             missing_fields.append(label)

#     license_value = extracted.get("fssai_license") or ""
#     if license_value.startswith("⚠️"):
#         violations.append("FSSAI license number could not be verified as 14 digits")
#     elif license_value and not (license_value.isdigit() and len(license_value) == 14):
#         violations.append("FSSAI license number is not a valid 14-digit number")

#     # Banned/restricted ingredient terms — a real hit, not a maybe.
#     banned_hits = extracted.get("banned_term_hits") or []
#     for hit in banned_hits:
#         violations.append(f"Banned/restricted term found in ingredients: '{hit.get('term')}'")

#     # Trans fat ratio vs FSSAI's 2% limit.
#     trans_fat = extracted.get("trans_fat_check") or {}
#     if trans_fat.get("status") == "exceeds_limit":
#         violations.append(
#             f"Trans fat is {trans_fat.get('trans_fat_pct_of_total_fat')}% of total fat "
#             f"(limit {trans_fat.get('limit_pct')}%) — {trans_fat.get('regulation')}"
#         )

#     # Unrecognized INS/E-numbers aren't automatically a violation (could be
#     # an OCR misread), but they're worth a human's attention.
#     unresolved_ins = [d["code"] for d in (extracted.get("ins_details") or []) if d.get("not_found")]
#     if unresolved_ins:
#         warnings.append(f"Unrecognized INS/E-number code(s), verify manually: {', '.join(unresolved_ins)}")

#     # Allergen cross-check: an allergen keyword in ingredients but no
#     # separate allergen declaration at all.
#     ingredients_text = (extracted.get("ingredients_raw") or "").lower()
#     allergen_text = (extracted.get("allergen_info") or "").lower()
#     if ingredients_text and not allergen_text:
#         found = [a for a in _COMMON_ALLERGENS if a in ingredients_text]
#         if found:
#             warnings.append(
#                 f"Possible allergen(s) {', '.join(sorted(set(found)))} found in ingredients "
#                 "but no separate allergen declaration was detected"
#             )

#     total_checks = len(_MANDATORY_FIELDS) + 3  # license format + banned terms + trans fat
#     failed_checks = len(missing_fields) + len(violations)
#     score = round(max(0.0, (total_checks - failed_checks) / total_checks) * 100, 1)

#     if banned_hits:
#         status = ComplianceStatus.SUSPICIOUS
#     elif trans_fat.get("status") == "exceeds_limit":
#         status = ComplianceStatus.NON_COMPLIANT
#     elif violations:
#         status = ComplianceStatus.SUSPICIOUS
#     elif missing_fields:
#         status = ComplianceStatus.NON_COMPLIANT if len(missing_fields) > 1 else ComplianceStatus.NEEDS_REVIEW
#     elif warnings:
#         status = ComplianceStatus.NEEDS_REVIEW
#     else:
#         status = ComplianceStatus.COMPLIANT

#     return {
#         "status": status.value,
#         "score": score,
#         "violations": violations,
#         "warnings": warnings,
#         "missing_fields": missing_fields,
#     }










"""
Wraps the real compliance engine now that it's part of ocr_pipeline.py
(run_pipeline() already calls run_compliance_checks() internally, so the
`extracted` dict passed in here already has ins_details/banned_term_hits/
trans_fat_check on it — this module's job is just turning those into the
status/score shape the Scan model and API expect).
"""
from app.models.scan import ComplianceStatus

_MANDATORY_FIELDS = [
    ("ingredients", "Ingredients list"),
    ("nutrients", "Nutrition information"),
    ("fssai_license", "FSSAI license number"),
]

_COMMON_ALLERGENS = ["milk", "wheat", "soy", "soya", "peanut", "tree nut", "egg", "gluten"]


def run_compliance_check(extracted: dict) -> dict:
    missing_fields: list[str] = []
    violations: list[str] = []
    warnings: list[str] = []

    for key, label in _MANDATORY_FIELDS:
        if not extracted.get(key):
            missing_fields.append(label)

    license_value = extracted.get("fssai_license") or ""
    if license_value.startswith("⚠️"):
        violations.append("FSSAI license number could not be verified as 14 digits")
    elif license_value and not (license_value.isdigit() and len(license_value) == 14):
        violations.append("FSSAI license number is not a valid 14-digit number")

    # Banned/restricted ingredient terms — a real hit, not a maybe.
    banned_hits = extracted.get("banned_term_hits") or []
    for hit in banned_hits:
        violations.append(f"Banned/restricted term found in ingredients: '{hit.get('term')}'")

    # Trans fat ratio vs FSSAI's 2% limit. Worded to match what's actually
    # being measured -- see check_trans_fat_compliance()'s docstring for
    # why this is "% of declared Total Fat" and not the regulation's exact
    # basis (total oils/fats used as an ingredient, which no label states).
    trans_fat = extracted.get("trans_fat_check") or {}
    if trans_fat.get("status") == "exceeds_limit":
        violations.append(
            f"Industrial trans fatty acids are {trans_fat.get('trans_fat_pct_of_declared_total_fat')}% "
            f"of the label's declared Total Fat, exceeding the FSSAI limit of {trans_fat.get('limit_pct')}% "
            f"— {trans_fat.get('regulation')}. Note: the regulation's limit is against total oils/fats "
            "used as an ingredient, not declared Total Fat -- this is an approximation from label data."
        )

    # Unrecognized INS/E-numbers aren't automatically a violation (could be
    # an OCR misread), but they're worth a human's attention.
    unresolved_ins = [d["code"] for d in (extracted.get("ins_details") or []) if d.get("not_found")]
    if unresolved_ins:
        warnings.append(f"Unrecognized INS/E-number code(s), verify manually: {', '.join(unresolved_ins)}")

    # Allergen cross-check: an allergen keyword in ingredients but no
    # separate allergen declaration at all.
    ingredients_text = (extracted.get("ingredients_raw") or "").lower()
    allergen_text = (extracted.get("allergen_info") or "").lower()
    if ingredients_text and not allergen_text:
        found = [a for a in _COMMON_ALLERGENS if a in ingredients_text]
        if found:
            warnings.append(
                f"Possible allergen(s) {', '.join(sorted(set(found)))} found in ingredients "
                "but no separate allergen declaration was detected"
            )

    total_checks = len(_MANDATORY_FIELDS) + 3  # license format + banned terms + trans fat
    failed_checks = len(missing_fields) + len(violations)
    score = round(max(0.0, (total_checks - failed_checks) / total_checks) * 100, 1)

    if banned_hits:
        status = ComplianceStatus.SUSPICIOUS
    elif trans_fat.get("status") == "exceeds_limit":
        status = ComplianceStatus.NON_COMPLIANT
    elif violations:
        status = ComplianceStatus.SUSPICIOUS
    elif missing_fields:
        status = ComplianceStatus.NON_COMPLIANT if len(missing_fields) > 1 else ComplianceStatus.NEEDS_REVIEW
    elif warnings:
        status = ComplianceStatus.NEEDS_REVIEW
    else:
        status = ComplianceStatus.COMPLIANT

    return {
        "status": status.value,
        "score": score,
        "violations": violations,
        "warnings": warnings,
        "missing_fields": missing_fields,
    }


def classify_violation_types(compliance_result: dict) -> list[str]:
    """
    Buckets a scan's findings into coarse categories for filtering
    (ALLERGEN / LICENSE / ADDITIVE). Deterministic keyword matching over
    the violations/warnings/missing_fields text run_compliance_check()
    already produces -- not every finding fits one of these three
    buckets (e.g. a missing ingredients list doesn't), and that's fine;
    those scans just won't appear under any category filter besides "All".
    """
    types = set()
    all_text = (
        compliance_result.get("violations", [])
        + compliance_result.get("warnings", [])
        + compliance_result.get("missing_fields", [])
    )
    for line in all_text:
        lower = line.lower()
        if "license" in lower:
            types.add("LICENSE")
        if "allergen" in lower:
            types.add("ALLERGEN")
        if "banned/restricted term" in lower or "trans fat" in lower or "ins/e-number" in lower:
            types.add("ADDITIVE")
    return sorted(types)