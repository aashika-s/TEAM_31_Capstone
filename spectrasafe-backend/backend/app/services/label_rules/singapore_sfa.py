"""
STATUS: PARTIAL. Citation and scope confirmed. SFA benchmarks against
Codex Alimentarius in principle, but this project has no Codex data
source integrated -- that's a real gap, not a fallback to lean on.

Batch/lot identification is mandatory under the requirement effective
2026-01-30, which is already in force as of the current verification date.
Nutrition declaration remains conditional.
"""

RULES = {
    "country": "Singapore",
    "authority": "Singapore Food Agency (SFA)",
    "source": "Sale of Food Act + Food Regulations",
    "source_url": "https://sso.agc.gov.sg",
    "last_verified": "2026-09 (PARTIAL)",

    "mandatory_fields": [
        {"key": "product_name", "label": "Name of food"},
        {"key": "ingredients_list", "label": "Ingredient list"},
        {"key": "net_quantity", "label": "Net quantity"},
        {"key": "manufacturer_name", "label": "Manufacturer/importer name and address"},
        {"key": "country_of_origin", "label": "Country of origin"},
        {"key": "date_marking", "label": "Date marking (for specified categories)"},

        {
            "key": "batch_number",
            "label": "Batch/lot identification",
            "status": "MANDATORY",
        },

        {
            "key": "nutrition_information_panel",
            "label": "Nutrition information panel",
        },
    ],

    "nutrition_declaration_conditional": True,

    # Effective 2026-01-30; already in force.
    "batch_lot_required": True,

    "nutrient_requirements": {
        "basis": None,
        "mandatory_nutrients": [],
    },

    "allergen_list": [],

    "font_rules": None,
}