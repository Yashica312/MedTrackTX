from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.visit import (
    VisitCreate,
    VisitResponse
)

from app.services.visit_service import (
    create_visit
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

