from datetime import date
from pydantic import BaseModel, ConfigDict


class VisitBase(BaseModel):
    visit_date: date
    symptoms: str | None = None
    doctor_notes: str | None = None


class VisitCreate(VisitBase):
    pass


class VisitUpdate(BaseModel):
    visit_date: date | None = None
    symptoms: str | None = None
    doctor_notes: str | None = None


class VisitResponse(VisitBase):
    id: int
    patient_id: int

    model_config = ConfigDict(from_attributes=True)