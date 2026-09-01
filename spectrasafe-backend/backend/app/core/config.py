# """
# App configuration, read from environment variables (see .env.example).
# Uses pydantic-settings so a misconfigured env var fails loudly at startup
# instead of silently as None deep inside a service call.
# """
# import os
# from pydantic_settings import BaseSettings


# class Settings(BaseSettings):
#     # Defaults to a local SQLite file so the app runs with zero setup.
#     # Point DATABASE_URL at Postgres for anything beyond local dev, e.g.:
#     #   postgresql+psycopg2://user:password@localhost:5432/spectrasafe
#     database_url: str = "sqlite:///./spectrasafe.db"

#     # Where the trained YOLO weights / ingredient dictionary / (optional)
#     # eval ground truth live. These override the hardcoded relative paths
#     # ocr_pipeline.py used when it was a standalone notebook script.
#     yolo_weights_path: str = "best (1).pt"
#     ingredient_dict_path: str = "ingredients.txt"
#     ground_truth_path: str = "ground_truth.json"

#     # Compliance-engine reference data (INS/E-number index + per-country
#     # divergence files + banned-term list).
#     ins_index_path: str = "index.csv"
#     canada_status_path: str = "canada_status.json"
#     uk_divergences_path: str = "uk_divergences.json"
#     banned_terms_path: str = "banned_terms.json"

#     # General English word list (dwyl/english-words) — checked before the
#     # narrow ingredient vocabulary so correction doesn't drag real words
#     # ("food", "grade") toward the nearest unrelated ingredient term.
#     english_words_path: str = "words_alpha.txt"

#     # JWT auth. jwt_secret_key has NO safe default -- generate a real one
#     # (e.g. `python -c "import secrets; print(secrets.token_hex(32))"`)
#     # and set it in .env. Left as a placeholder here only so the app
#     # doesn't crash on import before you've configured it; do not ship
#     # this default anywhere real.
#     jwt_secret_key: str = "CHANGE_ME_dev_only_insecure_default"
#     jwt_expire_minutes: int = 60 * 24  # 24h
#     paddle_enable_mkldnn: bool = False

#     cors_origins: list[str] = ["http://localhost:5173"]

#     class Config:
#         env_file = ".env"


# settings = Settings()

# # ocr_pipeline.py reads these paths from os.environ at import time, so make
# # sure they're set before that module is ever imported.
# os.environ.setdefault("YOLO_WEIGHTS_PATH", settings.yolo_weights_path)
# os.environ.setdefault("INGREDIENT_DICT_PATH", settings.ingredient_dict_path)
# os.environ.setdefault("GROUND_TRUTH_PATH", settings.ground_truth_path)
# os.environ.setdefault("INS_INDEX_PATH", settings.ins_index_path)
# os.environ.setdefault("CANADA_STATUS_PATH", settings.canada_status_path)
# os.environ.setdefault("UK_DIVERGENCES_PATH", settings.uk_divergences_path)
# os.environ.setdefault("BANNED_TERMS_PATH", settings.banned_terms_path)
# os.environ.setdefault("ENGLISH_WORDS_PATH", settings.english_words_path)




"""
App configuration, read from environment variables (see .env.example).
Uses pydantic-settings so a misconfigured env var fails loudly at startup
instead of silently as None deep inside a service call.
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Defaults to a local SQLite file so the app runs with zero setup.
    # Point DATABASE_URL at Postgres for anything beyond local dev, e.g.:
    #   postgresql+psycopg2://user:password@localhost:5432/spectrasafe
    database_url: str = "sqlite:///./spectrasafe.db"

    # Where the trained YOLO weights / ingredient dictionary / (optional)
    # eval ground truth live. These override the hardcoded relative paths
    # ocr_pipeline.py used when it was a standalone notebook script.
    yolo_weights_path: str = "best (1).pt"
    ingredient_dict_path: str = "ingredients.txt"
    ground_truth_path: str = "ground_truth.json"

    # Compliance-engine reference data (INS/E-number index + per-country
    # divergence files + banned-term list).
    ins_index_path: str = "index.csv"
    canada_status_path: str = "canada_status.json"
    uk_divergences_path: str = "uk_divergences.json"
    banned_terms_path: str = "banned_terms.json"

    # General English word list (dwyl/english-words) — checked before the
    # narrow ingredient vocabulary so correction doesn't drag real words
    # ("food", "grade") toward the nearest unrelated ingredient term.
    english_words_path: str = "words_alpha.txt"
    encyclopedia_path: str = "encyclopedia.json"

    # JWT auth. jwt_secret_key has NO safe default -- generate a real one
    # (e.g. `python -c "import secrets; print(secrets.token_hex(32))"`)
    # and set it in .env. Left as a placeholder here only so the app
    # doesn't crash on import before you've configured it; do not ship
    # this default anywhere real.
    jwt_secret_key: str = "CHANGE_ME_dev_only_insecure_default"
    jwt_expire_minutes: int = 60 * 24  # 24h
    paddle_enable_mkldnn: bool = False

    cors_origins: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"


settings = Settings()

# ocr_pipeline.py reads these paths from os.environ at import time, so make
# sure they're set before that module is ever imported.
os.environ.setdefault("YOLO_WEIGHTS_PATH", settings.yolo_weights_path)
os.environ.setdefault("INGREDIENT_DICT_PATH", settings.ingredient_dict_path)
os.environ.setdefault("GROUND_TRUTH_PATH", settings.ground_truth_path)
os.environ.setdefault("INS_INDEX_PATH", settings.ins_index_path)
os.environ.setdefault("CANADA_STATUS_PATH", settings.canada_status_path)
os.environ.setdefault("UK_DIVERGENCES_PATH", settings.uk_divergences_path)
os.environ.setdefault("BANNED_TERMS_PATH", settings.banned_terms_path)
os.environ.setdefault("ENGLISH_WORDS_PATH", settings.english_words_path)
os.environ.setdefault("ENCYCLOPEDIA_PATH", settings.encyclopedia_path)