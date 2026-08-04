from enum import Enum


class Status(str, Enum):
    ACTIVE = "1"
    INACTIVE = "0"

    @classmethod
    def get_label(cls, value: str) -> str:
        value = str(value).strip()

        labels = {
            cls.ACTIVE.value: "Active",
            cls.INACTIVE.value: "Inactive",
        }

        return labels.get(value, "-")


class UserRole(str, Enum):
    SUPER_ADMIN = "1"
    ADMIN = "2"
    STATE_HEAD = "3"
    DISTRICT_HEAD = "4"
    PI = "5"

    @classmethod
    def get_label(cls, value: str) -> str:
        value = str(value).strip()

        labels = {
            cls.SUPER_ADMIN.value: "Super Admin",
            cls.ADMIN.value: "Admin",
            cls.STATE_HEAD.value: "State Head",
            cls.DISTRICT_HEAD.value: "District Head",
            cls.PI.value: "PI",
        }

        return labels.get(value, "-")