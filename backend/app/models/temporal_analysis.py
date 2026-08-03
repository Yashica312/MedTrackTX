from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class TemporalAnalysis(Base):
    __tablename__ = "temporal_analysis"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    previous_visit_id = Column(
        Integer,
        ForeignKey("visits.id"),
        nullable=False
    )

    current_visit_id = Column(
        Integer,
        ForeignKey("visits.id"),
        nullable=False
    )

    growth_percentage = Column(Float)

    risk_change = Column(String)

    comparison_image = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    patient = relationship(
        "Patient",
        back_populates="temporal_analyses"
    )

    previous_visit = relationship(
        "Visit",
        foreign_keys=[previous_visit_id]
    )

    current_visit = relationship(
        "Visit",
        foreign_keys=[current_visit_id]
    )