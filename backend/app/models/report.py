from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    visit_id = Column(
        Integer,
        ForeignKey("visits.id"),
        nullable=False
    )

    report_path = Column(
        String,
        nullable=False
    )

    generated_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship("Patient")

    visit = relationship("Visit")