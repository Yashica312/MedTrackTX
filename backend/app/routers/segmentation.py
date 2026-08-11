from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse

import os
import tempfile
from io import BytesIO

from app.services.segmentation_service import segment_lesion


router = APIRouter(
    prefix="/segmentation",
    tags=["Segmentation"]
)


@router.post("/")
async def segment_uploaded_lesion(
    image: UploadFile = File(...)
):
    """
    Upload a dermoscopic image and return
    the U-Net lesion segmentation mask.
    """

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

        # Run U-Net
        mask = segment_lesion(temp_path)

        # Convert PIL image to PNG
        buffer = BytesIO()
        mask.save(buffer, format="PNG")
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="image/png",
            headers={
                "Content-Disposition":
                    "inline; filename=lesion_mask.png"
            }
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Segmentation failed: {str(e)}"
        )

    finally:

        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)