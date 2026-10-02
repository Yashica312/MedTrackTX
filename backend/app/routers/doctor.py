from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_doctor

from app.schemas.doctor import (
    DoctorCreate,
    DoctorResponse,
    DoctorUpdate
)

from app.services.doctor_service import (
    create_doctor,
    get_all_doctors,
    get_doctor_by_id,
    update_doctor,
    delete_doctor
)


router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"]
)


# ============================================================
# REGISTER DOCTOR
# ============================================================

@router.post(
    "/",
    response_model=DoctorResponse
)
def add_doctor(
    doctor: DoctorCreate,
    db: Session = Depends(get_db)
):
    return create_doctor(
        db,
        doctor
    )


# ============================================================
# GET DOCTORS
# ============================================================

@router.get(
    "/",
    response_model=list[DoctorResponse]
)
def get_doctors(
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    return get_all_doctors(db)


# ============================================================
# GET DOCTOR
# ============================================================

@router.get(
    "/{doctor_id}",
    response_model=DoctorResponse
)
def get_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    if doctor_id != current_doctor.id:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=403,
            detail="You can only access your own doctor profile."
        )

    return get_doctor_by_id(
        db,
        doctor_id
    )


# ============================================================
# UPDATE DOCTOR
# ============================================================

@router.put(
    "/{doctor_id}",
    response_model=DoctorResponse
)
def edit_doctor(
    doctor_id: int,
    doctor: DoctorUpdate,
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    if doctor_id != current_doctor.id:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=403,
            detail="You can only update your own doctor profile."
        )

    return update_doctor(
        db,
        doctor_id,
        doctor
    )


# ============================================================
# DELETE DOCTOR
# ============================================================

@router.delete(
    "/{doctor_id}"
)
def remove_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    if doctor_id != current_doctor.id:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=403,
            detail="You can only delete your own doctor account."
        )

    return delete_doctor(
        db,
        doctor_id
    )