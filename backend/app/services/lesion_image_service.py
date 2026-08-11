from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.lesion_image import LesionImage
from app.models.visit import Visit

from app.schemas.lesion_image import (
    LesionImageCreate,
    LesionImageUpdate
)

def create_lesion_image(
    db: Session,
    image_data: LesionImageCreate
):
    visit = (
        db.query(Visit)
        .filter(Visit.id == image_data.visit_id)
        .first()
    )

    if not visit:
        raise HTTPException(
            status_code=404,
            detail="Visit not found"
        )

    new_image = LesionImage(
        visit_id=image_data.visit_id,
        image_path=image_data.image_path
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return new_image

def get_all_images(db: Session):
    return db.query(LesionImage).all()
def get_image_by_id(
    db: Session,
    image_id: int
):
    image = (
        db.query(LesionImage)
        .filter(LesionImage.id == image_id)
        .first()
    )

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

    return image

def update_image(
    db: Session,
    image_id: int,
    image_data: LesionImageUpdate
):
    image = (
        db.query(LesionImage)
        .filter(LesionImage.id == image_id)
        .first()
    )

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

    update_data = image_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(image, key, value)

    db.commit()
    db.refresh(image)

    return image

def delete_image(
    db: Session,
    image_id: int
):
    image = (
        db.query(LesionImage)
        .filter(LesionImage.id == image_id)
        .first()
    )

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

    db.delete(image)
    db.commit()

    return {
        "message": "Image deleted successfully"
    }       