
import json
import re
import sys
import traceback
from pathlib import Path
from difflib import SequenceMatcher

# Project paths
APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
PIPELINE_DIR = APP_DIR / "services"
IMAGE_DIR = APP_DIR / "data" / "test_images"
GROUND_TRUTH_PATH = BACKEND_DIR / "data" / "ground_truth.json"
MODEL_PATH = APP_DIR / "models" / "best (2).pt"

# Make the services directory importable
sys.path.insert(0, str(PIPELINE_DIR))
import ocr_pipeline as pipeline

# Keep paths explicit for this evaluation run.
pipeline.YOLO_WEIGHTS = str(MODEL_PATH)
pipeline.GROUND_TRUTH_PATH = str(GROUND_TRUTH_PATH)

def normalize_text(text):
    return re.sub(r"\s+", " ", str(text or "").lower()).strip()

def character_error_rate(predicted, truth):
    """CER = Levenshtein distance / reference character count."""
    a, b = normalize_text(predicted), normalize_text(truth)

    if not b:
        return 0.0 if not a else 1.0

    previous = list(range(len(b) + 1))
    for i, char_a in enumerate(a, start=1):
        current = [i]
        for j, char_b in enumerate(b, start=1):
            current.append(min(
                current[-1] + 1,
                previous[j] + 1,
                previous[j - 1] + (char_a != char_b)
            ))
        previous = current

    return previous[-1] / len(b)

def nutrient_number(value):
    match = re.search(r"\d+(?:\.\d+)?", str(value or "").replace(",", ""))
    return float(match.group()) if match else None

def nutrient_key(key):
    key = normalize_text(key)
    key = re.sub(r"[^a-z0-9]+", "_", key).strip("_")

    aliases = {
        "energy": "energy_kcal",
        "energy_kcal": "energy_kcal",
        "calories": "energy_kcal",
        "protein": "protein_g",
        "protein_g": "protein_g",
        "carbohydrate": "carbohydrate_g",
        "carbohydrates": "carbohydrate_g",
        "carbohydrate_g": "carbohydrate_g",
        "total_carbohydrate": "carbohydrate_g",
        "total_sugars": "total_sugars_g",
        "total_sugars_g": "total_sugars_g",
        "sugars": "total_sugars_g",
        "added_sugars": "added_sugars_g",
        "added_sugars_g": "added_sugars_g",
        "total_fat": "total_fat_g",
        "total_fat_g": "total_fat_g",
        "fat": "total_fat_g",
        "saturated_fat": "saturated_fat_g",
        "saturated_fat_g": "saturated_fat_g",
        "trans_fat": "trans_fat_g",
        "trans_fat_g": "trans_fat_g",
        "cholesterol": "cholesterol_mg",
        "cholesterol_mg": "cholesterol_mg",
        "sodium": "sodium_mg",
        "sodium_mg": "sodium_mg",
    }
    return aliases.get(key, key)

def compare_nutrients(predicted, truth):
    pred_map = {}
    for key, value in (predicted or {}).items():
        pred_map.setdefault(nutrient_key(key), value)

    details = []
    correct = 0

    for true_key, true_value in truth.items():
        key = nutrient_key(true_key)
        pred_value = pred_map.get(key)

        expected_number = nutrient_number(true_value)
        predicted_number = nutrient_number(pred_value)

        # Values must be numeric matches; the tolerance is 0.01.
        # Unit conversion is deliberately not performed.
        matched = (
            expected_number is not None
            and predicted_number is not None
            and abs(expected_number - predicted_number) < 0.01
        )

        if matched:
            correct += 1

        details.append({
            "field": true_key,
            "expected": true_value,
            "predicted": pred_value,
            "correct": matched,
        })

    return correct, len(truth), details

def main():
    if not GROUND_TRUTH_PATH.is_file():
        raise FileNotFoundError(f"Ground truth not found: {GROUND_TRUTH_PATH}")
    if not MODEL_PATH.is_file():
        raise FileNotFoundError(f"YOLO checkpoint not found: {MODEL_PATH}")
    if not IMAGE_DIR.is_dir():
        raise FileNotFoundError(f"Image directory not found: {IMAGE_DIR}")

    with GROUND_TRUTH_PATH.open(encoding="utf-8") as f:
        ground_truth = json.load(f)

    print("Ground truth:", GROUND_TRUTH_PATH)
    print("YOLO model:", MODEL_PATH)
    print("Test images:", IMAGE_DIR)
    print("Ground-truth entries:", len(ground_truth))

    results = []
    failures = []

    for filename, truth in ground_truth.items():
        image_path = IMAGE_DIR / Path(filename).name

        print(f"\n{'=' * 65}\n{filename}\n{'=' * 65}")

        if not image_path.is_file():
            message = f"Image not found: {image_path}"
            print("FAILED:", message)
            failures.append({"image": filename, "error": message})
            continue

        try:
            predicted = pipeline.run_pipeline(str(image_path))
            if not isinstance(predicted, dict):
                raise TypeError(
                    f"Expected pipeline dict, got {type(predicted).__name__}"
                )
        except Exception as exc:
            print(f"FAILED: {type(exc).__name__}: {exc}")
            failures.append({
                "image": filename,
                "error": f"{type(exc).__name__}: {exc}",
            })
            continue

        result = {"image": filename}

        if truth.get("ingredients_true"):
            predicted_ingredients = predicted.get("ingredients_raw")
            if not predicted_ingredients:
                predicted_ingredients = " ".join(
                    str(x) for x in predicted.get("ingredients", [])
                )

            cer = character_error_rate(
                predicted_ingredients,
                truth["ingredients_true"]
            )
            result["ingredients_cer"] = cer
            print(f"Ingredients CER: {cer:.1%}")

        if truth.get("nutrients_true"):
            correct, total, details = compare_nutrients(
                predicted.get("nutrients", {}),
                truth["nutrients_true"]
            )
            result["nutrients_correct"] = correct
            result["nutrients_total"] = total
            result["nutrient_accuracy"] = correct / total if total else None
            print(
                f"Nutrient field accuracy: {correct}/{total} "
                f"({correct / total:.1%})" if total else
                "Nutrient field accuracy: not available"
            )

            for item in details:
                if not item["correct"]:
                    print(
                        f"  MISMATCH {item['field']}: "
                        f"expected={item['expected']!r}, "
                        f"predicted={item['predicted']!r}"
                    )

        if truth.get("fssai_license_true"):
            expected = re.sub(
                r"\D", "", str(truth["fssai_license_true"])
            )
            actual = re.sub(
                r"\D", "", str(predicted.get("fssai_license", "") or "")
            )
            matched = bool(expected) and expected == actual
            result["fssai_correct"] = matched
            print(f"FSSAI licence exact match: {matched}")

        results.append(result)

    cer_values = [
        r["ingredients_cer"] for r in results
        if "ingredients_cer" in r
    ]
    nutrient_correct = sum(r.get("nutrients_correct", 0) for r in results)
    nutrient_total = sum(r.get("nutrients_total", 0) for r in results)

    license_results = [
        r["fssai_correct"] for r in results if "fssai_correct" in r
    ]

    summary = {
        "ground_truth_entries": len(ground_truth),
        "successful_pipeline_runs": len(results),
        "failed_images": len(failures),
        "average_ingredients_cer": (
            sum(cer_values) / len(cer_values) if cer_values else None
        ),
        "nutrient_field_accuracy_micro": (
            nutrient_correct / nutrient_total if nutrient_total else None
        ),
        "nutrient_fields_correct": nutrient_correct,
        "nutrient_fields_total": nutrient_total,
        "fssai_license_accuracy": (
            sum(license_results) / len(license_results)
            if license_results else None
        ),
        "fssai_licenses_correct": sum(license_results),
        "fssai_licenses_evaluated": len(license_results),
        "failures": failures,
        "per_image": results,
    }

    print(f"\n{'=' * 65}\nAGGREGATE RESULTS\n{'=' * 65}")
    print(json.dumps(summary, indent=2, ensure_ascii=False))

    output_path = APP_DIR / "evaluation_results.json"
    output_path.write_text(
        json.dumps(summary, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )
    print(f"\nFull results saved to: {output_path}")

if __name__ == "__main__":
    main()
