from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Integer,
    String,
    ForeignKey, # Added for FK
    text,
)

from app.database.database import Base
from sqlalchemy.orm import relationship # Added for relationships






class BatchMaster(Base):
    __tablename__ = "batch_masters"

    batch_id = Column(BigInteger, primary_key=True, index=True)
    batch_name = Column(String(255), nullable=False)
    centre_id = Column(BigInteger, ForeignKey("centre_masters.centre_id"), nullable=False) # Corrected FK table name
    status = Column(Integer, nullable=False)

    created_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    deleted_at = Column(DateTime)

    created_by = Column(BigInteger, nullable=False) # Assuming this is a User.id

    fy_year = Column(String(7), nullable=False)

    # Relationships
    # centre = relationship("CentreMaster", back_populates="batches") # Uncomment if CentreMaster has back_populates
    participants = relationship("BatchParticipant", back_populates="batch")



class BatchParticipant(Base):
    __tablename__ = "batch_participant"

    batch_participant_id = Column(
        BigInteger,
        primary_key=True,
        index=True,
    )

    batch_id = Column(BigInteger, ForeignKey("batch_masters.batch_id"), nullable=False) # Added FK
    participant_id = Column(BigInteger, ForeignKey("participantmasters.participant_id"), nullable=False) # Added FK

    created_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    deleted_at = Column(DateTime)

    # Relationships
    batch = relationship("BatchMaster", back_populates="participants")
    participant = relationship("ParticipantMaster", back_populates="batches")