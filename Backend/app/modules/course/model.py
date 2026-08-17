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


class CourseMaster(Base):
    __tablename__ = "course_masters"

    course_id = Column(BigInteger, primary_key=True, index=True)

    parent_id = Column(BigInteger)

    course_code = Column(String(10))

    course_name = Column(String(500))

    course_description = Column(Text)

    course_image = Column(String(500))

    created_by = Column(BigInteger)

    status = Column(Integer)

    images = Column(String(2000))

    language_id = Column(BigInteger)

    created_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    deleted_at = Column(DateTime)
    