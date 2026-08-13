from fastapi import FastAPI

from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

# Import all models
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.visit import Visit
from app.models.lesion_image import LesionImage
from app.models.prediction import Prediction
from app.models.abcde_score import Abcde_Score
from app.models.temporal_analysis import TemporalAnalysis
from app.models.report import Report
from fastapi.staticfiles import StaticFiles

from app.routers import patient
from app.routers import doctor
from app.routers import visit
from app.routers import lesion_image
from app.routers import prediction
from app.routers import segmentation
from app.routers import segmentation
from app.routers import explainability
from app.routers import abcde
from app.routers import temporal_analysis
from app.routers import analysis

print(Base.metadata.tables.keys())
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedTrackTX API",
    version="1.0.0",
    description="Backend API for Skin Lesion Evolution Tracking"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(patient.router)
app.include_router(doctor.router)
app.include_router(doctor.router)
app.include_router(patient.router)
app.include_router(visit.router)
app.include_router(lesion_image.router)
app.include_router(prediction.router)
app.include_router(explainability.router)
app.include_router(
    abcde.router
)
app.include_router(
    temporal_analysis.router
)
app.include_router(
    analysis.router
)



@app.get("/")
def root():
    return {"message": "Welcome to MedTrackTX Backend..."}

app.mount(
    "/uploads",
    StaticFiles(directory="app/uploads"),
    name="uploads"
)