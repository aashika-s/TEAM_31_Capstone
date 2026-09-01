# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from app.core.config import settings
# from app.core.database import init_db
# from app.api.v1.scans import router as scans_router
# from app.api.v1.products import router as products_router
# from app.api.v1.auth import router as auth_router
# from app.services.ocr_pipeline import warm_up_models

# app = FastAPI(title="SpectraSafe API", version="0.1.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.cors_origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(auth_router)
# app.include_router(scans_router)
# app.include_router(products_router)


# @app.on_event("startup")
# def on_startup():
#     init_db()
#     # Loads YOLO/PaddleOCR/EasyOCR into memory once at boot instead of on
#     # the first request — comment out while iterating on non-OCR endpoints
#     # if you want faster reload cycles.
#     warm_up_models()


# @app.get("/health")
# def health():
#     return {"status": "ok"}





# PHASE 4
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from app.core.config import settings
# from app.core.database import init_db
# from app.api.v1.scans import router as scans_router
# from app.api.v1.products import router as products_router
# from app.api.v1.auth import router as auth_router
# from app.api.v1.flags import router as flags_router
# from app.services.ocr_pipeline import warm_up_models

# app = FastAPI(title="SpectraSafe API", version="0.1.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.cors_origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(auth_router)
# app.include_router(scans_router)
# app.include_router(products_router)
# app.include_router(flags_router)


# @app.on_event("startup")
# def on_startup():
#     init_db()
#     # Loads YOLO/PaddleOCR/EasyOCR into memory once at boot instead of on
#     # the first request — comment out while iterating on non-OCR endpoints
#     # if you want faster reload cycles.
#     warm_up_models()


# @app.get("/health")
# def health():
#     return {"status": "ok"}











from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.scans import router as scans_router
from app.api.v1.products import router as products_router
from app.api.v1.auth import router as auth_router
from app.api.v1.flags import router as flags_router
from app.api.v1.encyclopedia import router as encyclopedia_router
from app.services.ocr_pipeline import warm_up_models
from app.api.v1 import notices

app = FastAPI(title="SpectraSafe API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(scans_router)
app.include_router(products_router)
app.include_router(flags_router)
app.include_router(encyclopedia_router)
app.include_router(notices.router)


@app.on_event("startup")
def on_startup():
    init_db()
    # Loads YOLO/PaddleOCR/EasyOCR into memory once at boot instead of on
    # the first request — comment out while iterating on non-OCR endpoints
    # if you want faster reload cycles.
    warm_up_models()


@app.get("/health")
def health():
    return {"status": "ok"}