from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class LesionImage(Base):
    __tablename__ = "lesion_images"

    id = Column(Integer, primary_key=True, index=True)

    visit_id = Column(
        Integer,
        ForeignKey("visits.id"),
        nullable=False
    )

    image_path = Column(
        String,
        nullable=False
    )

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    visit = relationship(
        "Visit",
        back_populates="lesion_images"
    )

    prediction = relationship(
    "Prediction",
    back_populates="image",
    uselist=False,
    cascade="all, delete"
)