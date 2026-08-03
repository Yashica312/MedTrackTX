from pydantic import BaseModel, ConfigDict


class LesionImageBase(BaseModel):
    image_path: str


class LesionImageCreate(LesionImageBase):
    pass


class LesionImageUpdate(BaseModel):
    image_path: str | None = None


class LesionImageResponse(LesionImageBase):
    id: int
    visit_id: int

    model_config = ConfigDict(from_attributes=True)