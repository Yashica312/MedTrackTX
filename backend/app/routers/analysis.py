from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends
)

from sqlalchemy.orm import Session

import os
import tempfile

from app.database import get_db

from app.services.analysis_service import (
    analyze_patient_lesion
)


router = APIRouter(
    prefix="/analysis",
    tags=["Complete AI Analysis"]
)


@router.post("/")
async def complete_analysis(
    visit_id: int,
    current_image: UploadFile = File(...),
    previous_image: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):

    if not current_image.content_type:
        raise HTTPException(
            status_code=400,
            detail="Current image is required."
        )

    if not current_image.content_type.startswith(
        "image/"
    ):
        raise HTTPException(
            status_code=400,
            detail="Current file must be an image."
        )

    current_path = None
    previous_path = None

    try:

        # ================================================
        # CURRENT IMAGE
        # ================================================

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".jpg"
        ) as file:

            current_path = file.name

            file.write(
                await current_image.read()
            )


        # ================================================
        # PREVIOUS IMAGE
        # ================================================

        if previous_image:

            if not previous_image.content_type.startswith(
                "image/"
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Previous file must be an image."
                )

            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=".jpg"
            ) as file:

                previous_path = file.name

                file.write(
                    await previous_image.read()
                )


        # ================================================
        # COMPLETE AI + DB
        # ================================================

        result = analyze_patient_lesion(
            db=db,
            current_image_path=current_path,
            visit_id=visit_id,
            previous_image_path=previous_path
        )


        return {
            "success": True,
            "visit_id": visit_id,
            "current_filename":
                current_image.filename,
            "previous_filename":
                previous_image.filename
                if previous_image
                else None,
            "analysis": result
        }


    except HTTPException:
        raise


    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Complete analysis failed: {str(e)}"
        )


    finally:

        if current_path and os.path.exists(
            current_path
        ):
            os.remove(
                current_path
            )

        if previous_path and os.path.exists(
            previous_path
        ):
            os.remove(
                previous_path
            )