"""Exposure-normalised spectral features for diffraction-grating laser images.

Pipeline: find zero-order laser spot -> take horizontal band through it ->
analyse the coloured first-order lobes left/right of it. Everything is
normalised by the image's own peak brightness, so absolute exposure (camera
auto-gain, lighting) is NOT used as a signal.
"""
import cv2
import numpy as np

N_HUE, N_RAD = 12, 14
FEATURE_NAMES = (
    [f"hue_hist_{i}" for i in range(N_HUE)]
    + ["energy_left", "energy_right", "lr_ratio"]
    + [f"{s}_{k}" for s in ("L", "R") for k in ("mean_dx", "std_dx", "hue_sin", "hue_cos", "r_share", "g_share", "b_share", "dispersion", "n_blobs")]
    + [f"rad_{s}_{i}" for s in ("L", "R") for i in range(N_RAD)]
    + ["log_color_over_white", "log_white_area", "haze"]
)


def read_rgb(src):
    """src: path or raw bytes. Returns RGB uint8 or None."""
    if isinstance(src, (bytes, bytearray)):
        arr = cv2.imdecode(np.frombuffer(src, np.uint8), cv2.IMREAD_COLOR)
    else:
        arr = cv2.imread(str(src), cv2.IMREAD_COLOR)
    return None if arr is None else cv2.cvtColor(arr, cv2.COLOR_BGR2RGB)


def _side(dx, hue, w, rgb_w, mask):
    n = mask.sum()
    if n < 5:
        return [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], np.zeros(N_RAD)
    d, h, ww = np.abs(dx[mask]), hue[mask], w[mask]
    ws = ww.sum() + 1e-9
    mean_dx = float((d * ww).sum() / ws)
    std_dx = float(np.sqrt(((d - mean_dx) ** 2 * ww).sum() / ws))
    rad = np.histogram(d, bins=N_RAD, range=(0, 0.35), weights=ww)[0]
    rad = rad / (rad.sum() + 1e-9)
    rad_h = np.deg2rad(h)
    hs, hc = float((np.sin(rad_h) * ww).sum() / ws), float((np.cos(rad_h) * ww).sum() / ws)
    rgb = rgb_w[mask].sum(0)
    rgb = rgb / (rgb.sum() + 1e-9)
    # dispersion: how hue (red->violet) changes with distance from centre
    hv = np.clip(np.where(h > 270, 0, h), 0, 270)
    disp = float(np.corrcoef(d, hv)[0, 1]) if n > 10 and d.std() > 0 and hv.std() > 0 else 0.0
    comps = 0
    return [mean_dx, std_dx, hs, hc, *map(float, rgb), disp, 0.0], rad


def analyze(rgb, width=960):
    """Returns (feature_vector | None, quality dict)."""
    h0, w0 = rgb.shape[:2]
    img = cv2.resize(rgb, (width, max(1, int(h0 * width / w0))), interpolation=cv2.INTER_AREA)
    H_, W_ = img.shape[:2]
    hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV).astype(np.float32)
    hue, S, V = hsv[..., 0] * 2.0, hsv[..., 1] / 255.0, hsv[..., 2] / 255.0
    vmax = float(np.percentile(V, 99.99))
    q = {"ok": False, "reason": None, "peak_brightness": round(vmax, 3)}
    if vmax < 0.08:
        q["reason"] = "Image too dark: laser/spectrum not visible. Check laser and camera exposure."
        return None, q
    Vn = np.clip(V / vmax, 0, 1)
    white = (Vn > 0.8) & (S < 0.35)
    if white.sum() < 5:
        white = Vn >= 0.95
    ys, xs = np.nonzero(white)
    x0, y0 = float(np.median(xs)), float(np.median(ys))
    band = np.zeros_like(white)
    band[int(max(0, y0 - 0.12 * H_)): int(min(H_, y0 + 0.12 * H_)), :] = True
    colored = band & (S > 0.4) & (Vn > 0.12)
    if colored.sum() < 20:
        q["reason"] = "No diffraction spectrum found next to the laser spot. Re-take the photo."
        return None, q
    cy, cx = np.nonzero(colored)
    dx_all = (cx - x0) / W_
    w = Vn[cy, cx].astype(np.float64)
    hue_c = hue[cy, cx]
    rgb_w = img[cy, cx].astype(np.float64) * w[:, None]
    tot = w.sum() + 1e-9
    hist = np.histogram(hue_c, bins=N_HUE, range=(0, 360), weights=w)[0]
    hist = hist / (hist.sum() + 1e-9)
    left, right = dx_all < -0.004, dx_all > 0.004
    fl, rl = _side(dx_all, hue_c, w, rgb_w, left)
    fr, rr = _side(dx_all, hue_c, w, rgb_w, right)
    el, er = w[left].sum() / tot, w[right].sum() / tot
    # blob counts per side
    cm = colored.astype(np.uint8)
    cm = cv2.dilate(cm, np.ones((5, 9), np.uint8))
    n, lab = cv2.connectedComponents(cm)
    for side_f, sel in ((fl, lambda x: x < x0), (fr, lambda x: x > x0)):
        ids = {lab[yy, xx] for yy, xx in zip(cy[::7], cx[::7]) if sel(xx)}
        side_f[-1] = float(len(ids))
    white_e = Vn[white].sum() + 1e-9
    haze_mask = band & ~colored & ~white
    haze = float(Vn[haze_mask].mean()) if haze_mask.any() else 0.0
    vec = np.concatenate([
        hist, [el, er, np.log((el + 1e-3) / (er + 1e-3))], fl, fr, rl, rr,
        [np.log(tot / white_e + 1e-6), np.log(white.sum() / (H_ * W_) + 1e-8), haze],
    ]).astype(np.float64)
    assert len(vec) == len(FEATURE_NAMES), (len(vec), len(FEATURE_NAMES))
    q.update(ok=True, zero_order=[round(x0 / W_, 3), round(y0 / H_, 3)], colored_pixels=int(colored.sum()))
    return vec, q
