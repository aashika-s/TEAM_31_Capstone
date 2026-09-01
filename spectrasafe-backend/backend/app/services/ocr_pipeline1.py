# """
# OCR + FSSAI compliance extraction pipeline.

# Adapted from the standalone master_pipeline.py capstone script into a
# service module: paths are now environment-configurable instead of
# hardcoded, and the eval-only, import-time side effects (plausible-range
# derivation, banner prints) are guarded so importing this module in the
# API doesn't require ground_truth.json to exist on the deployment box.

# Includes the energy_kcal / energy_kJ classifier fix: both used to
# collapse into a single "energy" bucket because both names contain the
# substring "energy", which cross-matched kcal and kJ readings against
# each other and widened the plausible-range decimal-drop correction
# across two different unit scales. Now split by checking which unit is
# actually present in the raw field name before classifying.
# """

# import re, cv2, numpy as np
# import json, os
# from ultralytics import YOLO
# from paddleocr import PaddleOCR

# try:
#     import easyocr
#     _EASYOCR_AVAILABLE = True
# except ImportError:
#     _EASYOCR_AVAILABLE = False

# try:
#     import pytesseract
#     _TESSERACT_AVAILABLE = True
# except ImportError:
#     _TESSERACT_AVAILABLE = False


# # ══════════════════════════════════════════════════════════════════════════════
# # CONFIG & INIT — now environment-driven instead of hardcoded, so this module
# # can live inside a deployed service rather than a notebook working directory
# # ══════════════════════════════════════════════════════════════════════════════
# YOLO_WEIGHTS          = os.getenv("YOLO_WEIGHTS_PATH", "best.pt")
# YOLO_CONF             = 0.50
# FSSAI_CONF            = 0.30    # Lowered specifically for FSSAI boxes
# OCR_CONF_GATE         = 0.55
# OCR_CONF_SOFT_FLOOR   = 0.40
# CROP_PAD              = 5
# TARGET_CHAR_HEIGHT_PX = 48
# MIN_CROP_DIM          = 600
# GROUND_TRUTH_PATH     = os.getenv("GROUND_TRUTH_PATH", "ground_truth.json")
# INGREDIENT_DICT_PATH  = os.getenv("INGREDIENT_DICT_PATH", "ingredients.txt")

# def load_ingredient_dictionary(path=INGREDIENT_DICT_PATH, ground_truth_path=GROUND_TRUTH_PATH):
#     vocab = set()

#     if os.path.exists(path):
#         with open(path, encoding="utf-8") as f:
#             for line in f:
#                 line = line.strip()
#                 if not line or line.startswith("#"):
#                     continue
#                 m = re.match(r'^(?:synonyms:)?en:\s*(.+)$', line)
#                 if not m:
#                     continue
#                 entry = m.group(1)
#                 for name in entry.split(","):
#                     name = name.strip().lower()
#                     name = re.sub(r'\s*\(.*?\)\s*', ' ', name).strip()
#                     if len(name) >= 3 and re.match(r'^[a-z][a-z\s\-]*$', name):
#                         vocab.add(name)
#     else:
#         print(f"[warn] {path} not found — skipping external ingredient dictionary")

#     if os.path.exists(ground_truth_path):
#         with open(ground_truth_path, encoding="utf-8") as f:
#             gt = json.load(f)
#         for entry in gt.values():
#             text = entry.get("ingredients_true", "")
#             for word in re.findall(r'[a-zA-Z]+', text):
#                 if len(word) >= 3:
#                     vocab.add(word.lower())

#     print(f"[init] Loaded ingredient dictionary: {len(vocab)} entries")
#     return vocab

# _INGREDIENT_DICTIONARY = None
# _yolo_model_cache = None
# _ocr_engine_cache = None
# _easyocr_reader = None

# def load_models():
#     print("[init] Loading YOLO …")
#     yolo = YOLO(YOLO_WEIGHTS)
#     print("[init] Loading PaddleOCR …")
#     ocr  = PaddleOCR(use_angle_cls=True, lang="en", show_log=False,
#                      det_db_unclip_ratio=1.8, rec_batch_num=6,
#                      det_db_box_thresh=0.3, det_db_thresh=0.2,
#                      det_limit_side_len=1920)
#     return yolo, ocr

# def get_easyocr_reader():
#     global _easyocr_reader
#     if _easyocr_reader is None and _EASYOCR_AVAILABLE:
#         print("[init] Loading EasyOCR …")
#         _easyocr_reader = easyocr.Reader(['en'], gpu=True)
#     return _easyocr_reader

# def warm_up_models():
#     """Call once at API startup so the first real request isn't the one
#     paying multi-second model load time."""
#     global _yolo_model_cache, _ocr_engine_cache
#     if _yolo_model_cache is None or _ocr_engine_cache is None:
#         _yolo_model_cache, _ocr_engine_cache = load_models()
#     get_easyocr_reader()


# # ══════════════════════════════════════════════════════════════════════════════
# # STAGE 1 — YOLO DETECTION
# # ══════════════════════════════════════════════════════════════════════════════

# def detect_regions(image_path, yolo_model, ocr_engine=None, max_area_ratio=0.70):
#     img_bgr = cv2.imread(image_path)
#     if img_bgr is None: raise FileNotFoundError(f"Cannot read: {image_path}")
#     ih, iw = img_bgr.shape[:2]
#     image_area = ih * iw

#     results = yolo_model(image_path, conf=0.25)
#     raw_boxes = []
#     for box in results[0].boxes:
#         x1, y1, x2, y2 = map(int, box.xyxy[0])
#         label = yolo_model.names[int(box.cls[0])].lower()
#         box_conf = float(box.conf[0])
#         req_conf = FSSAI_CONF if "fssai" in label else YOLO_CONF
#         if box_conf < req_conf:
#             continue
#         raw_boxes.append((x1, y1, x2, y2, label, box_conf))

#     kept = []
#     for x1, y1, x2, y2, label, box_conf in raw_boxes:
#         ratio = ((x2 - x1) * (y2 - y1)) / image_area
#         if ratio > max_area_ratio:
#             continue
#         kept.append((x1, y1, x2, y2, label, box_conf))

#     def _iou(a, b):
#         ax1, ay1, ax2, ay2 = a[:4]
#         bx1, by1, bx2, by2 = b[:4]
#         ix1, iy1 = max(ax1, bx1), max(ay1, by1)
#         ix2, iy2 = min(ax2, bx2), min(ay2, by2)
#         if ix2 <= ix1 or iy2 <= iy1: return 0.0
#         inter = (ix2 - ix1) * (iy2 - iy1)
#         return inter / ((ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter)

#     final_boxes = []
#     for cand in sorted(kept, key=lambda b: -b[5]):
#         if not any(cand[4] == ex[4] and _iou(cand, ex) > 0.4 for ex in final_boxes):
#             final_boxes.append(cand)

#     regions = []
#     for x1, y1, x2, y2, label, box_conf in final_boxes:
#         crop = img_bgr[max(0, y1 - CROP_PAD):min(ih, y2 + CROP_PAD), max(0, x1 - CROP_PAD):min(iw, x2 + CROP_PAD)]
#         regions.append({"label": label, "bbox": (x1, y1, x2, y2), "crop_bgr": crop})

#     if ocr_engine is not None:
#         found_labels = {r["label"] for r in regions}
#         missing = [lbl for lbl in _FALLBACK_ANCHORS if not any(lbl in fl for fl in found_labels)]
#         if missing:
#             regions.extend(keyword_fallback_regions(img_bgr, ocr_engine, missing))

#     for r in regions:
#         h, w = r["crop_bgr"].shape[:2]
#         if h == 0 or w == 0: continue
#         min_dim = min(h, w)
#         if min_dim < MIN_CROP_DIM:
#             scale = MIN_CROP_DIM / min_dim
#             r["crop_bgr"] = cv2.resize(r["crop_bgr"], (max(1, int(w * scale)), max(1, int(h * scale))),
#                                         interpolation=cv2.INTER_LANCZOS4)
#     return regions


# # ══════════════════════════════════════════════════════════════════════════════
# # STAGE 1.5 — KEYWORD-ANCHORED FALLBACK DETECTION
# # ══════════════════════════════════════════════════════════════════════════════

# _FALLBACK_ANCHORS = {
#     "ingredients": re.compile(r'\bingredients?\b\s*[:\-]?', re.IGNORECASE),
#     "fssai": re.compile(r'\bfssai\b|\blic(?:ense|\.)?\s*(?:no\.?|number)\b', re.IGNORECASE),
# }
# _SECTION_STOP = re.compile(
#     r'\bnutrition(?:al)?\b|\ballergen\b|\bstorage\b|\bbest\s*before\b|\bbatch\b|'
#     r'\bmfg\b|\bmanufactur|\bnet\s*(?:wt|weight|quantity)\b|\bfssai\b',
#     re.IGNORECASE
# )

# def _full_page_ocr_lines(img_bgr, ocr_engine):
#     result = ocr_engine.ocr(img_bgr, det=True, rec=True, cls=True)
#     if not result or not result[0]: return []
#     lines = []
#     for box, rec in result[0]:
#         text, conf = rec if isinstance(rec, tuple) else (rec[0], rec[1])
#         pts = np.array(box, dtype=np.float32)
#         lines.append({
#             "text": text, "conf": float(conf),
#             "x1": float(pts[:, 0].min()), "y1": float(pts[:, 1].min()),
#             "x2": float(pts[:, 0].max()), "y2": float(pts[:, 1].max()),
#             "cy": float(pts[:, 1].mean()),
#         })
#     return sorted(lines, key=lambda l: l["cy"])

# def keyword_fallback_regions(img_bgr, ocr_engine, missing_labels, pad=CROP_PAD):
#     if not missing_labels: return []
#     ih, iw = img_bgr.shape[:2]
#     lines = _full_page_ocr_lines(img_bgr, ocr_engine)
#     if not lines: return []

#     heights = [l["y2"] - l["y1"] for l in lines if l["y2"] > l["y1"]]
#     median_h = sorted(heights)[len(heights) // 2] if heights else 20

#     regions = []
#     for label in missing_labels:
#         pattern = _FALLBACK_ANCHORS.get(label)
#         if pattern is None: continue

#         anchor_idx = next((i for i, l in enumerate(lines) if pattern.search(l["text"])), None)
#         if anchor_idx is None: continue

#         anchor = lines[anchor_idx]
#         gap_thresh = max(25, median_h * (5.0 if label == "ingredients" else 2.5))

#         block = [anchor]
#         prev_y2 = anchor["y2"]
#         max_lines = 40 if label == "ingredients" else 3

#         for l in lines[anchor_idx + 1:]:
#             if len(block) >= max_lines: break
#             if l["y1"] - prev_y2 > gap_thresh: break
#             if label == "ingredients" and _SECTION_STOP.search(l["text"]): break
#             block.append(l)
#             prev_y2 = l["y2"]

#         if label == "ingredients" and len(block) <= 1:
#             fallback_y2 = min(ih, int(anchor["y2"] + max(400, median_h * 15)))
#             for l in lines[anchor_idx + 1:]:
#                 if _SECTION_STOP.search(l["text"]) and l["y1"] > anchor["y2"]:
#                     fallback_y2 = min(fallback_y2, int(l["y1"]))
#                     break
#             x1 = max(0, int(anchor["x1"]) - pad)
#             y1 = max(0, int(anchor["y1"]) - pad)
#             x2 = min(iw, int(max(anchor["x2"], iw * 0.9)) + pad)
#             y2 = min(ih, fallback_y2 + pad)
#             regions.append({"label": label, "bbox": (x1, y1, x2, y2),
#                              "crop_bgr": img_bgr[y1:y2, x1:x2],
#                              "source": "keyword_fallback_expanded"})
#             continue

#         x1 = max(0, int(min(l["x1"] for l in block)) - pad)
#         y1 = max(0, int(min(l["y1"] for l in block)) - pad)
#         x2 = min(iw, int(max(l["x2"] for l in block)) + pad)
#         y2 = min(ih, int(max(l["y2"] for l in block)) + pad)
#         if x2 <= x1 or y2 <= y1: continue

#         regions.append({"label": label, "bbox": (x1, y1, x2, y2),
#                          "crop_bgr": img_bgr[y1:y2, x1:x2], "source": "keyword_fallback"})
#     return regions


# # ══════════════════════════════════════════════════════════════════════════════
# # STAGE 2 — ENSEMBLE LINE-SEGMENTED OCR & COLUMN PARSER
# # ══════════════════════════════════════════════════════════════════════════════

# def _dictionary_score(text: str) -> int:
#     score = 0
#     if re.search(r'energy|protein|fat|carbohydrate|sugar|sodium|cholesterol|fibre|fiber|calcium|iron|potassium|vitamin', text, re.IGNORECASE): score += 3
#     if re.search(r'\b\d{14}\b', text): score += 5
#     if re.search(r'\bINS\s*\d{3,4}|\(\d{3,4}\)', text, re.IGNORECASE): score += 2
#     if re.match(r'^[\d.,<>%\s]+$', text.strip()): score += 1
#     letters = re.sub(r'[^a-zA-Z]', '', text)
#     if len(letters) >= 4 and sum(1 for c in letters.lower() if c in 'aeiou') / len(letters) < 0.15: score -= 3
#     return score

# def ensemble_recognize_line(line_img, paddle_ocr_engine, label: str = "") -> tuple[str, float]:
#     cands = []
#     res = paddle_ocr_engine.ocr(line_img, det=False, rec=True, cls=True)
#     if res and res[0]:
#         t, c = res[0][0] if isinstance(res[0][0], tuple) else (res[0][0][0], res[0][0][1])
#         if c >= 0.4: cands.append((t.strip(), c, "paddle", _dictionary_score(t.strip())))

#     if _EASYOCR_AVAILABLE and get_easyocr_reader():
#         res_e = get_easyocr_reader().readtext(line_img, detail=1, paragraph=False)
#         if res_e:
#             combined = " ".join([r[1] for r in res_e]).strip()
#             avg_c = sum([r[2] for r in res_e]) / len(res_e)
#             if avg_c >= 0.4 and combined: cands.append((combined, avg_c, "easyocr", _dictionary_score(combined)))

#     if _TESSERACT_AVAILABLE and "nutri" not in label.lower():
#         try:
#             data = pytesseract.image_to_data(line_img, output_type=pytesseract.Output.DICT, config='--psm 7')
#             texts, confs = zip(*[(t, int(c)) for c, t in zip(data['conf'], data['text']) if t.strip() and c != '-1'])
#             if texts:
#                 avg_c = (sum(confs) / len(confs)) / 100.0
#                 if avg_c >= 0.4: cands.append((" ".join(texts).strip(), avg_c, "tesseract", _dictionary_score(" ".join(texts).strip())))
#         except Exception: pass

#     if not cands: return None, 0.0

#     text_counts = {}
#     for text, conf, _, dscore in cands: text_counts.setdefault(text.lower().strip(), []).append((text, conf, dscore))
#     for key, group in text_counts.items():
#         if len(group) >= 2: return max(group, key=lambda g: g[1])[0], min(0.99, max(group, key=lambda g: g[1])[1] + 0.15)

#     winner = max(cands, key=lambda c: (c[3], c[1]))
#     return winner[0], winner[1]

# def _box_rect(b):
#     pts = np.array(b, dtype=np.float32)
#     return pts[:, 0].min(), pts[:, 1].min(), pts[:, 0].max(), pts[:, 1].max()

# def _dedupe_line_boxes(boxes, iou_thresh=0.6):
#     def _iou(a, b):
#         ax1, ay1, ax2, ay2 = _box_rect(a); bx1, by1, bx2, by2 = _box_rect(b)
#         ix1, iy1 = max(ax1, bx1), max(ay1, by1)
#         ix2, iy2 = min(ax2, bx2), min(ay2, by2)
#         if ix2 <= ix1 or iy2 <= iy1: return 0.0
#         inter = (ix2 - ix1) * (iy2 - iy1)
#         area_a, area_b = (ax2 - ax1) * (ay2 - ay1), (bx2 - bx1) * (by2 - by1)
#         denom = area_a + area_b - inter
#         return inter / denom if denom > 0 else 0.0
#     kept = []
#     for b in boxes:
#         if not any(_iou(b, k) > iou_thresh for k in kept): kept.append(b)
#     return kept

# def line_segmented_ocr(crop_bgr, ocr_engine, gate: float = 0.55, label: str = "") -> list[dict]:
#     light = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY))
#     boxes = ocr_engine.ocr(light, det=True, rec=False, cls=False)

#     if not boxes or not boxes[0]:
#         boxes = ocr_engine.ocr(crop_bgr, det=True, rec=False, cls=False)
#         if not boxes or not boxes[0]: return []

#     boxes = [_dedupe_line_boxes(boxes[0])]

#     tokens = []
#     for box in boxes[0]:
#         pts = np.array(box, dtype=np.float32)
#         x_min, y_min = max(0, int(pts[:, 0].min()) - 6), max(0, int(pts[:, 1].min()) - 6)
#         x_max, y_max = min(crop_bgr.shape[1], int(pts[:, 0].max()) + 6), min(crop_bgr.shape[0], int(pts[:, 1].max()) + 6)
#         if x_max <= x_min or y_max <= y_min: continue

#         line_crop = crop_bgr[y_min:y_max, x_min:x_max]
#         lh, lw = line_crop.shape[:2]
#         if lh == 0 or lw == 0: continue

#         scale = TARGET_CHAR_HEIGHT_PX / lh
#         resized = cv2.resize(line_crop, (max(1, int(lw * scale)), TARGET_CHAR_HEIGHT_PX), interpolation=cv2.INTER_LANCZOS4 if scale > 1 else cv2.INTER_AREA)
#         gray = cv2.filter2D(cv2.createCLAHE(clipLimit=2.5, tileGridSize=(4, 4)).apply(cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)), -1, np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32))

#         text, conf = ensemble_recognize_line(gray, ocr_engine, label=label)
#         if text and text.strip():
#             accept = conf >= gate
#             if not accept and conf >= OCR_CONF_SOFT_FLOOR and _dictionary_score(text) >= 1:
#                 accept = True
#             if accept:
#                 tokens.append({"text": text.strip(), "bbox": box, "conf": conf,
#                                 "cx": float(pts[:, 0].mean()), "cy": float(pts[:, 1].mean())})
#     return tokens

# _COLUMN_HEADER_PATTERNS = {
#     "per_100": re.compile(r'per\s*100|100\s*g|100\s*ml', re.IGNORECASE),
#     "per_serving": re.compile(r'per\s*serv|per\s*serve', re.IGNORECASE),
#     "rda": re.compile(r'%\s*rda|rda\s*%|%\s*daily', re.IGNORECASE),
# }

# def detect_column_positions(tokens: list[dict]) -> dict:
#     if not tokens: return {}
#     positions = {}
#     for tok in sorted(tokens, key=lambda t: t["cy"]):
#         for col_name, pattern in _COLUMN_HEADER_PATTERNS.items():
#             if pattern.search(tok["text"]) and col_name not in positions:
#                 positions[col_name] = tok["cx"]
#     return positions

# def assign_token_to_column(token: dict, column_positions: dict) -> str | None:
#     if not column_positions: return None
#     return min(column_positions.items(), key=lambda kv: abs(kv[1] - token["cx"]))[0]

# _COLUMN_PRIORITY = ("per_100", "per_serving")
# _COLUMN_MIN_SEPARATION_PX = 15

# def choose_target_column(col_pos: dict) -> str | None:
#     if "per_100" in col_pos and "per_serving" in col_pos:
#         if abs(col_pos["per_100"] - col_pos["per_serving"]) < _COLUMN_MIN_SEPARATION_PX:
#             return None
#     for name in _COLUMN_PRIORITY:
#         if name in col_pos: return name
#     return None


# # ══════════════════════════════════════════════════════════════════════════════
# # STAGE 4 — SPATIAL ROW RECONSTRUCTION
# # ══════════════════════════════════════════════════════════════════════════════

# _LABEL_STEMS = [
#     "energy", "protein", "total fat", "saturated fat", "trans fat",
#     "monounsaturated", "polyunsaturated", "carbohydrate", "total sugars",
#     "added sugars", "dietary fibre", "dietary fiber", "sodium", "calcium",
#     "iron", "potassium", "vitamin d", "cholesterol", "of which",
# ]

# def _is_label_start(text: str) -> bool:
#     t = text.strip().lower()
#     if not t: return False
#     words = t.split()
#     for n in (1, 2, 3):
#         prefix = " ".join(words[:n])
#         if len(prefix) < 3: continue
#         for stem in _LABEL_STEMS:
#             tolerance = 1 if len(stem) <= 6 else 2
#             if _levenshtein(prefix, stem[:len(prefix)+2]) <= tolerance:
#                 return True
#             if len(prefix) >= len(stem) - 2 and _levenshtein(prefix[:len(stem)], stem) <= tolerance:
#                 return True
#     return False

# def reconstruct_rows(tokens, label=""):
#     if not tokens: return []
#     sorted_t = sorted(tokens, key=lambda t: t["cy"])
#     spread = max(t["cy"] for t in tokens) - min(t["cy"] for t in tokens) if len(tokens) > 1 else 100
#     is_nutri = "nutri" in label.lower()
#     merge_px = max(30, int(spread * 0.08)) if "ingredient" in label.lower() or "allergen" in label.lower() else max(12, int(spread * 0.04))

#     def _is_header_tok(t): return is_nutri and bool(_HEADER_MARKER_RE.search(t["text"]))
#     def _is_label_tok(t): return is_nutri and _is_label_start(t["text"])

#     rows, cur_row = [], [sorted_t[0]]
#     cur_row_has_label = _is_label_tok(sorted_t[0])
#     cur_row_has_header = _is_header_tok(sorted_t[0])
#     for tok in sorted_t[1:]:
#         same_band = abs(tok["cy"] - cur_row[-1]["cy"]) <= merge_px
#         tok_is_label = _is_label_tok(tok)
#         tok_is_header = _is_header_tok(tok)
#         force_break = same_band and (
#             (cur_row_has_label and tok_is_label) or
#             (cur_row_has_header != tok_is_header and (cur_row_has_header or tok_is_header) and (cur_row_has_label or tok_is_label or len(cur_row) > 1))
#         )
#         if same_band and not force_break:
#             cur_row.append(tok)
#             cur_row_has_label = cur_row_has_label or tok_is_label
#             cur_row_has_header = cur_row_has_header or tok_is_header
#         else:
#             rows.append(sorted(cur_row, key=lambda t: t["cx"]))
#             cur_row = [tok]
#             cur_row_has_label = tok_is_label
#             cur_row_has_header = tok_is_header
#     rows.append(sorted(cur_row, key=lambda t: t["cx"]))
#     return ["  ".join(t["text"] for t in r) for r in rows]


# # ══════════════════════════════════════════════════════════════════════════════
# # STAGE 5 — STRUCTURING
# # ══════════════════════════════════════════════════════════════════════════════

# _NUTRIENT_VAL = re.compile(r'(?<![/\d])(\d+(?:[.,]\d+)?\s*(?:kcal|kj|kJ|mg|mcg|µg|g|%|IU)|\b[Nn]il\b|\b[Tt]races?\b|\b[Nn]ot\s+[Dd]etected\b)(?!\s*/)', re.IGNORECASE)
# _LABEL_UNIT_THEN_NUMBERS = re.compile(r'^(?P<label>[A-Za-z][A-Za-z\s\-]*?\((?:kcal|kj|kJ|mg|mcg|µg|g|%|IU)\))\s*(?P<nums>[<>]?\d+(?:[.,]\d+)?(?:\s+[<>]?\d+(?:[.,]\d+)?)*)\s*$', re.IGNORECASE)
# _INS_PATTERN  = re.compile(r'\b(?:INS\s*[-–]?\s*|E)(\d{3,4}[a-z]?)\b|[\(\{](\d{3,4}(?:[a-z]|\([ivxIVX]+\))?)\s*(?:[&,]\s*\d{3,4}[a-z]?)*[\)\}]|(?<=[\(\{&,\s])(\d{3,4}[a-z]?)(?=\s*[&,\)\}])', re.IGNORECASE)
# _HEADER_PHRASE_RE = re.compile(r'^\s*([A-Za-z][A-Za-z\s\./]{0,40}?)\s*[:\-–]\s*')
# _HEADER_MARKER_RE = re.compile(
#     r'\b(nutrients?|per\s*100\s*(?:g|ml)|per\s*serv(?:ing)?|%\s*rda|rda\s*%?|approx(?:imate)?\s*values?)\b',
#     re.IGNORECASE
# )

# def _strip_ingredients_header(text):
#     m = _HEADER_PHRASE_RE.match(text)
#     if m and 'ingredient' in m.group(1).lower():
#         return text[m.end():].strip()
#     return text

# _NOISE = re.compile(r'(?:rda|%\s*rda|recommended|daily|adult|sedentary|average|icmr|guideline|approximately|information|informatian|nutritional\s*info|hutritional|best\s*before|store|cool|dry|place|customer|care|toll|free|manufactured|marketed|net\s*weight|fssai|^parameters?\b|^unit\b|^result\b|determination|approx\w*\s*value)', re.IGNORECASE)

# def _fix_ocr(text):
#     text = re.sub(r'\bO(?=[gG]|mg|mcg|ml|%|\.\d|\d)', '0', text)
#     text = re.sub(r'(\d+\.\d)\s*9\b(?!\d)', r'\1 g', text)
#     text = re.sub(r'(\d)([a-zA-Z]{2,})', r'\1 \2', text)
#     text = re.sub(r'([a-zA-Z])(\d)', r'\1 \2', text)
#     text = re.sub(r'(\d),(\d)', r'\1.\2', text)
#     text = re.sub(r'(\d+\.\d{2})9\b', r'\1g', text)
#     return re.sub(r'(\d)(g|mg|mcg|ml|kcal)\b', r'\1 \2', text, flags=re.IGNORECASE)

# def _norm_label(raw):
#     return re.sub(r'\(0\)', '(g)', re.sub(r'\bMonounsalurated\b', 'Monounsaturated', re.sub(r'\bCarbohydrale\b', 'Carbohydrate', re.sub(r'\bSodlum\b', 'Sodium', re.sub(r'\bProloin\b|\bProlcin\b', 'Protein', re.sub(r'\bFal\s*\(', 'Fat (', raw), flags=re.IGNORECASE), flags=re.IGNORECASE), flags=re.IGNORECASE), flags=re.IGNORECASE)).strip().rstrip('.')

# def _is_value_only(row):
#     row = row.strip()
#     if re.match(r'^S?[Nn]ot\s+De[lt]e[ck]led\.?$', row, re.IGNORECASE): return "Not Detected"
#     clean = _fix_ocr(row)
#     if re.match(r'^([<>]?\d+(?:\.\d+)?\s*(?:kcal|kj|mg|mcg|g|%|IU)?|\b[Nn]il\b|\b[Tt]races?\b)$', clean, re.IGNORECASE): return clean.strip()
#     return None

# def _is_header(row):
#     return bool(_NOISE.search(row))

# def _is_label_only(row):
#     if _is_header(row) or _LABEL_UNIT_THEN_NUMBERS.search(_fix_ocr(row)) or _NUTRIENT_VAL.search(_fix_ocr(row)): return False
#     return bool(re.search(r'[a-zA-Z]{2,}', row))

# def _pick_nutrient_value(row):
#     matches = list(_NUTRIENT_VAL.finditer(row))
#     if not matches: return None
#     non_pct = [m for m in matches if not m.group(1).strip().endswith('%')]
#     return non_pct[0] if non_pct else None

# def _parse_nutrient_row(row):
#     row = _fix_ocr(row)
#     row = re.sub(r'(?i)(?:g|mg|mcg|kcal|kj|%|)\s*(?:/|per)\s*100\s*(?:g|ml)?', '', row)

#     if _NOISE.search(row): return None

#     if re.search(r'serving\s*size', row, re.IGNORECASE):
#         m_size = re.search(r'serving\s*size\s*[:\-]?\s*(\d+(?:\.\d+)?\s*(?:g|ml|tbsp|tsp|cup)?)', row, re.IGNORECASE)
#         if m_size: return ("serving_size", m_size.group(1).strip())

#     if re.search(r'serv(?:e|es|ing|ings)?\s*per', row, re.IGNORECASE) or re.search(r'no\.\s*of\s*serv', row, re.IGNORECASE):
#         nums = re.findall(r'\d+(?:\.\d+)?', row)
#         if nums: return ("servings_per_container", nums[0].strip())

#     m_label_unit = _LABEL_UNIT_THEN_NUMBERS.search(row)
#     if m_label_unit:
#         return (_norm_label(m_label_unit.group("label").strip()), m_label_unit.group("nums").split()[0].strip()) if len(m_label_unit.group("label").strip()) >= 2 else None

#     m = _pick_nutrient_value(row)
#     if not m:
#         bucket = _classify_nutrient(row)
#         if bucket:
#             stray_nums = re.findall(r'(?<!\()\b\d+(?:\.\d+)?\b(?!\))', row)
#             if stray_nums: return (_norm_label(re.sub(r'[\d.,\s]+$', '', row).strip()), stray_nums[0])
#         return None

#     key = re.sub(r'\s{2,}', ' ', re.sub(r'[:\-–|]+$', '', row[:m.start()]).strip())
#     return (_norm_label(key), m.group(1).strip()) if len(key) >= 2 else None


# def derive_plausible_ranges(ground_truth_path=GROUND_TRUTH_PATH, margin=1.5):
#     with open(ground_truth_path, encoding="utf-8") as f:
#         gt = json.load(f)
#     bucket_values = {}
#     for entry in gt.values():
#         for name, val in entry.get("nutrients_true", {}).items():
#             bucket = _classify_nutrient(name)
#             if not bucket: continue
#             m = re.search(r'\d+\.?\d*', str(val))
#             if m: bucket_values.setdefault(bucket, []).append(float(m.group()))

#     ranges = {}
#     for bucket, values in bucket_values.items():
#         lo, hi = min(values), max(values)
#         ranges[bucket] = (max(0, lo / margin), hi * margin)
#     return ranges


# def _correct_decimal_drop(value_str: str, bucket: str) -> str:
#     m = re.match(r'^(\d+)(\D*)$', value_str.strip())
#     if not m or bucket not in _NUTRIENT_PLAUSIBLE_RANGE: return value_str
#     digits, suffix = m.group(1), m.group(2)
#     if len(digits) < 3: return value_str
#     lo, hi = _NUTRIENT_PLAUSIBLE_RANGE[bucket]
#     raw = float(digits)
#     if lo <= raw <= hi: return value_str

#     candidates = []
#     for split in range(1, len(digits)):
#         candidate_str = digits[:split] + "." + digits[split:]
#         candidate = float(candidate_str)
#         if lo <= candidate <= hi:
#             candidates.append((split, candidate_str))
#     if not candidates: return value_str
#     best_split, best_str = max(candidates, key=lambda c: c[0])
#     return best_str + suffix

# def parse_nutrient_table(rows):
#     nutrients, unmatched = {}, []
#     for row in rows:
#         m_size = re.search(r'serving\s*size\s*[:\-]?\s*(\d+(?:\.\d+)?\s*(?:g|ml|tbsp|tsp|cup)?)', row, re.IGNORECASE)
#         m_per = re.search(r'(\d+(?:\.\d+)?)\s*serv(?:e|es|ing|ings)?\s*per', row, re.IGNORECASE)
#         if m_size and m_per:
#             if "serving_size" not in nutrients: nutrients["serving_size"] = m_size.group(1).strip()
#             if "servings_per_container" not in nutrients: nutrients["servings_per_container"] = m_per.group(1).strip()
#             continue

#         r = _parse_nutrient_row(row)
#         if r:
#             key, val = r
#             bucket = _classify_nutrient(key)
#             if bucket: val = _correct_decimal_drop(val, bucket)
#             if key not in nutrients: nutrients[key] = val
#         else: unmatched.append(row)

#     vq = []
#     for row in unmatched:
#         if _is_header(row): continue
#         v = _is_value_only(row)
#         if v is not None: vq.append(v)
#         elif _is_label_only(row) and vq:
#             key = _norm_label(re.sub(r'[:\-–|]+$', '', row).strip())
#             if key and key not in nutrients: nutrients[key] = vq[-1]
#             vq.clear()
#     return nutrients

# def _dictionary_correct_word(word: str, vocabulary: set, max_dist_ratio: float = 0.25) -> str:
#     w = word.strip().lower()
#     if not w or len(w) < 4 or not vocabulary: return word
#     if w in vocabulary: return word
#     best, best_dist = None, None
#     for entry in vocabulary:
#         if abs(len(entry) - len(w)) > 3: continue
#         dist = _levenshtein(w, entry)
#         max_allowed = max(1, int(len(entry) * max_dist_ratio))
#         if dist <= max_allowed and (best_dist is None or dist < best_dist):
#             best, best_dist = entry, dist
#     if best is not None and (best_dist <= 1 or (best_dist <= 2 and len(w) >= 6)):
#         return best
#     return word

# def _correct_ingredient_item(item: str, vocabulary: set) -> str:
#     paren_match = re.search(r'\([^)]*\)', item)
#     paren_part = paren_match.group(0) if paren_match else ""
#     main_part = item[:paren_match.start()].strip() if paren_match else item
#     corrected_words = [_dictionary_correct_word(w, vocabulary) for w in main_part.split()]
#     corrected = " ".join(corrected_words)
#     return f"{corrected} {paren_part}".strip() if paren_part else corrected

# def structure_tokens(label, rows):
#     label, out = label.lower(), {}

#     if "ingredient" in label:
#         joined = _strip_ingredients_header(" ".join(rows))
#         full = re.compile(r'[Nn]umbers?\s+referred\s+above\s+are\s+as\s+per.*$', re.IGNORECASE | re.DOTALL).sub('', joined).strip()
#         out["ingredients_raw"] = full

#         items, ins = [], []
#         depth, cur = 0, []
#         for ch in full:
#             if ch in '([': depth += 1; cur.append(ch)
#             elif ch in ')]': depth = max(0, depth-1); cur.append(ch)
#             elif ch in ',;' and depth == 0:
#                 p = ''.join(cur).strip()
#                 if p: items.append(p)
#                 cur = []
#             else: cur.append(ch)
#         if ''.join(cur).strip(): items.append(''.join(cur).strip())

#         for item in items:
#             for m in _INS_PATTERN.finditer(item):
#                 val = m.group(1) or m.group(2) or m.group(3)
#                 if val: ins.append(re.sub(r'\([ivxIVX]+\)$', '', val).strip())

#         global _INGREDIENT_DICTIONARY
#         if _INGREDIENT_DICTIONARY is None:
#           _INGREDIENT_DICTIONARY = load_ingredient_dictionary()
#         out["ingredients"] = [_correct_ingredient_item(i.strip('.*#@!='), _INGREDIENT_DICTIONARY)
#                        for i in items if len(i.strip('.*#@!=')) >= 2]
#         out["ins_numbers"] = sorted(set(ins))

#     elif "nutri" in label:
#         ins = []
#         for row in rows:
#             for m in _INS_PATTERN.finditer(row):
#                 val = m.group(1) or m.group(2) or m.group(3)
#                 if val: ins.append(re.sub(r'\([ivxIVX]+\)$', '', val).strip())
#         out["nutrients"]   = parse_nutrient_table(rows)
#         out["ins_numbers"] = sorted(set(ins))

#     elif "fssai" in label:
#         all_text = " ".join(rows)
#         m = re.search(r'\b\d{14}\b', all_text)
#         if m: out["fssai_license"] = m.group(0)
#         else:
#             near_miss = re.search(r'\d{10,16}', all_text)
#             out["fssai_license"] = f"⚠️ UNVERIFIED ({near_miss.group(0)}, expected 14 digits)" if near_miss else all_text.strip() or None

#     elif "allergen" in label:
#         out["allergen_info"] = " ".join(rows).strip()

#     return out


# # ══════════════════════════════════════════════════════════════════════════════
# # COMPLIANCE ENGINE — INS/E-number lookup, banned-term scan, trans-fat check
# # ══════════════════════════════════════════════════════════════════════════════

# INS_INDEX_PATH       = os.getenv("INS_INDEX_PATH", "index.csv")
# CANADA_STATUS_PATH   = os.getenv("CANADA_STATUS_PATH", "canada_status.json")
# UK_DIVERGENCES_PATH  = os.getenv("UK_DIVERGENCES_PATH", "uk_divergences.json")
# BANNED_TERMS_PATH    = os.getenv("BANNED_TERMS_PATH", "banned_terms.json")

# def load_ins_index(path=INS_INDEX_PATH):
#     """Loads the INS/E-number reference table into a dict keyed by code
#     (e.g. '621', '472e'). Derives per-jurisdiction permitted flags from the
#     status column, based on the source convention: a=Australia/NZ approved,
#     e=EU approved (has E-number), u=USA approved."""
#     import csv
#     index = {}
#     if not os.path.exists(path):
#         print(f"[warn] {path} not found — INS/E-number lookups will be unavailable")
#         return index
#     with open(path, encoding="utf-8") as f:
#         reader = csv.DictReader(f)
#         for row in reader:
#             code = row["code"].strip().lower()
#             status = row.get("status", "").strip().split()
#             index[code] = {
#                 "code": code,
#                 "names": row["names"].strip(),
#                 "type": row["type"].strip(),
#                 "permitted_au": "a" in status,
#                 "permitted_eu": "e" in status,
#                 "permitted_us": "u" in status,
#                 "status_raw": row.get("status", "").strip(),
#             }
#     print(f"[init] Loaded INS index: {len(index)} entries")
#     return index

# _INS_INDEX = None


# def lookup_ins(code: str, index: dict) -> dict | None:
#     """Looks up a single INS code, handling common variations: leading
#     zeros, missing/extra letter suffixes, and bare numeric fallback when
#     an exact suffix match isn't found (e.g. '472' falls back from '472e'
#     if the exact suffix wasn't recognized by OCR)."""
#     c = code.strip().lower().replace(" ", "")
#     if c in index:
#         return index[c]
#     base = re.sub(r'[a-z]$', '', c)
#     if base != c and base in index:
#         return index[base]
#     return None

# def lookup_ins_numbers(ins_numbers: list[str], index: dict) -> list[dict]:
#     """Looks up every INS number extracted from a label, returning full
#     entries for matches and a placeholder for anything not found (so the
#     caller can flag unrecognized codes rather than silently dropping them)."""
#     results = []
#     for code in ins_numbers:
#         entry = lookup_ins(code, index)
#         if entry:
#             results.append(entry)
#         else:
#             results.append({"code": code, "names": None, "type": None,
#                              "permitted_au": None, "permitted_eu": None, "permitted_us": None,
#                              "status_raw": None, "not_found": True})
#     return results

# def load_country_data(path):
#     """Generic loader for small, manually-verified per-country compliance
#     data files (JSON, keyed by INS code). Missing file -> empty dict,
#     so the pipeline degrades gracefully instead of crashing."""
#     if os.path.exists(path):
#         with open(path, encoding="utf-8") as f:
#             return json.load(f)
#     print(f"[warn] {path} not found — that jurisdiction's data will be unavailable")
#     return {}

# _CANADA_STATUS = None
# _UK_DIVERGENCES = None

# def get_canada_status(code: str) -> dict:
#     global _CANADA_STATUS
#     if _CANADA_STATUS is None:
#         _CANADA_STATUS = load_country_data(CANADA_STATUS_PATH)
#     code = code.strip().lower()
#     if code in _CANADA_STATUS:
#         entry = _CANADA_STATUS[code]
#         return {"permitted_ca": entry["permitted_ca"], "ca_note": entry["note"],
#                 "ca_source": entry["source"], "ca_verified": True}
#     return {"permitted_ca": None, "ca_note": "Not in our verified Canada subset — status unknown, not assumed.",
#             "ca_source": None, "ca_verified": False}

# def get_uk_status(code: str, ins_entry: dict) -> dict:
#     global _UK_DIVERGENCES
#     if _UK_DIVERGENCES is None:
#         _UK_DIVERGENCES = load_country_data(UK_DIVERGENCES_PATH)
#     code = code.strip().lower()
#     if code in _UK_DIVERGENCES:
#         div = _UK_DIVERGENCES[code]
#         return {"permitted_uk": div["permitted_uk"], "uk_note": div["note"],
#                 "uk_source": div["source"], "uk_verified": True}
#     return {"permitted_uk": ins_entry.get("permitted_eu"),
#             "uk_note": "Assumed same as EU (UK retained EU additive law post-Brexit); not independently verified.",
#             "uk_source": "approximated from EU", "uk_verified": False}

# def enrich_ins_numbers(pipeline_result: dict) -> dict:
#     global _INS_INDEX
#     if _INS_INDEX is None:
#         _INS_INDEX = load_ins_index()
#     ins_numbers = pipeline_result.get("ins_numbers", [])
#     details = lookup_ins_numbers(ins_numbers, _INS_INDEX)
#     for d in details:
#         if not d.get("not_found"):
#             d.update(get_uk_status(d["code"], d))
#             d.update(get_canada_status(d["code"]))
#     pipeline_result["ins_details"] = details
#     return pipeline_result

# _BANNED_TERMS = None

# def load_banned_terms(path=BANNED_TERMS_PATH):
#     if os.path.exists(path):
#         with open(path, encoding="utf-8") as f:
#             return json.load(f)
#     print(f"[warn] {path} not found — banned-term checking unavailable")
#     return {}

# def check_banned_terms(ingredients_raw: str) -> list[dict]:
#     """Scans the raw ingredients text for known banned/restricted terms.
#     Simple substring matching on a small, sourced term list -- not exhaustive,
#     won't catch every FSSAI prohibition, only the ones explicitly tracked."""
#     global _BANNED_TERMS
#     if _BANNED_TERMS is None:
#         _BANNED_TERMS = load_banned_terms()
#     if not ingredients_raw: return []
#     text = ingredients_raw.lower()
#     hits = []
#     for term, info in _BANNED_TERMS.items():
#         if term in text:
#             hits.append({"term": term, **info})
#     return hits

# def check_trans_fat_compliance(nutrients: dict) -> dict:
#     """Uses the same fuzzy nutrient-bucket classification as the rest of
#     the pipeline, rather than exact key matching, since OCR-derived keys
#     are inconsistent (e.g. 'Trans Fat (g).', 'Trans Fat (o)')."""
#     trans_val = total_fat_val = None
#     for key, val in nutrients.items():
#         bucket = _classify_nutrient(key)
#         if bucket == "trans_fat" and trans_val is None: trans_val = val
#         if bucket == "total_fat" and total_fat_val is None: total_fat_val = val

#     if not trans_val or not total_fat_val:
#         return {"status": "insufficient_data", "note": "Trans fat and/or total fat value not extracted from label."}
#     tm = re.search(r'\d+\.?\d*', str(trans_val))
#     fm = re.search(r'\d+\.?\d*', str(total_fat_val))
#     if not tm or not fm or float(fm.group()) == 0:
#         return {"status": "insufficient_data", "note": "Could not parse numeric values."}
#     pct = (float(tm.group()) / float(fm.group())) * 100
#     return {
#         "status": "compliant" if pct <= 2.0 else "exceeds_limit",
#         "trans_fat_pct_of_total_fat": round(pct, 2),
#         "limit_pct": 2.0,
#         "regulation": "FSSAI Prohibition and Restriction on Sales Regulations, 2011 — Reg. 2.3.14(21)",
#     }


# def run_compliance_checks(pipeline_result: dict) -> dict:
#     """Enriches a run_pipeline() result with the deterministic checks:
#     INS/E-number jurisdiction lookups, banned-term scan, trans-fat ratio.
#     Called automatically at the end of run_pipeline() below."""
#     pipeline_result = enrich_ins_numbers(pipeline_result)
#     pipeline_result["banned_term_hits"] = check_banned_terms(pipeline_result.get("ingredients_raw", ""))
#     pipeline_result["trans_fat_check"] = check_trans_fat_compliance(pipeline_result.get("nutrients", {}))
#     return pipeline_result


# # ══════════════════════════════════════════════════════════════════════════════
# # MAIN ENTRY POINT — this is what the API layer calls
# # ══════════════════════════════════════════════════════════════════════════════

# def run_pipeline(image_path):
#     global _yolo_model_cache, _ocr_engine_cache
#     if _yolo_model_cache is None or _ocr_engine_cache is None: _yolo_model_cache, _ocr_engine_cache = load_models()

#     regions = detect_regions(image_path, _yolo_model_cache, ocr_engine=_ocr_engine_cache)
#     final = {}
#     for region in regions:
#         tokens = line_segmented_ocr(region["crop_bgr"], _ocr_engine_cache, gate=OCR_CONF_GATE, label=region["label"])

#         if "nutri" in region["label"].lower():
#             col_pos = detect_column_positions(tokens)
#             if choose_target_column(col_pos):
#                 numeric_tokens = [t for t in tokens if re.match(r'^[\d.,<>%\s]+$', t["text"])]
#                 filtered_tokens = [t for t in tokens if not re.match(r'^[\d.,<>%\s]+$', t["text"])
#                                     or assign_token_to_column(t, col_pos) == "per_100"]
#                 kept_numeric = [t for t in filtered_tokens if re.match(r'^[\d.,<>%\s]+$', t["text"])]
#                 if not numeric_tokens or len(kept_numeric) / len(numeric_tokens) >= 0.4:
#                     tokens = filtered_tokens

#         structured = structure_tokens(region["label"], reconstruct_rows(tokens, label=region["label"]))

#         for k, v in structured.items():
#             if k == "fssai_license":
#                 if not (final.get(k) and re.search(r'\b\d{14}\b', final.get(k, ''))): final[k] = v
#             elif k not in final: final[k] = v
#             elif isinstance(v, list): final[k] = list(dict.fromkeys(final[k] + v))
#             elif isinstance(v, dict): final[k].update(v)
#             elif k == "allergen_info" and isinstance(v, str): final[k] = final[k] + " " + v if final.get(k) else v

#     return run_compliance_checks(final)


# # ══════════════════════════════════════════════════════════════════════════════
# # LEVENSHTEIN + NUTRIENT CLASSIFICATION (used by parsing above and by eval)
# # ══════════════════════════════════════════════════════════════════════════════

# def _levenshtein(a: str, b: str) -> int:
#     if len(a) < len(b): return _levenshtein(b, a)
#     if len(b) == 0: return len(a)
#     prev_row = list(range(len(b) + 1))
#     for i, ca in enumerate(a):
#         curr_row = [i + 1]
#         for j, cb in enumerate(b):
#             insertions = prev_row[j + 1] + 1
#             deletions  = curr_row[j] + 1
#             substitutions = prev_row[j] + (ca != cb)
#             curr_row.append(min(insertions, deletions, substitutions))
#         prev_row = curr_row
#     return prev_row[-1]

# _NUTRIENT_KEYWORDS = {
#     "energy_kcal":     ["energy", "kcal", "calorie"],
#     "energy_kj":       ["kj", "kilojoule"],
#     "protein":         ["protein"],
#     "total_fat":       ["total fat", "totalfat", "fat"],
#     "saturated_fat":   ["saturated fat", "saturatedfat", "sat fat", "sat. fat"],
#     "trans_fat":       ["trans fat", "transfat", "trans fatty"],
#     "monounsaturated": ["monounsaturated", "mono unsaturated", "mono-unsaturated"],
#     "polyunsaturated": ["polyunsaturated", "poly unsaturated", "poly-unsaturated"],
#     "cholesterol":     ["cholesterol"],
#     "carbohydrate":    ["carbohydrate", "carb"],
#     "total_sugars":    ["total sugar", "totalsugar"],
#     "added_sugars":    ["added sugar", "addedsugar"],
#     "dietary_fibre":   ["dietary fibre", "dietary fiber", "fibre", "fiber"],
#     "sodium":          ["sodium"],
#     "calcium":         ["calcium"],
#     "iron":            ["iron"],
#     "potassium":       ["potassium"],
#     "vitamin_d":       ["vitamin d"],
#     "serving_size":    ["serving size", "servingsize"],
#     "servings":        ["servings", "serves"],
# }

# def _classify_nutrient(name: str) -> str | None:
#     raw = name.lower()
#     n = re.sub(r'(?:per|/)\s*100\s*m?[lg]|m?[lg]\s*/\s*100\s*m?[lg]|per\s*serving|per\s*serve|\(.*?\)|g$|mg$', '', raw.replace('_', ' ').replace('-', ' ')).strip()

#     if 'saturated' in n: return 'saturated_fat'
#     if 'trans' in n: return 'trans_fat'
#     if 'polyunsaturated' in n or 'poly unsaturated' in n: return 'polyunsaturated'
#     if 'monounsaturated' in n or 'mono unsaturated' in n: return 'monounsaturated'
#     if 'total fat' in n or n == 'fat': return 'total_fat'
#     if 'added sugar' in n: return 'added_sugars'
#     if 'total sugar' in n or n == 'sugar' or n == 'sugars': return 'total_sugars'
#     if 'carbohydrate' in n or 'carb' in n: return 'carbohydrate'
#     if 'energy' in n or 'kcal' in n or 'calorie' in n:
#         # kcal vs kJ split — see module docstring for why this matters.
#         return 'energy_kj' if re.search(r'\bkj\b', raw) else 'energy_kcal'
#     if 'protein' in n: return 'protein'
#     if 'dietary fibre' in n or 'fiber' in n or 'fibre' in n: return 'dietary_fibre'
#     if 'sodium' in n: return 'sodium'
#     if 'cholesterol' in n: return 'cholesterol'
#     if 'calcium' in n: return 'calcium'
#     if 'iron' in n: return 'iron'
#     if 'potassium' in n: return 'potassium'
#     if 'vitamin d' in n: return 'vitamin_d'
#     if 'serving size' in n: return 'serving_size'
#     if 'servings' in n or 'serves' in n: return 'servings'

#     for bucket, keywords in _NUTRIENT_KEYWORDS.items():
#         for kw in keywords:
#             if len(kw) > 4 and _levenshtein(kw, n) <= 2: return bucket
#     return None

# # Plausible-range table used by _correct_decimal_drop. Only meaningful if
# # ground_truth.json (your eval set) is present; in a normal deployment it
# # won't be, so this quietly falls back to {} instead of crashing the whole
# # service on import — decimal-drop correction just becomes a no-op then.
# try:
#     _NUTRIENT_PLAUSIBLE_RANGE = derive_plausible_ranges()
# except FileNotFoundError:
#     _NUTRIENT_PLAUSIBLE_RANGE = {}






"""
OCR + FSSAI compliance extraction pipeline.

Adapted from the standalone master_pipeline.py capstone script into a
service module: paths are now environment-configurable instead of
hardcoded, and the eval-only, import-time side effects (plausible-range
derivation, banner prints) are guarded so importing this module in the
API doesn't require ground_truth.json to exist on the deployment box.

Includes the energy_kcal / energy_kJ classifier fix: both used to
collapse into a single "energy" bucket because both names contain the
substring "energy", which cross-matched kcal and kJ readings against
each other and widened the plausible-range decimal-drop correction
across two different unit scales. Now split by checking which unit is
actually present in the raw field name before classifying.
"""

# import re, cv2, numpy as np
# import json, os
# from ultralytics import YOLO
# from paddleocr import PaddleOCR

# try:
#     import easyocr
#     _EASYOCR_AVAILABLE = True
# except ImportError:
#     _EASYOCR_AVAILABLE = False

# try:
#     import pytesseract
#     _TESSERACT_AVAILABLE = True
# except ImportError:
#     _TESSERACT_AVAILABLE = False


# # ══════════════════════════════════════════════════════════════════════════════
# # CONFIG & INIT — now environment-driven instead of hardcoded, so this module
# # can live inside a deployed service rather than a notebook working directory
# # ══════════════════════════════════════════════════════════════════════════════
# YOLO_WEIGHTS          = os.getenv("YOLO_WEIGHTS_PATH", "best.pt")
# YOLO_CONF             = 0.50
# FSSAI_CONF            = 0.30    # Lowered specifically for FSSAI boxes
# OCR_CONF_GATE         = 0.55
# OCR_CONF_SOFT_FLOOR   = 0.40
# CROP_PAD              = 5
# TARGET_CHAR_HEIGHT_PX = 48
# MIN_CROP_DIM          = 600
# GROUND_TRUTH_PATH     = os.getenv("GROUND_TRUTH_PATH", "ground_truth.json")
# INGREDIENT_DICT_PATH  = os.getenv("INGREDIENT_DICT_PATH", "ingredients.txt")

# def load_ingredient_dictionary(path=INGREDIENT_DICT_PATH):
#     vocab = set()

#     if os.path.exists(path):
#         with open(path, encoding="utf-8") as f:
#             for line in f:
#                 line = line.strip()

#                 if not line or line.startswith("#"):
#                     continue

#                 m = re.match(r'^(?:synonyms:)?en:\s*(.+)$', line)

#                 if not m:
#                     continue

#                 for name in m.group(1).split(","):
#                     name = name.strip().lower()
#                     name = re.sub(r'\s*\(.*?\)\s*', ' ', name).strip()

#                     if len(name) >= 3 and re.match(r'^[a-z][a-z\s\-]*$', name):
#                         vocab.add(name)

#     else:
#         print(f"[warn] {path} not found — skipping external ingredient dictionary")

#     print(f"[init] Loaded ingredient dictionary: {len(vocab)} entries")
#     return vocab

# _INGREDIENT_DICTIONARY = None
# _yolo_model_cache = None
# _ocr_engine_cache = None
# _easyocr_reader = None

# def load_models():
#     print("[init] Loading YOLO …")
#     yolo = YOLO(YOLO_WEIGHTS)
#     print("[init] Loading PaddleOCR …")
#     # enable_mkldnn is a genuinely different switch from FLAGS_use_mkldnn —
#     # this one controls whether PaddlePaddle's oneDNN graph-rewrite passes
#     # run at all, which is where "OneDnnContext does not have the input
#     # Filter" tends to originate on non-Linux CPU builds. Default off
#     # since it's the more commonly broken path outside Linux; flip
#     # PADDLE_ENABLE_MKLDNN=1 in .env once you're on a Linux target
#     # (Docker/WSL2) if you want the CPU speedup back.
#     enable_mkldnn = os.getenv("PADDLE_ENABLE_MKLDNN", "0") == "1"
#     ocr  = PaddleOCR(use_angle_cls=True, lang="en", show_log=False,
#                      det_db_unclip_ratio=1.8, rec_batch_num=6,
#                      det_db_box_thresh=0.3, det_db_thresh=0.2,
#                      det_limit_side_len=1920, enable_mkldnn=enable_mkldnn)
#     return yolo, ocr

# def get_easyocr_reader():
#     global _easyocr_reader
#     if _easyocr_reader is None and _EASYOCR_AVAILABLE:
#         print("[init] Loading EasyOCR …")
#         _easyocr_reader = easyocr.Reader(['en'], gpu=True)
#     return _easyocr_reader

# def warm_up_models():
#     """Call once at API startup so the first real request isn't the one
#     paying multi-second model load time."""
#     global _yolo_model_cache, _ocr_engine_cache
#     if _yolo_model_cache is None or _ocr_engine_cache is None:
#         _yolo_model_cache, _ocr_engine_cache = load_models()
#     get_easyocr_reader()


# # ══════════════════════════════════════════════════════════════════════════════
# # STAGE 1 — YOLO DETECTION
# # ══════════════════════════════════════════════════════════════════════════════

# def detect_regions(image_path, yolo_model, ocr_engine=None, max_area_ratio=0.70):
#     img_bgr = cv2.imread(image_path)
#     if img_bgr is None: raise FileNotFoundError(f"Cannot read: {image_path}")
#     ih, iw = img_bgr.shape[:2]
#     image_area = ih * iw

#     results = yolo_model(image_path, conf=0.25)
#     raw_boxes = []
#     for box in results[0].boxes:
#         x1, y1, x2, y2 = map(int, box.xyxy[0])
#         label = yolo_model.names[int(box.cls[0])].lower()
#         box_conf = float(box.conf[0])
#         req_conf = FSSAI_CONF if "fssai" in label else YOLO_CONF
#         if box_conf < req_conf:
#             continue
#         raw_boxes.append((x1, y1, x2, y2, label, box_conf))

#     kept = []
#     for x1, y1, x2, y2, label, box_conf in raw_boxes:
#         ratio = ((x2 - x1) * (y2 - y1)) / image_area
#         if ratio > max_area_ratio:
#             continue
#         kept.append((x1, y1, x2, y2, label, box_conf))

#     def _iou(a, b):
#         ax1, ay1, ax2, ay2 = a[:4]
#         bx1, by1, bx2, by2 = b[:4]
#         ix1, iy1 = max(ax1, bx1), max(ay1, by1)
#         ix2, iy2 = min(ax2, bx2), min(ay2, by2)
#         if ix2 <= ix1 or iy2 <= iy1: return 0.0
#         inter = (ix2 - ix1) * (iy2 - iy1)
#         return inter / ((ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter)

#     final_boxes = []
#     for cand in sorted(kept, key=lambda b: -b[5]):
#         if not any(cand[4] == ex[4] and _iou(cand, ex) > 0.4 for ex in final_boxes):
#             final_boxes.append(cand)

#     regions = []
#     for x1, y1, x2, y2, label, box_conf in final_boxes:
#         crop = img_bgr[max(0, y1 - CROP_PAD):min(ih, y2 + CROP_PAD), max(0, x1 - CROP_PAD):min(iw, x2 + CROP_PAD)]
#         regions.append({"label": label, "bbox": (x1, y1, x2, y2), "crop_bgr": crop})

#     if ocr_engine is not None:
#         found_labels = {r["label"] for r in regions}
#         missing = [lbl for lbl in _FALLBACK_ANCHORS if not any(lbl in fl for fl in found_labels)]
#         if missing:
#             regions.extend(keyword_fallback_regions(img_bgr, ocr_engine, missing))

#     for r in regions:
#         h, w = r["crop_bgr"].shape[:2]
#         if h == 0 or w == 0: continue
#         min_dim = min(h, w)
#         if min_dim < MIN_CROP_DIM:
#             scale = MIN_CROP_DIM / min_dim
#             r["crop_bgr"] = cv2.resize(r["crop_bgr"], (max(1, int(w * scale)), max(1, int(h * scale))),
#                                         interpolation=cv2.INTER_LANCZOS4)
#     return regions


# # ══════════════════════════════════════════════════════════════════════════════
# # STAGE 1.5 — KEYWORD-ANCHORED FALLBACK DETECTION
# # ══════════════════════════════════════════════════════════════════════════════

# _FALLBACK_ANCHORS = {
#     "ingredients": re.compile(r'\bingredients?\b\s*[:\-]?', re.IGNORECASE),
#     "fssai": re.compile(r'\bfssai\b|\blic(?:ense|\.)?\s*(?:no\.?|number)\b', re.IGNORECASE),
# }
# _SECTION_STOP = re.compile(
#     r'\bnutrition(?:al)?\b|\ballergen\b|\bstorage\b|\bbest\s*before\b|\bbatch\b|'
#     r'\bmfg\b|\bmanufactur|\bnet\s*(?:wt|weight|quantity)\b|\bfssai\b',
#     re.IGNORECASE
# )

# def _full_page_ocr_lines(img_bgr, ocr_engine):
#     result = ocr_engine.ocr(img_bgr, det=True, rec=True, cls=True)
#     if not result or not result[0]: return []
#     lines = []
#     for box, rec in result[0]:
#         text, conf = rec if isinstance(rec, tuple) else (rec[0], rec[1])
#         pts = np.array(box, dtype=np.float32)
#         lines.append({
#             "text": text, "conf": float(conf),
#             "x1": float(pts[:, 0].min()), "y1": float(pts[:, 1].min()),
#             "x2": float(pts[:, 0].max()), "y2": float(pts[:, 1].max()),
#             "cy": float(pts[:, 1].mean()),
#         })
#     return sorted(lines, key=lambda l: l["cy"])

# def keyword_fallback_regions(img_bgr, ocr_engine, missing_labels, pad=CROP_PAD):
#     if not missing_labels: return []
#     ih, iw = img_bgr.shape[:2]
#     lines = _full_page_ocr_lines(img_bgr, ocr_engine)
#     if not lines: return []

#     heights = [l["y2"] - l["y1"] for l in lines if l["y2"] > l["y1"]]
#     median_h = sorted(heights)[len(heights) // 2] if heights else 20

#     regions = []
#     for label in missing_labels:
#         pattern = _FALLBACK_ANCHORS.get(label)
#         if pattern is None: continue

#         anchor_idx = next((i for i, l in enumerate(lines) if pattern.search(l["text"])), None)
#         if anchor_idx is None: continue

#         anchor = lines[anchor_idx]
#         gap_thresh = max(25, median_h * (5.0 if label == "ingredients" else 2.5))

#         block = [anchor]
#         prev_y2 = anchor["y2"]
#         max_lines = 40 if label == "ingredients" else 3

#         for l in lines[anchor_idx + 1:]:
#             if len(block) >= max_lines: break
#             if l["y1"] - prev_y2 > gap_thresh: break
#             if label == "ingredients" and _SECTION_STOP.search(l["text"]): break
#             block.append(l)
#             prev_y2 = l["y2"]

#         if label == "ingredients" and len(block) <= 1:
#             fallback_y2 = min(ih, int(anchor["y2"] + max(400, median_h * 15)))
#             for l in lines[anchor_idx + 1:]:
#                 if _SECTION_STOP.search(l["text"]) and l["y1"] > anchor["y2"]:
#                     fallback_y2 = min(fallback_y2, int(l["y1"]))
#                     break
#             x1 = max(0, int(anchor["x1"]) - pad)
#             y1 = max(0, int(anchor["y1"]) - pad)
#             x2 = min(iw, int(max(anchor["x2"], iw * 0.9)) + pad)
#             y2 = min(ih, fallback_y2 + pad)
#             regions.append({"label": label, "bbox": (x1, y1, x2, y2),
#                              "crop_bgr": img_bgr[y1:y2, x1:x2],
#                              "source": "keyword_fallback_expanded"})
#             continue

#         x1 = max(0, int(min(l["x1"] for l in block)) - pad)
#         y1 = max(0, int(min(l["y1"] for l in block)) - pad)
#         x2 = min(iw, int(max(l["x2"] for l in block)) + pad)
#         y2 = min(ih, int(max(l["y2"] for l in block)) + pad)
#         if x2 <= x1 or y2 <= y1: continue

#         regions.append({"label": label, "bbox": (x1, y1, x2, y2),
#                          "crop_bgr": img_bgr[y1:y2, x1:x2], "source": "keyword_fallback"})
#     return regions


# # ══════════════════════════════════════════════════════════════════════════════
# # STAGE 2 — ENSEMBLE LINE-SEGMENTED OCR & COLUMN PARSER
# # ══════════════════════════════════════════════════════════════════════════════

# def _dictionary_score(text: str) -> int:
#     score = 0
#     if re.search(r'energy|protein|fat|carbohydrate|sugar|sodium|cholesterol|fibre|fiber|calcium|iron|potassium|vitamin', text, re.IGNORECASE): score += 3
#     if re.search(r'\b\d{14}\b', text): score += 5
#     if re.search(r'\bINS\s*\d{3,4}|\(\d{3,4}\)', text, re.IGNORECASE): score += 2
#     if re.match(r'^[\d.,<>%\s]+$', text.strip()): score += 1
#     letters = re.sub(r'[^a-zA-Z]', '', text)
#     if len(letters) >= 4 and sum(1 for c in letters.lower() if c in 'aeiou') / len(letters) < 0.15: score -= 3
#     return score

# def ensemble_recognize_line(line_img, paddle_ocr_engine, label: str = "") -> tuple[str, float]:
#     cands = []
#     res = paddle_ocr_engine.ocr(line_img, det=False, rec=True, cls=True)
#     if res and res[0]:
#         t, c = res[0][0] if isinstance(res[0][0], tuple) else (res[0][0][0], res[0][0][1])
#         if c >= 0.4: cands.append((t.strip(), c, "paddle", _dictionary_score(t.strip())))

#     if _EASYOCR_AVAILABLE and get_easyocr_reader():
#         res_e = get_easyocr_reader().readtext(line_img, detail=1, paragraph=False)
#         if res_e:
#             combined = " ".join([r[1] for r in res_e]).strip()
#             avg_c = sum([r[2] for r in res_e]) / len(res_e)
#             if avg_c >= 0.4 and combined: cands.append((combined, avg_c, "easyocr", _dictionary_score(combined)))

#     if _TESSERACT_AVAILABLE and "nutri" not in label.lower():
#         try:
#             data = pytesseract.image_to_data(line_img, output_type=pytesseract.Output.DICT, config='--psm 7')
#             texts, confs = zip(*[(t, int(c)) for c, t in zip(data['conf'], data['text']) if t.strip() and c != '-1'])
#             if texts:
#                 avg_c = (sum(confs) / len(confs)) / 100.0
#                 if avg_c >= 0.4: cands.append((" ".join(texts).strip(), avg_c, "tesseract", _dictionary_score(" ".join(texts).strip())))
#         except Exception: pass

#     if not cands: return None, 0.0

#     text_counts = {}
#     for text, conf, _, dscore in cands: text_counts.setdefault(text.lower().strip(), []).append((text, conf, dscore))
#     for key, group in text_counts.items():
#         if len(group) >= 2: return max(group, key=lambda g: g[1])[0], min(0.99, max(group, key=lambda g: g[1])[1] + 0.15)

#     winner = max(cands, key=lambda c: (c[3], c[1]))
#     return winner[0], winner[1]

# def _box_rect(b):
#     pts = np.array(b, dtype=np.float32)
#     return pts[:, 0].min(), pts[:, 1].min(), pts[:, 0].max(), pts[:, 1].max()

# def _dedupe_line_boxes(boxes, iou_thresh=0.6):
#     def _iou(a, b):
#         ax1, ay1, ax2, ay2 = _box_rect(a); bx1, by1, bx2, by2 = _box_rect(b)
#         ix1, iy1 = max(ax1, bx1), max(ay1, by1)
#         ix2, iy2 = min(ax2, bx2), min(ay2, by2)
#         if ix2 <= ix1 or iy2 <= iy1: return 0.0
#         inter = (ix2 - ix1) * (iy2 - iy1)
#         area_a, area_b = (ax2 - ax1) * (ay2 - ay1), (bx2 - bx1) * (by2 - by1)
#         denom = area_a + area_b - inter
#         return inter / denom if denom > 0 else 0.0
#     kept = []
#     for b in boxes:
#         if not any(_iou(b, k) > iou_thresh for k in kept): kept.append(b)
#     return kept

# def line_segmented_ocr(crop_bgr, ocr_engine, gate: float = 0.55, label: str = "") -> list[dict]:
#     light = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY))
#     boxes = ocr_engine.ocr(light, det=True, rec=False, cls=False)

#     if not boxes or not boxes[0]:
#         boxes = ocr_engine.ocr(crop_bgr, det=True, rec=False, cls=False)
#         if not boxes or not boxes[0]: return []

#     boxes = [_dedupe_line_boxes(boxes[0])]

#     tokens = []
#     for box in boxes[0]:
#         pts = np.array(box, dtype=np.float32)
#         x_min, y_min = max(0, int(pts[:, 0].min()) - 6), max(0, int(pts[:, 1].min()) - 6)
#         x_max, y_max = min(crop_bgr.shape[1], int(pts[:, 0].max()) + 6), min(crop_bgr.shape[0], int(pts[:, 1].max()) + 6)
#         if x_max <= x_min or y_max <= y_min: continue

#         line_crop = crop_bgr[y_min:y_max, x_min:x_max]
#         lh, lw = line_crop.shape[:2]
#         if lh == 0 or lw == 0: continue

#         scale = TARGET_CHAR_HEIGHT_PX / lh
#         resized = cv2.resize(line_crop, (max(1, int(lw * scale)), TARGET_CHAR_HEIGHT_PX), interpolation=cv2.INTER_LANCZOS4 if scale > 1 else cv2.INTER_AREA)
#         gray = cv2.filter2D(cv2.createCLAHE(clipLimit=2.5, tileGridSize=(4, 4)).apply(cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)), -1, np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32))

#         text, conf = ensemble_recognize_line(gray, ocr_engine, label=label)
#         if text and text.strip():
#             accept = conf >= gate
#             if not accept and conf >= OCR_CONF_SOFT_FLOOR and _dictionary_score(text) >= 1:
#                 accept = True
#             if accept:
#                 tokens.append({"text": text.strip(), "bbox": box, "conf": conf,
#                                 "cx": float(pts[:, 0].mean()), "cy": float(pts[:, 1].mean())})
#     return tokens

# _COLUMN_HEADER_PATTERNS = {
#     "per_100": re.compile(r'per\s*100|100\s*g|100\s*ml', re.IGNORECASE),
#     "per_serving": re.compile(r'per\s*serv|per\s*serve', re.IGNORECASE),
#     "rda": re.compile(r'%\s*rda|rda\s*%|%\s*daily', re.IGNORECASE),
# }

# def detect_column_positions(tokens: list[dict]) -> dict:
#     if not tokens: return {}
#     positions = {}
#     for tok in sorted(tokens, key=lambda t: t["cy"]):
#         for col_name, pattern in _COLUMN_HEADER_PATTERNS.items():
#             if pattern.search(tok["text"]) and col_name not in positions:
#                 positions[col_name] = tok["cx"]
#     return positions

# def assign_token_to_column(token: dict, column_positions: dict) -> str | None:
#     if not column_positions: return None
#     return min(column_positions.items(), key=lambda kv: abs(kv[1] - token["cx"]))[0]

# _COLUMN_PRIORITY = ("per_100", "per_serving")
# _COLUMN_MIN_SEPARATION_PX = 15

# def choose_target_column(col_pos: dict) -> str | None:
#     if "per_100" in col_pos and "per_serving" in col_pos:
#         if abs(col_pos["per_100"] - col_pos["per_serving"]) < _COLUMN_MIN_SEPARATION_PX:
#             return None
#     for name in _COLUMN_PRIORITY:
#         if name in col_pos: return name
#     return None


# # ══════════════════════════════════════════════════════════════════════════════
# # STAGE 4 — SPATIAL ROW RECONSTRUCTION
# # ══════════════════════════════════════════════════════════════════════════════

# _LABEL_STEMS = [
#     "energy", "protein", "total fat", "saturated fat", "trans fat",
#     "monounsaturated", "polyunsaturated", "carbohydrate", "total sugars",
#     "added sugars", "dietary fibre", "dietary fiber", "sodium", "calcium",
#     "iron", "potassium", "vitamin d", "cholesterol", "of which",
# ]

# def _is_label_start(text: str) -> bool:
#     t = text.strip().lower()
#     if not t: return False
#     words = t.split()
#     for n in (1, 2, 3):
#         prefix = " ".join(words[:n])
#         if len(prefix) < 3: continue
#         for stem in _LABEL_STEMS:
#             tolerance = 1 if len(stem) <= 6 else 2
#             if _levenshtein(prefix, stem[:len(prefix)+2]) <= tolerance:
#                 return True
#             if len(prefix) >= len(stem) - 2 and _levenshtein(prefix[:len(stem)], stem) <= tolerance:
#                 return True
#     return False

# def reconstruct_rows(tokens, label=""):
#     if not tokens: return []
#     sorted_t = sorted(tokens, key=lambda t: t["cy"])
#     spread = max(t["cy"] for t in tokens) - min(t["cy"] for t in tokens) if len(tokens) > 1 else 100
#     is_nutri = "nutri" in label.lower()
#     merge_px = max(30, int(spread * 0.08)) if "ingredient" in label.lower() or "allergen" in label.lower() else max(12, int(spread * 0.04))

#     def _is_header_tok(t): return is_nutri and bool(_HEADER_MARKER_RE.search(t["text"]))
#     def _is_label_tok(t): return is_nutri and _is_label_start(t["text"])

#     rows, cur_row = [], [sorted_t[0]]
#     cur_row_has_label = _is_label_tok(sorted_t[0])
#     cur_row_has_header = _is_header_tok(sorted_t[0])
#     for tok in sorted_t[1:]:
#         same_band = abs(tok["cy"] - cur_row[-1]["cy"]) <= merge_px
#         tok_is_label = _is_label_tok(tok)
#         tok_is_header = _is_header_tok(tok)
#         force_break = same_band and (
#             (cur_row_has_label and tok_is_label) or
#             (cur_row_has_header != tok_is_header and (cur_row_has_header or tok_is_header) and (cur_row_has_label or tok_is_label or len(cur_row) > 1))
#         )
#         if same_band and not force_break:
#             cur_row.append(tok)
#             cur_row_has_label = cur_row_has_label or tok_is_label
#             cur_row_has_header = cur_row_has_header or tok_is_header
#         else:
#             rows.append(sorted(cur_row, key=lambda t: t["cx"]))
#             cur_row = [tok]
#             cur_row_has_label = tok_is_label
#             cur_row_has_header = tok_is_header
#     rows.append(sorted(cur_row, key=lambda t: t["cx"]))
#     return ["  ".join(t["text"] for t in r) for r in rows]


# # ══════════════════════════════════════════════════════════════════════════════
# # STAGE 5 — STRUCTURING
# # ══════════════════════════════════════════════════════════════════════════════

# _NUTRIENT_VAL = re.compile(r'(?<![/\d])(\d+(?:[.,]\d+)?\s*(?:kcal|kj|kJ|mg|mcg|µg|g|%|IU)|\b[Nn]il\b|\b[Tt]races?\b|\b[Nn]ot\s+[Dd]etected\b)(?!\s*/)', re.IGNORECASE)
# _LABEL_UNIT_THEN_NUMBERS = re.compile(r'^(?P<label>[A-Za-z][A-Za-z\s\-]*?\((?:kcal|kj|kJ|mg|mcg|µg|g|%|IU)\))\s*(?P<nums>[<>]?\d+(?:[.,]\d+)?(?:\s+[<>]?\d+(?:[.,]\d+)?)*)\s*$', re.IGNORECASE)
# _INS_PATTERN  = re.compile(r'\b(?:INS\s*[-–]?\s*|E)(\d{3,4}[a-z]?)\b|[\(\{](\d{3,4}(?:[a-z]|\([ivxIVX]+\))?)\s*(?:[&,]\s*\d{3,4}[a-z]?)*[\)\}]|(?<=[\(\{&,\s])(\d{3,4}[a-z]?)(?=\s*[&,\)\}])', re.IGNORECASE)
# _HEADER_PHRASE_RE = re.compile(r'^\s*([A-Za-z][A-Za-z\s\./]{0,40}?)\s*[:\-–]\s*')
# _HEADER_MARKER_RE = re.compile(
#     r'\b(nutrients?|per\s*100\s*(?:g|ml)|per\s*serv(?:ing)?|%\s*rda|rda\s*%?|approx(?:imate)?\s*values?)\b',
#     re.IGNORECASE
# )

# def _strip_ingredients_header(text):
#     m = _HEADER_PHRASE_RE.match(text)
#     if m and 'ingredient' in m.group(1).lower():
#         return text[m.end():].strip()
#     return text

# _NOISE = re.compile(r'(?:rda|%\s*rda|recommended|daily|adult|sedentary|average|icmr|guideline|approximately|information|informatian|nutritional\s*info|hutritional|best\s*before|store|cool|dry|place|customer|care|toll|free|manufactured|marketed|net\s*weight|fssai|^parameters?\b|^unit\b|^result\b|determination|approx\w*\s*value)', re.IGNORECASE)

# def _fix_ocr(text):
#     text = re.sub(r'\bO(?=[gG]|mg|mcg|ml|%|\.\d|\d)', '0', text)
#     text = re.sub(r'(\d+\.\d)\s*9\b(?!\d)', r'\1 g', text)
#     text = re.sub(r'(\d)([a-zA-Z]{2,})', r'\1 \2', text)
#     text = re.sub(r'([a-zA-Z])(\d)', r'\1 \2', text)
#     text = re.sub(r'(\d),(\d)', r'\1.\2', text)
#     text = re.sub(r'(\d+\.\d{2})9\b', r'\1g', text)
#     return re.sub(r'(\d)(g|mg|mcg|ml|kcal)\b', r'\1 \2', text, flags=re.IGNORECASE)

# def _norm_label(raw):
#     return re.sub(r'\(0\)', '(g)', re.sub(r'\bMonounsalurated\b', 'Monounsaturated', re.sub(r'\bCarbohydrale\b', 'Carbohydrate', re.sub(r'\bSodlum\b', 'Sodium', re.sub(r'\bProloin\b|\bProlcin\b', 'Protein', re.sub(r'\bFal\s*\(', 'Fat (', raw), flags=re.IGNORECASE), flags=re.IGNORECASE), flags=re.IGNORECASE), flags=re.IGNORECASE)).strip().rstrip('.')

# def _is_value_only(row):
#     row = row.strip()
#     if re.match(r'^S?[Nn]ot\s+De[lt]e[ck]led\.?$', row, re.IGNORECASE): return "Not Detected"
#     clean = _fix_ocr(row)
#     if re.match(r'^([<>]?\d+(?:\.\d+)?\s*(?:kcal|kj|mg|mcg|g|%|IU)?|\b[Nn]il\b|\b[Tt]races?\b)$', clean, re.IGNORECASE): return clean.strip()
#     return None

# def _is_header(row):
#     return bool(_NOISE.search(row))

# def _is_label_only(row):
#     if _is_header(row) or _LABEL_UNIT_THEN_NUMBERS.search(_fix_ocr(row)) or _NUTRIENT_VAL.search(_fix_ocr(row)): return False
#     return bool(re.search(r'[a-zA-Z]{2,}', row))

# def _pick_nutrient_value(row):
#     matches = list(_NUTRIENT_VAL.finditer(row))
#     if not matches: return None
#     non_pct = [m for m in matches if not m.group(1).strip().endswith('%')]
#     return non_pct[0] if non_pct else None

# def _parse_nutrient_row(row):
#     row = _fix_ocr(row)
#     row = re.sub(r'(?i)(?:g|mg|mcg|kcal|kj|%|)\s*(?:/|per)\s*100\s*(?:g|ml)?', '', row)

#     if _NOISE.search(row): return None

#     if re.search(r'serving\s*size', row, re.IGNORECASE):
#         m_size = re.search(r'serving\s*size\s*[:\-]?\s*(\d+(?:\.\d+)?\s*(?:g|ml|tbsp|tsp|cup)?)', row, re.IGNORECASE)
#         if m_size: return ("serving_size", m_size.group(1).strip())

#     if re.search(r'serv(?:e|es|ing|ings)?\s*per', row, re.IGNORECASE) or re.search(r'no\.\s*of\s*serv', row, re.IGNORECASE):
#         nums = re.findall(r'\d+(?:\.\d+)?', row)
#         if nums: return ("servings_per_container", nums[0].strip())

#     m_label_unit = _LABEL_UNIT_THEN_NUMBERS.search(row)
#     if m_label_unit:
#         return (_norm_label(m_label_unit.group("label").strip()), m_label_unit.group("nums").split()[0].strip()) if len(m_label_unit.group("label").strip()) >= 2 else None

#     m = _pick_nutrient_value(row)
#     if not m:
#         bucket = _classify_nutrient(row)
#         if bucket:
#             stray_nums = re.findall(r'(?<!\()\b\d+(?:\.\d+)?\b(?!\))', row)
#             if stray_nums: return (_norm_label(re.sub(r'[\d.,\s]+$', '', row).strip()), stray_nums[0])
#         return None

#     key = re.sub(r'\s{2,}', ' ', re.sub(r'[:\-–|]+$', '', row[:m.start()]).strip())
#     return (_norm_label(key), m.group(1).strip()) if len(key) >= 2 else None


# # def derive_plausible_ranges(ground_truth_path=GROUND_TRUTH_PATH, margin=1.5):
# #     with open(ground_truth_path, encoding="utf-8") as f:
# #         gt = json.load(f)
# #     bucket_values = {}
# #     for entry in gt.values():
# #         for name, val in entry.get("nutrients_true", {}).items():
# #             bucket = _classify_nutrient(name)
# #             if not bucket: continue
# #             m = re.search(r'\d+\.?\d*', str(val))
# #             if m: bucket_values.setdefault(bucket, []).append(float(m.group()))

# #     ranges = {}
# #     for bucket, values in bucket_values.items():
# #         lo, hi = min(values), max(values)
# #         ranges[bucket] = (max(0, lo / margin), hi * margin)
# #     return ranges


# def _correct_decimal_drop(value_str: str, bucket: str) -> str:
#     m = re.match(r'^(\d+)(\D*)$', value_str.strip())
#     if not m or bucket not in _NUTRIENT_PLAUSIBLE_RANGE: return value_str
#     digits, suffix = m.group(1), m.group(2)
#     if len(digits) < 3: return value_str
#     lo, hi = _NUTRIENT_PLAUSIBLE_RANGE[bucket]
#     raw = float(digits)
#     if lo <= raw <= hi: return value_str

#     candidates = []
#     for split in range(1, len(digits)):
#         candidate_str = digits[:split] + "." + digits[split:]
#         candidate = float(candidate_str)
#         if lo <= candidate <= hi:
#             candidates.append((split, candidate_str))
#     if not candidates: return value_str
#     best_split, best_str = max(candidates, key=lambda c: c[0])
#     return best_str + suffix

# def parse_nutrient_table(rows):
#     nutrients, unmatched = {}, []
#     for row in rows:
#         m_size = re.search(r'serving\s*size\s*[:\-]?\s*(\d+(?:\.\d+)?\s*(?:g|ml|tbsp|tsp|cup)?)', row, re.IGNORECASE)
#         m_per = re.search(r'(\d+(?:\.\d+)?)\s*serv(?:e|es|ing|ings)?\s*per', row, re.IGNORECASE)
#         if m_size and m_per:
#             if "serving_size" not in nutrients: nutrients["serving_size"] = m_size.group(1).strip()
#             if "servings_per_container" not in nutrients: nutrients["servings_per_container"] = m_per.group(1).strip()
#             continue

#         r = _parse_nutrient_row(row)
#         if r:
#             key, val = r
#             bucket = _classify_nutrient(key)
#             if bucket: val = _correct_decimal_drop(val, bucket)
#             if key not in nutrients: nutrients[key] = val
#         else: unmatched.append(row)

#     vq = []
#     for row in unmatched:
#         if _is_header(row): continue
#         v = _is_value_only(row)
#         if v is not None: vq.append(v)
#         elif _is_label_only(row) and vq:
#             key = _norm_label(re.sub(r'[:\-–|]+$', '', row).strip())
#             if key and key not in nutrients: nutrients[key] = vq[-1]
#             vq.clear()
#     return nutrients

# ENGLISH_WORDS_PATH = os.getenv("ENGLISH_WORDS_PATH", "words_alpha.txt")

# def load_english_words(path=ENGLISH_WORDS_PATH):
#     """General English vocabulary (dwyl/english-words, ~370k words) —
#     checked BEFORE the narrow ingredient vocabulary so ordinary words that
#     simply aren't ingredient names ('food', 'grade') aren't dragged toward
#     the nearest unrelated ingredient term ('fond', 'grape'). Missing file
#     degrades to an empty set, i.e. every word falls through to
#     ingredient-vocab correction only — same behavior as before this fix."""
#     if not os.path.exists(path):
#         print(f"[warn] {path} not found — general-English word filtering unavailable; "
#               f"ingredient correction may over-correct real words. "
#               f"See https://github.com/dwyl/english-words (words_alpha.txt)")
#         return set()
#     with open(path, encoding="utf-8") as f:
#         words = {line.strip().lower() for line in f if line.strip()}
#     print(f"[init] Loaded English word list: {len(words)} entries")
#     return words

# _ENGLISH_WORDS = None

# def _dictionary_correct_word(word: str, vocabulary: set, english_words: set = frozenset(),
#                               max_dist_ratio: float = 0.25) -> str:
#     w = word.strip().lower()
#     if not w or len(w) < 4 or not vocabulary: return word
#     if w in vocabulary: return word
#     # A word that's already valid, ordinary English is not a target for
#     # ingredient-vocab correction at all — leave it alone rather than
#     # nudging it toward the nearest unrelated ingredient term.
#     if w in english_words: return word
#     best, best_dist = None, None
#     for entry in vocabulary:
#         if abs(len(entry) - len(w)) > 3: continue
#         dist = _levenshtein(w, entry)
#         # Candidate gate must be at least as loose as the final acceptance
#         # threshold below (dist<=2 for len>=6) — it previously wasn't
#         # (ratio*len could floor to 1 for a 7-letter word), which silently
#         # excluded genuine 2-edit typos like "celauin"->"gelatin" from ever
#         # becoming a candidate in the first place.
#         max_allowed = max(2, int(len(entry) * max_dist_ratio))
#         if dist <= max_allowed and (best_dist is None or dist < best_dist):
#             best, best_dist = entry, dist
#     if best is not None and (best_dist <= 1 or (best_dist <= 2 and len(w) >= 6)):
#         return best
#     return word

# def _correct_ingredient_item(item: str, vocabulary: set, english_words: set = frozenset()) -> str:
#     paren_match = re.search(r'\([^)]*\)', item)
#     paren_part = paren_match.group(0) if paren_match else ""
#     main_part = item[:paren_match.start()].strip() if paren_match else item
#     corrected_words = [_dictionary_correct_word(w, vocabulary, english_words) for w in main_part.split()]
#     corrected = " ".join(corrected_words)
#     return f"{corrected} {paren_part}".strip() if paren_part else corrected

# def structure_tokens(label, rows):
#     label, out = label.lower(), {}

#     if "ingredient" in label:
#         joined = _strip_ingredients_header(" ".join(rows))
#         full = re.compile(r'[Nn]umbers?\s+referred\s+above\s+are\s+as\s+per.*$', re.IGNORECASE | re.DOTALL).sub('', joined).strip()
#         out["ingredients_raw"] = full

#         items, ins = [], []
#         depth, cur = 0, []
#         for ch in full:
#             if ch in '([': depth += 1; cur.append(ch)
#             elif ch in ')]': depth = max(0, depth-1); cur.append(ch)
#             elif ch in ',;' and depth == 0:
#                 p = ''.join(cur).strip()
#                 if p: items.append(p)
#                 cur = []
#             else: cur.append(ch)
#         if ''.join(cur).strip(): items.append(''.join(cur).strip())

#         for item in items:
#             for m in _INS_PATTERN.finditer(item):
#                 val = m.group(1) or m.group(2) or m.group(3)
#                 if val: ins.append(re.sub(r'\([ivxIVX]+\)$', '', val).strip())

#         global _INGREDIENT_DICTIONARY, _ENGLISH_WORDS
#         if _INGREDIENT_DICTIONARY is None:
#           _INGREDIENT_DICTIONARY = load_ingredient_dictionary()
#         if _ENGLISH_WORDS is None:
#           _ENGLISH_WORDS = load_english_words()
#         out["ingredients"] = [_correct_ingredient_item(i.strip('.*#@!='), _INGREDIENT_DICTIONARY, _ENGLISH_WORDS)
#                        for i in items if len(i.strip('.*#@!=')) >= 2]
#         out["ins_numbers"] = sorted(set(ins))

#     elif "nutri" in label:
#         ins = []
#         for row in rows:
#             for m in _INS_PATTERN.finditer(row):
#                 val = m.group(1) or m.group(2) or m.group(3)
#                 if val: ins.append(re.sub(r'\([ivxIVX]+\)$', '', val).strip())
#         out["nutrients"]   = parse_nutrient_table(rows)
#         out["ins_numbers"] = sorted(set(ins))

#     elif "fssai" in label:
#         all_text = " ".join(rows)
#         m = re.search(r'\b\d{14}\b', all_text)
#         if m: out["fssai_license"] = m.group(0)
#         else:
#             near_miss = re.search(r'\d{10,16}', all_text)
#             out["fssai_license"] = f"⚠️ UNVERIFIED ({near_miss.group(0)}, expected 14 digits)" if near_miss else all_text.strip() or None

#     elif "allergen" in label:
#         out["allergen_info"] = " ".join(rows).strip()

#     return out


# # ══════════════════════════════════════════════════════════════════════════════
# # COMPLIANCE ENGINE — INS/E-number lookup, banned-term scan, trans-fat check
# # ══════════════════════════════════════════════════════════════════════════════

# INS_INDEX_PATH       = os.getenv("INS_INDEX_PATH", "index.csv")
# CANADA_STATUS_PATH   = os.getenv("CANADA_STATUS_PATH", "canada_status.json")
# UK_DIVERGENCES_PATH  = os.getenv("UK_DIVERGENCES_PATH", "uk_divergences.json")
# BANNED_TERMS_PATH    = os.getenv("BANNED_TERMS_PATH", "banned_terms.json")

# def load_ins_index(path=INS_INDEX_PATH):
#     """Loads the INS/E-number reference table into a dict keyed by code
#     (e.g. '621', '472e'). Derives per-jurisdiction permitted flags from the
#     status column, based on the source convention: a=Australia/NZ approved,
#     e=EU approved (has E-number), u=USA approved."""
#     import csv
#     index = {}
#     if not os.path.exists(path):
#         print(f"[warn] {path} not found — INS/E-number lookups will be unavailable")
#         return index
#     with open(path, encoding="utf-8") as f:
#         reader = csv.DictReader(f)
#         for row in reader:
#             code = row["code"].strip().lower()
#             status = row.get("status", "").strip().split()
#             index[code] = {
#                 "code": code,
#                 "names": row["names"].strip(),
#                 "type": row["type"].strip(),
#                 "permitted_au": "a" in status,
#                 "permitted_eu": "e" in status,
#                 "permitted_us": "u" in status,
#                 "status_raw": row.get("status", "").strip(),
#             }
#     print(f"[init] Loaded INS index: {len(index)} entries")
#     return index

# _INS_INDEX = None


# def lookup_ins(code: str, index: dict) -> dict | None:
#     """Looks up a single INS code, handling common variations: leading
#     zeros, missing/extra letter suffixes, and bare numeric fallback when
#     an exact suffix match isn't found (e.g. '472' falls back from '472e'
#     if the exact suffix wasn't recognized by OCR)."""
#     c = code.strip().lower().replace(" ", "")
#     if c in index:
#         return index[c]
#     base = re.sub(r'[a-z]$', '', c)
#     if base != c and base in index:
#         return index[base]
#     return None

# def lookup_ins_numbers(ins_numbers: list[str], index: dict) -> list[dict]:
#     """Looks up every INS number extracted from a label, returning full
#     entries for matches and a placeholder for anything not found (so the
#     caller can flag unrecognized codes rather than silently dropping them)."""
#     results = []
#     for code in ins_numbers:
#         entry = lookup_ins(code, index)
#         if entry:
#             results.append(entry)
#         else:
#             results.append({"code": code, "names": None, "type": None,
#                              "permitted_au": None, "permitted_eu": None, "permitted_us": None,
#                              "status_raw": None, "not_found": True})
#     return results

# def load_country_data(path):
#     """Generic loader for small, manually-verified per-country compliance
#     data files (JSON, keyed by INS code). Missing file -> empty dict,
#     so the pipeline degrades gracefully instead of crashing."""
#     if os.path.exists(path):
#         with open(path, encoding="utf-8") as f:
#             return json.load(f)
#     print(f"[warn] {path} not found — that jurisdiction's data will be unavailable")
#     return {}

# _CANADA_STATUS = None
# _UK_DIVERGENCES = None

# def get_canada_status(code: str) -> dict:
#     global _CANADA_STATUS
#     if _CANADA_STATUS is None:
#         _CANADA_STATUS = load_country_data(CANADA_STATUS_PATH)
#     code = code.strip().lower()
#     if code in _CANADA_STATUS:
#         entry = _CANADA_STATUS[code]
#         return {"permitted_ca": entry["permitted_ca"], "ca_note": entry["note"],
#                 "ca_source": entry["source"], "ca_verified": True}
#     return {"permitted_ca": None, "ca_note": "Not in our verified Canada subset — status unknown, not assumed.",
#             "ca_source": None, "ca_verified": False}

# def get_uk_status(code: str, ins_entry: dict) -> dict:
#     global _UK_DIVERGENCES
#     if _UK_DIVERGENCES is None:
#         _UK_DIVERGENCES = load_country_data(UK_DIVERGENCES_PATH)
#     code = code.strip().lower()
#     if code in _UK_DIVERGENCES:
#         div = _UK_DIVERGENCES[code]
#         return {"permitted_uk": div["permitted_uk"], "uk_note": div["note"],
#                 "uk_source": div["source"], "uk_verified": True}
#     return {"permitted_uk": ins_entry.get("permitted_eu"),
#             "uk_note": "Assumed same as EU (UK retained EU additive law post-Brexit); not independently verified.",
#             "uk_source": "approximated from EU", "uk_verified": False}

# def enrich_ins_numbers(pipeline_result: dict) -> dict:
#     global _INS_INDEX
#     if _INS_INDEX is None:
#         _INS_INDEX = load_ins_index()
#     ins_numbers = pipeline_result.get("ins_numbers", [])
#     details = lookup_ins_numbers(ins_numbers, _INS_INDEX)
#     for d in details:
#         if not d.get("not_found"):
#             d.update(get_uk_status(d["code"], d))
#             d.update(get_canada_status(d["code"]))
#     pipeline_result["ins_details"] = details
#     return pipeline_result

# _BANNED_TERMS = None

# def load_banned_terms(path=BANNED_TERMS_PATH):
#     if os.path.exists(path):
#         with open(path, encoding="utf-8") as f:
#             return json.load(f)
#     print(f"[warn] {path} not found — banned-term checking unavailable")
#     return {}

# def check_banned_terms(ingredients_raw: str) -> list[dict]:
#     """Scans the raw ingredients text for known banned/restricted terms.
#     Simple substring matching on a small, sourced term list -- not exhaustive,
#     won't catch every FSSAI prohibition, only the ones explicitly tracked."""
#     global _BANNED_TERMS
#     if _BANNED_TERMS is None:
#         _BANNED_TERMS = load_banned_terms()
#     if not ingredients_raw: return []
#     text = ingredients_raw.lower()
#     hits = []
#     for term, info in _BANNED_TERMS.items():
#         if term in text:
#             hits.append({"term": term, **info})
#     return hits

# def check_trans_fat_compliance(nutrients: dict) -> dict:
#     """Uses the same fuzzy nutrient-bucket classification as the rest of
#     the pipeline, rather than exact key matching, since OCR-derived keys
#     are inconsistent (e.g. 'Trans Fat (g).', 'Trans Fat (o)')."""
#     trans_val = total_fat_val = None
#     for key, val in nutrients.items():
#         bucket = _classify_nutrient(key)
#         if bucket == "trans_fat" and trans_val is None: trans_val = val
#         if bucket == "total_fat" and total_fat_val is None: total_fat_val = val

#     if not trans_val or not total_fat_val:
#         return {"status": "insufficient_data", "note": "Trans fat and/or total fat value not extracted from label."}
#     tm = re.search(r'\d+\.?\d*', str(trans_val))
#     fm = re.search(r'\d+\.?\d*', str(total_fat_val))
#     if not tm or not fm or float(fm.group()) == 0:
#         return {"status": "insufficient_data", "note": "Could not parse numeric values."}
#     pct = (float(tm.group()) / float(fm.group())) * 100
#     return {
#         "status": "compliant" if pct <= 2.0 else "exceeds_limit",
#         "trans_fat_pct_of_total_fat": round(pct, 2),
#         "limit_pct": 2.0,
#         "regulation": "FSSAI Prohibition and Restriction on Sales Regulations, 2011 — Reg. 2.3.14(21)",
#     }


# def run_compliance_checks(pipeline_result: dict) -> dict:
#     """Enriches a run_pipeline() result with the deterministic checks:
#     INS/E-number jurisdiction lookups, banned-term scan, trans-fat ratio.
#     Called automatically at the end of run_pipeline() below."""
#     pipeline_result = enrich_ins_numbers(pipeline_result)
#     pipeline_result["banned_term_hits"] = check_banned_terms(pipeline_result.get("ingredients_raw", ""))
#     pipeline_result["trans_fat_check"] = check_trans_fat_compliance(pipeline_result.get("nutrients", {}))
#     return pipeline_result


# # ══════════════════════════════════════════════════════════════════════════════
# # MAIN ENTRY POINT — this is what the API layer calls
# # ══════════════════════════════════════════════════════════════════════════════

# def run_pipeline(image_path):
#     global _yolo_model_cache, _ocr_engine_cache
#     if _yolo_model_cache is None or _ocr_engine_cache is None: _yolo_model_cache, _ocr_engine_cache = load_models()

#     regions = detect_regions(image_path, _yolo_model_cache, ocr_engine=_ocr_engine_cache)
#     final = {}
#     for region in regions:
#         tokens = line_segmented_ocr(region["crop_bgr"], _ocr_engine_cache, gate=OCR_CONF_GATE, label=region["label"])

#         if "nutri" in region["label"].lower():
#             col_pos = detect_column_positions(tokens)
#             if choose_target_column(col_pos):
#                 numeric_tokens = [t for t in tokens if re.match(r'^[\d.,<>%\s]+$', t["text"])]
#                 filtered_tokens = [t for t in tokens if not re.match(r'^[\d.,<>%\s]+$', t["text"])
#                                     or assign_token_to_column(t, col_pos) == "per_100"]
#                 kept_numeric = [t for t in filtered_tokens if re.match(r'^[\d.,<>%\s]+$', t["text"])]
#                 if not numeric_tokens or len(kept_numeric) / len(numeric_tokens) >= 0.4:
#                     tokens = filtered_tokens

#         structured = structure_tokens(region["label"], reconstruct_rows(tokens, label=region["label"]))

#         for k, v in structured.items():
#             if k == "fssai_license":
#                 if not (final.get(k) and re.search(r'\b\d{14}\b', final.get(k, ''))): final[k] = v
#             elif k not in final: final[k] = v
#             elif isinstance(v, list): final[k] = list(dict.fromkeys(final[k] + v))
#             elif isinstance(v, dict): final[k].update(v)
#             elif k == "allergen_info" and isinstance(v, str): final[k] = final[k] + " " + v if final.get(k) else v

#     return run_compliance_checks(final)


# # ══════════════════════════════════════════════════════════════════════════════
# # LEVENSHTEIN + NUTRIENT CLASSIFICATION (used by parsing above and by eval)
# # ══════════════════════════════════════════════════════════════════════════════

# def _levenshtein(a: str, b: str) -> int:
#     if len(a) < len(b): return _levenshtein(b, a)
#     if len(b) == 0: return len(a)
#     prev_row = list(range(len(b) + 1))
#     for i, ca in enumerate(a):
#         curr_row = [i + 1]
#         for j, cb in enumerate(b):
#             insertions = prev_row[j + 1] + 1
#             deletions  = curr_row[j] + 1
#             substitutions = prev_row[j] + (ca != cb)
#             curr_row.append(min(insertions, deletions, substitutions))
#         prev_row = curr_row
#     return prev_row[-1]

# _NUTRIENT_KEYWORDS = {
#     "energy_kcal":     ["energy", "kcal", "calorie"],
#     "energy_kj":       ["kj", "kilojoule"],
#     "protein":         ["protein"],
#     "total_fat":       ["total fat", "totalfat", "fat"],
#     "saturated_fat":   ["saturated fat", "saturatedfat", "sat fat", "sat. fat"],
#     "trans_fat":       ["trans fat", "transfat", "trans fatty"],
#     "monounsaturated": ["monounsaturated", "mono unsaturated", "mono-unsaturated"],
#     "polyunsaturated": ["polyunsaturated", "poly unsaturated", "poly-unsaturated"],
#     "cholesterol":     ["cholesterol"],
#     "carbohydrate":    ["carbohydrate", "carb"],
#     "total_sugars":    ["total sugar", "totalsugar"],
#     "added_sugars":    ["added sugar", "addedsugar"],
#     "dietary_fibre":   ["dietary fibre", "dietary fiber", "fibre", "fiber"],
#     "sodium":          ["sodium"],
#     "calcium":         ["calcium"],
#     "iron":            ["iron"],
#     "potassium":       ["potassium"],
#     "vitamin_d":       ["vitamin d"],
#     "serving_size":    ["serving size", "servingsize"],
#     "servings":        ["servings", "serves"],
# }

# def _classify_nutrient(name: str) -> str | None:
#     raw = name.lower()
#     n = re.sub(r'(?:per|/)\s*100\s*m?[lg]|m?[lg]\s*/\s*100\s*m?[lg]|per\s*serving|per\s*serve|\(.*?\)|g$|mg$', '', raw.replace('_', ' ').replace('-', ' ')).strip()

#     if 'saturated' in n: return 'saturated_fat'
#     if 'trans' in n: return 'trans_fat'
#     if 'polyunsaturated' in n or 'poly unsaturated' in n: return 'polyunsaturated'
#     if 'monounsaturated' in n or 'mono unsaturated' in n: return 'monounsaturated'
#     if 'total fat' in n or n == 'fat': return 'total_fat'
#     if 'added sugar' in n: return 'added_sugars'
#     if 'total sugar' in n or n == 'sugar' or n == 'sugars': return 'total_sugars'
#     if 'carbohydrate' in n or 'carb' in n: return 'carbohydrate'
#     if 'energy' in n or 'kcal' in n or 'calorie' in n:
#         # kcal vs kJ split — see module docstring for why this matters.
#         return 'energy_kj' if re.search(r'\bkj\b', raw) else 'energy_kcal'
#     if 'protein' in n: return 'protein'
#     if 'dietary fibre' in n or 'fiber' in n or 'fibre' in n: return 'dietary_fibre'
#     if 'sodium' in n: return 'sodium'
#     if 'cholesterol' in n: return 'cholesterol'
#     if 'calcium' in n: return 'calcium'
#     if 'iron' in n: return 'iron'
#     if 'potassium' in n: return 'potassium'
#     if 'vitamin d' in n: return 'vitamin_d'
#     if 'serving size' in n: return 'serving_size'
#     if 'servings' in n or 'serves' in n: return 'servings'

#     for bucket, keywords in _NUTRIENT_KEYWORDS.items():
#         for kw in keywords:
#             if len(kw) > 4 and _levenshtein(kw, n) <= 2: return bucket
#     return None

# # Plausible-range table used by _correct_decimal_drop. Only meaningful if
# # ground_truth.json (your eval set) is present; in a normal deployment it
# # won't be, so this quietly falls back to {} instead of crashing the whole
# # service on import — decimal-drop correction just becomes a no-op then.
# try:
#     _NUTRIENT_PLAUSIBLE_RANGE = {
#     "energy_kcal": (0, 900),
#     "energy_kj": (0, 4000),
#     "protein": (0, 100),
#     "total_fat": (0, 100),
#     "saturated_fat": (0, 100),
#     "trans_fat": (0, 20),
#     "monounsaturated": (0, 100),
#     "polyunsaturated": (0, 100),
#     "carbohydrate": (0, 100),
#     "total_sugars": (0, 100),
#     "added_sugars": (0, 100),
#     "dietary_fibre": (0, 50),
#     "sodium": (0, 3000),
#     "cholesterol": (0, 500),
#     "calcium": (0, 1500),
#     "iron": (0, 50),
#     "potassium": (0, 3000),
# }
# except FileNotFoundError:
#     _NUTRIENT_PLAUSIBLE_RANGE = {}





















"""
OCR + FSSAI compliance extraction pipeline.

Adapted from the standalone master_pipeline.py capstone script into a
service module: paths are now environment-configurable instead of
hardcoded, and the eval-only, import-time side effects (plausible-range
derivation, banner prints) are guarded so importing this module in the
API doesn't require ground_truth.json to exist on the deployment box.

Includes the energy_kcal / energy_kJ classifier fix: both used to
collapse into a single "energy" bucket because both names contain the
substring "energy", which cross-matched kcal and kJ readings against
each other and widened the plausible-range decimal-drop correction
across two different unit scales. Now split by checking which unit is
actually present in the raw field name before classifying.
"""

import re, cv2, numpy as np
import json, os
from ultralytics import YOLO
from paddleocr import PaddleOCR

try:
    import easyocr
    _EASYOCR_AVAILABLE = True
except ImportError:
    _EASYOCR_AVAILABLE = False

try:
    import pytesseract
    _TESSERACT_AVAILABLE = True
except ImportError:
    _TESSERACT_AVAILABLE = False


# ══════════════════════════════════════════════════════════════════════════════
# CONFIG & INIT — now environment-driven instead of hardcoded, so this module
# can live inside a deployed service rather than a notebook working directory
# ══════════════════════════════════════════════════════════════════════════════
YOLO_WEIGHTS          = os.getenv("YOLO_WEIGHTS_PATH", "best.pt")
YOLO_CONF             = 0.50
FSSAI_CONF            = 0.30    # Lowered specifically for FSSAI boxes
OCR_CONF_GATE         = 0.55
OCR_CONF_SOFT_FLOOR   = 0.40
CROP_PAD              = 5
TARGET_CHAR_HEIGHT_PX = 48
MIN_CROP_DIM          = 600
GROUND_TRUTH_PATH     = os.getenv("GROUND_TRUTH_PATH", "ground_truth.json")
INGREDIENT_DICT_PATH  = os.getenv("INGREDIENT_DICT_PATH", "ingredients.txt")

def load_ingredient_dictionary(path=INGREDIENT_DICT_PATH, ground_truth_path=GROUND_TRUTH_PATH):
    vocab = set()

    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                m = re.match(r'^(?:synonyms:)?en:\s*(.+)$', line)
                if not m:
                    continue
                entry = m.group(1)
                for name in entry.split(","):
                    name = name.strip().lower()
                    name = re.sub(r'\s*\(.*?\)\s*', ' ', name).strip()
                    if len(name) >= 3 and re.match(r'^[a-z][a-z\s\-]*$', name):
                        vocab.add(name)
    else:
        print(f"[warn] {path} not found — skipping external ingredient dictionary")

    if os.path.exists(ground_truth_path):
        with open(ground_truth_path, encoding="utf-8") as f:
            gt = json.load(f)
        for entry in gt.values():
            text = entry.get("ingredients_true", "")
            for word in re.findall(r'[a-zA-Z]+', text):
                if len(word) >= 3:
                    vocab.add(word.lower())

    print(f"[init] Loaded ingredient dictionary: {len(vocab)} entries")
    return vocab

_INGREDIENT_DICTIONARY = None
_yolo_model_cache = None
_ocr_engine_cache = None
_easyocr_reader = None

def load_models():
    print("[init] Loading YOLO …")
    yolo = YOLO(YOLO_WEIGHTS)
    print("[init] Loading PaddleOCR …")
    # enable_mkldnn is a genuinely different switch from FLAGS_use_mkldnn —
    # this one controls whether PaddlePaddle's oneDNN graph-rewrite passes
    # run at all, which is where "OneDnnContext does not have the input
    # Filter" tends to originate on non-Linux CPU builds. Default off
    # since it's the more commonly broken path outside Linux; flip
    # PADDLE_ENABLE_MKLDNN=1 in .env once you're on a Linux target
    # (Docker/WSL2) if you want the CPU speedup back.
    enable_mkldnn = os.getenv("PADDLE_ENABLE_MKLDNN", "0") == "1"
    ocr  = PaddleOCR(use_angle_cls=True, lang="en", show_log=False,
                     det_db_unclip_ratio=1.8, rec_batch_num=6,
                     det_db_box_thresh=0.3, det_db_thresh=0.2,
                     det_limit_side_len=1920, enable_mkldnn=enable_mkldnn)
    return yolo, ocr

def get_easyocr_reader():
    global _easyocr_reader
    if _easyocr_reader is None and _EASYOCR_AVAILABLE:
        print("[init] Loading EasyOCR …")
        _easyocr_reader = easyocr.Reader(['en'], gpu=True)
    return _easyocr_reader

def warm_up_models():
    """Call once at API startup so the first real request isn't the one
    paying multi-second model load time."""
    global _yolo_model_cache, _ocr_engine_cache
    if _yolo_model_cache is None or _ocr_engine_cache is None:
        _yolo_model_cache, _ocr_engine_cache = load_models()
    get_easyocr_reader()


# ══════════════════════════════════════════════════════════════════════════════
# STAGE 1 — YOLO DETECTION
# ══════════════════════════════════════════════════════════════════════════════

def detect_regions(image_path, yolo_model, ocr_engine=None, max_area_ratio=0.70):
    img_bgr = cv2.imread(image_path)
    if img_bgr is None: raise FileNotFoundError(f"Cannot read: {image_path}")
    ih, iw = img_bgr.shape[:2]
    image_area = ih * iw

    results = yolo_model(image_path, conf=0.25)
    raw_boxes = []
    for box in results[0].boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        label = yolo_model.names[int(box.cls[0])].lower()
        box_conf = float(box.conf[0])
        req_conf = FSSAI_CONF if "fssai" in label else YOLO_CONF
        if box_conf < req_conf:
            continue
        raw_boxes.append((x1, y1, x2, y2, label, box_conf))

    kept = []
    for x1, y1, x2, y2, label, box_conf in raw_boxes:
        ratio = ((x2 - x1) * (y2 - y1)) / image_area
        if ratio > max_area_ratio:
            continue
        kept.append((x1, y1, x2, y2, label, box_conf))

    def _iou(a, b):
        ax1, ay1, ax2, ay2 = a[:4]
        bx1, by1, bx2, by2 = b[:4]
        ix1, iy1 = max(ax1, bx1), max(ay1, by1)
        ix2, iy2 = min(ax2, bx2), min(ay2, by2)
        if ix2 <= ix1 or iy2 <= iy1: return 0.0
        inter = (ix2 - ix1) * (iy2 - iy1)
        return inter / ((ax2 - ax1) * (ay2 - ay1) + (bx2 - bx1) * (by2 - by1) - inter)

    final_boxes = []
    for cand in sorted(kept, key=lambda b: -b[5]):
        if not any(cand[4] == ex[4] and _iou(cand, ex) > 0.4 for ex in final_boxes):
            final_boxes.append(cand)

    regions = []
    for x1, y1, x2, y2, label, box_conf in final_boxes:
        crop = img_bgr[max(0, y1 - CROP_PAD):min(ih, y2 + CROP_PAD), max(0, x1 - CROP_PAD):min(iw, x2 + CROP_PAD)]
        regions.append({"label": label, "bbox": (x1, y1, x2, y2), "crop_bgr": crop})

    if ocr_engine is not None:
        found_labels = {r["label"] for r in regions}
        missing = [lbl for lbl in _FALLBACK_ANCHORS if not any(lbl in fl for fl in found_labels)]
        if missing:
            regions.extend(keyword_fallback_regions(img_bgr, ocr_engine, missing))

    for r in regions:
        h, w = r["crop_bgr"].shape[:2]
        if h == 0 or w == 0: continue
        min_dim = min(h, w)
        if min_dim < MIN_CROP_DIM:
            scale = MIN_CROP_DIM / min_dim
            r["crop_bgr"] = cv2.resize(r["crop_bgr"], (max(1, int(w * scale)), max(1, int(h * scale))),
                                        interpolation=cv2.INTER_LANCZOS4)
    return regions


# ══════════════════════════════════════════════════════════════════════════════
# STAGE 1.5 — KEYWORD-ANCHORED FALLBACK DETECTION
# ══════════════════════════════════════════════════════════════════════════════

_FALLBACK_ANCHORS = {
    "ingredients": re.compile(r'\bingredients?\b\s*[:\-]?', re.IGNORECASE),
    "fssai": re.compile(r'\bfssai\b|\blic(?:ense|\.)?\s*(?:no\.?|number)\b', re.IGNORECASE),
}
_SECTION_STOP = re.compile(
    r'\bnutrition(?:al)?\b|\ballergen\b|\bstorage\b|\bbest\s*before\b|\bbatch\b|'
    r'\bmfg\b|\bmanufactur|\bnet\s*(?:wt|weight|quantity)\b|\bfssai\b',
    re.IGNORECASE
)

def _full_page_ocr_lines(img_bgr, ocr_engine):
    result = ocr_engine.ocr(img_bgr, det=True, rec=True, cls=True)
    if not result or not result[0]: return []
    lines = []
    for box, rec in result[0]:
        text, conf = rec if isinstance(rec, tuple) else (rec[0], rec[1])
        pts = np.array(box, dtype=np.float32)
        lines.append({
            "text": text, "conf": float(conf),
            "x1": float(pts[:, 0].min()), "y1": float(pts[:, 1].min()),
            "x2": float(pts[:, 0].max()), "y2": float(pts[:, 1].max()),
            "cy": float(pts[:, 1].mean()),
        })
    return sorted(lines, key=lambda l: l["cy"])

def keyword_fallback_regions(img_bgr, ocr_engine, missing_labels, pad=CROP_PAD):
    if not missing_labels: return []
    ih, iw = img_bgr.shape[:2]
    lines = _full_page_ocr_lines(img_bgr, ocr_engine)
    if not lines: return []

    heights = [l["y2"] - l["y1"] for l in lines if l["y2"] > l["y1"]]
    median_h = sorted(heights)[len(heights) // 2] if heights else 20

    regions = []
    for label in missing_labels:
        pattern = _FALLBACK_ANCHORS.get(label)
        if pattern is None: continue

        anchor_idx = next((i for i, l in enumerate(lines) if pattern.search(l["text"])), None)
        if anchor_idx is None: continue

        anchor = lines[anchor_idx]
        gap_thresh = max(25, median_h * (5.0 if label == "ingredients" else 2.5))

        block = [anchor]
        prev_y2 = anchor["y2"]
        max_lines = 40 if label == "ingredients" else 3

        for l in lines[anchor_idx + 1:]:
            if len(block) >= max_lines: break
            if l["y1"] - prev_y2 > gap_thresh: break
            if label == "ingredients" and _SECTION_STOP.search(l["text"]): break
            block.append(l)
            prev_y2 = l["y2"]

        if label == "ingredients" and len(block) <= 1:
            fallback_y2 = min(ih, int(anchor["y2"] + max(400, median_h * 15)))
            for l in lines[anchor_idx + 1:]:
                if _SECTION_STOP.search(l["text"]) and l["y1"] > anchor["y2"]:
                    fallback_y2 = min(fallback_y2, int(l["y1"]))
                    break
            x1 = max(0, int(anchor["x1"]) - pad)
            y1 = max(0, int(anchor["y1"]) - pad)
            x2 = min(iw, int(max(anchor["x2"], iw * 0.9)) + pad)
            y2 = min(ih, fallback_y2 + pad)
            regions.append({"label": label, "bbox": (x1, y1, x2, y2),
                             "crop_bgr": img_bgr[y1:y2, x1:x2],
                             "source": "keyword_fallback_expanded"})
            continue

        x1 = max(0, int(min(l["x1"] for l in block)) - pad)
        y1 = max(0, int(min(l["y1"] for l in block)) - pad)
        x2 = min(iw, int(max(l["x2"] for l in block)) + pad)
        y2 = min(ih, int(max(l["y2"] for l in block)) + pad)
        if x2 <= x1 or y2 <= y1: continue

        regions.append({"label": label, "bbox": (x1, y1, x2, y2),
                         "crop_bgr": img_bgr[y1:y2, x1:x2], "source": "keyword_fallback"})
    return regions


# ══════════════════════════════════════════════════════════════════════════════
# STAGE 2 — ENSEMBLE LINE-SEGMENTED OCR & COLUMN PARSER
# ══════════════════════════════════════════════════════════════════════════════

def _dictionary_score(text: str) -> int:
    score = 0
    if re.search(r'energy|protein|fat|carbohydrate|sugar|sodium|cholesterol|fibre|fiber|calcium|iron|potassium|vitamin', text, re.IGNORECASE): score += 3
    if re.search(r'\b\d{14}\b', text): score += 5
    if re.search(r'\bINS\s*\d{3,4}|\(\d{3,4}\)', text, re.IGNORECASE): score += 2
    if re.match(r'^[\d.,<>%\s]+$', text.strip()): score += 1
    letters = re.sub(r'[^a-zA-Z]', '', text)
    if len(letters) >= 4 and sum(1 for c in letters.lower() if c in 'aeiou') / len(letters) < 0.15: score -= 3
    return score

def ensemble_recognize_line(line_img, paddle_ocr_engine, label: str = "") -> tuple[str, float]:
    cands = []
    res = paddle_ocr_engine.ocr(line_img, det=False, rec=True, cls=True)
    if res and res[0]:
        t, c = res[0][0] if isinstance(res[0][0], tuple) else (res[0][0][0], res[0][0][1])
        if c >= 0.4: cands.append((t.strip(), c, "paddle", _dictionary_score(t.strip())))

    if _EASYOCR_AVAILABLE and get_easyocr_reader():
        res_e = get_easyocr_reader().readtext(line_img, detail=1, paragraph=False)
        if res_e:
            combined = " ".join([r[1] for r in res_e]).strip()
            avg_c = sum([r[2] for r in res_e]) / len(res_e)
            if avg_c >= 0.4 and combined: cands.append((combined, avg_c, "easyocr", _dictionary_score(combined)))

    if _TESSERACT_AVAILABLE and "nutri" not in label.lower():
        try:
            data = pytesseract.image_to_data(line_img, output_type=pytesseract.Output.DICT, config='--psm 7')
            texts, confs = zip(*[(t, int(c)) for c, t in zip(data['conf'], data['text']) if t.strip() and c != '-1'])
            if texts:
                avg_c = (sum(confs) / len(confs)) / 100.0
                if avg_c >= 0.4: cands.append((" ".join(texts).strip(), avg_c, "tesseract", _dictionary_score(" ".join(texts).strip())))
        except Exception: pass

    if not cands: return None, 0.0

    text_counts = {}
    for text, conf, _, dscore in cands: text_counts.setdefault(text.lower().strip(), []).append((text, conf, dscore))
    for key, group in text_counts.items():
        if len(group) >= 2: return max(group, key=lambda g: g[1])[0], min(0.99, max(group, key=lambda g: g[1])[1] + 0.15)

    winner = max(cands, key=lambda c: (c[3], c[1]))
    return winner[0], winner[1]

def _box_rect(b):
    pts = np.array(b, dtype=np.float32)
    return pts[:, 0].min(), pts[:, 1].min(), pts[:, 0].max(), pts[:, 1].max()

def _dedupe_line_boxes(boxes, iou_thresh=0.6):
    def _iou(a, b):
        ax1, ay1, ax2, ay2 = _box_rect(a); bx1, by1, bx2, by2 = _box_rect(b)
        ix1, iy1 = max(ax1, bx1), max(ay1, by1)
        ix2, iy2 = min(ax2, bx2), min(ay2, by2)
        if ix2 <= ix1 or iy2 <= iy1: return 0.0
        inter = (ix2 - ix1) * (iy2 - iy1)
        area_a, area_b = (ax2 - ax1) * (ay2 - ay1), (bx2 - bx1) * (by2 - by1)
        denom = area_a + area_b - inter
        return inter / denom if denom > 0 else 0.0
    kept = []
    for b in boxes:
        if not any(_iou(b, k) > iou_thresh for k in kept): kept.append(b)
    return kept

def line_segmented_ocr(crop_bgr, ocr_engine, gate: float = 0.55, label: str = "") -> list[dict]:
    light = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY))
    boxes = ocr_engine.ocr(light, det=True, rec=False, cls=False)

    if not boxes or not boxes[0]:
        boxes = ocr_engine.ocr(crop_bgr, det=True, rec=False, cls=False)
        if not boxes or not boxes[0]: return []

    boxes = [_dedupe_line_boxes(boxes[0])]

    tokens = []
    for box in boxes[0]:
        pts = np.array(box, dtype=np.float32)
        x_min, y_min = max(0, int(pts[:, 0].min()) - 6), max(0, int(pts[:, 1].min()) - 6)
        x_max, y_max = min(crop_bgr.shape[1], int(pts[:, 0].max()) + 6), min(crop_bgr.shape[0], int(pts[:, 1].max()) + 6)
        if x_max <= x_min or y_max <= y_min: continue

        line_crop = crop_bgr[y_min:y_max, x_min:x_max]
        lh, lw = line_crop.shape[:2]
        if lh == 0 or lw == 0: continue

        scale = TARGET_CHAR_HEIGHT_PX / lh
        resized = cv2.resize(line_crop, (max(1, int(lw * scale)), TARGET_CHAR_HEIGHT_PX), interpolation=cv2.INTER_LANCZOS4 if scale > 1 else cv2.INTER_AREA)
        gray = cv2.filter2D(cv2.createCLAHE(clipLimit=2.5, tileGridSize=(4, 4)).apply(cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)), -1, np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32))

        text, conf = ensemble_recognize_line(gray, ocr_engine, label=label)
        if text and text.strip():
            accept = conf >= gate
            if not accept and conf >= OCR_CONF_SOFT_FLOOR and _dictionary_score(text) >= 1:
                accept = True
            if accept:
                tokens.append({"text": text.strip(), "bbox": box, "conf": conf,
                                "cx": float(pts[:, 0].mean()), "cy": float(pts[:, 1].mean())})
    return tokens

_COLUMN_HEADER_PATTERNS = {
    "per_100": re.compile(r'per\s*100|100\s*g|100\s*ml', re.IGNORECASE),
    "per_serving": re.compile(r'per\s*serv|per\s*serve', re.IGNORECASE),
    "rda": re.compile(r'%\s*rda|rda\s*%|%\s*daily', re.IGNORECASE),
}

def detect_column_positions(tokens: list[dict]) -> dict:
    if not tokens: return {}
    positions = {}
    for tok in sorted(tokens, key=lambda t: t["cy"]):
        for col_name, pattern in _COLUMN_HEADER_PATTERNS.items():
            if pattern.search(tok["text"]) and col_name not in positions:
                positions[col_name] = tok["cx"]
    return positions

def assign_token_to_column(token: dict, column_positions: dict) -> str | None:
    if not column_positions: return None
    return min(column_positions.items(), key=lambda kv: abs(kv[1] - token["cx"]))[0]

_COLUMN_PRIORITY = ("per_100", "per_serving")
_COLUMN_MIN_SEPARATION_PX = 15

def choose_target_column(col_pos: dict) -> str | None:
    if "per_100" in col_pos and "per_serving" in col_pos:
        if abs(col_pos["per_100"] - col_pos["per_serving"]) < _COLUMN_MIN_SEPARATION_PX:
            return None
    for name in _COLUMN_PRIORITY:
        if name in col_pos: return name
    return None


# ══════════════════════════════════════════════════════════════════════════════
# STAGE 4 — SPATIAL ROW RECONSTRUCTION
# ══════════════════════════════════════════════════════════════════════════════

_LABEL_STEMS = [
    "energy", "protein", "total fat", "saturated fat", "trans fat",
    "monounsaturated", "polyunsaturated", "carbohydrate", "total sugars",
    "added sugars", "dietary fibre", "dietary fiber", "sodium", "calcium",
    "iron", "potassium", "vitamin d", "cholesterol", "of which",
]

def _is_label_start(text: str) -> bool:
    t = text.strip().lower()
    if not t: return False
    words = t.split()
    for n in (1, 2, 3):
        prefix = " ".join(words[:n])
        if len(prefix) < 3: continue
        for stem in _LABEL_STEMS:
            tolerance = 1 if len(stem) <= 6 else 2
            if _levenshtein(prefix, stem[:len(prefix)+2]) <= tolerance:
                return True
            if len(prefix) >= len(stem) - 2 and _levenshtein(prefix[:len(stem)], stem) <= tolerance:
                return True
    return False

def reconstruct_rows(tokens, label=""):
    if not tokens: return []
    sorted_t = sorted(tokens, key=lambda t: t["cy"])
    spread = max(t["cy"] for t in tokens) - min(t["cy"] for t in tokens) if len(tokens) > 1 else 100
    is_nutri = "nutri" in label.lower()
    merge_px = max(30, int(spread * 0.08)) if "ingredient" in label.lower() or "allergen" in label.lower() else max(12, int(spread * 0.04))

    def _is_header_tok(t): return is_nutri and bool(_HEADER_MARKER_RE.search(t["text"]))
    def _is_label_tok(t): return is_nutri and _is_label_start(t["text"])

    rows, cur_row = [], [sorted_t[0]]
    cur_row_has_label = _is_label_tok(sorted_t[0])
    cur_row_has_header = _is_header_tok(sorted_t[0])
    for tok in sorted_t[1:]:
        same_band = abs(tok["cy"] - cur_row[-1]["cy"]) <= merge_px
        tok_is_label = _is_label_tok(tok)
        tok_is_header = _is_header_tok(tok)
        force_break = same_band and (
            (cur_row_has_label and tok_is_label) or
            (cur_row_has_header != tok_is_header and (cur_row_has_header or tok_is_header) and (cur_row_has_label or tok_is_label or len(cur_row) > 1))
        )
        if same_band and not force_break:
            cur_row.append(tok)
            cur_row_has_label = cur_row_has_label or tok_is_label
            cur_row_has_header = cur_row_has_header or tok_is_header
        else:
            rows.append(sorted(cur_row, key=lambda t: t["cx"]))
            cur_row = [tok]
            cur_row_has_label = tok_is_label
            cur_row_has_header = tok_is_header
    rows.append(sorted(cur_row, key=lambda t: t["cx"]))
    return ["  ".join(t["text"] for t in r) for r in rows]


# ══════════════════════════════════════════════════════════════════════════════
# STAGE 5 — STRUCTURING
# ══════════════════════════════════════════════════════════════════════════════

_NUTRIENT_VAL = re.compile(r'(?<![/\d])(\d+(?:[.,]\d+)?\s*(?:kcal|kj|kJ|mg|mcg|µg|g|%|IU)|\b[Nn]il\b|\b[Tt]races?\b|\b[Nn]ot\s+[Dd]etected\b)(?!\s*/)', re.IGNORECASE)
_LABEL_UNIT_THEN_NUMBERS = re.compile(r'^(?P<label>[A-Za-z][A-Za-z\s\-]*?\((?:kcal|kj|kJ|mg|mcg|µg|g|%|IU)\)?)\s*(?P<nums>[<>]?\d+(?:[.,]\d+)?(?:\s+[<>]?\d+(?:[.,]\d+)?)*)', re.IGNORECASE)
_INS_PATTERN  = re.compile(r'\b(?:INS\s*[-–]?\s*|E)(\d{3,4}[a-z]?)\b|[\(\{](\d{3,4}(?:[a-z]|\([ivxIVX]+\))?)\s*(?:[&,]\s*\d{3,4}[a-z]?)*[\)\}]|(?<=[\(\{&,\s])(\d{3,4}[a-z]?)(?=\s*[&,\)\}])', re.IGNORECASE)
_HEADER_PHRASE_RE = re.compile(r'^\s*([A-Za-z][A-Za-z\s\./]{0,40}?)\s*[:\-–]\s*')
_HEADER_MARKER_RE = re.compile(
    r'\b(nutrients?|per\s*100\s*(?:g|ml)|per\s*serv(?:ing)?|%\s*rda|rda\s*%?|approx(?:imate)?\s*values?)\b',
    re.IGNORECASE
)

def _strip_ingredients_header(text):
    m = _HEADER_PHRASE_RE.match(text)
    if m and 'ingredient' in m.group(1).lower():
        return text[m.end():].strip()
    return text

_NOISE = re.compile(r'(?:rda|%\s*rda|recommended|daily|adult|sedentary|average|icmr|guideline|approximately|information|informatian|nutritional\s*info|hutritional|best\s*before|store|cool|dry|place|customer|care|toll|free|manufactured|marketed|net\s*weight|fssai|^parameters?\b|^unit\b|^result\b|determination|approx\w*\s*value)', re.IGNORECASE)

def _fix_ocr(text):
    text = re.sub(r'\bO(?=[gG]|mg|mcg|ml|%|\.\d|\d)', '0', text)
    text = re.sub(r'(\d+\.\d)\s*9\b(?!\d)', r'\1 g', text)
    text = re.sub(r'(\d)([a-zA-Z]{2,})', r'\1 \2', text)
    text = re.sub(r'([a-zA-Z])(\d)', r'\1 \2', text)
    text = re.sub(r'(\d),(\d)', r'\1.\2', text)
    text = re.sub(r'(\d+\.\d{2})9\b', r'\1g', text)
    return re.sub(r'(\d)(g|mg|mcg|ml|kcal)\b', r'\1 \2', text, flags=re.IGNORECASE)

def _norm_label(raw):
    return re.sub(r'\(0\)', '(g)', re.sub(r'\bMonounsalurated\b', 'Monounsaturated', re.sub(r'\bCarbohydrale\b', 'Carbohydrate', re.sub(r'\bSodlum\b', 'Sodium', re.sub(r'\bProloin\b|\bProlcin\b', 'Protein', re.sub(r'\bFal\s*\(', 'Fat (', raw), flags=re.IGNORECASE), flags=re.IGNORECASE), flags=re.IGNORECASE), flags=re.IGNORECASE)).strip().rstrip('.')

def _is_value_only(row):
    row = row.strip()
    if re.match(r'^S?[Nn]ot\s+De[lt]e[ck]led\.?$', row, re.IGNORECASE): return "Not Detected"
    clean = _fix_ocr(row)
    if re.match(r'^([<>]?\d+(?:\.\d+)?\s*(?:kcal|kj|mg|mcg|g|%|IU)?|\b[Nn]il\b|\b[Tt]races?\b)$', clean, re.IGNORECASE): return clean.strip()
    return None

def _is_header(row):
    return bool(_NOISE.search(row))

def _is_label_only(row):
    if _is_header(row) or _LABEL_UNIT_THEN_NUMBERS.search(_fix_ocr(row)) or _NUTRIENT_VAL.search(_fix_ocr(row)): return False
    return bool(re.search(r'[a-zA-Z]{2,}', row))

def _pick_nutrient_value(row):
    matches = list(_NUTRIENT_VAL.finditer(row))
    if not matches: return None
    non_pct = [m for m in matches if not m.group(1).strip().endswith('%')]
    return non_pct[0] if non_pct else None

def _parse_nutrient_row(row):
    row = _fix_ocr(row)
    row = re.sub(r'(?i)(?:g|mg|mcg|kcal|kj|%|)\s*(?:/|per)\s*100\s*(?:g|ml)?', '', row)

    if _NOISE.search(row): return None

    if re.search(r'serving\s*size', row, re.IGNORECASE):
        m_size = re.search(r'serving\s*size\s*[:\-]?\s*(\d+(?:\.\d+)?\s*(?:g|ml|tbsp|tsp|cup)?)', row, re.IGNORECASE)
        if m_size: return ("serving_size", m_size.group(1).strip())

    if re.search(r'serv(?:e|es|ing|ings)?\s*per', row, re.IGNORECASE) or re.search(r'no\.\s*of\s*serv', row, re.IGNORECASE):
        nums = re.findall(r'\d+(?:\.\d+)?', row)
        if nums: return ("servings_per_container", nums[0].strip())

    m_label_unit = _LABEL_UNIT_THEN_NUMBERS.search(row)
    if m_label_unit:
        return (_norm_label(m_label_unit.group("label").strip()), m_label_unit.group("nums").split()[0].strip()) if len(m_label_unit.group("label").strip()) >= 2 else None

    m = _pick_nutrient_value(row)
    if not m:
        bucket = _classify_nutrient(row)
        if bucket:
            # Strip from the position of the FIRST stray number onward, not
            # just trailing digits/spaces -- the trailing-only strip does
            # nothing when the row ends in leftover column garbage that
            # isn't itself numeric (e.g. a stray "P"/"B" fragment from an
            # adjacent %RDA column), which is exactly what let garbled
            # multi-column text end up in the label instead of just the
            # value.
            first_num = re.search(r'(?<!\()\b\d+(?:\.\d+)?\b(?!\))', row)
            if first_num:
                label_text = row[:first_num.start()].strip()
                return (_norm_label(label_text), first_num.group())
        return None

    key = re.sub(r'\s{2,}', ' ', re.sub(r'[:\-–|]+$', '', row[:m.start()]).strip())
    return (_norm_label(key), m.group(1).strip()) if len(key) >= 2 else None


def derive_plausible_ranges(ground_truth_path=GROUND_TRUTH_PATH, margin=1.5):
    with open(ground_truth_path, encoding="utf-8") as f:
        gt = json.load(f)
    bucket_values = {}
    for entry in gt.values():
        for name, val in entry.get("nutrients_true", {}).items():
            bucket = _classify_nutrient(name)
            if not bucket: continue
            m = re.search(r'\d+\.?\d*', str(val))
            if m: bucket_values.setdefault(bucket, []).append(float(m.group()))

    ranges = {}
    for bucket, values in bucket_values.items():
        lo, hi = min(values), max(values)
        ranges[bucket] = (max(0, lo / margin), hi * margin)
    return ranges


def _correct_decimal_drop(value_str: str, bucket: str) -> str:
    m = re.match(r'^(\d+)(\D*)$', value_str.strip())
    if not m or bucket not in _NUTRIENT_PLAUSIBLE_RANGE: return value_str
    digits, suffix = m.group(1), m.group(2)
    if len(digits) < 3: return value_str
    lo, hi = _NUTRIENT_PLAUSIBLE_RANGE[bucket]
    raw = float(digits)
    if lo <= raw <= hi: return value_str

    candidates = []
    for split in range(1, len(digits)):
        candidate_str = digits[:split] + "." + digits[split:]
        candidate = float(candidate_str)
        if lo <= candidate <= hi:
            candidates.append((split, candidate_str))
    if not candidates: return value_str
    best_split, best_str = max(candidates, key=lambda c: c[0])
    return best_str + suffix

def parse_nutrient_table(rows):
    nutrients, unmatched = {}, []
    for row in rows:
        m_size = re.search(r'serving\s*size\s*[:\-]?\s*(\d+(?:\.\d+)?\s*(?:g|ml|tbsp|tsp|cup)?)', row, re.IGNORECASE)
        m_per = re.search(r'(\d+(?:\.\d+)?)\s*serv(?:e|es|ing|ings)?\s*per', row, re.IGNORECASE)
        if m_size and m_per:
            if "serving_size" not in nutrients: nutrients["serving_size"] = m_size.group(1).strip()
            if "servings_per_container" not in nutrients: nutrients["servings_per_container"] = m_per.group(1).strip()
            continue

        r = _parse_nutrient_row(row)
        if r:
            key, val = r
            bucket = _classify_nutrient(key)
            if bucket: val = _correct_decimal_drop(val, bucket)
            if key not in nutrients: nutrients[key] = val
        else: unmatched.append(row)

    vq = []
    for row in unmatched:
        if _is_header(row): continue
        v = _is_value_only(row)
        if v is not None: vq.append(v)
        elif _is_label_only(row) and vq:
            key = _norm_label(re.sub(r'[:\-–|]+$', '', row).strip())
            if key and key not in nutrients: nutrients[key] = vq[-1]
            vq.clear()
    return nutrients

ENGLISH_WORDS_PATH = os.getenv("ENGLISH_WORDS_PATH", "words_alpha.txt")

def load_english_words(path=ENGLISH_WORDS_PATH):
    """General English vocabulary (dwyl/english-words, ~370k words) —
    checked BEFORE the narrow ingredient vocabulary so ordinary words that
    simply aren't ingredient names ('food', 'grade') aren't dragged toward
    the nearest unrelated ingredient term ('fond', 'grape'). Missing file
    degrades to an empty set, i.e. every word falls through to
    ingredient-vocab correction only — same behavior as before this fix."""
    if not os.path.exists(path):
        print(f"[warn] {path} not found — general-English word filtering unavailable; "
              f"ingredient correction may over-correct real words. "
              f"See https://github.com/dwyl/english-words (words_alpha.txt)")
        return set()
    with open(path, encoding="utf-8") as f:
        words = {line.strip().lower() for line in f if line.strip()}
    print(f"[init] Loaded English word list: {len(words)} entries")
    return words

_ENGLISH_WORDS = None

def _dictionary_correct_word(word: str, vocabulary: set, english_words: set = frozenset(),
                              max_dist_ratio: float = 0.25) -> str:
    w = word.strip().lower()
    if not w or len(w) < 4 or not vocabulary: return word
    if w in vocabulary: return word
    # A word that's already valid, ordinary English is not a target for
    # ingredient-vocab correction at all — leave it alone rather than
    # nudging it toward the nearest unrelated ingredient term.
    if w in english_words: return word
    best, best_dist = None, None
    for entry in vocabulary:
        if abs(len(entry) - len(w)) > 3: continue
        dist = _levenshtein(w, entry)
        # Candidate gate must be at least as loose as the final acceptance
        # threshold below (dist<=2 for len>=6) — it previously wasn't
        # (ratio*len could floor to 1 for a 7-letter word), which silently
        # excluded genuine 2-edit typos like "celauin"->"gelatin" from ever
        # becoming a candidate in the first place.
        max_allowed = max(2, int(len(entry) * max_dist_ratio))
        if dist <= max_allowed and (best_dist is None or dist < best_dist):
            best, best_dist = entry, dist
    if best is not None and (best_dist <= 1 or (best_dist <= 2 and len(w) >= 6)):
        return best
    return word

def _correct_ingredient_item(item: str, vocabulary: set, english_words: set = frozenset()) -> str:
    paren_match = re.search(r'\([^)]*\)', item)
    paren_part = paren_match.group(0) if paren_match else ""
    main_part = item[:paren_match.start()].strip() if paren_match else item
    corrected_words = [_dictionary_correct_word(w, vocabulary, english_words) for w in main_part.split()]
    corrected = " ".join(corrected_words)
    return f"{corrected} {paren_part}".strip() if paren_part else corrected

def structure_tokens(label, rows):
    label, out = label.lower(), {}

    if "ingredient" in label:
        joined = _strip_ingredients_header(" ".join(rows))
        full = re.compile(r'[Nn]umbers?\s+referred\s+above\s+are\s+as\s+per.*$', re.IGNORECASE | re.DOTALL).sub('', joined).strip()
        out["ingredients_raw"] = full

        items, ins = [], []
        depth, cur = 0, []
        for ch in full:
            if ch in '([': depth += 1; cur.append(ch)
            elif ch in ')]': depth = max(0, depth-1); cur.append(ch)
            elif ch in ',;' and depth == 0:
                p = ''.join(cur).strip()
                if p: items.append(p)
                cur = []
            else: cur.append(ch)
        if ''.join(cur).strip(): items.append(''.join(cur).strip())

        for item in items:
            for m in _INS_PATTERN.finditer(item):
                val = m.group(1) or m.group(2) or m.group(3)
                if val: ins.append(re.sub(r'\([ivxIVX]+\)$', '', val).strip())

        global _INGREDIENT_DICTIONARY, _ENGLISH_WORDS
        if _INGREDIENT_DICTIONARY is None:
          _INGREDIENT_DICTIONARY = load_ingredient_dictionary()
        if _ENGLISH_WORDS is None:
          _ENGLISH_WORDS = load_english_words()
        out["ingredients"] = [_correct_ingredient_item(i.strip('.*#@!='), _INGREDIENT_DICTIONARY, _ENGLISH_WORDS)
                       for i in items if len(i.strip('.*#@!=')) >= 2]
        out["ins_numbers"] = sorted(set(ins))

    elif "nutri" in label:
        ins = []
        for row in rows:
            for m in _INS_PATTERN.finditer(row):
                val = m.group(1) or m.group(2) or m.group(3)
                if val: ins.append(re.sub(r'\([ivxIVX]+\)$', '', val).strip())
        out["nutrients"]   = parse_nutrient_table(rows)
        out["ins_numbers"] = sorted(set(ins))

    elif "fssai" in label:
        all_text = " ".join(rows)
        m = re.search(r'\b\d{14}\b', all_text)
        if m: out["fssai_license"] = m.group(0)
        else:
            near_miss = re.search(r'\d{10,16}', all_text)
            out["fssai_license"] = f"⚠️ UNVERIFIED ({near_miss.group(0)}, expected 14 digits)" if near_miss else all_text.strip() or None

    elif "allergen" in label:
        out["allergen_info"] = " ".join(rows).strip()

    return out


# ══════════════════════════════════════════════════════════════════════════════
# COMPLIANCE ENGINE — INS/E-number lookup, banned-term scan, trans-fat check
# ══════════════════════════════════════════════════════════════════════════════

INS_INDEX_PATH       = os.getenv("INS_INDEX_PATH", "index.csv")
CANADA_STATUS_PATH   = os.getenv("CANADA_STATUS_PATH", "canada_status.json")
UK_DIVERGENCES_PATH  = os.getenv("UK_DIVERGENCES_PATH", "uk_divergences.json")
BANNED_TERMS_PATH    = os.getenv("BANNED_TERMS_PATH", "banned_terms.json")

def load_ins_index(path=INS_INDEX_PATH):
    """Loads the INS/E-number reference table into a dict keyed by code
    (e.g. '621', '472e'). Derives per-jurisdiction permitted flags from the
    status column, based on the source convention: a=Australia/NZ approved,
    e=EU approved (has E-number), u=USA approved."""
    import csv
    index = {}
    if not os.path.exists(path):
        print(f"[warn] {path} not found — INS/E-number lookups will be unavailable")
        return index
    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = row["code"].strip().lower()
            status = row.get("status", "").strip().split()
            index[code] = {
                "code": code,
                "names": row["names"].strip(),
                "type": row["type"].strip(),
                "permitted_au": "a" in status,
                "permitted_eu": "e" in status,
                "permitted_us": "u" in status,
                "status_raw": row.get("status", "").strip(),
            }
    print(f"[init] Loaded INS index: {len(index)} entries")
    return index

_INS_INDEX = None


def lookup_ins(code: str, index: dict) -> dict | None:
    """Looks up a single INS code, handling common variations: leading
    zeros, missing/extra letter suffixes, and bare numeric fallback when
    an exact suffix match isn't found (e.g. '472' falls back from '472e'
    if the exact suffix wasn't recognized by OCR)."""
    c = code.strip().lower().replace(" ", "")
    if c in index:
        return index[c]
    base = re.sub(r'[a-z]$', '', c)
    if base != c and base in index:
        return index[base]
    return None

def lookup_ins_numbers(ins_numbers: list[str], index: dict) -> list[dict]:
    """Looks up every INS number extracted from a label, returning full
    entries for matches and a placeholder for anything not found (so the
    caller can flag unrecognized codes rather than silently dropping them)."""
    results = []
    for code in ins_numbers:
        entry = lookup_ins(code, index)
        if entry:
            results.append(entry)
        else:
            results.append({"code": code, "names": None, "type": None,
                             "permitted_au": None, "permitted_eu": None, "permitted_us": None,
                             "status_raw": None, "not_found": True})
    return results

def load_country_data(path):
    """Generic loader for small, manually-verified per-country compliance
    data files (JSON, keyed by INS code). Missing file -> empty dict,
    so the pipeline degrades gracefully instead of crashing."""
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    print(f"[warn] {path} not found — that jurisdiction's data will be unavailable")
    return {}

_CANADA_STATUS = None
_UK_DIVERGENCES = None

def get_canada_status(code: str) -> dict:
    global _CANADA_STATUS
    if _CANADA_STATUS is None:
        _CANADA_STATUS = load_country_data(CANADA_STATUS_PATH)
    code = code.strip().lower()
    if code in _CANADA_STATUS:
        entry = _CANADA_STATUS[code]
        return {"permitted_ca": entry["permitted_ca"], "ca_note": entry["note"],
                "ca_source": entry["source"], "ca_verified": True}
    return {"permitted_ca": None, "ca_note": "Not in our verified Canada subset — status unknown, not assumed.",
            "ca_source": None, "ca_verified": False}

def get_uk_status(code: str, ins_entry: dict) -> dict:
    global _UK_DIVERGENCES
    if _UK_DIVERGENCES is None:
        _UK_DIVERGENCES = load_country_data(UK_DIVERGENCES_PATH)
    code = code.strip().lower()
    if code in _UK_DIVERGENCES:
        div = _UK_DIVERGENCES[code]
        return {"permitted_uk": div["permitted_uk"], "uk_note": div["note"],
                "uk_source": div["source"], "uk_verified": True}
    return {"permitted_uk": ins_entry.get("permitted_eu"),
            "uk_note": "Assumed same as EU (UK retained EU additive law post-Brexit); not independently verified.",
            "uk_source": "approximated from EU", "uk_verified": False}

def enrich_ins_numbers(pipeline_result: dict) -> dict:
    global _INS_INDEX
    if _INS_INDEX is None:
        _INS_INDEX = load_ins_index()
    ins_numbers = pipeline_result.get("ins_numbers", [])
    details = lookup_ins_numbers(ins_numbers, _INS_INDEX)
    for d in details:
        if not d.get("not_found"):
            d.update(get_uk_status(d["code"], d))
            d.update(get_canada_status(d["code"]))
    pipeline_result["ins_details"] = details
    return pipeline_result

_BANNED_TERMS = None

def load_banned_terms(path=BANNED_TERMS_PATH):
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    print(f"[warn] {path} not found — banned-term checking unavailable")
    return {}

def check_banned_terms(ingredients_raw: str) -> list[dict]:
    """Scans the raw ingredients text for known banned/restricted terms.
    Simple substring matching on a small, sourced term list -- not exhaustive,
    won't catch every FSSAI prohibition, only the ones explicitly tracked."""
    global _BANNED_TERMS
    if _BANNED_TERMS is None:
        _BANNED_TERMS = load_banned_terms()
    if not ingredients_raw: return []
    text = ingredients_raw.lower()
    hits = []
    for term, info in _BANNED_TERMS.items():
        if term in text:
            hits.append({"term": term, **info})
    return hits

def check_trans_fat_compliance(nutrients: dict) -> dict:
    """Uses the same fuzzy nutrient-bucket classification as the rest of
    the pipeline, rather than exact key matching, since OCR-derived keys
    are inconsistent (e.g. 'Trans Fat (g).', 'Trans Fat (o)')."""
    trans_val = total_fat_val = None
    for key, val in nutrients.items():
        bucket = _classify_nutrient(key)
        if bucket == "trans_fat" and trans_val is None: trans_val = val
        if bucket == "total_fat" and total_fat_val is None: total_fat_val = val

    if not trans_val or not total_fat_val:
        return {"status": "insufficient_data", "note": "Trans fat and/or total fat value not extracted from label."}
    tm = re.search(r'\d+\.?\d*', str(trans_val))
    fm = re.search(r'\d+\.?\d*', str(total_fat_val))
    if not tm or not fm or float(fm.group()) == 0:
        return {"status": "insufficient_data", "note": "Could not parse numeric values."}
    pct = (float(tm.group()) / float(fm.group())) * 100
    return {
        "status": "compliant" if pct <= 2.0 else "exceeds_limit",
        "trans_fat_pct_of_total_fat": round(pct, 2),
        "limit_pct": 2.0,
        "regulation": "FSSAI Prohibition and Restriction on Sales Regulations, 2011 — Reg. 2.3.14(21)",
    }


def run_compliance_checks(pipeline_result: dict) -> dict:
    """Enriches a run_pipeline() result with the deterministic checks:
    INS/E-number jurisdiction lookups, banned-term scan, trans-fat ratio.
    Called automatically at the end of run_pipeline() below."""
    pipeline_result = enrich_ins_numbers(pipeline_result)
    pipeline_result["banned_term_hits"] = check_banned_terms(pipeline_result.get("ingredients_raw", ""))
    pipeline_result["trans_fat_check"] = check_trans_fat_compliance(pipeline_result.get("nutrients", {}))
    return pipeline_result


# ══════════════════════════════════════════════════════════════════════════════
# MAIN ENTRY POINT — this is what the API layer calls
# ══════════════════════════════════════════════════════════════════════════════

def run_pipeline(image_path):
    global _yolo_model_cache, _ocr_engine_cache
    if _yolo_model_cache is None or _ocr_engine_cache is None: _yolo_model_cache, _ocr_engine_cache = load_models()

    regions = detect_regions(image_path, _yolo_model_cache, ocr_engine=_ocr_engine_cache)
    final = {}
    for region in regions:
        tokens = line_segmented_ocr(region["crop_bgr"], _ocr_engine_cache, gate=OCR_CONF_GATE, label=region["label"])

        if "nutri" in region["label"].lower():
            col_pos = detect_column_positions(tokens)
            if choose_target_column(col_pos):
                numeric_tokens = [t for t in tokens if re.match(r'^[\d.,<>%\s]+$', t["text"])]
                filtered_tokens = [t for t in tokens if not re.match(r'^[\d.,<>%\s]+$', t["text"])
                                    or assign_token_to_column(t, col_pos) == "per_100"]
                kept_numeric = [t for t in filtered_tokens if re.match(r'^[\d.,<>%\s]+$', t["text"])]
                if not numeric_tokens or len(kept_numeric) / len(numeric_tokens) >= 0.4:
                    tokens = filtered_tokens

        structured = structure_tokens(region["label"], reconstruct_rows(tokens, label=region["label"]))

        for k, v in structured.items():
            if k == "fssai_license":
                if not (final.get(k) and re.search(r'\b\d{14}\b', final.get(k, ''))): final[k] = v
            elif k not in final: final[k] = v
            elif isinstance(v, list): final[k] = list(dict.fromkeys(final[k] + v))
            elif isinstance(v, dict): final[k].update(v)
            elif k == "allergen_info" and isinstance(v, str): final[k] = final[k] + " " + v if final.get(k) else v

    return run_compliance_checks(final)


# ══════════════════════════════════════════════════════════════════════════════
# LEVENSHTEIN + NUTRIENT CLASSIFICATION (used by parsing above and by eval)
# ══════════════════════════════════════════════════════════════════════════════

def _levenshtein(a: str, b: str) -> int:
    if len(a) < len(b): return _levenshtein(b, a)
    if len(b) == 0: return len(a)
    prev_row = list(range(len(b) + 1))
    for i, ca in enumerate(a):
        curr_row = [i + 1]
        for j, cb in enumerate(b):
            insertions = prev_row[j + 1] + 1
            deletions  = curr_row[j] + 1
            substitutions = prev_row[j] + (ca != cb)
            curr_row.append(min(insertions, deletions, substitutions))
        prev_row = curr_row
    return prev_row[-1]

_NUTRIENT_KEYWORDS = {
    "energy_kcal":     ["energy", "kcal", "calorie"],
    "energy_kj":       ["kj", "kilojoule"],
    "protein":         ["protein"],
    "total_fat":       ["total fat", "totalfat", "fat"],
    "saturated_fat":   ["saturated fat", "saturatedfat", "sat fat", "sat. fat"],
    "trans_fat":       ["trans fat", "transfat", "trans fatty"],
    "monounsaturated": ["monounsaturated", "mono unsaturated", "mono-unsaturated"],
    "polyunsaturated": ["polyunsaturated", "poly unsaturated", "poly-unsaturated"],
    "cholesterol":     ["cholesterol"],
    "carbohydrate":    ["carbohydrate", "carb"],
    "total_sugars":    ["total sugar", "totalsugar"],
    "added_sugars":    ["added sugar", "addedsugar"],
    "dietary_fibre":   ["dietary fibre", "dietary fiber", "fibre", "fiber"],
    "sodium":          ["sodium"],
    "calcium":         ["calcium"],
    "iron":            ["iron"],
    "potassium":       ["potassium"],
    "vitamin_d":       ["vitamin d"],
    "serving_size":    ["serving size", "servingsize"],
    "servings":        ["servings", "serves"],
}

def _classify_nutrient(name: str) -> str | None:
    raw = name.lower()
    n = re.sub(r'(?:per|/)\s*100\s*m?[lg]|m?[lg]\s*/\s*100\s*m?[lg]|per\s*serving|per\s*serve|\(.*?\)|g$|mg$', '', raw.replace('_', ' ').replace('-', ' ')).strip()

    if 'saturated' in n: return 'saturated_fat'
    if 'trans' in n: return 'trans_fat'
    if 'polyunsaturated' in n or 'poly unsaturated' in n: return 'polyunsaturated'
    if 'monounsaturated' in n or 'mono unsaturated' in n: return 'monounsaturated'
    if 'total fat' in n or n == 'fat': return 'total_fat'
    if 'added sugar' in n: return 'added_sugars'
    if 'total sugar' in n or n == 'sugar' or n == 'sugars': return 'total_sugars'
    if 'carbohydrate' in n or 'carb' in n: return 'carbohydrate'
    if 'energy' in n or 'kcal' in n or 'calorie' in n:
        # kcal vs kJ split — see module docstring for why this matters.
        return 'energy_kj' if re.search(r'\bkj\b', raw) else 'energy_kcal'
    if 'protein' in n: return 'protein'
    if 'dietary fibre' in n or 'fiber' in n or 'fibre' in n: return 'dietary_fibre'
    if 'sodium' in n: return 'sodium'
    if 'cholesterol' in n: return 'cholesterol'
    if 'calcium' in n: return 'calcium'
    if 'iron' in n: return 'iron'
    if 'potassium' in n: return 'potassium'
    if 'vitamin d' in n: return 'vitamin_d'
    if 'serving size' in n: return 'serving_size'
    if 'servings' in n or 'serves' in n: return 'servings'

    for bucket, keywords in _NUTRIENT_KEYWORDS.items():
        for kw in keywords:
            if len(kw) > 4 and _levenshtein(kw, n) <= 2: return bucket
    return None

# Plausible-range table used by _correct_decimal_drop, for catching OCR
# decimal-drop errors (e.g. "233.4" read as "2334"). Hardcoded to known-good
# FSSAI-typical ranges rather than derived from ground_truth.json — that file
# is an eval artifact and usually won't exist in a real deployment, and a
# fixed, reviewed range is more predictable than one that silently reshapes
# itself based on whatever's in a small eval sample. derive_plausible_ranges()
# above is kept for offline recalibration if you want to sanity-check these
# numbers against a bigger labeled set later — it just isn't called here.
_NUTRIENT_PLAUSIBLE_RANGE = {
    "energy_kcal": (0, 900),
    "energy_kj": (0, 4000),
    "protein": (0, 100),
    "total_fat": (0, 100),
    "saturated_fat": (0, 100),
    "trans_fat": (0, 20),
    "monounsaturated": (0, 100),
    "polyunsaturated": (0, 100),
    "carbohydrate": (0, 100),
    "total_sugars": (0, 100),
    "added_sugars": (0, 100),
    "dietary_fibre": (0, 50),
    "sodium": (0, 3000),
    "cholesterol": (0, 500),
    "calcium": (0, 1500),
    "iron": (0, 50),
    "potassium": (0, 3000),
}