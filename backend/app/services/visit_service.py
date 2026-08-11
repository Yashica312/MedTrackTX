from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.visit import Visit
from app.models.patient import Patient

from app.schemas.visit import (
    VisitCreate,
    VisitUpdate
)


def create_visit(
    db: Session,
    visit_data: VisitCreate
):
    patient = (
        db.query(Patient)
        .filter(Patient.id == visit_data.patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    new_visit = Visit(
        patient_id=visit_data.patient_id,
        visit_date=visit_data.visit_date,
        symptoms=visit_data.symptoms,
        doctor_notes=visit_data.doctor_notes
    )

    db.add(new_visit)
    db.commit()
    db.refresh(new_visit)

    return new_visit

def get_all_visits(db: Session):
    return db.query(Visit).all()
def get_visit_by_id(
    db: Session,
    visit_id: int
):
    visit = (
        db.query(Visit)
        .filter(Visit.id == visit_id)
        .first()
    )

    if not visit:
        raise HTTPException(
            status_code=404,
            detail="Visit not found"
        )

    return visit

def update_visit(
    db: Session,
    visit_id: int,
    visit_data: VisitUpdate
):
    visit = (
        db.query(Visit)
        .filter(Visit.id == visit_id)
        .first()
    )

    if not visit:
        raise HTTPException(
            status_code=404,
            detail="Visit not found"
        )

    update_data = visit_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(
            visit,
            key,
            value
        )

    db.commit()
    db.refresh(visit)

    return visit

def delete_visit(
    db: Session,
    visit_id: int
):
    visit = (
        db.query(Visit)
        .filter(Visit.id == visit_id)
        .first()
    )

    if not visit:
        raise HTTPException(
            status_code=404,
            detail="Visit not found"
        )

    db.delete(visit)
    db.commit()

    return {
        "message": "Visit deleted successfully"
    }