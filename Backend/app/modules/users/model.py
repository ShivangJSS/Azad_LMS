from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Integer,
    String,
    text,
)
from sqlalchemy.orm import relationship

from app.database.database import Base


class ParticipantMaster(Base):
    __tablename__ = "participantmasters"

    participant_id = Column(
        BigInteger,
        primary_key=True,
        index=True,
    )
    batches = relationship("BatchParticipant", back_populates="participant")

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


class ParticipantMcq(Base):
    __tablename__ = "participant_mcqs"

    participant_mcq_id = Column(BigInteger, primary_key=True)
    participant_id = Column(BigInteger)
    attempt_id = Column(Integer)
    course_id = Column(BigInteger)
    module_id = Column(BigInteger)
    mcq_id = Column(BigInteger)
    option_selected = Column(String(255))
    correct_option = Column(String(255))
    created_date = Column(DateTime)
    is_active = Column(Integer)


class ParticipantScq(Base):
    __tablename__ = "participant_scs"

    participant_sc_id = Column(BigInteger, primary_key=True)
    participant_id = Column(BigInteger)
    module_id = Column(Integer)
    attempt_id = Column(Integer)
    single_choice_id = Column(BigInteger)
    option_selected = Column(String(255))
    correct_option = Column(String(255))
    created_date = Column(DateTime)
    is_active = Column(Integer)


class ParticipantDb(Base):
    __tablename__ = "participant_dbs"

    participant_db_id = Column(BigInteger, primary_key=True)
    participant_id = Column(BigInteger)
    attempt_id = Column(Integer)
    cource_id = Column(BigInteger)
    module_id = Column(BigInteger)
    bucket_id = Column(BigInteger)
    item_id = Column(BigInteger)
    created_date = Column(DateTime)
    is_active = Column(Integer)


class ParticipantMm(Base):
    __tablename__ = "participant_mm"

    participant_mm_id = Column(BigInteger, primary_key=True)
    participant_id = Column(BigInteger)
    attempt_id = Column(Integer)
    course_id = Column(BigInteger)
    module_id = Column(BigInteger)
    question_id = Column(BigInteger)
    left_option = Column(String(255))
    right_option = Column(String(255))
    is_correct = Column(String(255))
    created_date = Column(DateTime)
    is_active = Column(Integer)


class TimeSpentModuleLog(Base):
    __tablename__ = "time_spent_module_log"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger)
    module_id = Column(BigInteger)
    topic_id = Column(BigInteger)
    document_id = Column(BigInteger)
    time_taken = Column(Integer)
