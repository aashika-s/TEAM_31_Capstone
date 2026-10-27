"""
STATUS: PARTIAL. GB 28050-2011 core nutrients verified. GB 7718-2025 /
GB 28050-2025 were published 27 March 2025 but do not take full effect
until 16 March 2027 (two-year transition) -- until then, the 2011
versions are the enforceable baseline. This sheet intentionally targets
the CURRENTLY OPERATIVE standard, not the newest published one.
Re-check this file's effective_date logic as that date approaches.
"""
RULES = {
    "country": "China",
    "authority": "SAMR / NHC",
    "source": "GB 7718-2011 / GB 28050-2011 (operative until 2027-03-16, then GB 7718-2025 / GB 28050-2025)",
    "last_verified": "2026-09 (PARTIAL)",
    "effective_date": "2011-current",
    "supersedes_on": "2027-03-16",
    "mandatory_fields": [
        {"key": "product_name", "label": "Product name"},
        {"key": "ingredients_list", "label": "Ingredient list"},
        {"key": "net_quantity", "label": "Net quantity"},
        {"key": "manufacturer_name", "label": "Manufacturer/distributor name and address"},
        {"key": "production_date", "label": "Production date / shelf life"},
        {"key": "storage_conditions", "label": "Storage conditions"},
        {"key": "nutrition_facts_panel", "label": "Nutrition Facts panel (GB 28050)"},
    ],
    "nutrient_requirements": {
        "basis": "per_100g_or_100ml",
        "mandatory_nutrients": ["energy_kj", "protein_g", "fat_g", "carbohydrate_g", "sodium_mg"],
    },
    "allergen_list": [],  # NOT VERIFIED -- allergen declaration is largely voluntary under current GB standards; confirm before relying on this
    "font_rules": None,  # NOT VERIFIED -- primary GB text is paywalled, need a licensed translation summary (see reference doc)
}