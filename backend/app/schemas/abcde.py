from pydantic import BaseModel, ConfigDict


class ABCDEBase(BaseModel):
    asymmetry: float | None = None
    border: float | None = None
    color: float | None = None
    diameter: float | None = None
    evolution: float | None = None


class ABCDECreate(ABCDEBase):
    pass


class ABCDEUpdate(BaseModel):
    asymmetry: float | None = None
    border: float | None = None
    color: float | None = None
    diameter: float | None = None
    evolution: float | None = None


class ABCDEResponse(ABCDEBase):
    id: int
    prediction_id: int

    model_config = ConfigDict(from_attributes=True)