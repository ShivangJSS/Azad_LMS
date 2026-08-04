from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    text,
)

from app.database.database import Base


class AssessmentMaster(Base):
    __tablename__ = "assessment_master"

    assessment_id = Column(Integer, primary_key=True)
    parent_id = Column(Integer)
    assessment_name = Column(String)
    module_id = Column(Integer)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)




class PostSessionAssessment(Base):
    __tablename__ = "post_session_assessment"

    post_session_assessment_id = Column(BigInteger, primary_key=True)

    assessment_id = Column(BigInteger)

    module_id = Column(BigInteger)

    topic_id = Column(Integer)

    is_active = Column(Integer)

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime)


class McqMaster(Base):
    __tablename__ = "mcq_master"

    mcq_id = Column(BigInteger, primary_key=True)

    parent_id = Column(BigInteger)

    mcq_question_title = Column(String(500))

    mcq_question_description = Column(Text)

    image_url = Column(String(500))

    status = Column(Integer)

    marks = Column(Numeric(6, 2))

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)


class ScqMaster(Base):
    __tablename__ = "scq_master"

    scq_id = Column(BigInteger, primary_key=True)

    parent_id = Column(BigInteger)

    scq_question_title = Column(String(500))

    scq_question_description = Column(Text)

    image_url = Column(String(500))

    status = Column(Integer)

    marks = Column(Numeric(6, 2))

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)

class MatchMakingMaster(Base):
    __tablename__ = "match_making_masters"

    match_making_id = Column(BigInteger, primary_key=True)

    parent_id = Column(BigInteger)

    match_making_question_title = Column(String(500))

    match_making_question_description = Column(Text)

    image_url = Column(String(500))

    status = Column(Integer)

    marks = Column(Numeric(6, 2))

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)



class AssessmentMapping(Base):
    __tablename__ = "assessment_mapping"

    assessmentmapping_id = Column(BigInteger, primary_key=True)

    assessment_id = Column(BigInteger, nullable=False)

    assessment_type = Column(String(255), nullable=False)
    # MCQ
    # SCQ
    # DB
    # MM

    assessment_ref_id = Column(BigInteger, nullable=False)

    is_active = Column(Integer)

    created_at = Column(DateTime)

    updated_at = Column(DateTime)




class McqQuestionOption(Base):
    __tablename__ = "mcq_question_options"

    mcq_option_id = Column(Integer, primary_key=True)

    mcq_id = Column(BigInteger)

    mcq_option_text = Column(String(500))

    is_mcq_option_correct = Column(Integer)

    status = Column(Integer)

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)


class ScqQuestionOption(Base):
    __tablename__ = "scq_question_options"

    scq_option_id = Column(Integer, primary_key=True)

    scq_id = Column(BigInteger)

    scq_option_text = Column(String(500))

    is_scq_option_correct = Column(Integer)

    status = Column(Integer)

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)


class MatchLeftItem(Base):
    __tablename__ = "match_left_items"

    match_left_id = Column(BigInteger, primary_key=True)

    match_making_id = Column(BigInteger)

    match_left_text = Column(String(500))

    sort_order = Column(String(50))

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)


class MatchRightItem(Base):
    __tablename__ = "match_right_items"

    match_right_id = Column(BigInteger, primary_key=True)

    match_making_id = Column(BigInteger)

    match_right_text = Column(String(500))

    sort_order = Column(String(50))

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)


class MatchCorrectAnswer(Base):
    __tablename__ = "match_correct_answers"

    match_correct_answers_id = Column(BigInteger, primary_key=True)

    match_making_id = Column(BigInteger)

    match_left_id = Column(BigInteger)

    match_right_id = Column(BigInteger)

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime)