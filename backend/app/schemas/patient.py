from pydantic import BaseModel, EmailStr, ConfigDict


class PatientBase(BaseModel):
    full_name: str
    age: int
    gender: str
    phone: str | None = None
    email: EmailStr | None = None


class PatientCreate(BaseModel):
    full_name: str
    age: int
    gender: str
    phone: str
    email: str | None = None
    address: str | None = None


class PatientUpdate(BaseModel):
    full_name: str | None = None
    age: int | None = None
    gender: str | None = None
    phone: str | None = None
    email: EmailStr | None = None


class PatientResponse(PatientBase):
    id: int
    doctor_id: int

    model_config = ConfigDict(from_attributes=True)