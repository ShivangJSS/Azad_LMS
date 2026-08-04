from enum import Enum
from typing import Set

from fastapi import Depends, HTTPException, status

from app.common.enums import UserRole
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.model import User


class Module(str, Enum):
    DASHBOARD = "DASHBOARD"
    CREATE_PARTICIPANT = "CREATE_PARTICIPANT"
    CREATE_USER = "CREATE_USER"
    ASSESSMENT = "ASSESSMENT"
    DOCUMENT_MANAGEMENT = "DOCUMENT_MANAGEMENT"
    MODULE_MANAGEMENT = "MODULE_MANAGEMENT"
    MASTER = "MASTER"
    CENTRES = "CENTRES"
    BATCH = "BATCH"
    REFERENCE_DATA = "REFERENCE_DATA"


MODULE_ACCESS_MATRIX: dict[UserRole, Set[Module]] = {
    UserRole.SUPER_ADMIN: {
        Module.DASHBOARD,
        Module.CREATE_PARTICIPANT,
        Module.CREATE_USER,
        Module.ASSESSMENT,
        Module.DOCUMENT_MANAGEMENT,
        Module.MODULE_MANAGEMENT,
        Module.MASTER,
        Module.CENTRES,
        Module.BATCH,
        Module.REFERENCE_DATA,
    },
    UserRole.ADMIN: {
        Module.DASHBOARD,
        Module.CREATE_PARTICIPANT,
        Module.CREATE_USER,
        Module.ASSESSMENT,
        Module.DOCUMENT_MANAGEMENT,
        Module.MODULE_MANAGEMENT,
        Module.REFERENCE_DATA,
    },
    UserRole.STATE_HEAD: {
        Module.DASHBOARD,
        Module.CREATE_PARTICIPANT,
        Module.ASSESSMENT,
        Module.BATCH,
        Module.REFERENCE_DATA,
    },
    UserRole.DISTRICT_HEAD: {
        Module.DASHBOARD,
        Module.CREATE_PARTICIPANT,
        Module.ASSESSMENT,
        Module.BATCH,
        Module.REFERENCE_DATA,
    },
    UserRole.PI: {
        Module.DASHBOARD,
        Module.CREATE_PARTICIPANT,
        Module.ASSESSMENT,
        Module.REFERENCE_DATA,
    },
}


def require_module_access(module: Module):
    def module_access_checker(
        current_user: User = Depends(get_current_user),
    ) -> None:
        user_role = UserRole(str(current_user.role))

        if module not in MODULE_ACCESS_MATRIX.get(user_role, set()):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You don't have permission to access the {module.value} module.",
            )

    return module_access_checker
