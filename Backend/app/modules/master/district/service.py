"""Service layer for District Master module.

Role values are strings throughout (UserRole is a str-Enum), so no int()
conversion happens anywhere in this file. Converting breaks every comparison
silently: int("1") == UserRole.SUPER_ADMIN is False, which downgrades every
user to the most restricted branch and returns an empty list.
"""

import math

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.common.enums import UserRole
from app.modules.audit_log.service import create_audit_log
from app.modules.auth.model import User

from . import repository
from .exceptions import (
    DistrictAlreadyExistsError,
    DistrictDeleteError,
    DistrictNotFoundError,
    StateNotFoundError,
)
from .model import DistrictMaster
from .schema import (
    DeleteDistrictResponse,
    DistrictCreateRequest,
    DistrictListResponse,
    DistrictResponse,
    DistrictUpdateRequest,
)

PRIVILEGED_ROLES = frozenset(
    {
        UserRole.SUPER_ADMIN.value,
        UserRole.ADMIN.value,
    }
)

DISTRICT_SCOPED_ROLES = frozenset(
    {
        UserRole.DISTRICT_HEAD.value,
        UserRole.PI.value,
    }
)


def _get_user_role(current_user: User) -> str:
    """Return the caller's role as a string.

    UserRole is a str-Enum, so its members compare equal to plain strings.
    """
    if current_user.role is None:  # type: ignore [reportUnnecessaryComparison]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user role.",
        )

    return str(current_user.role)


def _empty_list(page: int, per_page: int) -> DistrictListResponse:
    return DistrictListResponse(
        data=[],
        total=0,
        page=page,
        per_page=per_page,
        total_pages=0,
    )


def _snapshot(district: DistrictMaster) -> dict[str, object]:
    """JSON-serialisable copy of the row, for the audit log."""
    return {
        column.name: getattr(district, column.name)
        for column in district.__table__.columns
    }


def _map_district(district: DistrictMaster) -> DistrictResponse:
    return DistrictResponse(
        district_lgd_code=district.district_lgd_code,
        district_name=district.district_name,
        state_lgd_code=district.state_lgd_code,
        state_name=(district.state.state_name if district.state else None),
        status=district.status,
    )


def create_district_service(
    db: Session,
    request: DistrictCreateRequest,
    current_user: User,
) -> DistrictResponse:

    existing = repository.get_district_by_code(
        db=db,
        district_lgd_code=request.district_lgd_code,
    )

    if existing:
        raise DistrictAlreadyExistsError()

    state = repository.get_state_by_code(
        db=db,
        state_lgd_code=request.state_lgd_code,
    )

    if not state:
        raise StateNotFoundError()

    district = DistrictMaster(
        district_lgd_code=request.district_lgd_code,
        district_name=request.district_name,
        state_lgd_code=request.state_lgd_code,
        status=request.status,
    )

    try:
        repository.create_district(db=db, district=district)

        create_audit_log(
            db=db,
            user=current_user,
            action="CREATE",
            entity="District",
            entity_id=str(request.district_lgd_code),
            details={"new_district": request.model_dump(mode="json")}, # type: ignore
        )

        db.commit()

        created_district = repository.get_district_by_code(
            db=db,
            district_lgd_code=request.district_lgd_code,
        )

        if not created_district:
            raise DistrictNotFoundError()

        return _map_district(created_district)

    except IntegrityError as exc:
        db.rollback()
        raise DistrictAlreadyExistsError() from exc

    except SQLAlchemyError:
        db.rollback()
        raise


def get_districts_service(
    db: Session,
    state_lgd_code: int | None,
    district_name: str | None,
    district_status: str | None,
    page: int,
    per_page: int,
    current_user: User,
) -> DistrictListResponse:

    user_role = _get_user_role(current_user)

    district_lgd_code: int | None = None

    if user_role not in PRIVILEGED_ROLES:
        user_state_code = current_user.state_lgd_code

        if not user_state_code:
            return _empty_list(page, per_page)

        # A scoped user asking for someone else's state gets nothing.
        if state_lgd_code is not None and state_lgd_code != user_state_code:
            return _empty_list(page, per_page)

        state_lgd_code = user_state_code

        # District-level users are further narrowed to their own district.
        # This must go into the query, not a post-filter on the page: filtering
        # after pagination drops rows that were never fetched and makes `total`
        # report the size of one page instead of the whole result set.
        if user_role in DISTRICT_SCOPED_ROLES:
            if not current_user.district_lgd_code:
                return _empty_list(page, per_page)

            district_lgd_code = current_user.district_lgd_code

    districts, total = repository.get_districts(
        db=db,
        state_lgd_code=state_lgd_code,
        district_lgd_code=district_lgd_code,
        district_name=district_name,
        district_status=district_status,
        page=page,
        per_page=per_page,
    )

    return DistrictListResponse(
        data=[_map_district(district) for district in districts],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page) if total and per_page else 0,
    )


def get_district_service(
    db: Session,
    district_lgd_code: int,
    current_user: User,
) -> DistrictResponse:

    district = repository.get_district_by_code(
        db=db,
        district_lgd_code=district_lgd_code,
    )

    if not district:
        raise DistrictNotFoundError()

    user_role = _get_user_role(current_user)


    if user_role not in PRIVILEGED_ROLES:

        if user_role == UserRole.STATE_HEAD.value:
            if (
                not current_user.state_lgd_code
                or current_user.state_lgd_code != district.state_lgd_code
            ):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to access this district.",
                )

        elif user_role in DISTRICT_SCOPED_ROLES:
            if (
                not current_user.district_lgd_code
                or current_user.district_lgd_code != district.district_lgd_code
            ):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to access this district.",
                )

        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this district.",
            )



    return _map_district(district)


def update_district_service(
    db: Session,
    district_lgd_code: int,
    request: DistrictUpdateRequest,
    current_user: User,
) -> DistrictResponse:

    district = repository.get_district_by_code(
        db=db,
        district_lgd_code=district_lgd_code,
    )

    if not district:
        raise DistrictNotFoundError()

    state = repository.get_state_by_code(
        db=db,
        state_lgd_code=request.state_lgd_code,
    )

    if not state:
        raise StateNotFoundError()

    old_district_data = _snapshot(district)

    district.district_name = request.district_name
    district.state_lgd_code = request.state_lgd_code
    district.status = request.status

    try:
        repository.update_district(db=db, district=district)

        create_audit_log(
            db=db,
            user=current_user,
            action="UPDATE",
            entity="District",
            entity_id=str(district_lgd_code),
            details={ # type: ignore
                "old_district": old_district_data,
                "new_district": request.model_dump(mode="json"),
            },
        )

        db.commit()

        updated_district = repository.get_district_by_code(
            db=db,
            district_lgd_code=district_lgd_code,
        )

        if not updated_district:
            raise DistrictNotFoundError()

        return _map_district(updated_district)

    except IntegrityError:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()
        raise


def delete_district_service(
    db: Session,
    district_lgd_code: int,
    current_user: User,
) -> DeleteDistrictResponse:

    district = repository.get_district_by_code(
        db=db,
        district_lgd_code=district_lgd_code,
    )

    if not district:
        raise DistrictNotFoundError()

    # Captured before the delete: the instance is expired afterwards.
    deleted_district = _snapshot(district)

    try:
        repository.delete_district(db=db, district=district)

        create_audit_log(
            db=db,
            user=current_user,
            action="DELETE",
            entity="District",
            entity_id=str(district_lgd_code),
            details={"deleted_district": deleted_district},
        )

        db.commit()

        return DeleteDistrictResponse(message="District deleted successfully.")

    except IntegrityError as exc:
        db.rollback()
        raise DistrictDeleteError() from exc

    except SQLAlchemyError:
        db.rollback()
        raise