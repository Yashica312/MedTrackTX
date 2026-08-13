from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_doctor

from app.models.doctor import Doctor

from app.schemas.patient import (
    PatientCreate,
    PatientResponse,
    PatientUpdate
)

from app.services.patient_service import (
    create_patient,
    get_all_patients,
    get_patient_by_id,
    update_patient,
    delete_patient
)


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


@router.post(
    "/",
    response_model=PatientResponse
)
def add_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(
        get_current_doctor
    )
):
    return create_patient(
        db,
        patient,
        current_doctor.id
    )


@router.get(
    "/",
    response_model=list[PatientResponse]
)
def get_patients(
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(
        get_current_doctor
    )
):
    return get_all_patients(
        db,
        current_doctor.id
    )


@router.get(
    "/{patient_id}",
    response_model=PatientResponse
)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(
        get_current_doctor
    )
):
    return get_patient_by_id(
        db,
        patient_id,
        current_doctor.id
    )


@router.put(
    "/{patient_id}",
    response_model=PatientResponse
)
def edit_patient(
    patient_id: int,
    patient: PatientUpdate,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(
        get_current_doctor
    )
):
    return update_patient(
        db,
        patient_id,
        patient,
        current_doctor.id
    )


@router.delete(
    "/{patient_id}"
)
def remove_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(
        get_current_doctor
    )
):
    return delete_patient(
        db,
        patient_id,
        current_doctor.id
    )