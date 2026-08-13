from typing import List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from fastapi.responses import FileResponse

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.report import Report

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
    db: Session = Depends(get_db)
):

    reports = (
        db.query(Report)
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
):

    try:

        report = generate_clinical_report(
            db=db,
            patient_id=request.patient_id,
            visit_id=visit_id,
            analysis_data=request.analysis_data,
        )

        return report

    except Exception as exc:

        db.rollback()

        print(
            "REPORT GENERATION ERROR:",
            repr(exc)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(exc)}"
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
    db: Session = Depends(get_db)
):

    report = (
        db.query(Report)
        .filter(
            Report.id == report_id
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
    db: Session = Depends(get_db)
):

    report = (
        db.query(Report)
        .filter(
            Report.id == report_id
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

    if not __import__("os").path.isfile(
        pdf_path
    ):

        raise HTTPException(
            status_code=404,
            detail="PDF file does not exist on server."
        )

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=__import__("os").path.basename(
            pdf_path
        ),
        content_disposition_type="inline",
    )