from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.patient import Patient
from app.models.doctor import Doctor

from app.schemas.patient import PatientCreate, PatientUpdate


def create_patient(
    db: Session,
    patient_data: PatientCreate
):
     doctor = (
        db.query(Doctor)
        .filter(Doctor.id == patient_data.doctor_id)
        .first()
    )
     if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )
     new_patient = Patient(
    doctor_id=patient_data.doctor_id,
    full_name=patient_data.full_name,
    age=patient_data.age,
    gender=patient_data.gender,
    phone=patient_data.phone,
    email=patient_data.email
)
     db.add(new_patient)
     db.commit()
     db.refresh(new_patient)
     return new_patient

def get_all_patients(db: Session):
    return db.query(Patient).all()

def get_patient_by_id(
    db: Session,
    patient_id: int
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return patient

def get_all_patients(db: Session):
    return db.query(Patient).all()

def get_patient_by_id(
    db: Session,
    patient_id: int
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return patient

def update_patient(
    db: Session,
    patient_id: int,
    patient_data: PatientUpdate
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    update_data = patient_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(patient, key, value)

    db.commit()
    db.refresh(patient)

    return patient

def delete_patient(
    db: Session,
    patient_id: int
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    db.delete(patient)
    db.commit()

    return {
        "message": "Patient deleted successfully"
    }
