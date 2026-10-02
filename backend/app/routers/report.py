from typing import List
import os

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_doctor

from app.models.report import Report
from app.models.patient import Patient
from app.models.visit import Visit

from app.schemas.report import (
    ReportResponse,
    ReportGenerateRequest,
)

from app.services.report_service import (
    generate_clinical_report,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ============================================================
# GET ALL REPORTS
# ============================================================

@router.get(
    "/",
    response_model=List[ReportResponse]
)
def get_reports(
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    reports = (
        db.query(Report)
        .join(Patient, Report.patient_id == Patient.id)
        .filter(
            Patient.doctor_id == current_doctor.id
        )
        .order_by(
            Report.generated_at.desc()
        )
        .all()
    )

    return reports


# ============================================================
# GENERATE NEW CLINICAL REPORT
# ============================================================

@router.post(
    "/generate/{visit_id}",
    response_model=ReportResponse
)
def generate_report(
    visit_id: int,
    request: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    # Verify that the visit belongs to the logged-in doctor.
    visit = (
        db.query(Visit)
        .join(Patient, Visit.patient_id == Patient.id)
        .filter(
            Visit.id == visit_id,
            Patient.doctor_id == current_doctor.id
        )
        .first()
    )

    if not visit:
        raise HTTPException(
            status_code=404,
            detail="Visit not found"
        )

    # Do not trust an arbitrary patient_id supplied by the client.
    if request.patient_id != visit.patient_id:
        raise HTTPException(
            status_code=400,
            detail="Patient does not match the visit."
        )

    try:
        report = generate_clinical_report(
            db=db,
            patient_id=visit.patient_id,
            visit_id=visit_id,
            analysis_data=request.analysis_data,
        )

        return report

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to generate report."
        )


# ============================================================
# GET REPORT BY ID
# ============================================================

@router.get(
    "/{report_id}",
    response_model=ReportResponse
)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    report = (
        db.query(Report)
        .join(Patient, Report.patient_id == Patient.id)
        .filter(
            Report.id == report_id,
            Patient.doctor_id == current_doctor.id
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found."
        )

    return report


# ============================================================
# DOWNLOAD / VIEW PDF
# ============================================================

@router.get(
    "/{report_id}/pdf"
)
def get_report_pdf(
    report_id: int,
    db: Session = Depends(get_db),
    current_doctor=Depends(get_current_doctor)
):
    report = (
        db.query(Report)
        .join(Patient, Report.patient_id == Patient.id)
        .filter(
            Report.id == report_id,
            Patient.doctor_id == current_doctor.id
        )
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found."
        )

    pdf_path = report.report_path

    if not pdf_path:
        raise HTTPException(
            status_code=404,
            detail="PDF path is missing."
        )

    if not os.path.isfile(pdf_path):
        raise HTTPException(
            status_code=404,
            detail="PDF file does not exist on server."
        )

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(pdf_path),
        content_disposition_type="inline",
    )