import base64
from io import BytesIO

import cv2
import numpy as np
from PIL import Image
from sqlalchemy.orm import Session

from app.models.lesion_image import LesionImage
from app.models.prediction import Prediction
from app.models.abcde_score import Abcde_Score
from app.models.visit import Visit
from app.models.temporal_analysis import TemporalAnalysis

from app.services.prediction_service import predict_skin_lesion
from app.services.segmentation_service import segment_lesion
from app.services.explainability_service import generate_gradcam
from app.services.abcde_service import analyze_abcde
from app.services.temporal_analysis_service import analyze_temporal
from app.services.report_service import generate_clinical_report


# ============================================================
# IMAGE -> BASE64
# ============================================================

def image_to_base64(image, format="PNG"):

    # PIL Image
    if isinstance(image, Image.Image):

        buffer = BytesIO()

        image.save(
            buffer,
            format=format
        )

        return base64.b64encode(
            buffer.getvalue()
        ).decode("utf-8")

    # NumPy / OpenCV image
    if isinstance(image, np.ndarray):

        success, encoded = cv2.imencode(
            ".png",
            image
        )

        if not success:
            raise ValueError(
                "Failed to encode image."
            )

        return base64.b64encode(
            encoded.tobytes()
        ).decode("utf-8")

    raise ValueError(
        "Unsupported image type for base64 conversion."
    )


# ============================================================
# SAFE DICTIONARY VALIDATION
# ============================================================

def ensure_dict(value, module_name):

    if value is None:

        raise ValueError(
            f"{module_name} returned None. "
            f"Please check {module_name} implementation."
        )

    if not isinstance(value, dict):

        raise ValueError(
            f"{module_name} returned "
            f"{type(value).__name__} instead of dict."
        )

    return value


# ============================================================
# COMPLETE PATIENT LESION ANALYSIS
# ============================================================

def analyze_patient_lesion(
    db: Session,
    current_image_path: str,
    visit_id: int,
    previous_image_path: str | None = None
):

    try:

        # ====================================================
        # 0. CURRENT VISIT
        # ====================================================

        current_visit = (
            db.query(Visit)
            .filter(
                Visit.id == visit_id
            )
            .first()
        )

        if not current_visit:

            raise ValueError(
                f"Current visit with ID "
                f"{visit_id} was not found."
            )

        patient_id = current_visit.patient_id

        print("\n")
        print("=" * 60)
        print("MEDTRACK-TX COMPLETE ANALYSIS")
        print("=" * 60)

        print(
            f"Patient ID     : {patient_id}"
        )

        print(
            f"Visit ID       : {visit_id}"
        )

        print(
            f"Current Image  : {current_image_path}"
        )

        print(
            f"Previous Image : {previous_image_path}"
        )

        print("=" * 60)


        # ====================================================
        # 1. ViT CLASSIFICATION
        # ====================================================

        print("1. Running ViT classification...")

        prediction = predict_skin_lesion(
            current_image_path
        )

        prediction = ensure_dict(
            prediction,
            "Prediction service"
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

        # Convert 0-1 confidence to percentage
        if confidence <= 1:

            confidence_percentage = (
                confidence * 100
            )

        else:

            confidence_percentage = confidence

        confidence_percentage = round(
            confidence_percentage,
            2
        )

        print(
            f"   Prediction : {predicted_class}"
        )

        print(
            f"   Confidence : {confidence_percentage}%"
        )


        # ====================================================
        # 2. U-NET SEGMENTATION
        # ====================================================

        print("2. Running U-Net segmentation...")

        mask = segment_lesion(
            current_image_path
        )

        if mask is None:

            raise ValueError(
                "Segmentation service returned None."
            )

        mask_base64 = image_to_base64(
            mask
        )

        print(
            "   Segmentation completed."
        )


        # ====================================================
        # 3. GRAD-CAM
        # ====================================================

        print("3. Generating Grad-CAM...")

        gradcam_result = generate_gradcam(
            current_image_path
        )

        gradcam_result = ensure_dict(
            gradcam_result,
            "Grad-CAM service"
        )

        gradcam_image = gradcam_result.get(
            "overlay"
        )

        if gradcam_image is None:

            raise ValueError(
                "Grad-CAM service did not return "
                "an overlay image."
            )

        gradcam_base64 = image_to_base64(
            gradcam_image
        )

        gradcam_predicted_class = (
            gradcam_result.get(
                "predicted_class",
                predicted_class
            )
        )

        print(
            "   Grad-CAM completed."
        )


        # ====================================================
        # 4. ABCDE ANALYSIS
        # ====================================================

        print("4. Running ABCDE analysis...")

        abcde = analyze_abcde(
            current_image_path
        )

        abcde = ensure_dict(
            abcde,
            "ABCDE service"
        )

        print(
            "   ABCDE analysis completed."
        )


        # ====================================================
        # 5. TEMPORAL ANALYSIS
        # ====================================================

        temporal = None

        print("5. Checking previous visit...")

        if previous_image_path:

            print(
                "   Previous image found."
            )

            temporal = analyze_temporal(
                previous_image_path,
                current_image_path
            )

            temporal = ensure_dict(
                temporal,
                "Temporal analysis service"
            )

            print(
                "   Temporal analysis completed."
            )

        else:

            print(
                "   No previous image."
            )

            temporal = {
                "status":
                    "No previous visit image available.",
                "progression":
                    "Baseline visit",
                "evolution_score":
                    0.0
            }


        # ====================================================
        # 6. ABCDE SCORES
        # ====================================================

        a_score = float(
            abcde.get(
                "A_asymmetry",
                0
            )
        )

        b_score = float(
            abcde.get(
                "B_border",
                0
            )
        )

        c_score = float(
            abcde.get(
                "C_color",
                0
            )
        )

        d_score = float(
            abcde.get(
                "D_diameter",
                0
            )
        )


        # Evolution score
        e_score = float(
            temporal.get(
                "evolution_score",
                0
            )
        )


        # ====================================================
        # 7. OVERALL RISK ASSESSMENT
        # ====================================================

        print(
            "6. Calculating risk assessment..."
        )

        abcde_score = float(
            abcde.get(
                "overall_score",
                0
            )
        )

        risk_score = (

            confidence_percentage * 0.60

            +

            abcde_score * 0.25

            +

            e_score * 0.15
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


        print(
            f"   Risk Score : {risk_score}"
        )

        print(
            f"   Risk Level : {risk_level}"
        )


        # ====================================================
        # 8. CREATE LESION IMAGE DB RECORD
        # ====================================================

        print(
            "7. Saving lesion image..."
        )

        lesion_image = LesionImage(
            visit_id=visit_id,
            image_path=current_image_path
        )

        db.add(
            lesion_image
        )

        db.flush()


        # ====================================================
        # 9. CREATE PREDICTION DB RECORD
        # ====================================================

        print(
            "8. Saving prediction..."
        )

        prediction_record = Prediction(

            image_id=
                lesion_image.id,

            predicted_class=
                predicted_class,

            confidence=
                confidence_percentage,

            risk_level=
                risk_level
        )

        db.add(
            prediction_record
        )

        db.flush()


        # ====================================================
        # 10. CREATE ABCDE DB RECORD
        # ====================================================

        print(
            "9. Saving ABCDE scores..."
        )

        abcde_record = Abcde_Score(

            prediction_id=
                prediction_record.id,

            asymmetry=
                round(
                    a_score / 100,
                    4
                ),

            border=
                round(
                    b_score / 100,
                    4
                ),

            color=
                round(
                    c_score / 100,
                    4
                ),

            diameter=
                round(
                    d_score / 100,
                    4
                ),

            evolution=
                round(
                    e_score / 100,
                    4
                )
        )

        db.add(
            abcde_record
        )

        db.flush()


        # ====================================================
        # 11. SAVE TEMPORAL ANALYSIS
        # ====================================================

        temporal_record = None

        if previous_image_path:

            print(
                "10. Saving temporal analysis..."
            )

            previous_visit = (

                db.query(Visit)

                .filter(

                    Visit.patient_id ==
                    patient_id,

                    Visit.id !=
                    visit_id,

                    Visit.visit_date <=
                    current_visit.visit_date
                )

                .order_by(

                    Visit.visit_date.desc(),

                    Visit.id.desc()
                )

                .first()
            )


            if previous_visit:

                growth_percentage = float(
                    temporal.get(
                        "area_change_percent",
                        temporal.get(
                            "growth_percentage",
                            0
                        )
                    )
                )

                progression = temporal.get(
                    "progression",
                    "Stable"
                )


                temporal_record = TemporalAnalysis(

                    patient_id=
                        patient_id,

                    previous_visit_id=
                        previous_visit.id,

                    current_visit_id=
                        visit_id,

                    growth_percentage=
                        round(
                            growth_percentage,
                            2
                        ),

                    risk_change=
                        progression,

                    comparison_image=None
                )

                db.add(
                    temporal_record
                )

                db.flush()

                print(
                    "   Temporal DB record saved."
                )

            else:

                print(
                    "   Previous visit record "
                    "not found. Temporal DB record skipped."
                )


        # ====================================================
        # 12. PREPARE CLINICAL REPORT DATA
        # ====================================================

        print(
            "11. Preparing clinical report..."
        )

        report_data = {

            # ------------------------------------------------
            # PATIENT / VISIT
            # ------------------------------------------------

            "patient": {

                "patient_id":
                    patient_id,

                "visit_id":
                    visit_id
            },


            # ------------------------------------------------
            # AI CLASSIFICATION
            # ------------------------------------------------

            "prediction": {

                "prediction":
                    predicted_class,

                "confidence":
                    confidence_percentage
            },


            # ------------------------------------------------
            # U-NET SEGMENTATION
            # ------------------------------------------------

            "segmentation": {

                "mask_generated":
                    True,

                "mask_base64":
                    mask_base64
            },


            # ------------------------------------------------
            # GRAD-CAM
            # ------------------------------------------------

            "gradcam": {

                "predicted_class":
                    gradcam_predicted_class,

                "overlay_base64":
                    gradcam_base64,

                "explanation": (
                    "Grad-CAM highlights the image regions "
                    "that contributed most strongly to the "
                    "model prediction. Warmer regions indicate "
                    "areas receiving greater importance from "
                    "the classification model."
                )
            },


            # ------------------------------------------------
            # ABCDE
            # ------------------------------------------------

            "abcde": {

                "A_asymmetry":
                    a_score,

                "B_border":
                    b_score,

                "C_color":
                    c_score,

                "D_diameter":
                    d_score,

                "E_evolution":
                    e_score,

                "overall_score":
                    abcde_score,

                "note": abcde.get(
                    "note",
                    "ABCDE values are image-analysis indicators "
                    "and are not a clinical diagnosis."
                )
            },


            # ------------------------------------------------
            # TEMPORAL ANALYSIS
            # ------------------------------------------------

            "temporal": temporal,


            # ------------------------------------------------
            # RISK ASSESSMENT
            # ------------------------------------------------

            "risk_assessment": {

                "risk_score":
                    risk_score,

                "risk_level":
                    risk_level
            },


            # ------------------------------------------------
            # CLINICAL INTERPRETATION
            # ------------------------------------------------

            "clinical_interpretation": {

                "summary": (
                    "The current dermoscopic image was "
                    "analyzed using lesion classification, "
                    "segmentation, ABCDE image indicators, "
                    "and longitudinal comparison where "
                    "a previous visit image was available."
                ),

                "gradcam_explanation": (
                    "The Grad-CAM visualization provides "
                    "model explainability by highlighting "
                    "image regions that contributed to the "
                    "predicted lesion class."
                ),

                "temporal_explanation": (
                    "Temporal analysis compares the current "
                    "lesion with the previous visit using "
                    "area, diameter, structural overlap, "
                    "and image similarity measures."
                ),

                "clinical_note": (
                    "This automated analysis is intended "
                    "as a clinical decision-support aid and "
                    "does not replace evaluation by a qualified "
                    "dermatologist."
                )
            },


            # ------------------------------------------------
            # DATABASE REFERENCES
            # ------------------------------------------------

            "database": {

                "image_id":
                    lesion_image.id,

                "prediction_id":
                    prediction_record.id,

                "abcde_id":
                    abcde_record.id,

                "temporal_analysis_id": (

                    temporal_record.id

                    if temporal_record

                    else None
                )
            }
        }


        # ====================================================
        # 13. GENERATE CLINICAL REPORT
        # ====================================================

        print(
            "12. Generating clinical report..."
        )

        report_record = generate_clinical_report(

            db=db,

            patient_id=
                patient_id,

            visit_id=
                visit_id,

            analysis_data=
                report_data
        )


        if report_record is None:

            raise ValueError(
                "Report service returned None."
            )


        # ====================================================
        # 14. COMMIT EVERYTHING
        # ====================================================

        print(
            "13. Committing database records..."
        )

        db.commit()


        # ====================================================
        # 15. REFRESH DB OBJECTS
        # ====================================================

        db.refresh(
            lesion_image
        )

        db.refresh(
            prediction_record
        )

        db.refresh(
            abcde_record
        )

        db.refresh(
            report_record
        )

        if temporal_record:

            db.refresh(
                temporal_record
            )


        # ====================================================
        # 16. FINAL RESPONSE
        # ====================================================

        print(
            "14. Analysis completed successfully."
        )

        print("=" * 60)
        print(
            "MEDTRACK-TX ANALYSIS COMPLETE"
        )
        print("=" * 60)


        return {

            # ------------------------------------------------
            # PATIENT
            # ------------------------------------------------

            "patient": {

                "patient_id":
                    patient_id,

                "visit_id":
                    visit_id
            },


            # ------------------------------------------------
            # ViT
            # ------------------------------------------------

            "prediction": {

                "prediction":
                    predicted_class,

                "confidence":
                    confidence_percentage
            },


            # ------------------------------------------------
            # U-NET
            # ------------------------------------------------

            "segmentation": {

                "mask_base64":
                    mask_base64
            },


            # ------------------------------------------------
            # GRAD-CAM
            # ------------------------------------------------

            "gradcam": {

                "predicted_class":
                    gradcam_predicted_class,

                "overlay_base64":
                    gradcam_base64,

                "explanation": (
                    "The Grad-CAM overlay highlights "
                    "the regions that contributed most "
                    "to the model's classification."
                )
            },


            # ------------------------------------------------
            # ABCDE
            # ------------------------------------------------

            "abcde": abcde,


            # ------------------------------------------------
            # TEMPORAL
            # ------------------------------------------------

            "temporal": temporal,


            # ------------------------------------------------
            # RISK
            # ------------------------------------------------

            "risk_assessment": {

                "risk_score":
                    risk_score,

                "risk_level":
                    risk_level
            },


            # ------------------------------------------------
            # DATABASE
            # ------------------------------------------------

            "database": {

                "image_id":
                    lesion_image.id,

                "prediction_id":
                    prediction_record.id,

                "abcde_id":
                    abcde_record.id,

                "temporal_analysis_id": (

                    temporal_record.id

                    if temporal_record

                    else None
                ),

                "report_id":
                    report_record.id,

                "saved":
                    True
            }

        }


    # ========================================================
    # ERROR HANDLING
    # ========================================================

    except Exception as e:

        db.rollback()

        print("\n")
        print("=" * 60)
        print("MEDTRACK-TX ANALYSIS FAILED")
        print("=" * 60)

        print(
            f"ERROR: {str(e)}"
        )

        print("=" * 60)

        raise