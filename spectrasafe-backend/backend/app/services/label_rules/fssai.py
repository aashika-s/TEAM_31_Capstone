"""
STATUS: VERIFIED (built directly from FSSAI's Food Safety and Standards
(Labelling and Display) Regulations, 2020 -- same rules already enforced
elsewhere in this app's compliance_service.py).
"""
RULES = {
    "country": "India",
    "authority": "FSSAI",
    "source": "FSS (Labelling and Display) Regulations, 2020",
    "last_verified": "2026-09",
    "mandatory_fields": [
        {"key": "product_name", "label": "Name of food"},
        {"key": "ingredients_list", "label": "List of ingredients (descending order by weight)"},
        {"key": "net_quantity", "label": "Net quantity"},
        {"key": "fssai_license", "label": "FSSAI license number (14 digits)"},
        {"key": "manufacturer_name", "label": "Manufacturer/packer name and address"},
        {"key": "veg_nonveg_symbol", "label": "Veg (green dot) / non-veg (brown dot) symbol"},
        {"key": "date_of_manufacture", "label": "Date of manufacture or packing"},
        {"key": "best_before_or_use_by", "label": "Best before / use by date"},
        {"key": "mrp", "label": "Maximum retail price"},
        {"key": "nutritional_info", "label": "Nutritional information panel"},
        {"key": "allergen_declaration", "label": "Allergen declaration (if applicable)"},
        {"key": "batch_number", "label": "Batch/lot number"},
    ],
    "nutrient_requirements": {
        "basis": "per_100g_or_100ml",
        "mandatory_nutrients": [
            "energy_kcal", "protein_g", "total_fat_g", "saturated_fat_g",
            "trans_fat_g", "total_carbohydrate_g", "total_sugars_g", "sodium_mg",
        ],
        "trans_fat_limit_pct_of_total_fat": 2.0,
    },
    "allergen_list": [
        "milk", "wheat", "soy", "peanut", "tree nuts", "egg", "fish",
        "crustacean shellfish", "gluten", "sulphites",
    ],
    "font_rules": {
        "unit": "mm",
        "min_height_mandatory_text": 1.0,
        "note": "Minimum 1mm font height for mandatory declarations under the 2020 regulations.",
    },
    "veg_status_required": True,
}