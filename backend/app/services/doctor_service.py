from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.doctor import Doctor
from app.schemas.doctor import (
    DoctorCreate,
    DoctorUpdate
)
from app.utils.security import hash_password


def create_doctor(
    db: Session,
    doctor_data: DoctorCreate
):
    existing_doctor = (
        db.query(Doctor)
        .filter(
            Doctor.email == doctor_data.email
        )
        .first()
    )

    if existing_doctor:
        raise HTTPException(
            status_code=400,
            detail="Doctor with this email already exists"
        )

    new_doctor = Doctor(
        full_name=doctor_data.full_name,
        email=doctor_data.email,
        password=hash_password(
            doctor_data.password
        )
    )

    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)

    return new_doctor


def get_all_doctors(
    db: Session
):
    return db.query(Doctor).all()


def get_doctor_by_id(
    db: Session,
    doctor_id: int
):
    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.id == doctor_id
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    return doctor


def update_doctor(
    db: Session,
    doctor_id: int,
    doctor_data: DoctorUpdate
):
    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.id == doctor_id
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    update_data = doctor_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():

        if key == "password":
            value = hash_password(value)

        setattr(
            doctor,
            key,
            value
        )

    db.commit()
    db.refresh(doctor)

    return doctor


def delete_doctor(
    db: Session,
    doctor_id: int
):
    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.id == doctor_id
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    db.delete(doctor)
    db.commit()

    return {
        "message": "Doctor deleted successfully"
    }