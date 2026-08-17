from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Integer,
    String,
    text,
)
from app.database.database import Base




class ParticipantMaster(Base):
    __tablename__ = "participantmasters"

    participant_id = Column(
        BigInteger,
        primary_key=True,
        index=True,
    )

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


class TimeSpentModuleLog(Base):
    __tablename__ = "time_spent_module_log"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger)
    module_id = Column(BigInteger)
    topic_id = Column(BigInteger)
    document_id = Column(BigInteger)
    time_taken = Column(Integer)