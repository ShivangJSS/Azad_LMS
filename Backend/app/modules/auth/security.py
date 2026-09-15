import bcrypt

BCRYPT_MAX_BYTES = 72
BCRYPT_ROUNDS = 12
_PHP_PREFIX = b"$2y$"


def _encode_password(password: str) -> bytes:
    return password.encode("utf-8")[:BCRYPT_MAX_BYTES]


# ==========================================================
# Verify Password
# ==========================================================


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against a bcrypt hash.

    Returns True if the password matches.
    """

    try:
        return bcrypt.checkpw(
            _encode_password(plain_password),
            hashed_password.encode("utf-8"),
        )
    except ValueError, TypeError:
        return False


# ==========================================================
# Hash Password
# ==========================================================


def hash_password(
    password: str,
) -> str:
    """
    Hash a password using bcrypt.
    """

    hashed = bcrypt.hashpw(
        _encode_password(password),
        bcrypt.gensalt(rounds=BCRYPT_ROUNDS),
    )

    # Existing LMS rows created by Laravel use the $2y$ bcrypt prefix.
    return (_PHP_PREFIX + hashed[4:]).decode("utf-8")
