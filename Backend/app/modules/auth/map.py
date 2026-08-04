from app.modules.auth.constants import UserRole
from .constants import Permission


PERMISSION_MAP: dict[UserRole, set[Permission]] = {
    UserRole.SUPER_ADMIN: {
        Permission.DASHBOARD_VIEW,
        Permission.PARTICIPANT_CREATE,
        Permission.USER_CREATE,
        Permission.ASSESSMENT_VIEW,
        Permission.DOCUMENT_MANAGE,
        Permission.MODULE_MANAGE,
        Permission.MASTER_MANAGE,
        Permission.CENTRE_CREATE,
        Permission.CENTRE_VIEW,
        Permission.CENTRE_UPDATE,
        Permission.CENTRE_DELETE,
        Permission.BATCH_MANAGE,
    },
    UserRole.ADMIN: {
        Permission.DASHBOARD_VIEW,
        Permission.PARTICIPANT_CREATE,
        Permission.USER_CREATE,
        Permission.ASSESSMENT_VIEW,
        Permission.DOCUMENT_MANAGE,
        Permission.MODULE_MANAGE,
    },
    UserRole.STATE_LEAD: {
        Permission.DASHBOARD_VIEW,
        Permission.PARTICIPANT_CREATE,
        Permission.ASSESSMENT_VIEW,
        Permission.BATCH_MANAGE,
    },
    UserRole.DISTRICT_LEAD: {
        Permission.DASHBOARD_VIEW,
        Permission.PARTICIPANT_CREATE,
        Permission.ASSESSMENT_VIEW,
        Permission.BATCH_MANAGE,
    },
    UserRole.PI: {
        Permission.DASHBOARD_VIEW,
        Permission.PARTICIPANT_CREATE,
        Permission.ASSESSMENT_VIEW,
    },
}
