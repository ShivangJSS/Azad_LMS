from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt

# ==========================================================
# JWT Configuration
# ==========================================================

SECRET_KEY = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60

REFRESH_TOKEN_EXPIRE_DAYS = 7

RESET_PASSWORD_EXPIRE_MINUTES = 15

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
            "exp": expire,
            "type": "access",
        }
    )

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encoded_jwt

# ==========================================================
# Refresh Token
# ==========================================================


def create_refresh_token(user_id: int):

    expire = datetime.now(timezone.utc) + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )

    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


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
    

    # ==========================================================
# Verify Refresh Token
# ==========================================================

def verify_refresh_token(token: str):

    payload = verify_token(token)

    if payload is None:
        return None

    if payload.get("type") != "refresh":
        return None

    return payload





def create_reset_password_token(email: str):

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=RESET_PASSWORD_EXPIRE_MINUTES
    )

    payload = {
        "sub": email,
        "type": "reset_password",
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )