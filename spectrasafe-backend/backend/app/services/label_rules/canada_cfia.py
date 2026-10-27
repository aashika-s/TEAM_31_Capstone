"""
STATUS: VERIFIED (core nutrient list and bilingual requirement).
Font-size specifics still not pulled from primary FDR text -- CFIA's own
guidance says minimums exist and are "prescribed" but doesn't state
exact point sizes in the sources checked; needs a direct pull from the
Nutrition Labelling Toolkit's format figures before treating as complete.
"""
RULES = {
    "country": "Canada",
    "authority": "Health Canada (standards) / CFIA (enforcement)",
    "source": "Food and Drug Regulations (FDR), Part B, Division 1, ss. B.01.401-B.01.406",
    "source_url": "https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._870/",
    "last_verified": "2026-09",
    "mandatory_fields": [
        {"key": "product_name", "label": "Common name (English and French)"},
        {"key": "ingredients_list", "label": "Ingredient list (bilingual)"},
        {"key": "allergen_declaration", "label": "Allergen \"Contains\" statement"},
        {"key": "net_quantity", "label": "Net quantity"},
        {"key": "manufacturer_name", "label": "Manufacturer/distributor name and address"},
        {"key": "nutrition_facts_table", "label": "Standardized Nutrition Facts table"},
    ],
    "nutrient_requirements": {
        "basis": "per_serving_with_percent_dv",
        "mandatory_nutrients": [
            "calories", "fat_g", "saturated_fat_g", "trans_fat_g", "cholesterol_mg",
            "sodium_mg", "carbohydrate_g", "fibre_g", "sugars_g", "protein_g",
            "potassium_mg", "calcium_mg", "iron_mg",
        ],
    },
    "allergen_list": [],  # NOT VERIFIED -- Canada's "priority allergens" list needs a direct pull (differs slightly from EU/US)
    "bilingual_required": True,
    "font_rules": None,  # NOT VERIFIED -- exists in the FDR format figures, exact point sizes not confirmed
}