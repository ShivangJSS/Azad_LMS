from datetime import datetime, timedelta, timezone
from typing import Any

import os

from dotenv import load_dotenv
from jose import JWTError, jwt


# ==========================================================
# JWT Configuration
# ==========================================================

load_dotenv()

_secret_key = os.getenv("SECRET_KEY")

if not _secret_key:
    raise RuntimeError(
        "SECRET_KEY is not configured. "
        "Please add SECRET_KEY to your .env file."
    )

# Explicit str assignment prevents Pylance str | None errors
SECRET_KEY: str = _secret_key

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7
RESET_PASSWORD_EXPIRE_MINUTES = 15


# ==========================================================
# Create Access Token
# ==========================================================

def create_access_token(
    data: dict[str, str],
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a JWT access token.
    """

    to_encode: dict[str, Any] = data.copy()

    if expires_delta is not None:
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

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ==========================================================
# Create Refresh Token
# ==========================================================

def create_refresh_token(user_id: int) -> str:
    """
    Create a JWT refresh token.
    """

    expire = datetime.now(timezone.utc) + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )

    payload: dict[str, Any] = {
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
# Verify / Decode Token
# ==========================================================

def verify_token(
    token: str,
) -> dict[str, Any] | None:
    """
    Decode and verify a JWT token.

    Returns the decoded payload when valid.
    Returns None when invalid or expired.
    """

    try:
        payload: dict[str, Any] = jwt.decode(
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

def verify_refresh_token(
    token: str,
) -> dict[str, Any] | None:
    """
    Verify that the JWT is a valid refresh token.
    """

    payload = verify_token(token)

    if payload is None:
        return None

    if payload.get("type") != "refresh":
        return None

    if not payload.get("sub"):
        return None

    return payload


# ==========================================================
# Create Reset Password Token
# ==========================================================

def create_reset_password_token(
    email: str,
) -> str:
    """
    Create a short-lived password reset token.
    """

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=RESET_PASSWORD_EXPIRE_MINUTES
    )

    payload: dict[str, Any] = {
        "sub": email,
        "type": "reset_password",
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ==========================================================
# Verify Reset Password Token
# ==========================================================

def verify_reset_password_token(
    token: str,
) -> dict[str, Any] | None:
    """
    Verify that the JWT is a valid password reset token.
    """

    payload = verify_token(token)

    if payload is None:
        return None

    if payload.get("type") != "reset_password":
        return None

    if not payload.get("sub"):
        return None

    return payload