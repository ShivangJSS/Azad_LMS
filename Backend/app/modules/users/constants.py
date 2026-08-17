from enum import IntEnum


class UserRole(IntEnum):
    SUPER_ADMIN = 1
    ADMIN = 2
    STATE_LEAD = 3
    DISTRICT_LEAD = 4
    PI = 5



ROLE_LABELS = {
    UserRole.SUPER_ADMIN: "Super Admin",
    UserRole.ADMIN: "Admin",
    UserRole.STATE_LEAD: "State Lead",
    UserRole.DISTRICT_LEAD: "District Lead",
    UserRole.PI: "PI",
}


CREATABLE_ROLES = {
    UserRole.SUPER_ADMIN: [
        UserRole.ADMIN,
    ],

    UserRole.ADMIN: [
        UserRole.STATE_LEAD,
        UserRole.DISTRICT_LEAD,
        UserRole.PI,
    ],

    UserRole.STATE_LEAD: [
        UserRole.DISTRICT_LEAD,
        UserRole.PI,
    ],

    UserRole.DISTRICT_LEAD: [
        UserRole.PI,
    ],

    UserRole.PI: [],
}


ACTIVE = 1
INACTIVE = 0