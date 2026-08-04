from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Integer,
    String,
    text,
)
from app.database.database import Base

from sqlalchemy.orm import relationship


class ParticipantMaster(Base):
    __tablename__ = "participantmasters"

    participant_id = Column(
        BigInteger,
        primary_key=True,
        index=True,
    )
    batches = relationship("BatchParticipant", back_populates="participant") # Added relationship

    enrollment_no = Column(String(255), nullable=False)

    participant_name = Column(String(255), nullable=False)

    username = Column(String(255))
    password = Column(String(255))
    gender = Column(String(50))
    age = Column(Integer)
    email = Column(String(255))
    mobile_no = Column(String(20))
    location = Column(String(255))
    address = Column(String)
    block_id = Column(Integer)

    district_id = Column(Integer)
    state_id = Column(Integer)
    pin = Column(String(20))
    aadhaar_number = Column(String(20))
    images = Column(String(255))
    status = Column(String(50))
    trainee_status = Column(String(50))

    created_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    deleted_at = Column(DateTime)

    progress_status = Column(Integer)

    course_progress = Column(Integer)
