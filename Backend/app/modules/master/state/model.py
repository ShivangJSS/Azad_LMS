from sqlalchemy import SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

class StateMaster(Base):
    __tablename__ = "state_master"

    state_lgd_code: Mapped[int] = mapped_column(
        SmallInteger,
        primary_key=True,
        index=True,
    )

    state_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(1),
        nullable=False,
    )

    districts = relationship(
        "DistrictMaster",
        back_populates="state",
    )