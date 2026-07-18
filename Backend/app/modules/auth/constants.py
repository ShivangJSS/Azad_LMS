# app/modules/auth/constants.py

from enum import IntEnum


class UserRole(IntEnum):
    SUPER_ADMIN = 1
    ADMIN = 2
    STATE_LEAD = 3
    DISTRICT_LEAD = 4
    PI = 5


ACTIVE = "1"
INACTIVE = "0"

ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7