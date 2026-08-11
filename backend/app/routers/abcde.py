from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException
)

import os
import tempfile

from app.services.abcde_service import analyze_abcde


router = APIRouter(
    prefix="/abcde",
    tags=["ABCDE"]
)


@router.post("/")
async def analyze_abcde_image(
    image: UploadFile = File(...)
):

    if not image.content_type or not image.content_type.startswith(
        "image/"
    ):
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

            temp_file.write(
                content
            )

        result = analyze_abcde(
            temp_path
        )

        return {
            "success": True,
            "filename": image.filename,
            "analysis": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"ABCDE analysis failed: {str(e)}"
        )

    finally:

        if temp_path and os.path.exists(
            temp_path
        ):
            os.remove(
                temp_path
            )