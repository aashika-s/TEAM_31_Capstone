"""
Checks a Label draft against a chosen country's rule sheet.

This engine performs deterministic field-presence and basic-format
checking based on the structured data entered by the brand.

It is explicitly NOT a claim of full legal compliance. Physical
label properties such as font size, placement, print quality, visual
symbols, packaging context, and other product-category-specific
requirements cannot be verified from structured form data alone.

The engine checks what can be determined from the available data:
- Whether applicable mandatory/conditional fields are present
- Whether required nutrients are present
- Whether declared allergens cover allergens detected in ingredients
- A score based only on requirements that actually apply
"""

from app.services.label_rules import RULE_SHEETS


# ---------------------------------------------------------------------------
# CONDITIONAL FIELD TRIGGERS
# ---------------------------------------------------------------------------
"""
CONDITIONAL_TRIGGERS maps a field key to a function that decides whether
the requirement actually APPLIES to this specific label.

A CONDITIONAL field whose trigger returns False is not "missing" -- it
simply doesn't apply to this product.

A MANDATORY field has no trigger check; it always applies.

For fields where the current structured data is not sufficient to infer
whether a requirement applies, the trigger should either:
- return True when the requirement is generally applicable, or
- return False when the requirement is opt-in / cannot safely be inferred.

This prevents the compliance score from penalizing a label for a
conditional requirement that does not apply.
"""

CONDITIONAL_TRIGGERS = {
    # Allergens only apply when allergens are actually present/declared
    # in the structured product data.
    "allergen_declaration": lambda d: bool(d.get("allergens")),

    # Nutrition requirements.
    # The actual nutrient list is handled separately below according to
    # the country's nutrition_declaration_conditional rule.
    "nutrition_information": lambda d: True,
    "nutrition_declaration": lambda d: True,
    "nutrition_information_panel": lambda d: True,

    # Country of origin is conditional in the current data model.
    # If the brand provides it, the field is relevant. Product-category
    # rules that require origin based on other facts need a richer trigger.
    "country_of_origin": lambda d: bool(d.get("country_of_origin")),

    # Storage information only applies when the product has storage
    # conditions to declare.
    "storage_instructions": lambda d: bool(d.get("storage_conditions")),
    "storage_conditions": lambda d: bool(d.get("storage_conditions")),

    # Most packaged foods do not need usage instructions based only on
    # the fields currently available to this engine.
    "usage_instructions": lambda d: False,

    # Claims only apply when the brand is actually making a claim.
    "claims": lambda d: bool(d.get("nutrition_claim_text")),

    # These are product/category-specific and cannot reliably be inferred
    # from the current structured data.
    "warning_statements": lambda d: False,
    "warnings": lambda d: False,

    # Certification is opt-in.
    "halal": lambda d: False,
}


# ---------------------------------------------------------------------------
# FIELD ALIASES
# ---------------------------------------------------------------------------
"""
FIELD_ALIASES maps a rule sheet's mandatory-field key to a function that
checks whether the label's ACTUAL data satisfies that requirement.

Different countries' rule sheets may use different key names for the
same real-world fact.

For example:
- FSSAI may use "nutritional_info"
- EU rules may use "nutrition_declaration"
- Another rule sheet may use "nutrition_facts_panel"

All of these can map to the editor's actual "nutrients" field.
"""

FIELD_ALIASES = {
    # Allergens
    "allergen_declaration": lambda d: bool(d.get("allergens")),

    # Nutrition
    "nutritional_info": lambda d: bool(d.get("nutrients")),
    "nutrition_facts_panel": lambda d: bool(d.get("nutrients")),
    "nutrition_declaration": lambda d: bool(d.get("nutrients")),
    "nutrition_information": lambda d: bool(d.get("nutrients")),
    "nutrition_information_panel": lambda d: bool(d.get("nutrients")),
    "nutrition_labeling": lambda d: bool(d.get("nutrients")),
    "nutrition_facts_table": lambda d: bool(d.get("nutrients")),

    # Vegetarian / non-vegetarian
    "veg_nonveg_symbol": lambda d: bool(d.get("veg_status")),

    # Dates
    "date_of_manufacture": lambda d: bool(d.get("date_of_manufacture")),
    "production_date": lambda d: bool(d.get("date_of_manufacture")),

    "best_before_or_use_by": lambda d: bool(d.get("best_before_date")),
    "date_of_minimum_durability": lambda d: bool(d.get("best_before_date")),
    "expiration_date": lambda d: bool(d.get("best_before_date")),
    "expiry_date": lambda d: bool(d.get("best_before_date")),

    "date_marking": lambda d: bool(
        d.get("best_before_date") or d.get("date_of_manufacture")
    ),

    # Batch / lot
    "batch_number": lambda d: bool(d.get("batch_number")),
    "batch_code": lambda d: bool(d.get("batch_number")),
    "batch_lot_number": lambda d: bool(d.get("batch_number")),
}


def _field_present(key: str, label_data: dict) -> bool:
    """
    Return whether a rule-sheet field is satisfied by the label data.

    First checks for a direct key match. If the rule-sheet key is not
    directly present, falls back to FIELD_ALIASES.
    """
    if label_data.get(key):
        return True

    resolver = FIELD_ALIASES.get(key)

    if resolver:
        return bool(resolver(label_data))

    return False


def _resolve_field(field: dict, label_data: dict) -> tuple[bool, bool]:
    """
    Resolve whether a field applies and whether it is present.

    Returns:
        (applies, present)

    MANDATORY fields:
        Always apply.

    CONDITIONAL fields:
        Use CONDITIONAL_TRIGGERS.

    Unknown conditional fields:
        Default to applies=True rather than silently ignoring the
        requirement.
    """
    key = field["key"]
    status = field.get("status", "MANDATORY")

    present = _field_present(key, label_data)

    # Mandatory requirements always apply.
    if status == "MANDATORY":
        return True, present

    # Conditional requirement.
    trigger = CONDITIONAL_TRIGGERS.get(key)

    # Unknown conditional requirement:
    # safer to apply it than silently skip it.
    applies = trigger(label_data) if trigger else True

    return applies, present


def check_label(label_data: dict, country_code: str) -> dict:
    """
    Check a label against one country's rule sheet.

    The compliance score only counts:
    1. Mandatory fields that always apply
    2. Conditional fields whose trigger says they apply
    3. Nutrients that are actually required by the country's rule sheet

    Non-applicable conditional fields do not count as missing and do not
    reduce the score.
    """

    rules = RULE_SHEETS.get(country_code)

    if rules is None:
        raise ValueError(f"Unknown country code: {country_code}")

    # Some countries may have rule-sheet stubs that have not yet been
    # populated with verified regulatory data.
    if not rules.get("source"):
        return {
            "country": country_code,
            "authority": rules.get("authority"),
            "status": "RULES_INCOMPLETE",
            "score_pct": None,
            "field_checklist": [],
            "missing_nutrients": [],
            "missing_allergens": [],
            "message": (
                f"The rule sheet for "
                f"{rules.get('country', country_code)} "
                "is a stub and hasn't been populated with verified "
                "regulatory data yet."
            ),
        }

    # -----------------------------------------------------------------------
    # FIELD CHECKS
    # -----------------------------------------------------------------------

    field_checklist = []

    applicable_count = 0
    satisfied_count = 0

    for field in rules.get("mandatory_fields", []):
        applies, present = _resolve_field(field, label_data)

        field_checklist.append(
            {
                "label": field["label"],
                "key": field["key"],
                "present": present,
                "applies": applies,
            }
        )

        # Only applicable fields contribute to the score.
        if applies:
            applicable_count += 1

            if present:
                satisfied_count += 1

    # Only applicable + missing fields should appear here.
    missing_fields = [
        field["label"]
        for field in field_checklist
        if field["applies"] and not field["present"]
    ]

    # -----------------------------------------------------------------------
    # NUTRIENT CHECKS
    # -----------------------------------------------------------------------

    nutrient_reqs = rules.get("nutrient_requirements", {})
    nutrients = label_data.get("nutrients", {}) or {}

    if rules.get("nutrition_declaration_conditional"):
        nutrition_triggered = bool(
            label_data.get("has_nutrition_claim")
            or label_data.get("is_nutri_grade_beverage")
        )

        if nutrition_triggered:
            required_nutrients = nutrient_reqs.get(
                "mandatory_nutrients_when_required",
                [],
            )
        else:
            required_nutrients = []
    else:
        required_nutrients = nutrient_reqs.get(
            "mandatory_nutrients",
            [],
        )

    missing_nutrients = [
        nutrient
        for nutrient in required_nutrients
        if nutrient not in nutrients
    ]

    # -----------------------------------------------------------------------
    # ALLERGEN CHECKS
    # -----------------------------------------------------------------------

    declared_allergens = {
        str(allergen).lower()
        for allergen in label_data.get("allergens", [])
    }

    ingredients_text = (
        label_data.get("ingredients_list") or ""
    ).lower()

    missing_allergens = [
        allergen
        for allergen in rules.get("allergen_list", [])
        if allergen.lower() in ingredients_text
        and allergen.lower() not in declared_allergens
    ]

    # -----------------------------------------------------------------------
    # SCORE
    # -----------------------------------------------------------------------

    total_checks = applicable_count + len(required_nutrients)

    passed_checks = (
        satisfied_count
        + (len(required_nutrients) - len(missing_nutrients))
    )

    score_pct = (
        round((passed_checks / total_checks) * 100, 1)
        if total_checks > 0
        else 100.0
    )

    # -----------------------------------------------------------------------
    # STATUS
    # -----------------------------------------------------------------------

    status = (
        "COMPLIANT"
        if not (
            missing_fields
            or missing_nutrients
            or missing_allergens
        )
        else "NON_COMPLIANT"
    )

    return {
        "country": country_code,
        "authority": rules.get("authority"),
        "status": status,
        "score_pct": score_pct,
        "field_checklist": field_checklist,
        "missing_nutrients": missing_nutrients,
        "missing_allergens": missing_allergens,
        "source": rules["source"],
    }


def check_label_all_countries(label_data: dict) -> dict:
    """
    Run the compliance check against every configured country rule sheet.
    """
    return {
        country_code: check_label(label_data, country_code)
        for country_code in RULE_SHEETS
    }