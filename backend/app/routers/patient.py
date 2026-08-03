from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.patient import PatientCreate, PatientResponse
from app.services.patient_service import (
    create_patient,
    get_all_patients,
    PatientUpdate,
    get_patient_by_id,
    update_patient,
    delete_patient
)



router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)

@router.post("/", response_model=PatientResponse)
def add_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db)
):
    return create_patient(db, patient)

@router.get("/", response_model=list[PatientResponse])
def get_patients(
    db: Session = Depends(get_db)
):
    return get_all_patients(db)

@router.put("/{patient_id}", response_model=PatientResponse)
def edit_patient(
    patient_id: int,
    patient: PatientUpdate,
    db: Session = Depends(get_db)
):
    return update_patient(
        db,
        patient_id,
        patient
    )
@router.delete("/{patient_id}")
def remove_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    return delete_patient(
        db,
        patient_id
    )