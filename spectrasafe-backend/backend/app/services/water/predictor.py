"""Water-spectrum classifier wrapper (deterministic: classical features + sklearn head, no LLM).

Loads app/data/water/model.joblib, which was trained by the water team's ml/train.py.
The model file pickles scikit-learn objects, so scikit-learn must be the SAME version it
was trained with (1.8.0). If you retrain, copy the new model.joblib + metrics.json into
app/data/water/.
"""
from __future__ import annotations

import logging
from pathlib import Path

import joblib
import numpy as np

from . import features as F
from . import features_nb as FNB
from . import pipeline_ss as PSS

log = logging.getLogger(__name__)

MODEL_PATH = Path(__file__).resolve().parents[2] / "data" / "water" / "model.joblib"


def _knn(Xs, xq, k=3):
    d = np.linalg.norm(Xs - xq, axis=1)
    return float(np.sort(d)[:k].mean())


class WaterPredictor:
    def __init__(self, path: Path = MODEL_PATH):
        a = joblib.load(path)
        self.a = a
        self.version = f"{a['mode']}/{a['head_name']}@{a['trained_at']}"
        self.metrics = a["metrics"]
        if a["mode"] == "ss_pipeline":
            self.head = a["model"]
            self.Xsafe = None
            return
        if a["head_name"] == "tabpfn":
            from tabpfn import TabPFNClassifier  # only if a deep model was exported
            self.head = TabPFNClassifier(random_state=0).fit(a["Xt"], a["y"])
        else:
            self.head = a["head"]
        self.Xsafe = a["Xt"][a["y"] == 0]

    def predict(self, rgb: np.ndarray) -> dict:
        a = self.a
        if a["mode"] == "ss_pipeline":                   # water team's final model: auto-crop + 193 features + ExtraTrees
            return self._predict_ss(rgb)
        if a["mode"] == "notebook":                      # production model: envelope features + logistic regression
            vec, q = FNB.extract(rgb)
            if vec is None:
                return dict(result="inconclusive", p_unsafe=None, novelty_z=None, quality=q)
            x = vec
        else:                                            # legacy physics-feature models
            vec, q = F.analyze(rgb)
            if vec is None:
                return dict(result="inconclusive", p_unsafe=None, novelty_z=None, quality=q)
            x = vec[a["phys_cols"]]
        if a["mode"] == "dino+physics":
            from . import embed
            x = np.concatenate([embed.embed(rgb), vec])
        xt = a["pre"].transform(x[None])
        p = float(self.head.predict_proba(xt)[0, 1])
        z = (_knn(self.Xsafe, xt[0]) - a["nov_mu"]) / a["nov_sd"]
        if p >= a["thr_hi"]:
            result = "unsafe"
        elif p <= a["thr_lo"] and z <= 4.0:
            result = "no_contaminant_detected"
        else:
            result = "inconclusive"
        return dict(result=result, p_unsafe=round(p, 4), novelty_z=round(float(z), 2), quality=q)


    def _predict_ss(self, rgb: np.ndarray) -> dict:
        a = self.a
        try:
            crop, info = PSS.detect_crop(rgb)
            if crop is None:
                return dict(result="inconclusive", p_unsafe=None, novelty_z=None,
                            quality={"ok": False, "reason": info.get("reason") or "no spectrum found"})
            vec = PSS.featurize_crop(PSS.apply_crop(rgb, crop))
        except PSS.PipelineError as e:
            return dict(result="inconclusive", p_unsafe=None, novelty_z=None,
                        quality={"ok": False, "reason": e.message})
        if vec.shape[0] != a["feature_dim"]:
            raise RuntimeError("feature size mismatch with trained model; retrain")
        p = float(self.head.predict_proba(vec[None])[0, list(self.head.classes_).index(0)])  # class 0 = potential_risk
        q = {"ok": True, "crop": crop, "crop_confident": info["confident"]}
        if p >= a["thr_hi"] and info["confident"]:
            result = "unsafe"
        elif p <= a["thr_lo"] and info["confident"]:
            result = "no_contaminant_detected"
        else:
            result = "inconclusive"
        return dict(result=result, p_unsafe=round(p, 4), novelty_z=None, quality=q)


_predictor: WaterPredictor | None = None
_load_error: str | None = None


def get_predictor() -> WaterPredictor | None:
    """Lazy singleton. A missing/incompatible model must never crash the rest of the backend."""
    global _predictor, _load_error
    if _predictor is None and _load_error is None:
        try:
            _predictor = WaterPredictor()
        except Exception as e:  # noqa: BLE001
            _load_error = f"{type(e).__name__}: {e}"
            log.error("Water model failed to load: %s", _load_error)
    return _predictor


def load_error() -> str | None:
    return _load_error
