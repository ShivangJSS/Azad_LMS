from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.modules.master.state.model import StateMaster


class DistrictMaster(Base):
    __tablename__ = "district_master"

    district_lgd_code: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    district_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    state_lgd_code: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("state_master.state_lgd_code"),
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(1),
        nullable=False,
        default="1",
    )

    state: Mapped["StateMaster"] = relationship(
        "StateMaster",
        back_populates="districts",
    )