from pydantic import BaseModel, EmailStr


class DoctorLogin(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    doctor_id: int
    full_name: str
    email: EmailStr