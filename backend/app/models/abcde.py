from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class ABCDE(Base):
    __tablename__ = "abcde_analysis"

    id = Column(Integer, primary_key=True, index=True)

    prediction_id = Column(
        Integer,
        ForeignKey("predictions.id"),
        nullable=False
    )

    asymmetry = Column(Float)

    border = Column(Float)

    color = Column(Float)

    diameter = Column(Float)

    evolution = Column(Float)

    prediction = relationship(
        "Prediction",
        back_populates="abcde_analysis"
    )

    