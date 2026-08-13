from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.doctor import Doctor
from app.utils.security import decode_access_token


security = HTTPBearer()


def get_current_doctor(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    doctor_id = payload.get("doctor_id")

    if not doctor_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )

    doctor = (
        db.query(Doctor)
        .filter(Doctor.id == int(doctor_id))
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=401,
            detail="Doctor not found",
        )

    return doctor