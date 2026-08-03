from pydantic import BaseModel, ConfigDict


class TemporalAnalysisBase(BaseModel):
    growth_percentage: float | None = None
    risk_change: str | None = None
    comparison_image: str | None = None


class TemporalAnalysisCreate(TemporalAnalysisBase):
    pass


class TemporalAnalysisUpdate(BaseModel):
    growth_percentage: float | None = None
    risk_change: str | None = None
    comparison_image: str | None = None


class TemporalAnalysisResponse(TemporalAnalysisBase):
    id: int
    patient_id: int
    previous_visit_id: int
    current_visit_id: int

    model_config = ConfigDict(from_attributes=True)