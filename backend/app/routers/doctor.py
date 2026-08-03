from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.doctor import DoctorCreate, DoctorResponse
from app.services.doctor_service import create_doctor

router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"]
)

@router.post("/", response_model=DoctorResponse)
def add_doctor(
    doctor: DoctorCreate,
    db: Session = Depends(get_db)
):
    return create_doctor(db, doctor)
from app.services.doctor_service import (
    create_doctor,
    get_all_doctors
)

@router.get("/", response_model=list[DoctorResponse])
def get_doctors(
    db: Session = Depends(get_db)
):
    return get_all_doctors(db)

from app.services.doctor_service import (
    create_doctor,
    get_all_doctors,
    get_doctor_by_id,
    update_doctor,
    delete_doctor
)
@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    return get_doctor_by_id(db, doctor_id)
from app.schemas.doctor import (
    DoctorCreate,
    DoctorResponse,
    DoctorUpdate
)
@router.put("/{doctor_id}", response_model=DoctorResponse)
def edit_doctor(
    doctor_id: int,
    doctor: DoctorUpdate,
    db: Session = Depends(get_db)
):
    return update_doctor(
        db,
        doctor_id,
        doctor
    )
@router.delete("/{doctor_id}")
def remove_doctor(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    return delete_doctor(
        db,
        doctor_id
    )
