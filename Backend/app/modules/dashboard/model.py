from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Integer,
    Numeric,
    String,
    Date,
    Text,
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

class DocumentCategory(Base):
    __tablename__ = "document_categories"

    doc_category_id = Column(Integer, primary_key=True, index=True)
    doc_category_name = Column(String)
    status = Column(Integer)
    language_id = Column(Integer)    


