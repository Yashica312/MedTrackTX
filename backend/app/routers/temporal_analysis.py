from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException
)

import os
import tempfile

from app.services.temporal_analysis_service import (
    analyze_temporal
)


router = APIRouter(
    prefix="/temporal-analysis",
    tags=["Temporal Analysis"]
)


@router.post("/")
async def temporal_analysis(
    previous_image: UploadFile = File(...),
    current_image: UploadFile = File(...)
):

    if not previous_image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Previous file must be an image."
        )

    if not current_image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Current file must be an image."
        )

    previous_path = None
    current_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".jpg"
        ) as f:

            previous_path = f.name
            f.write(
                await previous_image.read()
            )

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".jpg"
        ) as f:

            current_path = f.name
            f.write(
                await current_image.read()
            )

        result = analyze_temporal(
            previous_path,
            current_path
        )

        return {
            "success": True,
            "previous_filename": previous_image.filename,
            "current_filename": current_image.filename,
            "temporal_analysis": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Temporal analysis failed: {str(e)}"
        )

    finally:

        if previous_path and os.path.exists(previous_path):
            os.remove(previous_path)

        if current_path and os.path.exists(current_path):
            os.remove(current_path)