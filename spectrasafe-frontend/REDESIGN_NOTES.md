# UI Redesign Notes

All functionality, routes, fields, and workflows are unchanged. Only visual
design was touched.

## What changed

1. **Design tokens** (`src/index.css`) — replaced the old blue/navy palette
   with a warm, food-safety-inspired system: warm stone neutrals, a deep
   forest-green brand accent, harmonized pass/fail/warn/info colors,
   warm-tinted soft shadows, larger corner radii, and the Inter typeface
   (loaded in `index.html`).

2. **Shared component library** (`src/components/*`) — Button (added Ghost
   and Danger variants alongside the existing Primary/Outline), Card, Pill,
   Avatar, TopBar, TabBar, Screen, ListItem, MetricRow, ProgressBar, ScanBox,
   SectionLabel — all restyled for more polish (shadows, hover states,
   spacing) since every page composes from these primitives.

3. **Hardcoded colors harmonized app-wide** — several hand-styled pages
   (ShopScan, ShopHistory, ShopHome, Login, Register, BrandHome,
   BrandLabelEditor, ShopLayout, FSSAILayout/FSSAIHome, FSSAIHeatmap) used
   ~150 one-off hardcoded indigo/purple hex colors that bypassed the design
   token system entirely — this was the main source of the "generic AI SaaS
   dashboard" look. Every one of those colors (and the matching shadow
   `rgba()` values) was systematically remapped to the new palette:
   indigo/purple → forest green, cool grays → warm stone, reds/ambers/greens
   harmonized to the semantic status colors.

4. **Branding cleanup** — replaced the default Vite/placeholder favicon with
   a branded shield-check mark, removed unused default assets
   (`react.svg`, `vite.svg`, an unrelated icon sprite).

## Not changed
- No component logic, API calls, routes, or data shapes were touched.
- Page layouts/structure were left as-is where they already used the shared
  token system (most of Shop/Brand/FSSAI detail, list, and profile pages) —
  they inherit the new look automatically through the token and component
  updates.
