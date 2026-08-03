from pydantic import BaseModel, ConfigDict


class ReportBase(BaseModel):
    report_path: str


class ReportCreate(ReportBase):
    pass


class ReportUpdate(BaseModel):
    report_path: str | None = None


class ReportResponse(ReportBase):
    id: int
    patient_id: int
    visit_id: int

    model_config = ConfigDict(from_attributes=True)