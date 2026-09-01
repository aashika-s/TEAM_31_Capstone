# SpectraSafe frontend — Phase 1 (foundation + shared components)

Vite + React + Tailwind v4 + React Router. Design tokens ported directly
from `spectrasite_wireframe.html` — same colors, same component patterns,
same light/dark behavior (see `src/index.css`).

## What's here

```
src/
  components/
    Screen.jsx        Real responsive app shell (phone-width max, not a
                       decorative bezel like the wireframe's demo trick)
    TopBar.jsx
    TabBar.jsx
    Card.jsx           Card, CardTitle, CardSub
    Pill.jsx           status pills — accepts real backend status strings
                        (COMPLIANT, NEEDS_REVIEW, MATCHED_WITH_DISCREPANCIES,
                        etc.) and maps them to the right visual variant
    Button.jsx         ButtonPrimary, ButtonOutline
    Avatar.jsx
    MetricRow.jsx
    ListItem.jsx
    SectionLabel.jsx
    ScanBox.jsx
    ProgressBar.jsx
  pages/
    ComponentPreview.jsx   every component composed together with
                           placeholder data — this IS this phase's
                           deliverable, not a real screen
  App.jsx              route skeleton: /shop, /brand, /fssai are stubs,
                       replaced with real screens in later phases
```

## Run it

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — you'll land on the component preview page.

## Not built yet (by design, per the phased plan)

- No real screens — `/shop`, `/brand`, `/fssai` are placeholders
- No auth (phase 2)
- No API calls anywhere yet — `ComponentPreview.jsx` uses hardcoded
  example data specifically so its content can't be mistaken for
  something wired to the real backend
