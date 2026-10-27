"""
STATUS: VERIFIED (allergen list, dual-declaration requirement, and
nutrient basis -- strong multi-source corroboration including the CAA's
own 2025 update history on walnut's addition).
"""
RULES = {
    "country": "Japan",
    "authority": "Consumer Affairs Agency (CAA / 消費者庁)",
    "source": "Food Labeling Act + Food Labeling Standard",
    "source_url": "https://www.caa.go.jp/policies/policy/food_labeling/",
    "last_verified": "2026-09",
    "mandatory_fields": [
        {"key": "product_name", "label": "Name of food"},
        {"key": "ingredients_list", "label": "Ingredient list (allergens marked inline, in parentheses)"},
        {"key": "allergen_declaration", "label": "Consolidated allergen summary statement (in addition to inline marking -- Japan requires BOTH)"},
        {"key": "expiration_date", "label": "Expiration date (perishable) or best-before date (shelf-stable)"},
        {"key": "manufacturer_name", "label": "Manufacturer information"},
        {"key": "nutrition_labeling", "label": "Nutrition labeling"},
    ],
    "nutrient_requirements": {
        "basis": "per_100g_and_per_serving",
        "mandatory_nutrients": ["energy_kcal", "protein_g", "fat_g", "carbohydrate_g", "salt_equivalent_g"],
        "sodium_to_salt_conversion": "salt_equivalent_g = sodium_g * 2.54",
    },
    # 8 mandatory ("specified ingredients") as of 2023 (walnut added).
    # 20 recommended ("quasi-specified") exist separately and are NOT
    # legally required -- not included here since this list is enforced.
    "allergen_list": ["shrimp", "crab", "walnut", "wheat", "buckwheat", "egg", "milk", "peanut"],
    "allergen_declaration_note": "Must be declared BOTH inline in the ingredient list AND as a consolidated summary statement -- dual declaration is Japan-specific.",
    "language_required": "Japanese",
    "font_rules": None,  # NOT VERIFIED
}