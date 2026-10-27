"""
Generates a STARTING DRAFT label from a one-line product description via
Groq's free-tier API (OpenAI-compatible). This is explicitly a draft --
the brand must review and edit before saving. The model is instructed to
NEVER invent regulatory identifiers: a plausible-looking fake FSSAI
license or address is worse than a blank field.

Client is created lazily, not at import time -- a missing/blank
GROQ_API_KEY should only break the label-draft feature when someone
actually tries to use it, not crash the entire backend on startup.
"""
import json

from openai import OpenAI

from app.core.config import settings

_MODEL = "openai/gpt-oss-120b"  # check console.groq.com for the current model list if this 404s

_SYSTEM_PROMPT = """You draft STARTING POINTS for food product labels, to be reviewed and edited by a human brand representative before use. Respond with ONLY a JSON object, no other text, no markdown fences.

The JSON must have exactly these keys:
- product_name (string)
- brand_name (string)
- ingredients_list (string, comma-separated, descending order by typical proportion)
- allergens (array of strings, lowercase, only ones plausible given the ingredients)
- nutrients (object mapping nutrient name to a plausible per-100g value as a string)
- net_quantity (string, or null)
- manufacturer_name (string)
- veg_status (string, exactly "VEG" or "NON_VEG" -- infer from ingredients; if ingredients contain meat, egg, gelatin, or animal-derived items, it's NON_VEG, otherwise VEG)
- storage_conditions (string, generic and safe, e.g. "Store in a cool, dry place" or "Keep refrigerated below 4°C" if the product implies refrigeration)
- recommended_template (string, exactly one of: "clean", "organic", "premium")
- accent_color (string, a hex color like "#2f6b3c" that fits the product's character -- e.g. earthy green for organic/natural foods, deep navy/gold for premium/indulgent items, simple black/gray for clean/everyday items)

Template guide:
- "clean": minimal, white background, black text -- everyday/functional products (bread, plain dairy, staples)
- "organic": cream background, earthy accent -- natural/health-positioned products
- "premium": dark background, light text, gold/jewel-tone accent -- indulgent/gourmet products

CRITICAL: Do NOT include manufacturer_address, fssai_license, mrp, or batch_number keys at all. These are real regulatory/business identifiers that must never be fabricated -- a human must supply them."""

def generate_draft(description: str) -> dict:
    if not settings.groq_api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not configured. Add it to .env and restart the backend."
        )

    client = OpenAI(api_key=settings.groq_api_key, base_url="https://api.groq.com/openai/v1")

    response = client.chat.completions.create(
        model=_MODEL,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": description},
        ],
        response_format={"type": "json_object"},
        max_tokens=1000,
    )
    text = response.choices[0].message.content.strip()
    data = json.loads(text)

    for forbidden_key in ("fssai_license", "manufacturer_address", "mrp", "batch_number",
                       "date_of_manufacture", "best_before_date", "country_of_origin",
                       "quid", "alcoholic_strength_abv"):
            data.pop(forbidden_key, None)

    data["_ai_generated"] = True
    return data