# """
# Ingredient/additive encyclopedia (IFID — Encyclopedia of Indian Food
# Ingredients, 661 entries across 8 categories). Two uses:

# 1. Enrich extracted ingredients with a plain-language explanation, so a
#    scan result isn't just a bare ingredient name.
# 2. Power a manual search screen for anything the pipeline didn't
#    recognize or match automatically — the whole point of having this
#    data is that OCR/matching will sometimes miss, and a person should
#    still be able to look something up themselves.

# Cross-referencing with INS numbers works because many entries' keywords
# include the literal INS code (e.g. "INS 950" for Acesulfame Potassium) --
# extracted at load time into a separate ins-code index rather than
# re-scanning all 661 entries on every lookup.
# """
# import json
# import os
# import re

# ENCYCLOPEDIA_PATH = os.getenv("ENCYCLOPEDIA_PATH", "encyclopedia.json")

# _flat = None       # {normalized_name: record}
# _by_slug = None     # {slug: record}
# _by_ins = None      # {ins_code: record}
# _INS_IN_TEXT_RE = re.compile(r'\bins\s*(\d{3,4}[a-z]?)\b', re.IGNORECASE)


# def load_encyclopedia(path=ENCYCLOPEDIA_PATH):
#     if not os.path.exists(path):
#         print(f"[warn] {path} not found — ingredient encyclopedia lookups unavailable")
#         return {}, {}, {}

#     with open(path, encoding="utf-8") as f:
#         raw = json.load(f)

#     flat, by_slug, by_ins = {}, {}, {}
#     for category, items in raw.get("data", {}).items():
#         for name, entry in items.items():
#             description = entry.get("json", {}).get("description", {}) or {}
#             record = {
#                 "name": name,
#                 "category": category,
#                 "slug": entry.get("slug"),
#                 # Short summary for inline display (e.g. next to a scanned
#                 # ingredient) -- the full write-up is available separately
#                 # via get_by_slug() for a "read more" detail view, so a
#                 # scan result payload isn't bloated with 661 entries' worth
#                 # of multi-paragraph text for the handful actually matched.
#                 "summary": (description.get("history_and_sourcing") or "")[:400].rsplit(".", 1)[0] + ".",
#                 "text": entry.get("text"),
#                 "description": description,
#                 "keywords": entry.get("json", {}).get("keywords", []) or [],
#             }
#             norm = name.strip().lower()
#             flat[norm] = record
#             if record["slug"]:
#                 by_slug[record["slug"]] = record

#             for kw in record["keywords"]:
#                 m = _INS_IN_TEXT_RE.search(kw)
#                 if m:
#                     by_ins.setdefault(m.group(1).lower(), record)
#             m = _INS_IN_TEXT_RE.search(name)
#             if m:
#                 by_ins.setdefault(m.group(1).lower(), record)

#     print(f"[init] Loaded ingredient encyclopedia: {len(flat)} entries, {len(by_ins)} INS cross-refs")
#     return flat, by_slug, by_ins


# def _ensure_loaded():
#     global _flat, _by_slug, _by_ins
#     if _flat is None:
#         _flat, _by_slug, _by_ins = load_encyclopedia()


# def _strip_trailing_percentage(item: str) -> str:
#     """'Sharbati Wheat (75%)' -> 'Sharbati Wheat' -- but keeps parens that
#     aren't a bare percentage, like '(INS 950)', since those are meaningful
#     for matching, not packaging noise."""
#     return re.sub(r'\s*\(\d+(?:\.\d+)?%?\)\s*$', '', item).strip()


# _STOPWORDS = {"whole", "raw", "the", "and", "of", "in", "with", "powder", "extract"}


# def _tokens(text: str) -> set[str]:
#     words = re.findall(r"[a-z0-9']+", text.lower())
#     return {w for w in words if len(w) >= 3 and w not in _STOPWORDS}


# def lookup_ingredient(item: str) -> dict | None:
#     """Looks up one ingredient-list item against the encyclopedia, trying
#     progressively looser strategies until one is confident enough to
#     trust, and returning None (not a weak guess) if nothing clears that
#     bar -- a wrong explanation is worse than no explanation:

#     1. Exact match (after stripping a trailing "(NN%)").
#     2. Space-insensitive exact match -- catches "Flaxseed" vs "Flax Seed",
#        "Horse gram" vs "Horsegram", which raw substring comparison misses
#        since the words are just tokenized differently, not really
#        different ingredients.
#     3. Token overlap -- catches "Whole Bengal gram" vs "Bengal Gram
#        (Chana Dal)": the item has an extra qualifier word ("Whole") that
#        breaks pure substring containment, but the significant words
#        (bengal, gram) still match. Requires ALL of the encyclopedia
#        name's significant tokens to appear in the item, not just some,
#        so it doesn't loosely match on one shared word.
#     4. Raw substring containment (longest match wins).
#     5. Keyword match, as a last resort -- this is how generic-sounding
#        items land on a broader entry (e.g. "Ragi" has no dedicated
#        article in this encyclopedia, but the "Millet" entry lists it as
#        a keyword, which is a genuinely useful redirect, not a false
#        positive)."""
#     _ensure_loaded()
#     if not _flat:
#         return None

#     cleaned = _strip_trailing_percentage(item).lower()

#     for candidate in (item.strip().lower(), cleaned):
#         if candidate in _flat:
#             return _flat[candidate]

#     cleaned_nospace = cleaned.replace(" ", "").replace("-", "")
#     for enc_name, record in _flat.items():
#         if enc_name.replace(" ", "").replace("-", "") == cleaned_nospace:
#             return record

#     item_tokens = _tokens(cleaned)
#     best_token_match, best_shared_count = None, 0
#     for enc_name, record in _flat.items():
#         enc_tokens = _tokens(enc_name)
#         if not enc_tokens:
#             continue
#         shared = item_tokens & enc_tokens
#         # Require at least 2 shared significant words, OR a full match
#         # when the encyclopedia name is itself just one significant word
#         # (e.g. "Barley") -- this is what lets "Whole Bengal gram" find
#         # "Bengal Gram (Chana Dal)" (shares "bengal"+"gram", 2 tokens)
#         # over "Green Gram (Moong Dal)" or "Urad Dal (Black Gram)" (share
#         # only "gram", 1 token each) without requiring an impossible exact
#         # subset match against the encyclopedia's more detailed name.
#         qualifies = len(shared) >= 2 or (len(enc_tokens) == 1 and enc_tokens == shared)
#         if qualifies and len(shared) > best_shared_count:
#             best_token_match, best_shared_count = record, len(shared)
#     if best_token_match:
#         return best_token_match

#     best, best_len = None, 0
#     for enc_name, record in _flat.items():
#         if len(enc_name) < 5:
#             continue  # too short to match safely by raw containment
#         if enc_name in cleaned or cleaned in enc_name:
#             if len(enc_name) > best_len:
#                 best, best_len = record, len(enc_name)
#     if best:
#         return best

#     for record in _flat.values():
#         for kw in record["keywords"]:
#             kw_norm = kw.strip().lower()
#             if len(kw_norm) >= 4 and kw_norm in cleaned:
#                 return record
#     return None


# def lookup_by_ins(code: str) -> dict | None:
#     _ensure_loaded()
#     return _by_ins.get(code.strip().lower())


# def get_by_slug(slug: str) -> dict | None:
#     _ensure_loaded()
#     return _by_slug.get(slug)


# def search_encyclopedia(query: str, limit: int = 15) -> list[dict]:
#     """Powers the manual 'look this up' search screen. Ranked: exact name
#     match, then prefix match, then substring match, then keyword match --
#     so searching 'wheat' surfaces the Wheat entry itself before every
#     entry that merely mentions wheat in passing."""
#     _ensure_loaded()
#     q = query.strip().lower()
#     if not q or not _flat:
#         return []

#     scored = []
#     for norm, record in _flat.items():
#         if norm == q:
#             score = 0
#         elif norm.startswith(q):
#             score = 1
#         elif q in norm:
#             score = 2
#         elif any(q in kw.strip().lower() for kw in record["keywords"]):
#             score = 3
#         else:
#             continue
#         scored.append((score, len(record["name"]), record))

#     scored.sort(key=lambda x: (x[0], x[1]))
#     return [r for _, _, r in scored[:limit]]


# def enrich_ingredients(pipeline_result: dict) -> dict:
#     """Attaches an encyclopedia match (if any) to each item in the
#     already-extracted ingredients list. Called from run_compliance_checks,
#     same pattern as enrich_ins_numbers."""
#     ingredients = pipeline_result.get("ingredients", [])
#     details = []
#     for item in ingredients:
#         record = lookup_ingredient(item)
#         if record:
#             details.append({
#                 "item": item,
#                 "matched_name": record["name"],
#                 "category": record["category"],
#                 "summary": record["summary"],
#                 "slug": record["slug"],
#             })
#         else:
#             details.append({"item": item, "matched_name": None})
#     pipeline_result["ingredient_details"] = details
#     return pipeline_result

















# """
# Ingredient/additive encyclopedia (IFID — Encyclopedia of Indian Food
# Ingredients, 661 entries across 8 categories). Two uses:

# 1. Enrich extracted ingredients with a plain-language explanation, so a
#    scan result isn't just a bare ingredient name.
# 2. Power a manual search screen for anything the pipeline didn't
#    recognize or match automatically — the whole point of having this
#    data is that OCR/matching will sometimes miss, and a person should
#    still be able to look something up themselves.

# Cross-referencing with INS numbers works because many entries' keywords
# include the literal INS code (e.g. "INS 950" for Acesulfame Potassium) --
# extracted at load time into a separate ins-code index rather than
# re-scanning all 661 entries on every lookup.
# """
# import json
# import os
# import re

# ENCYCLOPEDIA_PATH = os.getenv("ENCYCLOPEDIA_PATH", "encyclopedia.json")
# INS_INDEX_PATH = os.getenv("INS_INDEX_PATH", "index.csv")

# _flat = None       # {normalized_name: record}
# _by_slug = None     # {slug: record}
# _by_ins = None      # {ins_code: record}
# _ins_index = None   # {code: {code, names, type, status}} -- loaded separately from
#                      # ocr_pipeline.py's own INS index to avoid a circular import
#                      # (ocr_pipeline already imports this module); the two are
#                      # reading the same file, not maintaining separate data.
# _INS_IN_TEXT_RE = re.compile(r'\bins\s*(\d{3,4}[a-z]?)\b', re.IGNORECASE)

# _STATUS_JURISDICTIONS = {"a": "Australia/NZ", "e": "EU", "u": "USA"}


# def load_encyclopedia(path=ENCYCLOPEDIA_PATH):
#     if not os.path.exists(path):
#         print(f"[warn] {path} not found — ingredient encyclopedia lookups unavailable")
#         return {}, {}, {}

#     with open(path, encoding="utf-8") as f:
#         raw = json.load(f)

#     flat, by_slug, by_ins = {}, {}, {}
#     for category, items in raw.get("data", {}).items():
#         for name, entry in items.items():
#             description = entry.get("json", {}).get("description", {}) or {}
#             record = {
#                 "name": name,
#                 "category": category,
#                 "slug": entry.get("slug"),
#                 # Short summary for inline display (e.g. next to a scanned
#                 # ingredient) -- the full write-up is available separately
#                 # via get_by_slug() for a "read more" detail view, so a
#                 # scan result payload isn't bloated with 661 entries' worth
#                 # of multi-paragraph text for the handful actually matched.
#                 "summary": (description.get("history_and_sourcing") or "")[:400].rsplit(".", 1)[0] + ".",
#                 "text": entry.get("text"),
#                 "description": description,
#                 "keywords": entry.get("json", {}).get("keywords", []) or [],
#             }
#             norm = name.strip().lower()
#             flat[norm] = record
#             if record["slug"]:
#                 by_slug[record["slug"]] = record

#             for kw in record["keywords"]:
#                 m = _INS_IN_TEXT_RE.search(kw)
#                 if m:
#                     by_ins.setdefault(m.group(1).lower(), record)
#             m = _INS_IN_TEXT_RE.search(name)
#             if m:
#                 by_ins.setdefault(m.group(1).lower(), record)

#     print(f"[init] Loaded ingredient encyclopedia: {len(flat)} entries, {len(by_ins)} INS cross-refs")
#     return flat, by_slug, by_ins


# def _ensure_loaded():
#     global _flat, _by_slug, _by_ins
#     if _flat is None:
#         _flat, _by_slug, _by_ins = load_encyclopedia()


# def _strip_trailing_percentage(item: str) -> str:
#     """'Sharbati Wheat (75%)' -> 'Sharbati Wheat' -- but keeps parens that
#     aren't a bare percentage, like '(INS 950)', since those are meaningful
#     for matching, not packaging noise."""
#     return re.sub(r'\s*\(\d+(?:\.\d+)?%?\)\s*$', '', item).strip()


# _STOPWORDS = {"whole", "raw", "the", "and", "of", "in", "with", "powder", "extract"}


# def _tokens(text: str) -> set[str]:
#     words = re.findall(r"[a-z0-9']+", text.lower())
#     return {w for w in words if len(w) >= 3 and w not in _STOPWORDS}


# def lookup_ingredient(item: str) -> dict | None:
#     """Looks up one ingredient-list item against the encyclopedia, trying
#     progressively looser strategies until one is confident enough to
#     trust, and returning None (not a weak guess) if nothing clears that
#     bar -- a wrong explanation is worse than no explanation:

#     1. Exact match (after stripping a trailing "(NN%)").
#     2. Space-insensitive exact match -- catches "Flaxseed" vs "Flax Seed",
#        "Horse gram" vs "Horsegram", which raw substring comparison misses
#        since the words are just tokenized differently, not really
#        different ingredients.
#     3. Token overlap -- catches "Whole Bengal gram" vs "Bengal Gram
#        (Chana Dal)": the item has an extra qualifier word ("Whole") that
#        breaks pure substring containment, but the significant words
#        (bengal, gram) still match. Requires ALL of the encyclopedia
#        name's significant tokens to appear in the item, not just some,
#        so it doesn't loosely match on one shared word.
#     4. Raw substring containment (longest match wins).
#     5. Keyword match, as a last resort -- this is how generic-sounding
#        items land on a broader entry (e.g. "Ragi" has no dedicated
#        article in this encyclopedia, but the "Millet" entry lists it as
#        a keyword, which is a genuinely useful redirect, not a false
#        positive)."""
#     _ensure_loaded()
#     if not _flat:
#         return None

#     cleaned = _strip_trailing_percentage(item).lower()

#     for candidate in (item.strip().lower(), cleaned):
#         if candidate in _flat:
#             return _flat[candidate]

#     cleaned_nospace = cleaned.replace(" ", "").replace("-", "")
#     for enc_name, record in _flat.items():
#         if enc_name.replace(" ", "").replace("-", "") == cleaned_nospace:
#             return record

#     item_tokens = _tokens(cleaned)
#     best_token_match, best_shared_count = None, 0
#     for enc_name, record in _flat.items():
#         enc_tokens = _tokens(enc_name)
#         if not enc_tokens:
#             continue
#         shared = item_tokens & enc_tokens
#         # Require at least 2 shared significant words, OR a full match
#         # when the encyclopedia name is itself just one significant word
#         # (e.g. "Barley") -- this is what lets "Whole Bengal gram" find
#         # "Bengal Gram (Chana Dal)" (shares "bengal"+"gram", 2 tokens)
#         # over "Green Gram (Moong Dal)" or "Urad Dal (Black Gram)" (share
#         # only "gram", 1 token each) without requiring an impossible exact
#         # subset match against the encyclopedia's more detailed name.
#         qualifies = len(shared) >= 2 or (len(enc_tokens) == 1 and enc_tokens == shared)
#         if qualifies and len(shared) > best_shared_count:
#             best_token_match, best_shared_count = record, len(shared)
#     if best_token_match:
#         return best_token_match

#     best, best_len = None, 0
#     for enc_name, record in _flat.items():
#         if len(enc_name) < 5:
#             continue  # too short to match safely by raw containment
#         if enc_name in cleaned or cleaned in enc_name:
#             if len(enc_name) > best_len:
#                 best, best_len = record, len(enc_name)
#     if best:
#         return best

#     for record in _flat.values():
#         for kw in record["keywords"]:
#             kw_norm = kw.strip().lower()
#             if len(kw_norm) >= 4 and kw_norm in cleaned:
#                 return record
#     return None


# def _load_ins_index(path=INS_INDEX_PATH) -> dict:
#     if not os.path.exists(path):
#         print(f"[warn] {path} not found — INS-index search fallback unavailable")
#         return {}
#     import csv
#     index = {}
#     with open(path, encoding="utf-8") as f:
#         for row in csv.DictReader(f):
#             code = row["code"].strip().lower()
#             index[code] = {
#                 "code": code,
#                 "names": row.get("names", "").strip(),
#                 "type": row.get("type", "").strip(),
#                 "status": row.get("status", "").strip(),
#             }
#     return index


# def _ensure_ins_index_loaded():
#     global _ins_index
#     if _ins_index is None:
#         _ins_index = _load_ins_index()


# def _ins_index_record(entry: dict) -> dict:
#     """Shapes a bare index.csv row into the same record shape encyclopedia
#     entries use, so search/detail can treat both uniformly. slug is
#     prefixed 'ins:' so get_by_slug can tell the two apart without a
#     separate lookup path."""
#     jurisdictions = [
#         _STATUS_JURISDICTIONS[c] for c in entry["status"].split() if c in _STATUS_JURISDICTIONS
#     ]
#     permitted_text = f"Permitted in: {', '.join(jurisdictions)}." if jurisdictions else "Permitted-jurisdiction data not available."
#     display_name = entry["names"].split(",")[0].strip().title() or f"INS {entry['code']}"
#     return {
#         "name": f"{display_name} (INS {entry['code']})",
#         "category": (entry["type"] or "Additive").title(),
#         "slug": f"ins:{entry['code']}",
#         "summary": f"INS {entry['code']} — {entry['type'] or 'additive'}. {permitted_text}",
#         "text": None,
#         "description": {
#             "type": entry["type"] or "Not specified",
#             "regulatory_status": permitted_text,
#             "other_names": entry["names"] or "Not specified",
#         },
#         "keywords": [n.strip() for n in entry["names"].split(",") if n.strip()],
#         "source": "ins_index",
#     }


# def lookup_by_ins(code: str) -> dict | None:
#     """Encyclopedia write-up first (richer content); falls back to the
#     bare index.csv entry if there's no dedicated article -- the two data
#     sources only overlap on ~89 of index.csv's 436 codes."""
#     _ensure_loaded()
#     record = _by_ins.get(code.strip().lower())
#     if record:
#         return record
#     _ensure_ins_index_loaded()
#     entry = _ins_index.get(code.strip().lower())
#     return _ins_index_record(entry) if entry else None


# def get_by_slug(slug: str) -> dict | None:
#     if slug.startswith("ins:"):
#         _ensure_ins_index_loaded()
#         entry = _ins_index.get(slug[4:])
#         return _ins_index_record(entry) if entry else None
#     _ensure_loaded()
#     return _by_slug.get(slug)


# def search_encyclopedia(query: str, limit: int = 15) -> list[dict]:
#     """Powers the manual 'look this up' search screen. Ranked: exact name
#     match, then prefix match, then substring match, then keyword match --
#     so searching 'wheat' surfaces the Wheat entry itself before every
#     entry that merely mentions wheat in passing.

#     Also searches index.csv directly for INS codes/names that have no
#     encyclopedia write-up -- otherwise searching "951" or "aspartame"
#     returns nothing despite the data genuinely being available, just in
#     the leaner reference table rather than a full article."""
#     _ensure_loaded()
#     _ensure_ins_index_loaded()
#     q = query.strip().lower()
#     if not q:
#         return []

#     scored = []
#     for norm, record in _flat.items():
#         if norm == q:
#             score = 0
#         elif norm.startswith(q):
#             score = 1
#         elif q in norm:
#             score = 2
#         elif any(q in kw.strip().lower() for kw in record["keywords"]):
#             score = 3
#         else:
#             continue
#         scored.append((score, len(record["name"]), record))

#     seen_codes = set()
#     for code, entry in _ins_index.items():
#         # Skip codes the encyclopedia already covers -- the richer article
#         # should win, not a duplicate bare-data-table entry alongside it.
#         if code in _by_ins:
#             continue
#         names_norm = entry["names"].lower()
#         if code == q:
#             score = 0
#         elif q == names_norm or q in [n.strip() for n in names_norm.split(",")]:
#             score = 0
#         elif names_norm.startswith(q) or code.startswith(q):
#             score = 1
#         elif q in names_norm:
#             score = 2
#         else:
#             continue
#         if code not in seen_codes:
#             seen_codes.add(code)
#             record = _ins_index_record(entry)
#             scored.append((score, len(record["name"]), record))

#     scored.sort(key=lambda x: (x[0], x[1]))
#     return [r for _, _, r in scored[:limit]]


# def enrich_ingredients(pipeline_result: dict) -> dict:
#     """Attaches an encyclopedia match (if any) to each item in the
#     already-extracted ingredients list. Called from run_compliance_checks,
#     same pattern as enrich_ins_numbers."""
#     ingredients = pipeline_result.get("ingredients", [])
#     details = []
#     for item in ingredients:
#         record = lookup_ingredient(item)
#         if record:
#             details.append({
#                 "item": item,
#                 "matched_name": record["name"],
#                 "category": record["category"],
#                 "summary": record["summary"],
#                 "slug": record["slug"],
#             })
#         else:
#             details.append({"item": item, "matched_name": None})
#     pipeline_result["ingredient_details"] = details
#     return pipeline_result










"""
Ingredient/additive encyclopedia (IFID — Encyclopedia of Indian Food
Ingredients, 661 entries across 8 categories). Two uses:

1. Enrich extracted ingredients with a plain-language explanation, so a
   scan result isn't just a bare ingredient name.
2. Power a manual search screen for anything the pipeline didn't
   recognize or match automatically — the whole point of having this
   data is that OCR/matching will sometimes miss, and a person should
   still be able to look something up themselves.

Cross-referencing with INS numbers works because many entries' keywords
include the literal INS code (e.g. "INS 950" for Acesulfame Potassium) --
extracted at load time into a separate ins-code index rather than
re-scanning all 661 entries on every lookup.
"""
import json
import os
import re

ENCYCLOPEDIA_PATH = os.getenv("ENCYCLOPEDIA_PATH", "encyclopedia.json")
INS_INDEX_PATH = os.getenv("INS_INDEX_PATH", "index.csv")

_flat = None       # {normalized_name: record}
_by_slug = None     # {slug: record}
_by_ins = None      # {ins_code: record}
_ins_index = None   # {code: {code, names, type, status}} -- loaded separately from
                     # ocr_pipeline.py's own INS index to avoid a circular import
                     # (ocr_pipeline already imports this module); the two are
                     # reading the same file, not maintaining separate data.
_INS_IN_TEXT_RE = re.compile(r'\bins\s*(\d{3,4}[a-z]?)\b', re.IGNORECASE)

_STATUS_JURISDICTIONS = {"a": "Australia/NZ", "e": "EU", "u": "USA"}


def load_encyclopedia(path=ENCYCLOPEDIA_PATH):
    if not os.path.exists(path):
        print(f"[warn] {path} not found — ingredient encyclopedia lookups unavailable")
        return {}, {}, {}

    with open(path, encoding="utf-8") as f:
        raw = json.load(f)

    flat, by_slug, by_ins = {}, {}, {}
    for category, items in raw.get("data", {}).items():
        for name, entry in items.items():
            description = entry.get("json", {}).get("description", {}) or {}
            record = {
                "name": name,
                "category": category,
                "slug": entry.get("slug"),
                # Short summary for inline display (e.g. next to a scanned
                # ingredient) -- the full write-up is available separately
                # via get_by_slug() for a "read more" detail view, so a
                # scan result payload isn't bloated with 661 entries' worth
                # of multi-paragraph text for the handful actually matched.
                "summary": (description.get("history_and_sourcing") or "")[:400].rsplit(".", 1)[0] + ".",
                "text": entry.get("text"),
                "description": description,
                "keywords": entry.get("json", {}).get("keywords", []) or [],
            }
            norm = name.strip().lower()
            flat[norm] = record
            if record["slug"]:
                by_slug[record["slug"]] = record

            for kw in record["keywords"]:
                m = _INS_IN_TEXT_RE.search(kw)
                if m:
                    by_ins.setdefault(m.group(1).lower(), record)
            m = _INS_IN_TEXT_RE.search(name)
            if m:
                by_ins.setdefault(m.group(1).lower(), record)

    print(f"[init] Loaded ingredient encyclopedia: {len(flat)} entries, {len(by_ins)} INS cross-refs")
    return flat, by_slug, by_ins


def _ensure_loaded():
    global _flat, _by_slug, _by_ins
    if _flat is None:
        _flat, _by_slug, _by_ins = load_encyclopedia()


def _strip_trailing_percentage(item: str) -> str:
    """'Sharbati Wheat (75%)' -> 'Sharbati Wheat' -- but keeps parens that
    aren't a bare percentage, like '(INS 950)', since those are meaningful
    for matching, not packaging noise."""
    return re.sub(r'\s*\(\d+(?:\.\d+)?%?\)\s*$', '', item).strip()


_STOPWORDS = {"whole", "raw", "the", "and", "of", "in", "with", "powder", "extract"}


def _tokens(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9']+", text.lower())
    return {w for w in words if len(w) >= 3 and w not in _STOPWORDS}


def lookup_ingredient(item: str) -> dict | None:
    """Looks up one ingredient-list item against the encyclopedia, trying
    progressively looser strategies until one is confident enough to
    trust, and returning None (not a weak guess) if nothing clears that
    bar -- a wrong explanation is worse than no explanation:

    1. Exact match (after stripping a trailing "(NN%)").
    2. Space-insensitive exact match -- catches "Flaxseed" vs "Flax Seed",
       "Horse gram" vs "Horsegram", which raw substring comparison misses
       since the words are just tokenized differently, not really
       different ingredients.
    3. Token overlap -- catches "Whole Bengal gram" vs "Bengal Gram
       (Chana Dal)": the item has an extra qualifier word ("Whole") that
       breaks pure substring containment, but the significant words
       (bengal, gram) still match. Requires ALL of the encyclopedia
       name's significant tokens to appear in the item, not just some,
       so it doesn't loosely match on one shared word.
    4. Raw substring containment (longest match wins).
    5. Keyword match, as a last resort -- this is how generic-sounding
       items land on a broader entry (e.g. "Ragi" has no dedicated
       article in this encyclopedia, but the "Millet" entry lists it as
       a keyword, which is a genuinely useful redirect, not a false
       positive)."""
    _ensure_loaded()
    if not _flat:
        return None

    cleaned = _strip_trailing_percentage(item).lower()

    for candidate in (item.strip().lower(), cleaned):
        if candidate in _flat:
            return _flat[candidate]

    cleaned_nospace = cleaned.replace(" ", "").replace("-", "")
    for enc_name, record in _flat.items():
        if enc_name.replace(" ", "").replace("-", "") == cleaned_nospace:
            return record

    item_tokens = _tokens(cleaned)
    best_token_match, best_shared_count = None, 0
    for enc_name, record in _flat.items():
        enc_tokens = _tokens(enc_name)
        if not enc_tokens:
            continue
        shared = item_tokens & enc_tokens
        # Require at least 2 shared significant words, OR a full match
        # when the encyclopedia name is itself just one significant word
        # (e.g. "Barley") -- this is what lets "Whole Bengal gram" find
        # "Bengal Gram (Chana Dal)" (shares "bengal"+"gram", 2 tokens)
        # over "Green Gram (Moong Dal)" or "Urad Dal (Black Gram)" (share
        # only "gram", 1 token each) without requiring an impossible exact
        # subset match against the encyclopedia's more detailed name.
        qualifies = len(shared) >= 2 or (len(enc_tokens) == 1 and enc_tokens == shared)
        if qualifies and len(shared) > best_shared_count:
            best_token_match, best_shared_count = record, len(shared)
    if best_token_match:
        return best_token_match

    best, best_len = None, 0
    for enc_name, record in _flat.items():
        if len(enc_name) < 5:
            continue  # too short to match safely by raw containment
        if enc_name in cleaned or cleaned in enc_name:
            if len(enc_name) > best_len:
                best, best_len = record, len(enc_name)
    if best:
        return best

    for record in _flat.values():
        for kw in record["keywords"]:
            kw_norm = kw.strip().lower()
            if len(kw_norm) >= 4 and kw_norm in cleaned:
                return record
    return None


def _load_ins_index(path=INS_INDEX_PATH) -> dict:
    if not os.path.exists(path):
        print(f"[warn] {path} not found — INS-index search fallback unavailable")
        return {}
    import csv
    index = {}
    with open(path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            code = row["code"].strip().lower()
            index[code] = {
                "code": code,
                "names": row.get("names", "").strip(),
                "type": row.get("type", "").strip(),
                "status": row.get("status", "").strip(),
            }
    return index


def _ensure_ins_index_loaded():
    global _ins_index
    if _ins_index is None:
        _ins_index = _load_ins_index()


def _ins_index_record(entry: dict) -> dict:
    """Shapes a bare index.csv row into the same record shape encyclopedia
    entries use, so search/detail can treat both uniformly. slug is
    prefixed 'ins:' so get_by_slug can tell the two apart without a
    separate lookup path."""
    jurisdictions = [
        _STATUS_JURISDICTIONS[c] for c in entry["status"].split() if c in _STATUS_JURISDICTIONS
    ]
    permitted_text = f"Permitted in: {', '.join(jurisdictions)}." if jurisdictions else "Permitted-jurisdiction data not available."
    display_name = entry["names"].split(",")[0].strip().title() or f"INS {entry['code']}"
    return {
        "name": f"{display_name} (INS {entry['code']})",
        "category": (entry["type"] or "Additive").title(),
        "slug": f"ins:{entry['code']}",
        "summary": f"INS {entry['code']} — {entry['type'] or 'additive'}. {permitted_text}",
        "text": None,
        "description": {
            "type": entry["type"] or "Not specified",
            "regulatory_status": permitted_text,
            "other_names": entry["names"] or "Not specified",
        },
        "keywords": [n.strip() for n in entry["names"].split(",") if n.strip()],
        "source": "ins_index",
    }


def lookup_by_ins(code: str) -> dict | None:
    """Encyclopedia write-up first (richer content); falls back to the
    bare index.csv entry if there's no dedicated article -- the two data
    sources only overlap on ~89 of index.csv's 436 codes."""
    _ensure_loaded()
    record = _by_ins.get(code.strip().lower())
    if record:
        return record
    _ensure_ins_index_loaded()
    entry = _ins_index.get(code.strip().lower())
    return _ins_index_record(entry) if entry else None


def get_by_slug(slug: str) -> dict | None:
    if slug.startswith("ins:"):
        _ensure_ins_index_loaded()
        entry = _ins_index.get(slug[4:])
        return _ins_index_record(entry) if entry else None
    _ensure_loaded()
    return _by_slug.get(slug)


def search_encyclopedia(query: str, limit: int = 15) -> list[dict]:
    """Powers the manual 'look this up' search screen. Ranked: exact name
    match, then prefix match, then substring match, then keyword match --
    so searching 'wheat' surfaces the Wheat entry itself before every
    entry that merely mentions wheat in passing.

    Also searches index.csv directly for INS codes/names that have no
    encyclopedia write-up -- otherwise searching "951" or "aspartame"
    returns nothing despite the data genuinely being available, just in
    the leaner reference table rather than a full article."""
    _ensure_loaded()
    _ensure_ins_index_loaded()
    q = query.strip().lower()
    if not q:
        return []

    scored = []
    for norm, record in _flat.items():
        if norm == q:
            score = 0
        elif norm.startswith(q):
            score = 1
        elif q in norm:
            score = 2
        elif any(q in kw.strip().lower() for kw in record["keywords"]):
            score = 3
        else:
            continue
        scored.append((score, len(record["name"]), record))

    seen_codes = set()
    for code, entry in _ins_index.items():
        # Skip codes the encyclopedia already covers -- the richer article
        # should win, not a duplicate bare-data-table entry alongside it.
        if code in _by_ins:
            continue
        names_norm = entry["names"].lower()
        if code == q:
            score = 0
        elif q == names_norm or q in [n.strip() for n in names_norm.split(",")]:
            score = 0
        elif names_norm.startswith(q) or code.startswith(q):
            score = 1
        elif q in names_norm:
            score = 2
        else:
            continue
        if code not in seen_codes:
            seen_codes.add(code)
            record = _ins_index_record(entry)
            scored.append((score, len(record["name"]), record))

    scored.sort(key=lambda x: (x[0], x[1]))
    return [r for _, _, r in scored[:limit]]


def enrich_ingredients(pipeline_result: dict) -> dict:
    """Attaches an encyclopedia match (if any) to each item in the
    already-extracted ingredients list. Called from run_compliance_checks,
    same pattern as enrich_ins_numbers."""
    ingredients = pipeline_result.get("ingredients", [])
    details = []
    for item in ingredients:
        record = lookup_ingredient(item)
        if record:
            details.append({
                "item": item,
                "matched_name": record["name"],
                "category": record["category"],
                "summary": record["summary"],
                "slug": record["slug"],
            })
        else:
            details.append({"item": item, "matched_name": None})
    pipeline_result["ingredient_details"] = details
    return pipeline_result