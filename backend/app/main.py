from fastapi import FastAPI

from app.database import Base, engine

# Import all models
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.visit import Visit
from app.models.lesion_image import LesionImage
from app.models.prediction import Prediction
from app.models.abcde import ABCDE
from app.models.temporal_analysis import TemporalAnalysis
from app.models.report import Report

from app.routers import patient
from app.routers import doctor
from app.routers import visit


print(Base.metadata.tables.keys())
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MedTrackTX API",
    version="1.0.0",
    description="Backend API for Skin Lesion Evolution Tracking"
)
app.include_router(patient.router)
app.include_router(doctor.router)
app.include_router(doctor.router)
app.include_router(patient.router)
app.include_router(visit.router)


@app.get("/")
def root():
    return {"message": "Welcome to MedTrackTX Backend 🚀"}