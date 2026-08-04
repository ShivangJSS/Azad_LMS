from datetime import datetime

from sqlalchemy import BigInteger, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    username: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    email_verified_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    remember_token: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    api_token: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    responsibility: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    state_lgd_code: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
    )

    district_lgd_code: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
    )

    block_lgd_code: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
    )

    centre_id: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(1),
        nullable=False,
    )

    created_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )
