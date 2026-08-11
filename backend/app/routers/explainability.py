from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse

import os
import tempfile
from io import BytesIO
from PIL import Image

from app.services.explainability_service import generate_gradcam


router = APIRouter(
    prefix="/explainability",
    tags=["Explainability"]
)


@router.post("/")
async def generate_explanation(
    image: UploadFile = File(...)
):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed."
        )

    temp_path = None

    try:
        suffix = os.path.splitext(
            image.filename or ".jpg"
        )[1]

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_path = temp_file.name
            content = await image.read()
            temp_file.write(content)

        result = generate_gradcam(temp_path)

        overlay = Image.fromarray(
            result["overlay"]
        )

        buffer = BytesIO()
        overlay.save(buffer, format="PNG")
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="image/png",
            headers={
                "Content-Disposition":
                    "inline; filename=gradcam_result.png"
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Grad-CAM failed: {str(e)}"
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)