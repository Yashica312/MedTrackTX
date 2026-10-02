from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.visit import Visit
from app.models.lesion_image import LesionImage

from app.schemas.lesion_image import (
    LesionImageCreate,
    LesionImageUpdate
)


def _get_owned_visit(
    db: Session,
    visit_id: int,
    doctor_id: int
):
    visit = (
        db.query(Visit)
        .join(Patient, Visit.patient_id == Patient.id)
        .filter(
            Visit.id == visit_id,
            Patient.doctor_id == doctor_id
        )
        .first()
    )

    if not visit:
        raise HTTPException(
            status_code=404,
            detail="Visit not found"
        )

    return visit


def _get_owned_image(
    db: Session,
    image_id: int,
    doctor_id: int
):
    image = (
        db.query(LesionImage)
        .join(Visit, LesionImage.visit_id == Visit.id)
        .join(Patient, Visit.patient_id == Patient.id)
        .filter(
            LesionImage.id == image_id,
            Patient.doctor_id == doctor_id
        )
        .first()
    )

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

    return image


def create_lesion_image(
    db: Session,
    image_data: LesionImageCreate,
    doctor_id: int
):
    _get_owned_visit(
        db,
        image_data.visit_id,
        doctor_id
    )

    new_image = LesionImage(
        visit_id=image_data.visit_id,
        image_path=image_data.image_path
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return new_image


def get_all_images(
    db: Session,
    doctor_id: int
):
    return (
        db.query(LesionImage)
        .join(Visit, LesionImage.visit_id == Visit.id)
        .join(Patient, Visit.patient_id == Patient.id)
        .filter(Patient.doctor_id == doctor_id)
        .all()
    )


def get_image_by_id(
    db: Session,
    image_id: int,
    doctor_id: int
):
    return _get_owned_image(
        db,
        image_id,
        doctor_id
    )


def update_image(
    db: Session,
    image_id: int,
    image_data: LesionImageUpdate,
    doctor_id: int
):
    image = _get_owned_image(
        db,
        image_id,
        doctor_id
    )

    update_data = image_data.model_dump(
        exclude_unset=True
    )

    if "visit_id" in update_data:
        _get_owned_visit(
            db,
            update_data["visit_id"],
            doctor_id
        )

    for key, value in update_data.items():
        setattr(image, key, value)

    db.commit()
    db.refresh(image)

    return image


def delete_image(
    db: Session,
    image_id: int,
    doctor_id: int
):
    image = _get_owned_image(
        db,
        image_id,
        doctor_id
    )

    db.delete(image)
    db.commit()

    return {
        "message": "Image deleted successfully"
    }