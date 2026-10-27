"""
Country-specific label rule sheets, each a plain dict describing:
- mandatory_fields: fields that MUST be present, with a human label
- nutrient_requirements: which nutrients must appear, per what basis
  (per-100g, per-serving, or both), and in what unit
- allergen_list: the country's own list of "major" allergens that must
  be declared/emphasized (these differ by country -- EU has 14, US has 9)
- font_rules: minimum font size/x-height, expressed in the country's own
  unit (points for the US, mm x-height for the EU) -- deliberately NOT
  normalized to one unit, since converting risks introducing an error
  the source regulation doesn't have
- source: citation for where these numbers came from, and the date they
  were last checked -- these regulations change, and every rule sheet
  needs a paper trail back to what it was actually verified against

Rule sheets marked "STATUS: STUB" have accurate top-level structure but
INCOMPLETE OR UNVERIFIED numeric thresholds -- do not present labels
generated against a stub sheet as compliant. Fill in from the official
regulatory text before relying on them.
"""
from . import fssai, fda_us, eu_1169, china_gb, uk_fsa, canada_cfia, australia_fsanz, uae_gcc, japan_caa, singapore_sfa

RULE_SHEETS = {
    "FSSAI": fssai.RULES,
    "FDA": fda_us.RULES,
    "EU_1169": eu_1169.RULES,
    "CHINA_GB": china_gb.RULES,
    "UK_FSA": uk_fsa.RULES,
    "CANADA_CFIA": canada_cfia.RULES,
    "AUSTRALIA_FSANZ": australia_fsanz.RULES,
    "UAE_GCC": uae_gcc.RULES,
    "JAPAN_CAA": japan_caa.RULES,
    "SINGAPORE_SFA": singapore_sfa.RULES,
}