from pydantic import BaseModel, ConfigDict


class PredictionBase(BaseModel):
    predicted_class: str
    confidence: float
    risk_level: str
    gradcam_path: str | None = None


class PredictionCreate(PredictionBase):
    pass


class PredictionUpdate(BaseModel):
    predicted_class: str | None = None
    confidence: float | None = None
    risk_level: str | None = None
    gradcam_path: str | None = None


class PredictionResponse(PredictionBase):
    id: int
    image_id: int

    model_config = ConfigDict(from_attributes=True)