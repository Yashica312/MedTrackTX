from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_doctor
from app.models.doctor import Doctor

from app.schemas.visit import (
    VisitCreate,
    VisitResponse,
    VisitUpdate,
)

from app.services.visit_service import (
    create_visit,
    get_all_visits,
    get_visit_by_id,
    update_visit,
    delete_visit,
)


router = APIRouter(
    prefix="/visits",
    tags=["Visits"],
)


@router.post(
    "/",
    response_model=VisitResponse,
)
def add_visit(
    visit: VisitCreate,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor),
):
    return create_visit(
        db,
        visit,
        current_doctor.id,
    )


@router.get(
    "/",
    response_model=list[VisitResponse],
)
def get_visits(
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor),
):
    return get_all_visits(
        db,
        current_doctor.id,
    )


@router.get(
    "/{visit_id}",
    response_model=VisitResponse,
)
def get_visit(
    visit_id: int,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor),
):
    return get_visit_by_id(
        db,
        visit_id,
        current_doctor.id,
    )


@router.put(
    "/{visit_id}",
    response_model=VisitResponse,
)
def edit_visit(
    visit_id: int,
    visit: VisitUpdate,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor),
):
    return update_visit(
        db,
        visit_id,
        visit,
        current_doctor.id,
    )


@router.delete("/{visit_id}")
def remove_visit(
    visit_id: int,
    db: Session = Depends(get_db),
    current_doctor: Doctor = Depends(get_current_doctor),
):
    return delete_visit(
        db,
        visit_id,
        current_doctor.id,
    )