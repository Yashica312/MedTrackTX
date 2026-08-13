from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import DoctorLogin, LoginResponse
from app.services.auth_service import login_doctor


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_model=LoginResponse
)
def doctor_login(
    login_data: DoctorLogin,
    db: Session = Depends(get_db)
):
    return login_doctor(db, login_data)