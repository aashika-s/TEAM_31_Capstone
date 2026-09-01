# SpectraSafe backend — Phase 1 (DB + API wrapping the OCR/compliance pipeline)

This is the first slice of the full SpectraSafe spec: a FastAPI service
that wraps the existing YOLO + OCR ensemble + FSSAI extraction pipeline,
runs a compliance check, and persists the result to a database.

**Not included yet** (by design, per the phased plan): auth/roles, the
Brand product registry, the FSSAI investigation dashboard, traceability,
and the AI label generator (being built separately).

## What's here

```
backend/
  app/
    main.py                    FastAPI app + startup model warm-up
    core/
      config.py                env-driven settings
      database.py               SQLAlchemy engine/session, init_db()
    models/
      scan.py                  Scan table (the only table so far)
    schemas/
      scan.py                  Pydantic request/response models
    services/
      ocr_pipeline.py          your pipeline, adapted to be import-safe
      compliance_service.py    PLACEHOLDER rule engine — see file docstring
    api/v1/
      scans.py                 POST/GET /api/v1/scans
  requirements.txt
  .env.example
```

## Important: swap in your real compliance engine

`app/services/compliance_service.py` is a placeholder — deterministic,
but a much smaller rule set than the SQLite-backed engine you already
built (FSSAI Compendium / Codex Alimentarius / Open Food Facts). Replace
`run_compliance_check(extracted: dict) -> dict` with a call into your
real engine. Keep the same return shape
(`status/score/violations/warnings/missing_fields`) and nothing else in
the API needs to change.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env — at minimum set YOLO_WEIGHTS_PATH to your real "best.pt"
```

Put your trained weights + ingredient dictionary wherever `.env` points:
```
backend/models/best.pt
backend/data/ingredients.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

First startup loads YOLO + PaddleOCR + EasyOCR into memory (this can take
a while) — that's expected, it's a one-time cost per process start, not
per request.

## Try it

```bash
curl http://localhost:8000/health

curl -X POST http://localhost:8000/api/v1/scans/ \
  -F "file=@/path/to/a/label/photo.jpg"

curl http://localhost:8000/api/v1/scans/
```

Interactive API docs: http://localhost:8000/docs

## Known limitations at this phase

- SQLite by default — fine for local dev/demo, switch `DATABASE_URL` to
  Postgres before anything resembling production.
- No auth yet — every endpoint is open. Auth/roles is a separate phase.
- Scans aren't linked to a registered product yet (no Brand/product
  registry exists), so compliance is currently "does this label look
  right on its own," not "does this match what was registered."
- The compliance engine here is a placeholder — see above.
- Accuracy limits from the pipeline itself (nutrient classifier edge
  cases, ingredients-region detection mAP, OCR CER) still apply; this
  phase doesn't change extraction quality, just makes it queryable.
