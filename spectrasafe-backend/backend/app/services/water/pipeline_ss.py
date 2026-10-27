"""Single source of truth for crop detection + feature extraction.

Training (train.py) and serving (backend_app.py) both import from here, so the
numbers reported by train.py describe exactly what the API runs.
"""
import io
import numpy as np
import cv2
from PIL import Image, ImageOps

MIN_CROP = 32          # px, smallest accepted crop side
N_BINS = 48
FEATURE_DIM = None     # filled lazily


class PipelineError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code, self.message = code, message


# --------------------------------------------------------------------- loading
def load_rgb(source):
    """Load a path / bytes / file-like into an EXIF-corrected RGB uint8 array."""
    try:
        if isinstance(source, (bytes, bytearray)):
            source = io.BytesIO(source)
        im = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
    except Exception as e:  # noqa: BLE001
        raise PipelineError("invalid_image", f"Could not read the image: {e}")
    return np.asarray(im)


# ------------------------------------------------------------------ detection
def detect_crop(rgb):
    """Suggest a crop around the spectral streaks (left band, source, right band).

    Returns (crop_dict | None, info_dict). Crop is in the image's own pixel coords.
    """
    h, w = rgb.shape[:2]
    g = cv2.GaussianBlur(rgb.max(axis=2), (5, 5), 0).astype(np.float32)
    peak = float(g.max())
    if peak < 25:
        return None, {"confident": False, "hue_std": None,
                      "reason": "image is almost completely dark (no spectrum found)"}
    thr = max(12.0, 0.10 * peak)
    mask = (g > thr).astype(np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    joined = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_RECT, (81, 15)))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(joined, connectivity=8)
    if n <= 1:
        return None, {"confident": False, "hue_std": None, "reason": "no bright spectral region found"}
    energy = np.array([g[(lab == i) & (mask > 0)].sum() for i in range(1, n)])
    if energy.sum() <= 0:
        return None, {"confident": False, "hue_std": None, "reason": "no bright spectral region found"}
    keep = [i + 1 for i, e in enumerate(energy) if e >= 0.25 * energy.max()]
    xs0 = min(stats[i, cv2.CC_STAT_LEFT] for i in keep)
    ys0 = min(stats[i, cv2.CC_STAT_TOP] for i in keep)
    xs1 = max(stats[i, cv2.CC_STAT_LEFT] + stats[i, cv2.CC_STAT_WIDTH] for i in keep)
    ys1 = max(stats[i, cv2.CC_STAT_TOP] + stats[i, cv2.CC_STAT_HEIGHT] for i in keep)
    padx, pady = 20, 30
    x0, y0 = max(0, xs0 - padx), max(0, ys0 - pady)
    x1, y1 = min(w, xs1 + padx), min(h, ys1 + pady)
    crop = {"x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)}
    hsv = cv2.cvtColor(rgb[y0:y1, x0:x1], cv2.COLOR_RGB2HSV)
    lit = hsv[..., 2] > thr
    hue_std = float(hsv[..., 0][lit].astype(np.float32).std() * 2) if lit.sum() > 10 else 0.0
    confident = bool(crop["w"] >= 100 and crop["h"] >= 20 and crop["w"] * crop["h"] < 0.6 * w * h
                     and lit.sum() >= 50 and len(keep) >= 1)
    return crop, {"confident": confident, "hue_std": round(hue_std, 1), "reason": None}


def validate_crop(crop, w, h):
    """Raise PipelineError for malformed / out-of-bounds / too-small crops."""
    try:
        x, y, cw, ch = (int(round(float(crop[k]))) for k in ("x", "y", "w", "h"))
    except Exception:  # noqa: BLE001
        raise PipelineError("malformed_crop", 'Crop must be {"x":int,"y":int,"w":int,"h":int}.')
    if x < 0 or y < 0 or x + cw > w or y + ch > h:
        raise PipelineError("crop_out_of_bounds",
                            f"Crop ({x},{y},{cw},{ch}) falls outside the {w}x{h} image.")
    if cw < MIN_CROP or ch < MIN_CROP:
        raise PipelineError("crop_too_small", f"Crop must be at least {MIN_CROP}x{MIN_CROP} pixels.")
    return {"x": x, "y": y, "w": cw, "h": ch}


def apply_crop(rgb, crop):
    return rgb[crop["y"]:crop["y"] + crop["h"], crop["x"]:crop["x"] + crop["w"]]


# ------------------------------------------------------------------- features
def _rotate_to_horizontal(rgb):
    g = rgb.max(axis=2).astype(np.float32)
    thr = max(20, np.percentile(g, 99.5) * 0.25)
    ys, xs = np.nonzero(g > thr)
    if len(xs) < 50:
        return rgb
    pts = np.stack([xs, ys], 1).astype(np.float32)
    pts -= pts.mean(0)
    _, v = np.linalg.eigh(np.cov(pts.T))
    ang = np.degrees(np.arctan2(v[1, 1], v[0, 1]))
    if ang > 90: ang -= 180
    if ang < -90: ang += 180
    if abs(ang) > 45:
        return rgb
    h, w = rgb.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), ang, 1.0)
    return cv2.warpAffine(rgb, M, (w, h), flags=cv2.INTER_LINEAR)


def _band_rows(rgb):
    g = rgb.max(axis=2).astype(np.float32)
    thr = max(15, np.percentile(g, 99.7) * 0.2)
    mask = g > thr
    if not mask.any():
        return None
    rowsum = mask.sum(1).astype(np.float32)
    cy = int(np.argmax(np.convolve(rowsum, np.ones(25), "same")))
    y0, y1 = max(0, cy - 40), min(rgb.shape[0], cy + 40)
    return thr, y0, y1


def _profile_features(rgb):
    info = _band_rows(rgb)
    if info is None:
        raise PipelineError("feature_extraction_failed", "No lit spectral pixels in the crop.")
    thr, y0, y1 = info
    band = rgb[y0:y1].astype(np.float32)
    cols = np.nonzero((band.max(2) > thr).any(0))[0]
    if len(cols) == 0:
        raise PipelineError("feature_extraction_failed", "No lit spectral pixels in the crop.")
    x0, x1 = cols.min(), cols.max() + 1
    band = band[:, x0:x1]
    prof = band.sum(0)
    prof = np.stack([cv2.resize(prof[:, c][None], (N_BINS, 1), interpolation=cv2.INTER_AREA)[0]
                     for c in range(3)])
    geom = np.array([x1 - x0, y1 - y0, band.sum() / 1e6, (band.max(2) > thr).mean()], np.float32)
    total = prof.sum() + 1e-6
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    v = hsv[..., 2]
    lit = v > max(15, np.percentile(v, 99.7) * 0.2)
    if lit.sum() > 10:
        hh = hsv[..., 0][lit].astype(np.float32) * 2
        ss = hsv[..., 1][lit].astype(np.float32) / 255
        hist = np.histogram(hh, bins=12, range=(0, 360), weights=v[lit].astype(np.float32))[0]
        hist = hist / (hist.sum() + 1e-6)
        col = np.array([hh.mean(), hh.std(), ss.mean(), v[lit].mean() / 255, lit.mean()], np.float32)
    else:
        hist = np.zeros(12, np.float32); col = np.zeros(5, np.float32)
    return np.concatenate([(prof / total).ravel(), hist, col, prof.sum(1) / total,
                           [np.log1p(total)], geom]).astype(np.float32)


def _band_structure_features(rgb):
    rgbf = rgb.astype(np.float32)
    info = _band_rows(rgb)
    if info is None:
        return np.zeros(24, np.float32)
    _, y0, y1 = info
    prof = rgbf[y0:y1].sum(0)
    lum = prof.sum(1)
    if lum.max() <= 0:
        return np.zeros(24, np.float32)
    cx = int(np.argmax(np.convolve(lum, np.ones(15), "same")))
    W = len(lum)
    left, right = prof[:max(cx - 20, 1)], prof[min(cx + 20, W - 1):]
    tot = lum.sum() + 1e-6
    f = []
    for side in (left, right):
        s = side.sum() + 1e-6
        l = side.sum(1)
        xs = np.arange(len(l))
        c = (l * xs).sum() / (l.sum() + 1e-6) if len(l) else 0
        span = np.nonzero(l > 0.1 * (l.max() + 1e-6))[0] if len(l) else []
        width = (span.max() - span.min()) if len(span) else 0
        f += [s / tot, *(side.sum(0) / s), c / W, width / W, (l.max() if len(l) else 0) / (lum.max() + 1e-6)]
    f += [cx / W, lum.max() / tot, np.log1p(tot), (f[0] + 1e-6) / (f[7] + 1e-6)]
    out = np.zeros(24, np.float32)
    f = np.array(f, np.float32)
    out[:min(24, len(f))] = f[:24]
    return out


def featurize_crop(crop_rgb):
    """Feature vector for an already-cropped RGB array."""
    if crop_rgb.size == 0:
        raise PipelineError("feature_extraction_failed", "Empty crop.")
    rot = _rotate_to_horizontal(crop_rgb)
    vec = np.concatenate([_profile_features(rot), _band_structure_features(rot)])
    if not np.isfinite(vec).all():
        raise PipelineError("feature_extraction_failed", "Non-finite features.")
    return vec


def featurize_path_auto(path):
    """Training helper: load -> auto-detect crop -> features. Mirrors the API's flow."""
    rgb = load_rgb(path)
    crop, _ = detect_crop(rgb)
    if crop is None:
        raise PipelineError("crop_detection_failed", f"No crop detected for {path}")
    return featurize_crop(apply_crop(rgb, crop)), crop
