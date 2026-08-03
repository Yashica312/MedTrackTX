from sqlalchemy import Column, Integer, String
from app.database import Base
from sqlalchemy.orm import relationship


class Doctor(Base):
    __tablename__ = "doctors"

    patients = relationship(
    "Patient",
    back_populates="doctor",
    cascade="all, delete"
)

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)