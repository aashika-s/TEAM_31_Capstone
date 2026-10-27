"""Spectrum-envelope features used by the production water model.

Deterministic image processing (no learned feature extractor):
  1. find the bright, near-white zero-order bar (heuristic column score),
  2. take a 480 px window on the left of the bar (skipping 40 px of glare),
  3. per column take the 90th-percentile BGR envelope, bin it into 60 bins,
  4. features = normalised envelope shape + channel shares + intensity-weighted
     positions + log total brightness  (60*3 + 3 + 3 + 1 = 187 values).
Ported from the water team's Colab notebook (SIDE='left', SKIP=40, WIN=480, NB=60).
"""
import cv2
import numpy as np

SKIP_GLARE_PX = 40
WINDOW_WIDTH_PX = 480
N_BINS = 60


def find_reference_bar(bgr):
    f = bgr.astype(np.float32)
    mx, mn = f.max(2), f.min(2)
    white = (mn > 100) & ((mx - mn) < 55)
    col = white.sum(axis=0).astype(np.float32)
    if col.size < 3 or float(col.max()) <= 0:
        return int(bgr.shape[1] // 2), False
    smooth = np.convolve(col, np.ones(21, np.float32) / 21.0, mode="same")
    x0 = int(np.argmax(smooth))
    rows = np.where(white[:, max(0, x0 - 8): min(bgr.shape[1], x0 + 9)].any(axis=1))[0]
    return x0, bool(len(rows) >= max(20, int(bgr.shape[0] * 0.08)))


def extract(rgb):
    """rgb uint8 image -> (feature vector | None, quality dict)."""
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    h, w = bgr.shape[:2]
    peak = float(np.percentile(bgr.max(axis=2), 99.99)) / 255.0
    q = {"ok": False, "reason": None, "peak_brightness": round(peak, 3)}
    if peak < 0.08:
        q["reason"] = "Image too dark: laser/spectrum not visible. Check laser and camera exposure."
        return None, q
    x0, bar_ok = find_reference_bar(bgr)
    xs = max(0, x0 - SKIP_GLARE_PX - WINDOW_WIDTH_PX)
    xe = max(0, x0 - SKIP_GLARE_PX)
    if xe - xs < max(40, WINDOW_WIDTH_PX // 3):          # not enough room on the left: use the right side
        xs = min(w, x0 + SKIP_GLARE_PX)
        xe = min(w, xs + WINDOW_WIDTH_PX)
    if xe <= xs:
        q["reason"] = "No spectrum window found next to the laser spot. Re-take the photo."
        return None, q
    band = bgr[int(h * 0.10): int(h * 0.90), xs:xe]
    if band.size == 0:
        q["reason"] = "No spectrum window found next to the laser spot. Re-take the photo."
        return None, q
    band = cv2.resize(band, (WINDOW_WIDTH_PX, max(32, band.shape[0])), interpolation=cv2.INTER_AREA)
    env = np.percentile(band.astype(np.float32), 90, axis=0)
    bw = WINDOW_WIDTH_PX // N_BINS
    env = env[: N_BINS * bw].reshape(N_BINS, bw, 3).mean(axis=1)
    total = float(env.sum())
    shape = (env / (total + 1e-8)).ravel()
    share = env.sum(axis=0) / (total + 1e-8)
    pos = (env * np.arange(N_BINS)[:, None]).sum(axis=0) / (env.sum(axis=0) + 1e-8) / N_BINS
    vec = np.r_[shape, share, pos, np.log1p(total)].astype(np.float64)
    q.update(ok=True, bar_found=bool(bar_ok), bar_x=round(x0 / w, 3))
    return vec, q
