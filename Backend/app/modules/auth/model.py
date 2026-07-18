from sqlalchemy import BigInteger, Column, DateTime, String
from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)

    name = Column(String(255), nullable=False)

    username = Column(String(255), nullable=True)

    email = Column(String(255), unique=True, index=True, nullable=False)

    email_verified_at = Column(DateTime, nullable=True)

    password = Column(String(255), nullable=False)

    remember_token = Column(String(100), nullable=True)

    api_token = Column(String(255), nullable=True)

    role = Column(String(50), nullable=False)

    responsibility = Column(String(50), nullable=True)

    state_lgd_code = Column(BigInteger, nullable=True)

    district_lgd_code = Column(BigInteger, nullable=True)

    block_lgd_code = Column(BigInteger, nullable=True)

    centre_id = Column(BigInteger, nullable=True)

    status = Column(String(1), nullable=False)

    created_at = Column(DateTime)

    updated_at = Column(DateTime)