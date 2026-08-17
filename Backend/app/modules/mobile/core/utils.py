from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import bcrypt
from jose import JWTError, jwt

from app.modules.mobile.core.constants import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)

# ------------------------------------------------------------------
# Password Hashing
#
# bcrypt is used directly rather than through passlib: passlib 1.7.4 probes
# its bcrypt backend with a 73-byte password, which bcrypt 5.x rejects
# outright, so every hash and verify call raised ValueError.
#
# bcrypt itself only ever considers the first 72 bytes, so the truncation
# below is what passlib used to do silently.
# ------------------------------------------------------------------

BCRYPT_ROUNDS = 12
BCRYPT_MAX_BYTES = 72

# Laravel wrote these hashes with the $2y$ prefix and the web LMS still reads
# them, so new hashes keep that prefix. $2y$ and $2b$ are the same algorithm.
_PHP_PREFIX = b"$2y$"


def _encode(password: str) -> bytes:
    return password.encode("utf-8")[:BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    """
    Generate a bcrypt hash in the $2y$ format the rest of the LMS uses.
    """

    hashed = bcrypt.hashpw(
        _encode(password),
        bcrypt.gensalt(rounds=BCRYPT_ROUNDS),
    )

    return (_PHP_PREFIX + hashed[4:]).decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a participant password against a stored hash.

    Accepts the $2a$, $2b$ and $2y$ variants, which is what the existing rows
    contain. Returns False rather than raising on a malformed hash.
    """

    if not hashed_password:
        return False

    try:
        return bcrypt.checkpw(
            _encode(plain_password),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


# ------------------------------------------------------------------
# Access Token
# ------------------------------------------------------------------

def create_access_token(
    participant_id: int,
    username: str,
) -> str:
    """
    Create JWT access token.
    """

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
     "sub": str(participant_id),
     "participant_id": participant_id,
     "username": username,
     "token_type": "access",
     "iss": "azad-mobile",
     "exp": expire,
}

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ------------------------------------------------------------------
# Refresh Token
# ------------------------------------------------------------------

def create_refresh_token(
    participant_id: int,
    username: str,
) -> str:
    """
    Create JWT refresh token.
    """

    expire = datetime.now(timezone.utc) + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )

    payload = {
     "sub": str(participant_id),
     "participant_id": participant_id,
     "username": username,
     "token_type": "refresh",
     "iss": "azad-mobile",
     "exp": expire,
}

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ------------------------------------------------------------------
# Decode Token
# ------------------------------------------------------------------

def decode_token(
    token: str,
) -> Optional[dict[str, Any]]:
    """
    Decode JWT token.
    """

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return payload

    except JWTError:
        return None


# ------------------------------------------------------------------
# Get Participant ID From Token
# ------------------------------------------------------------------

def get_participant_id_from_token(
    token: str,
) -> Optional[int]:
    """
    Extract participant_id from JWT.
    """

    payload = decode_token(token)

    if payload is None:
        return None

    return payload.get("participant_id")


# ------------------------------------------------------------------
# Check Token Type
# ------------------------------------------------------------------

def is_access_token(token: str) -> bool:
    payload = decode_token(token)

    if payload is None:
        return False

    return payload.get("token_type") == "access"


def is_refresh_token(token: str) -> bool:
    payload = decode_token(token)

    if payload is None:
        return False

    return payload.get("token_type") == "refresh"