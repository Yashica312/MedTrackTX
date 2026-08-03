from sqlalchemy import Column, Integer, ForeignKey, Date, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import date, datetime

from app.database import Base


class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    visit_date = Column(
        Date,
        default=date.today,
        nullable=False
    )

    symptoms = Column(Text)

    doctor_notes = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="visits"
    )

    lesion_images = relationship(
    "LesionImage",
    back_populates="visit",
    cascade="all, delete"
)