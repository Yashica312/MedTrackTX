from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.visit import (
    VisitCreate,
    VisitResponse,
    VisitUpdate
)

from app.services.visit_service import (
    create_visit,
    get_all_visits,
    get_visit_by_id,
    update_visit,
    delete_visit
)


router = APIRouter(
    prefix="/visits",
    tags=["Visits"]
)

@router.post("/", response_model=VisitResponse)
def add_visit(
    visit: VisitCreate,
    db: Session = Depends(get_db)
):
    return create_visit(
        db,
        visit
    )
@router.get("/", response_model=list[VisitResponse])
def get_visits(
    db: Session = Depends(get_db)
):
    return get_all_visits(db)

@router.get("/{visit_id}", response_model=VisitResponse)
def get_visit(
    visit_id: int,
    db: Session = Depends(get_db)
):
    return get_visit_by_id(
        db,
        visit_id
    )

@router.put("/{visit_id}", response_model=VisitResponse)
def edit_visit(
    visit_id: int,
    visit: VisitUpdate,
    db: Session = Depends(get_db)
):
    return update_visit(
        db,
        visit_id,
        visit
    )

@router.delete("/{visit_id}")
def remove_visit(
    visit_id: int,
    db: Session = Depends(get_db)
):
    return delete_visit(
        db,
        visit_id
    )
