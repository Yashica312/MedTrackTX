from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine

# ============================================================
# IMPORT ALL MODELS
# ============================================================

from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.visit import Visit
from app.models.lesion_image import LesionImage
from app.models.prediction import Prediction
from app.models.abcde_score import Abcde_Score
from app.models.temporal_analysis import TemporalAnalysis
from app.models.report import Report


# ============================================================
# IMPORT ROUTERS
# ============================================================

from app.routers import patient
from app.routers import doctor
from app.routers import visit
from app.routers import lesion_image
from app.routers import prediction
from app.routers import segmentation
from app.routers import explainability
from app.routers import abcde
from app.routers import temporal_analysis
from app.routers import analysis
from app.routers import report

from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router


# ============================================================
# DATABASE
# ============================================================

print(Base.metadata.tables.keys())

Base.metadata.create_all(
    bind=engine
)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="MedTrackTX API",
    version="1.0.0",
    description="Backend API for Skin Lesion Evolution Tracking"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(
    patient.router
)

app.include_router(
    doctor.router
)

app.include_router(
    visit.router
)

app.include_router(
    lesion_image.router
)

app.include_router(
    prediction.router
)

app.include_router(
    segmentation.router
)

app.include_router(
    explainability.router
)

app.include_router(
    abcde.router
)

app.include_router(
    temporal_analysis.router
)

app.include_router(
    analysis.router
)

app.include_router(
    auth_router
)

app.include_router(
    dashboard_router
)

app.include_router(report.router)

# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to MedTrackTX Backend..."
    }


# ============================================================
# STATIC UPLOADS
# ============================================================

app.mount(
    "/uploads",
    StaticFiles(
        directory="app/uploads"
    ),
    name="uploads"
)