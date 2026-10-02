from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_doctor

from app.models.visit import Visit

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

import os
import uuid
import shutil
from pathlib import Path


router = APIRouter(
    prefix="/lesion-images",
    tags=["Lesion Images"]
)


@router.post(
    "/",
    response_model=LesionImageResponse
)
def add_lesion_image(
    image: LesionImageCreate,
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    return create_lesion_image(
        db,
        image,
        current_doctor.id
    )


@router.get(
    "/",
    response_model=list[LesionImageResponse]
)
def get_images(
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    return get_all_images(
        db,
        current_doctor.id
    )


@router.get(
    "/{image_id}",
    response_model=LesionImageResponse
)
def get_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    return get_image_by_id(
        db,
        image_id,
        current_doctor.id
    )


@router.put(
    "/{image_id}",
    response_model=LesionImageResponse
)
def edit_image(
    image_id: int,
    image: LesionImageUpdate,
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    return update_image(
        db,
        image_id,
        image,
        current_doctor.id
    )


@router.delete("/{image_id}")
def remove_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    return delete_image(
        db,
        image_id,
        current_doctor.id
    )


@router.post("/upload")
def upload_lesion_image(
    visit_id: int = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    # Verify that the visit belongs to the logged-in doctor.
    visit = (
        db.query(Visit)
        .join(Visit.patient)
        .filter(
            Visit.id == visit_id,
            Visit.patient.has(
                doctor_id=current_doctor.id
            )
        )
        .first()
    )

    if not visit:
        raise HTTPException(
            status_code=404,
            detail="Visit not found"
        )

    # Validate image content type.
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed."
        )

    file_extension = os.path.splitext(
        image.filename or ""
    )[1].lower()

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    }

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format."
        )

    unique_filename = (
        f"{uuid.uuid4()}{file_extension}"
    )

    backend_dir = Path(__file__).resolve().parents[2]

    upload_dir = backend_dir / "uploads"
    upload_dir.mkdir(
         parents=True,
         exist_ok=True
    )

    file_path = upload_dir / unique_filename

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(
                image.file,
                buffer
            )

        new_image = LesionImage(
            visit_id=visit_id,
            image_path=str(file_path),
        )

        db.add(new_image)
        db.commit()
        db.refresh(new_image)

        return {
            "message": "Image uploaded successfully",
            "image_id": new_image.id,
            "image_path": new_image.image_path
        }

    except Exception:
        if os.path.exists(file_path):
            os.remove(file_path)

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to upload image."
        )