from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    String,
    Date,
)

from app.database.database import Base


class ParticipantModule(Base):
    __tablename__ = "participant_module"

    participant_module_id = Column(Integer, primary_key=True)

    participant_id = Column(Integer)

    course_id = Column(Integer)

    module_id = Column(Integer)

    lock_status = Column(Integer)

    status = Column(String)

    start_date = Column(Date)

    end_date = Column(Date)

    initiated_mode = Column(String)

    initiated_by = Column(Integer)
