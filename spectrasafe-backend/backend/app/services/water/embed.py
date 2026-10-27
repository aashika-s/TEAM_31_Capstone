"""Optional deep embeddings (DINOv2 ViT-B/14 via torch.hub). Needs: pip install torch torchvision."""
import numpy as np, cv2

_model = None

def _load(name="dinov2_vitb14"):
    global _model
    if _model is None:
        import torch
        _model = torch.hub.load("facebookresearch/dinov2", name).eval()
    return _model


def crop_strip(rgb):
    """Crop the horizontal band through the laser spot (full width) and resize to 224x756 (multiples of 14)."""
    h, w = rgb.shape[:2]
    v = rgb.max(2).astype(np.float32)
    v = cv2.GaussianBlur(v, (0, 0), 6)
    _, y0 = np.unravel_index(np.argmax(v), v.shape)
    half = int(0.15 * h)
    strip = rgb[max(0, y0 - half): min(h, y0 + half), :]
    # per-image contrast stretch so exposure is not a signal
    s = strip.astype(np.float32)
    s = np.clip(s / max(np.percentile(s, 99.9), 1.0), 0, 1)
    return cv2.resize((s * 255).astype(np.uint8), (756, 224), interpolation=cv2.INTER_AREA)


def embed(rgb, name="dinov2_vitb14"):
    import torch
    m = _load(name)
    x = crop_strip(rgb).astype(np.float32) / 255.0
    x = (x - np.array([0.485, 0.456, 0.406], np.float32)) / np.array([0.229, 0.224, 0.225], np.float32)
    t = torch.from_numpy(x).permute(2, 0, 1).unsqueeze(0)
    with torch.no_grad():
        out = m.forward_features(t)
    cls = out["x_norm_clstoken"][0].numpy()
    patch = out["x_norm_patchtokens"][0].mean(0).numpy()
    return np.concatenate([cls, patch]).astype(np.float64)
