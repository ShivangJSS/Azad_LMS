from sqlalchemy import BigInteger, Column, DateTime, Integer, Numeric, SmallInteger, String, text

from app.database.database import Base


class StateMaster(Base):
    __tablename__ = "state_master"

    state_lgd_code = Column(SmallInteger, primary_key=True, index=True)
    state_name = Column(String(100), nullable=False)
    status = Column(String(1), nullable=False)



 
class DistrictMaster(Base):
    __tablename__ = "district_master"

    district_lgd_code = Column(Integer, primary_key=True, index=True)
    district_name = Column(String(100), nullable=False)
    state_lgd_code = Column(Integer, nullable=False)
    status = Column(String(1), nullable=False)   



class BlockMaster(Base):
    __tablename__ = "block_master"

    block_lgd_code = Column(Integer, primary_key=True, index=True)
    block_name = Column(String(100), nullable=False)
    district_lgd_code = Column(Integer, nullable=False)
    status = Column(String(1), nullable=False)



class CentreMaster(Base):
    __tablename__ = "centre_masters"

    centre_id = Column(BigInteger, primary_key=True)

    centre_name = Column(String(255), nullable=False)
    address = Column(String(1000), nullable=False)
    location = Column(String(255), nullable=False)

    latitude = Column(Numeric(11, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)

    pin = Column(String(6), nullable=False)
    phone_number = Column(String(50), nullable=False)
    email = Column(String(500), nullable=False)

    block_id = Column(Integer, nullable=False)
    district_id = Column(Integer, nullable=False)
    state_id = Column(SmallInteger, nullable=False)

    status = Column(Integer, nullable=False, default=1)
    created_at = Column(
    DateTime,
    nullable=False,
    server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
    DateTime,
    nullable=False,
    server_default=text("CURRENT_TIMESTAMP"),
   )

    deleted_at = Column(
    DateTime,
    nullable=True,
    )



class ParticipantMcq(Base):
    __tablename__ = "participant_mcqs"

    participant_mcq_id = Column(BigInteger, primary_key=True)

    participant_id = Column(BigInteger)

    attempt_id = Column(Integer)

    course_id = Column(BigInteger)

    module_id = Column(BigInteger)

    mcq_id = Column(BigInteger)

    option_selected = Column(String)

    correct_option = Column(String)

    created_date = Column(DateTime)

    is_active = Column(Integer)



class ParticipantScq(Base):
    __tablename__ = "participant_scs"

    participant_scq_id = Column(BigInteger, primary_key=True)

    participant_id = Column(BigInteger)

    module_id = Column(Integer)

    attempt_id = Column(Integer)

    single_choice_id = Column(BigInteger)

    option_selected = Column(String)

    correct_option = Column(String)

    created_date = Column(DateTime)

    is_active = Column(Integer)





class ParticipantDb(Base):
    __tablename__ = "participant_dbs"

    participant_db_id = Column(BigInteger, primary_key=True)

    participant_id = Column(BigInteger)

    attempt_id = Column(Integer)

    course_id = Column("cource_id", Integer)

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

    left_option = Column(String)

    right_option = Column(String)

    is_correct = Column(String)

    created_date = Column(DateTime)

    is_active = Column(Integer)