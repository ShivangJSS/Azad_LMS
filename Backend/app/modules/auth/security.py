from typing import Protocol, cast

from passlib.context import CryptContext  # pyright: ignore[reportMissingTypeStubs]


# ==========================================================
# Type Definition
# ==========================================================

class PasswordContext(Protocol):
    def verify(
        self,
        secret: str,
        hash: str,
    ) -> bool: ...

    def hash(
        self,
        secret: str,
    ) -> str: ...


# ==========================================================
# Password Configuration
# ==========================================================

_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

pwd_context = cast(PasswordContext, _context)


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

    return pwd_context.verify(
        plain_password,
        hashed_password,
    )


# ==========================================================
# Hash Password
# ==========================================================

def hash_password(
    password: str,
) -> str:
    """
    Hash a password using bcrypt.
    """

    return pwd_context.hash(password)