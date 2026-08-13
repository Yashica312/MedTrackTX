from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.visit import Visit
from app.schemas.visit import VisitCreate, VisitUpdate


def create_visit(
    db: Session,
    visit_data: VisitCreate,
    doctor_id: int,
):
    patient = (
        db.query(Patient)
        .filter(
            Patient.id == visit_data.patient_id,
            Patient.doctor_id == doctor_id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    new_visit = Visit(
        patient_id=visit_data.patient_id,
        visit_date=visit_data.visit_date,
        symptoms=visit_data.symptoms,
        doctor_notes=visit_data.doctor_notes,
    )

    db.add(new_visit)
    db.commit()
    db.refresh(new_visit)

    return new_visit


def get_all_visits(
    db: Session,
    doctor_id: int,
):
    return (
        db.query(Visit)
        .join(Patient, Visit.patient_id == Patient.id)
        .filter(Patient.doctor_id == doctor_id)
        .all()
    )


def get_visit_by_id(
    db: Session,
    visit_id: int,
    doctor_id: int,
):
    visit = (
        db.query(Visit)
        .join(Patient, Visit.patient_id == Patient.id)
        .filter(
            Visit.id == visit_id,
            Patient.doctor_id == doctor_id,
        )
        .first()
    )

    if not visit:
        raise HTTPException(
            status_code=404,
            detail="Visit not found",
        )

    return visit


def update_visit(
    db: Session,
    visit_id: int,
    visit_data: VisitUpdate,
    doctor_id: int,
):
    visit = (
        db.query(Visit)
        .join(Patient, Visit.patient_id == Patient.id)
        .filter(
            Visit.id == visit_id,
            Patient.doctor_id == doctor_id,
        )
        .first()
    )

    if not visit:
        raise HTTPException(
            status_code=404,
            detail="Visit not found",
        )

    update_data = visit_data.model_dump(
        exclude_unset=True
    )

    # If patient_id is being changed, make sure
    # the new patient also belongs to this doctor.
    if "patient_id" in update_data:
        new_patient = (
            db.query(Patient)
            .filter(
                Patient.id == update_data["patient_id"],
                Patient.doctor_id == doctor_id,
            )
            .first()
        )

        if not new_patient:
            raise HTTPException(
                status_code=404,
                detail="Patient not found",
            )

    for key, value in update_data.items():
        setattr(visit, key, value)

    db.commit()
    db.refresh(visit)

    return visit


def delete_visit(
    db: Session,
    visit_id: int,
    doctor_id: int,
):
    visit = (
        db.query(Visit)
        .join(Patient, Visit.patient_id == Patient.id)
        .filter(
            Visit.id == visit_id,
            Patient.doctor_id == doctor_id,
        )
        .first()
    )

    if not visit:
        raise HTTPException(
            status_code=404,
            detail="Visit not found",
        )

    db.delete(visit)
    db.commit()

    return {
        "message": "Visit deleted successfully"
    }