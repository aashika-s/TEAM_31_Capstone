"""
STATUS: STUB, WORSE THAN OTHERS -- GSO 9:2022 is paywalled (not freely
available primary text). Scope below is from secondary sourcing only.
Flag this explicitly in any capstone documentation: this ruleset is NOT
backed by primary legal text the way FSSAI/FDA/EU are.
"""
RULES = {
    "country": "UAE (GCC region)",
    "authority": "GSO (regional) / ESMA (UAE national enforcement)",
    "source": "GSO 9:2022 -- Labeling of Prepackaged Food Stuffs (paywalled; UAE.S 9:2019 is the national adoption)",
    "source_url": "https://www.gso.org.sa",
    "last_verified": None,
    "mandatory_fields": [
        {"key": "product_name", "label": "Brand/product name"},
        {"key": "ingredients_list", "label": "Ingredient list"},
        {"key": "net_quantity", "label": "Net content"},
        {"key": "manufacturer_name", "label": "Manufacturer/importer details"},
        {"key": "production_date", "label": "Production date"},
        {"key": "expiry_date", "label": "Expiry date"},
        {"key": "batch_code", "label": "Batch code"},
        {"key": "storage_conditions", "label": "Storage conditions"},
        {"key": "country_of_origin", "label": "Country of origin"},
        {"key": "nutritional_info", "label": "Nutritional information"},
    ],
    "nutrient_requirements": {"basis": None, "mandatory_nutrients": []},  # NOT VERIFIED
    "allergen_list": [],  # GSO 2810:2025 governs this -- NOT pulled
    "trans_fat_limit": "Governed by GSO 2483:2024 -- NOT pulled",
    "font_rules": None,
}