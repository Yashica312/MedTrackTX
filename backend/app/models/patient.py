from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    doctor_id = Column(Integer, ForeignKey("doctors.id"))

    full_name = Column(String, nullable=False)

    age = Column(Integer, nullable=False)

    gender = Column(String, nullable=False)

    phone = Column(String)

    email = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    doctor = relationship("Doctor", back_populates="patients")

    visits = relationship(
    "Visit",
    back_populates="patient",
    cascade="all, delete"
)
    temporal_analyses = relationship(
    "TemporalAnalysis",
    back_populates="patient",
    cascade="all, delete"
)