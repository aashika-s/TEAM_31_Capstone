"""
STATUS: VERIFIED (mandatory nutrient list and dual-column requirement,
Standard 1.2.8 -- corrected from the earlier citation of 1.2.1/1.2.7,
which are the general labelling and claims standards respectively; 1.2.8
is the one that actually governs the Nutrition Information Panel).

PEAL (Plain English Allergen Labelling) transition ended on 2026-02-25.
Allergen declarations are therefore expected to use the standardized
PEAL wording. The current compliance engine only checks whether an
allergen declaration is present; it does not validate the exact PEAL
wording, so this note does not introduce a functional engine change.

Font/legibility specifics not yet pulled from primary text.
"""

RULES = {
    "country": "Australia / New Zealand",
    "authority": "Food Standards Australia New Zealand (FSANZ)",
    "source": "Australia New Zealand Food Standards Code, Standard 1.2.8 (Nutrition information requirements)",
    "source_url": "https://www.legislation.gov.au/F2015L00395/latest/text",
    "last_verified": "2026-09",

    "mandatory_fields": [
        {"key": "product_name", "label": "Name/description of food"},
        {"key": "ingredients_list", "label": "Ingredient list"},
        {"key": "net_quantity", "label": "Net quantity"},
        {"key": "manufacturer_name", "label": "Name and address of supplier"},
        {"key": "date_marking", "label": "Date marking"},
        {"key": "nutrition_information_panel", "label": "Nutrition Information Panel"},
        {"key": "allergen_declaration", "label": "Allergen declaration"},
    ],

    "nutrient_requirements": {
        "basis": "per_100g_and_per_serving",
        "mandatory_nutrients": [
            "energy_kj",
            "protein_g",
            "total_fat_g",
            "saturated_fat_g",
            "carbohydrate_g",
            "sugars_g",
            "sodium_mg",
        ],
    },

    # NOT VERIFIED -- Australia's mandatory declaration list
    # (Standard 1.2.3) needs a direct pull from the primary source.
    "allergen_list": [],

    # NOT VERIFIED
    "font_rules": None,

    "exemptions_note": (
        "Plain water, tea, coffee, herbs, spices, and alcoholic beverages "
        "are generally exempt unless a nutrition/health claim is made."
    ),
}