from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    image_id = Column(
        Integer,
        ForeignKey("lesion_images.id"),
        nullable=False
    )

    predicted_class = Column(
        String,
        nullable=False
    )

    confidence = Column(
        Float,
        nullable=False
    )

    risk_level = Column(
        String,
        nullable=False
    )

    gradcam_path = Column(String)

    prediction_time = Column(
        DateTime,
        default=datetime.utcnow
    )

    image = relationship(
        "LesionImage",
        back_populates="prediction"
    )

    abcde_analysis = relationship(
    "Abcde_Score",
    back_populates="prediction",
    uselist=False,
    cascade="all, delete"
)