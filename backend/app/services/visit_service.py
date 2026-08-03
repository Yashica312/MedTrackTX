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

