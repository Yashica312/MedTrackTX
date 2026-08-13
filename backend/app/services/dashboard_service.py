from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.visit import Visit
from app.models.doctor import Doctor
from app.models.prediction import Prediction
from app.models.lesion_image import LesionImage


def get_dashboard_stats(
    db: Session,
    doctor_id: int
):
    # -----------------------------
    # PATIENTS
    # -----------------------------
    total_patients = (
        db.query(Patient)
        .filter(Patient.doctor_id == doctor_id)
        .count()
    )

    recent_patients = (
        db.query(Patient)
        .filter(Patient.doctor_id == doctor_id)
        .order_by(Patient.id.desc())
        .limit(5)
        .all()
    )

    # -----------------------------
    # VISITS
    # -----------------------------
    total_visits = (
        db.query(Visit)
        .join(
            Patient,
            Visit.patient_id == Patient.id
        )
        .filter(
            Patient.doctor_id == doctor_id
        )
        .count()
    )

    recent_visits = (
        db.query(Visit)
        .join(
            Patient,
            Visit.patient_id == Patient.id
        )
        .filter(
            Patient.doctor_id == doctor_id
        )
        .order_by(Visit.id.desc())
        .limit(5)
        .all()
    )

    # -----------------------------
    # TOTAL DOCTORS
    # -----------------------------
    total_doctors = db.query(Doctor).count()

    # -----------------------------
    # AI PREDICTIONS
    # -----------------------------
    doctor_predictions_query = (
        db.query(Prediction)
        .join(
            LesionImage,
            Prediction.image_id == LesionImage.id
        )
        .join(
            Visit,
            LesionImage.visit_id == Visit.id
        )
        .join(
            Patient,
            Visit.patient_id == Patient.id
        )
        .filter(
            Patient.doctor_id == doctor_id
        )
    )

    total_ai_analyses = (
        doctor_predictions_query.count()
    )

    # -----------------------------
    # RISK DISTRIBUTION
    # -----------------------------
    predictions = (
        doctor_predictions_query
        .order_by(
            Prediction.prediction_time.desc()
        )
        .all()
    )

    risk_distribution = {
        "low": 0,
        "moderate": 0,
        "high": 0,
    }

    for prediction in predictions:

        risk = (
            prediction.risk_level or ""
        ).strip().lower()

        if risk == "low":
            risk_distribution["low"] += 1

        elif risk in (
            "moderate",
            "medium",
            "medium risk"
        ):
            risk_distribution["moderate"] += 1

        elif risk in (
            "high",
            "high risk"
        ):
            risk_distribution["high"] += 1

    # -----------------------------
    # RECENT AI ANALYSES
    # -----------------------------
    recent_predictions = predictions[:5]

    return {
        "total_patients": total_patients,
        "total_visits": total_visits,
        "total_doctors": total_doctors,

        "total_ai_analyses": total_ai_analyses,

        "risk_distribution": risk_distribution,

        "recent_patients": recent_patients,

        "recent_visits": recent_visits,

        "recent_predictions": recent_predictions,
    }