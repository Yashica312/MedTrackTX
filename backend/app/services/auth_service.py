from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.doctor import Doctor
from app.schemas.auth import DoctorLogin
from app.utils.security import (
    verify_password,
    create_access_token,
)


def login_doctor(
    db: Session,
    login_data: DoctorLogin,
):
    doctor = (
        db.query(Doctor)
        .filter(Doctor.email == login_data.email)
        .first()
    )

    # DEBUG: confirm the doctor exists
    if not doctor:
        raise HTTPException(
            status_code=401,
            detail="DEBUG: Doctor email not found",
        )

    # DEBUG: confirm password hash exists
    if not doctor.password:
        raise HTTPException(
            status_code=401,
            detail="DEBUG: Doctor has no password stored",
        )

    password_valid = verify_password(
        login_data.password,
        doctor.password,
    )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="DEBUG: Password verification failed",
        )

    token = create_access_token({
        "doctor_id": doctor.id,
        "email": doctor.email,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "doctor_id": doctor.id,
        "full_name": doctor.full_name,
        "email": doctor.email,
    }