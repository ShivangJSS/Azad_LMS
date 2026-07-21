from enum import Enum


class UserStatus(str, Enum):
    ACTIVE = "1"
    INACTIVE = "0"


class UserRole(str, Enum):
    SUPER_ADMIN = "1"
    ADMIN = "2"
    STATE_HEAD = "3"
    DISTRICT_HEAD = "4"
    PI = "5"
