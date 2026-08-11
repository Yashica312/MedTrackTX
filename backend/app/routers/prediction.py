from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import shutil
import tempfile

from app.services.prediction_service import predict_skin_lesion


router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


@router.post("/")
async def predict_lesion(
    image: UploadFile = File(...)
):
    """
    Upload a dermoscopic image and get
    ViT skin lesion classification.
    """

    # Validate image
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed."
        )

    temp_path = None

    try:
        # Create temporary file
        suffix = os.path.splitext(image.filename or ".jpg")[1]

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_path = temp_file.name

            shutil.copyfileobj(
                image.file,
                temp_file
            )

        # Run ViT prediction
        result = predict_skin_lesion(temp_path)

        return {
            "success": True,
            "filename": image.filename,
            "prediction": result["prediction"],
            "confidence": result["confidence"]
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

    finally:
        # Remove temporary file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)