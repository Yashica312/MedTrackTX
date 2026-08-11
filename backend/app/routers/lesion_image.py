from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.lesion_image import (
    LesionImageCreate,
    LesionImageResponse,
    LesionImageUpdate
)

from app.services.lesion_image_service import (
    create_lesion_image,
    get_all_images,
    get_image_by_id,
    update_image,
    delete_image
)
from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form
)
from app.models.lesion_image import LesionImage
from app.models.visit import Visit


import os
import uuid
import shutil

router = APIRouter(
    prefix="/lesion-images",
    tags=["Lesion Images"]
)
@router.post("/", response_model=LesionImageResponse)
def add_lesion_image(
    image: LesionImageCreate,
    db: Session = Depends(get_db)
):
    return create_lesion_image(
        db,
        image
    )
@router.get("/", response_model=list[LesionImageResponse])
def get_images(
    db: Session = Depends(get_db)
):
    return get_all_images(db)

@router.get("/{image_id}", response_model=LesionImageResponse)
def get_image(
    image_id: int,
    db: Session = Depends(get_db)
):
    return get_image_by_id(
        db,
        image_id
    )

@router.put("/{image_id}", response_model=LesionImageResponse)
def edit_image(
    image_id: int,
    image: LesionImageUpdate,
    db: Session = Depends(get_db)
):
    return update_image(
        db,
        image_id,
        image
    )
@router.delete("/{image_id}")
def remove_image(
    image_id: int,
    db: Session = Depends(get_db)
):
    return delete_image(
        db,
        image_id
    )
@router.post("/upload")
def upload_lesion_image(
    visit_id: int = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if visit exists
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

    # Validate image
    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed."
        )

    # Generate unique filename
    file_extension = os.path.splitext(image.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    file_path = f"app/uploads/{unique_filename}"

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Save record in database
    new_image = LesionImage(
        visit_id=visit_id,
        image_path=file_path
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return {
        "message": "Image uploaded successfully",
        "image_id": new_image.id,
        "image_path": new_image.image_path
    }