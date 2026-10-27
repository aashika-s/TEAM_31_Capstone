"""
STATUS: PARTIAL. Scope and citation confirmed (Food Information
Regulations 2014, applying retained EU 1169/2011 as UK domestic law).
UK and EU have been diverging since Brexit -- do NOT assume this sheet
mirrors eu_1169.py exactly. Exact current font-size/allergen wording
still needs pulling from the primary text linked below.
"""
RULES = {
    "country": "United Kingdom",
    "authority": "Food Standards Agency (FSA)",
    "source": "Food Information Regulations 2014, applying retained Regulation (EU) No 1169/2011",
    "source_url": "https://www.legislation.gov.uk/uksi/2014/1855/pdfs/uksi_20141855_en.pdf",
    "last_verified": "2026-09 (PARTIAL)",
    "mandatory_fields": [
        {"key": "product_name", "label": "Name of the food"},
        {"key": "ingredients_list", "label": "Ingredient list"},
        {"key": "allergen_declaration", "label": "Allergens emphasized in ingredients (retained EU-style + Natasha's Law for PPDS food)"},
        {"key": "net_quantity", "label": "Net quantity"},
        {"key": "date_of_minimum_durability", "label": "Best before / use by date"},
        {"key": "manufacturer_name", "label": "Name and address of food business operator"},
        {"key": "nutrition_declaration", "label": "Nutrition declaration"},
    ],
    "nutrient_requirements": {
        "basis": "per_100g_or_100ml",
        "mandatory_nutrients": ["energy_kj_kcal", "fat_g", "saturated_fat_g", "carbohydrate_g", "sugars_g", "protein_g", "salt_g"],
    },
    "allergen_list": [  # same 14 as EU per retained law -- NOT independently re-confirmed for UK-specific amendments
        "cereals containing gluten", "crustaceans", "eggs", "fish", "peanuts",
        "soybeans", "milk", "nuts", "celery", "mustard", "sesame seeds",
        "sulphur dioxide and sulphites", "lupin", "molluscs",
    ],
    "font_rules": None,  # NOT VERIFIED for UK-specific text
}