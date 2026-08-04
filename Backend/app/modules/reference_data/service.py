"""Application queries for shared, read-only reference data.

This module owns API projections and scope checks only.  Master and Centres
continue to own their entities and management workflows.
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.common.enums import UserRole
from app.modules.auth.model import User
from app.modules.centres.repository import CentreRepository

from .schema import (
    ReferenceCentreResponse,
    ReferenceDistrictResponse,
    ReferenceStateResponse,
)

_GLOBAL_ROLES = frozenset({UserRole.SUPER_ADMIN, UserRole.ADMIN})


def _role_for(user: User) -> UserRole:
    try:
        return UserRole(str(user.role))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid user role.",
        ) from exc


def _assert_requested_scope(
    supplied: int | None,
    assigned: int | None,
    label: str,
) -> None:
    if supplied is not None and supplied != assigned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You cannot access reference data outside your assigned {label}.",
        )


class ReferenceDataService:
    @staticmethod
    def states(db: Session, current_user: User) -> list[ReferenceStateResponse]:
        role = _role_for(current_user)
        state_id = None if role in _GLOBAL_ROLES else current_user.state_lgd_code

        if role not in _GLOBAL_ROLES and state_id is None:
            return []

        return [
            ReferenceStateResponse(code=state.state_lgd_code, name=state.state_name)
            for state in CentreRepository.get_active_states(db, state_id=state_id)
        ]

    @staticmethod
    def districts(
        db: Session,
        current_user: User,
        state_id: int | None,
    ) -> list[ReferenceDistrictResponse]:
        role = _role_for(current_user)

        if role in _GLOBAL_ROLES:
            if state_id is None:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="state_id is required when retrieving districts.",
                )
            effective_state_id = state_id
        else:
            _assert_requested_scope(state_id, current_user.state_lgd_code, "state")
            effective_state_id = current_user.state_lgd_code
            if effective_state_id is None:
                return []

        districts = CentreRepository.get_active_districts(db, effective_state_id)
        if role in {UserRole.DISTRICT_HEAD, UserRole.PI} and current_user.district_lgd_code:
            districts = [
                district
                for district in districts
                if district.district_lgd_code == current_user.district_lgd_code
            ]

        return [
            ReferenceDistrictResponse(
                code=district.district_lgd_code,
                name=district.district_name,
                parent_code=district.state_lgd_code,
            )
            for district in districts
        ]

    @staticmethod
    def centres(
        db: Session,
        current_user: User,
        state_id: int | None,
        district_id: int | None,
        search: str | None,
    ) -> list[ReferenceCentreResponse]:
        role = _role_for(current_user)

        effective_state_id = state_id
        effective_district_id = district_id
        effective_centre_id = None

        if role not in _GLOBAL_ROLES:
            _assert_requested_scope(state_id, current_user.state_lgd_code, "state")
            effective_state_id = current_user.state_lgd_code
            if effective_state_id is None:
                return []

        if role in {UserRole.DISTRICT_HEAD, UserRole.PI}:
            _assert_requested_scope(district_id, current_user.district_lgd_code, "district")
            effective_district_id = current_user.district_lgd_code
            if effective_district_id is None:
                return []

        if role == UserRole.PI and current_user.centre_id is not None:
            effective_centre_id = current_user.centre_id

        return [
            ReferenceCentreResponse(
                id=centre.centre_id,
                name=centre.centre_name,
                parent_code=centre.district_id,
            )
            for centre in CentreRepository.get_active_reference_centres(
                db=db,
                state_id=effective_state_id,
                district_id=effective_district_id,
                centre_id=effective_centre_id,
                search=search,
            )
        ]
