from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Integer,
    String,
    Text,
    text,
)

from app.database.database import Base


class ModuleMaster(Base):
    __tablename__ = "module_masters"

    module_id = Column(BigInteger, primary_key=True, index=True)

    module_name = Column(String(255))

    parent_id = Column(BigInteger)

    fk_course_id = Column(BigInteger)

    # ==========================
    # Newly Added Columns
    # ==========================

    module_description = Column(Text)

    module_type = Column(BigInteger)

    module_duration = Column(String(100))

    publishing_status = Column(String(100))

    status = Column(Integer)

    language_id = Column(BigInteger)

    icon_images = Column(String(500))

    module_icon = Column(String(500))

    module_overview = Column(Text)

    module_objective = Column(Text)

    created_by = Column(BigInteger)

    self_paced_learning = Column(Integer)

    pre_session_assessment = Column(Integer)

    main_content_of_the_module = Column(Integer)

    post_session_assessment = Column(Integer)

    lock_status = Column(Integer)

    module_part_id = Column(BigInteger)

    module_part_type = Column(String(100))

    # ==========================
    # Existing Columns
    # ==========================

    created_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    deleted_at = Column(DateTime)


class ModuleType(Base):
    __tablename__ = "module_type"

    module_type_id = Column(BigInteger, primary_key=True, index=True)

    module_type = Column(String(255))

    status = Column(Integer)

    created_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    deleted_at = Column(DateTime)



class TopicMapping(Base):
    __tablename__ = "topic_mapping"

    topic_mapping_id = Column(BigInteger, primary_key=True, index=True)

    module_id = Column(BigInteger)

    topic_id = Column(BigInteger)

    doc_id = Column(BigInteger)

    status = Column(String(10))

    created_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        
        server_default=text("CURRENT_TIMESTAMP"),
    )    