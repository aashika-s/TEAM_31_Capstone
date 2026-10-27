"""
STATUS: VERIFIED (21 CFR 101.9, current as of the 2016 final rule,
mandatory since Jan 1 2021). Font sizes and mandatory nutrient list
cross-checked against multiple current sources; verify against the
current CFR text before relying on this for an actual commercial label.
"""
RULES = {
    "country": "United States",
    "authority": "FDA",
    "source": "21 CFR 101.9 (Nutrition Facts label final rule, 2016)",
    "last_verified": "2026-09",
    "mandatory_fields": [
        {"key": "product_name", "label": "Statement of identity"},
        {"key": "ingredients_list", "label": "Ingredient list (descending order by weight)"},
        {"key": "net_quantity", "label": "Net quantity of contents"},
        {"key": "manufacturer_name", "label": "Name and place of business of manufacturer/packer/distributor"},
        {"key": "nutrition_facts_panel", "label": "Nutrition Facts panel (21 CFR 101.9)"},
        {"key": "allergen_declaration", "label": "Allergen statement (\"Contains: ...\")"},
    ],
    "nutrient_requirements": {
        "basis": "per_serving",
        # The 13 nutrients FDA requires be declared, in the order they
        # must appear on the panel.
        "mandatory_nutrients": [
            "total_fat_g", "saturated_fat_g", "trans_fat_g", "cholesterol_mg",
            "sodium_mg", "total_carbohydrate_g", "dietary_fiber_g",
            "total_sugars_g", "added_sugars_g", "protein_g",
            "vitamin_d_mcg", "calcium_mg", "iron_mg", "potassium_mg",
        ],
        "daily_value_column_required": True,
        "dual_column_required_for_servings_between": [2, 3],
    },
    "allergen_list": [
        "milk", "egg", "fish", "crustacean shellfish", "tree nuts",
        "peanuts", "wheat", "soybeans", "sesame",
    ],
    "font_rules": {
        "unit": "point",
        "min_size_general_text": 6,
        "min_size_small_package_text": 4.5,
        "title_min_size_standard_format": 16,
        "title_min_size_tabular_linear_format": 10,
        "calories_min_size": 22,
        "note": "\"Nutrition Facts\" title must be the largest text on the panel except the Calories number itself.",
    },
    "formats_allowed": ["vertical", "dual-column", "tabular", "linear", "aggregate", "bilingual"],
}