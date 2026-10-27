"""
STATUS: VERIFIED (Regulation (EU) No 1169/2011, Food Information to
Consumers). Font x-height and the 14-allergen list are directly from
Articles 9, 13, and Annex II; cross-checked against EUR-Lex and multiple
current compliance guides.
"""
RULES = {
    "country": "European Union",
    "authority": "European Commission (FIC)",
    "source": "Regulation (EU) No 1169/2011",
    "last_verified": "2026-09",
    "mandatory_fields": [
        {"key": "product_name", "label": "Name of the food"},
        {"key": "ingredients_list", "label": "List of ingredients (descending order by weight)"},
        {"key": "allergen_declaration", "label": "Allergens emphasized within the ingredients list (e.g. bold)"},
        {"key": "quid", "label": "Quantitative Ingredient Declaration (QUID), where applicable"},
        {"key": "net_quantity", "label": "Net quantity (metric units)"},
        {"key": "date_of_minimum_durability", "label": "\"Best before\" or \"Use by\" date"},
        {"key": "storage_conditions", "label": "Special storage conditions / conditions of use"},
        {"key": "manufacturer_name", "label": "Name and address of the food business operator"},
        {"key": "country_of_origin", "label": "Country of origin or place of provenance, where required"},
        {"key": "nutrition_declaration", "label": "Nutrition declaration (per 100g/100ml)"},
        {"key": "alcoholic_strength", "label": "Alcoholic strength by volume, if ABV > 1.2%"},
        {"key": "instructions_for_use", "label": "Instructions for use, where necessary"},
    ],
    "nutrient_requirements": {
        "basis": "per_100g_or_100ml",  # NOT per-serving, unlike the FDA
        "mandatory_nutrients": [
            "energy_kj_kcal", "fat_g", "saturated_fat_g", "carbohydrate_g",
            "sugars_g", "protein_g", "salt_g",  # salt, NOT sodium -- EU-specific
        ],
    },
    "allergen_list": [
        "cereals containing gluten", "crustaceans", "eggs", "fish", "peanuts",
        "soybeans", "milk", "nuts", "celery", "mustard", "sesame seeds",
        "sulphur dioxide and sulphites", "lupin", "molluscs",
    ],
    "font_rules": {
        "unit": "mm_x_height",
        "min_x_height_standard": 1.2,
        "min_x_height_small_package_under_80cm2": 0.9,
        "nutrition_declaration_not_required_under_25cm2": True,
        "no_declarations_required_under_10cm2": True,
    },
}