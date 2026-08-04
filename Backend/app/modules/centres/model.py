from sqlalchemy import BigInteger, Column, DateTime, Integer, Numeric, SmallInteger, String, text

from app.database.database import Base


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

class BlockMaster(Base):
    __tablename__ = "block_master"

    block_lgd_code = Column(Integer, primary_key=True, index=True)
    block_name = Column(String(100), nullable=False)
    district_lgd_code = Column(Integer, nullable=False)
    status = Column(String(1), nullable=False)