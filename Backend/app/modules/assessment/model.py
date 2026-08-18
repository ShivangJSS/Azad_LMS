from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    ForeignKey,
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
    is_active = Column(Integer)
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

    mcq_id = Column(BigInteger, primary_key=True, autoincrement=True)

    parent_id = Column(BigInteger, nullable=True)

    mcq_question_title = Column(String(500))

    mcq_question_description = Column(Text)

    image_url = Column(String(500))

    status = Column(Integer, default=1)

    marks = Column(Numeric(6, 2))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    updated_at = Column(
    DateTime,
    server_default=text("CURRENT_TIMESTAMP"),
    onupdate=text("CURRENT_TIMESTAMP"),
)
    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)


class ScqMaster(Base):
    __tablename__ = "scq_master"

    scq_id = Column(BigInteger, primary_key=True, autoincrement=True)

    parent_id = Column(BigInteger, nullable=True)

    scq_question_title = Column(String(500))

    scq_question_description = Column(Text)

    image_url = Column(String(500))

    status = Column(Integer, default=1)

    marks = Column(Numeric(6, 2))

    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    updated_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)

class MatchMakingMaster(Base):
    __tablename__ = "match_making_masters"

    match_making_id = Column(
    BigInteger,
    primary_key=True,
    autoincrement=True,
)

    deleted_at = Column(
      DateTime,
      nullable=True,
)

    parent_id = Column(BigInteger)

    match_making_question_title = Column(String(500))

    match_making_question_description = Column(Text)

    image_url = Column(String(500))

    status = Column(Integer)

    marks = Column(Numeric(6, 2))

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    

    language_id = Column(BigInteger)



class AssessmentMapping(Base):
    __tablename__ = "assessment_mapping"

    # Map to the real DB column name "assessment_mapping_id" (the attribute
    # keeps its old name so existing code keeps working).
    assessmentmapping_id = Column(
        "assessment_mapping_id",
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

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

    mcq_option_id = Column(BigInteger, primary_key=True, autoincrement=True)

    mcq_id = Column(
        BigInteger,
        ForeignKey("mcq_master.mcq_id"),
        nullable=False,
    )

    mcq_option_text = Column(String(500))

    is_mcq_option_correct = Column(Integer)

    status = Column(Integer, default=1)

    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    updated_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    deleted_at = Column(DateTime, nullable=True)

    language_id = Column(BigInteger)


class ScqQuestionOption(Base):
    __tablename__ = "scq_question_options"

    scq_option_id = Column(BigInteger, primary_key=True, autoincrement=True)

    scq_id = Column(
        BigInteger,
        ForeignKey("scq_master.scq_id"),
        nullable=False,
    )

    scq_option_text = Column(String(500))

    is_scq_option_correct = Column(Integer)

    status = Column(Integer, default=1)

    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    updated_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )

    deleted_at = Column(DateTime, nullable=True)

    language_id = Column(BigInteger)


class MatchLeftItem(Base):
    __tablename__ = "match_left_items"

    match_left_id = Column(BigInteger, primary_key=True,autoincrement=True)

    match_making_id = Column(
    BigInteger,
    ForeignKey(
        "match_making_masters.match_making_id"
    ),
)

    match_left_text = Column(String(500))



    sort_order = Column(String(50))



    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)


class MatchRightItem(Base):
    __tablename__ = "match_right_items"

    match_right_id = Column(BigInteger, primary_key=True,autoincrement=True)

    match_making_id = Column(
    BigInteger,
    ForeignKey(
        "match_making_masters.match_making_id"
    ),
)

    match_right_text = Column(String(500))

    sort_order = Column(String(50))



    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime)

    language_id = Column(BigInteger)


class MatchCorrectAnswer(Base):
    __tablename__ = "match_correct_answers"

    match_correct_answers_id = Column(BigInteger, primary_key=True,autoincrement=True)

    match_making_id = Column(
    BigInteger,
    ForeignKey(
        "match_making_masters.match_making_id"
    ),
)

    match_left_id = Column(
     BigInteger,
     ForeignKey(
        "match_left_items.match_left_id"
    ),
)

    match_right_id = Column(
     BigInteger,
     ForeignKey(
        "match_right_items.match_right_id"
    ),
)

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(
     DateTime,
     nullable=True,
)




class DropBucketMaster(Base):
    __tablename__ = "drop_bucket_masters"

    drop_bucket_id = Column(BigInteger, primary_key=True,autoincrement=True)

    parent_id = Column(BigInteger)

    drop_bucket_question_title = Column(String(500))

    drop_bucket_question_description = Column(Text)

    image_url = Column(String(500))

    status = Column(Integer)

    marks = Column(Numeric(6, 2))

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime,nullable=True)

    language_id = Column(BigInteger)


    
class DropBucket(Base):
    __tablename__ = "drop_buckets"

    bucket_id = Column(BigInteger, primary_key=True,autoincrement=True)

    drop_bucket_id = Column(
    BigInteger,
    ForeignKey("drop_bucket_masters.drop_bucket_id"),
)


  

    bucket_name = Column(String(500))

    bucket_image = Column(String(1000))

    status = Column(Integer)

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime,nullable=True)

    language_id = Column(BigInteger)


class DropBucketItem(Base):
    __tablename__ = "drop_bucket_items"

    drop_bucket_item_id = Column(BigInteger, primary_key=True,autoincrement=True)

    bucket_id = Column(
    BigInteger,
    ForeignKey("drop_buckets.bucket_id"),
)

    item_name = Column(String(500))

    item_image = Column(String(1000))

    status = Column(Integer)

    created_at = Column(DateTime)

    updated_at = Column(DateTime)

    deleted_at = Column(DateTime,nullable=True)

    language_id = Column(BigInteger)