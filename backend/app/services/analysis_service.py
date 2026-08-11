import base64
from io import BytesIO

import cv2
from sqlalchemy.orm import Session

from app.models.lesion_image import LesionImage
from app.models.prediction import Prediction
from app.models.abcde_score import Abcde_Score

from app.services.prediction_service import predict_skin_lesion
from app.services.segmentation_service import segment_lesion
from app.services.explainability_service import generate_gradcam
from app.services.abcde_service import analyze_abcde
from app.services.temporal_analysis_service import analyze_temporal


# ============================================================
# IMAGE → BASE64
# ============================================================

def image_to_base64(image, format="PNG"):
    buffer = BytesIO()

    image.save(
        buffer,
        format=format
    )

    return base64.b64encode(
        buffer.getvalue()
    ).decode("utf-8")


# ============================================================
# COMPLETE AI + DATABASE ANALYSIS
# ============================================================

def analyze_patient_lesion(
    db: Session,
    current_image_path: str,
    visit_id: int,
    previous_image_path: str | None = None
):

    try:

        # ====================================================
        # 1. ViT CLASSIFICATION
        # ====================================================

        prediction = predict_skin_lesion(
            current_image_path
        )

        predicted_class = prediction.get(
            "prediction",
            prediction.get(
                "class",
                "unknown"
            )
        )

        confidence = float(
            prediction.get(
                "confidence",
                0
            )
        )

        # Convert confidence to percentage
        confidence_percentage = (
            confidence * 100
            if confidence <= 1
            else confidence
        )


        # ====================================================
        # 2. U-NET SEGMENTATION
        # ====================================================

        mask = segment_lesion(
            current_image_path
        )

        mask_base64 = image_to_base64(
            mask
        )


        # ====================================================
        # 3. GRAD-CAM
        # ====================================================

        gradcam_result = generate_gradcam(
            current_image_path
        )

        gradcam_image = gradcam_result[
            "overlay"
        ]

        success, encoded = cv2.imencode(
            ".png",
            cv2.cvtColor(
                gradcam_image,
                cv2.COLOR_RGB2BGR
            )
        )

        if not success:
            raise ValueError(
                "Failed to encode Grad-CAM image"
            )

        gradcam_base64 = base64.b64encode(
            encoded.tobytes()
        ).decode("utf-8")


        # ====================================================
        # 4. ABCDE ANALYSIS
        # ====================================================

        abcde = analyze_abcde(
            current_image_path
        )


        # ====================================================
        # 5. TEMPORAL ANALYSIS
        # ====================================================

        temporal = None

        if previous_image_path:

            temporal = analyze_temporal(
                previous_image_path,
                current_image_path
            )


        # ====================================================
        # 6. RISK ASSESSMENT
        # ====================================================

        evolution_score = 0.0

        if temporal:

            evolution_score = float(
                temporal.get(
                    "evolution_score",
                    0
                )
            )


        abcde_score = float(
            abcde.get(
                "overall_score",
                0
            )
        )


        # Combined risk score
        risk_score = (
            confidence_percentage * 0.60
            +
            abcde_score * 0.25
            +
            evolution_score * 0.15
        )

        risk_score = min(
            100,
            round(
                risk_score,
                2
            )
        )


        if risk_score < 35:

            risk_level = "Low"

        elif risk_score < 65:

            risk_level = "Moderate"

        else:

            risk_level = "High"


        # ====================================================
        # 7. CREATE LESION IMAGE DB RECORD
        # ====================================================

        lesion_image = LesionImage(
            visit_id=visit_id,
            image_path=current_image_path
        )

        db.add(
            lesion_image
        )

        db.flush()


        # ====================================================
        # 8. CREATE PREDICTION DB RECORD
        # ====================================================

        prediction_record = Prediction(
            image_id=lesion_image.id,
            predicted_class=predicted_class,
            confidence=confidence_percentage,
            risk_level=risk_level
        )

        db.add(
            prediction_record
        )

        db.flush()


        # ====================================================
        # 9. PREPARE ABCDE SCORES
        # ====================================================
        #
        # ABCDE service returns scores in 0–100 range.
        # Database stores them in 0–1 range.
        #


        a_score = float(
            abcde.get(
                "A_asymmetry",
                0
            )
        ) / 100


        b_score = float(
            abcde.get(
                "B_border",
                0
            )
        ) / 100


        c_score = float(
            abcde.get(
                "C_color",
                0
            )
        ) / 100


        d_score = float(
            abcde.get(
                "D_diameter",
                0
            )
        ) / 100


        # Evolution comes from temporal analysis
        if temporal:

            e_score = float(
                temporal.get(
                    "evolution_score",
                    0
                )
            ) / 100

        else:

            e_score = 0.0


        # ====================================================
        # 10. CREATE ABCDE DB RECORD
        # ====================================================

        abcde_record = Abcde_Score(
            prediction_id=prediction_record.id,

            asymmetry=round(
                a_score,
                4
            ),

            border=round(
                b_score,
                4
            ),

            color=round(
                c_score,
                4
            ),

            diameter=round(
                d_score,
                4
            ),

            evolution=round(
                e_score,
                4
            )
        )

        db.add(
            abcde_record
        )

        db.commit()


        # Refresh DB objects
        db.refresh(
            lesion_image
        )

        db.refresh(
            prediction_record
        )

        db.refresh(
            abcde_record
        )


        # ====================================================
        # 11. FINAL RESPONSE
        # ====================================================

        return {

            # -------------------------------
            # ViT
            # -------------------------------

            "prediction": prediction,


            # -------------------------------
            # U-Net
            # -------------------------------

            "segmentation": {

                "mask_base64":
                    mask_base64

            },


            # -------------------------------
            # Grad-CAM
            # -------------------------------

            "gradcam": {

                "predicted_class":
                    gradcam_result[
                        "predicted_class"
                    ],

                "overlay_base64":
                    gradcam_base64

            },


            # -------------------------------
            # ABCDE
            # -------------------------------

            "abcde": abcde,


            # -------------------------------
            # Temporal
            # -------------------------------

            "temporal": temporal,


            # -------------------------------
            # Risk
            # -------------------------------

            "risk_assessment": {

                "risk_score":
                    risk_score,

                "risk_level":
                    risk_level

            },


            # -------------------------------
            # Database
            # -------------------------------

            "database": {

                "image_id":
                    lesion_image.id,

                "prediction_id":
                    prediction_record.id,

                "abcde_id":
                    abcde_record.id,

                "saved":
                    True

            }

        }


    except Exception:

        # Rollback any partially-created DB transaction
        db.rollback()

        raise