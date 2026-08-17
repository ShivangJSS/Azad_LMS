from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    Integer,
    String,
    text,
)

from app.database.database import Base





class BatchMaster(Base):
    __tablename__ = "batch_masters"

    batch_id = Column(BigInteger, primary_key=True, index=True)
    batch_name = Column(String(255), nullable=False)
    created_by = Column(BigInteger, nullable=False)
    status = Column(Integer, nullable=False)

    created_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    deleted_at = Column(DateTime)

    centre_id = Column(BigInteger, nullable=False)

    fy_year = Column(String(7), nullable=False)


class BatchParticipant(Base):
    __tablename__ = "batch_participant"

    batch_participant_id = Column(
        BigInteger,
        primary_key=True,
        index=True,
    )

    batch_id = Column(BigInteger, nullable=False)

    participant_id = Column(BigInteger, nullable=False)

    created_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    updated_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    deleted_at = Column(DateTime)