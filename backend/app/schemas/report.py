from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class ReportBase(BaseModel):
    report_path: str


class ReportCreate(ReportBase):
    pass


class ReportUpdate(BaseModel):
    report_path: str | None = None


class ReportGenerateRequest(BaseModel):
    patient_id: int
    analysis_data: dict[str, Any] = {}


class ReportResponse(ReportBase):
    id: int
    patient_id: int
    visit_id: int
    generated_at: datetime | None = None

    model_config = ConfigDict(
        from_attributes=True
    )