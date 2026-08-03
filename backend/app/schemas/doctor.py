from pydantic import BaseModel, EmailStr, ConfigDict


class DoctorBase(BaseModel):
    full_name: str
    email: EmailStr


class DoctorCreate(DoctorBase):
    password: str


class DoctorUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    password: str | None = None


class DoctorResponse(DoctorBase):
    id: int

    model_config = ConfigDict(from_attributes=True)