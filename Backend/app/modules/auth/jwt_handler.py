from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt

# ==========================================================
# JWT Configuration
# ==========================================================

SECRET_KEY = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# ==========================================================
# Create JWT Token
# ==========================================================

def create_access_token(data: dict,
                        expires_delta: Optional[timedelta] = None):

    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update(
        {
            "exp": expire
        }
    )

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encoded_jwt


# ==========================================================
# Decode JWT
# ==========================================================

def verify_token(token: str):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return payload

    except JWTError:
        return None