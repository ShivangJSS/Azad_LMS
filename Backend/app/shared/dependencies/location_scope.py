from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from fastapi import HTTPException, status

from app.common.enums import UserRole
from app.modules.auth.model import User


class LocationScopeLevel(str, Enum):
    GLOBAL = "global"
    STATE = "state"
    DISTRICT = "district"
    CENTRE = "centre"


@dataclass(frozen=True)
class LocationScope:
    level: LocationScopeLevel
    state_lgd_code: int | None = None
    district_lgd_code: int | None = None
    block_lgd_code: int | None = None
    centre_id: int | None = None


def get_location_scope(user: User) -> LocationScope:
    role = UserRole(str(user.role))

    if role in {UserRole.SUPER_ADMIN, UserRole.ADMIN}:
        return LocationScope(level=LocationScopeLevel.GLOBAL)

    if role == UserRole.STATE_HEAD:
        if user.state_lgd_code is None:
            raise _missing_scope()
        return LocationScope(
            level=LocationScopeLevel.STATE,
            state_lgd_code=user.state_lgd_code,
        )

    if role == UserRole.DISTRICT_HEAD:
        if user.state_lgd_code is None or user.district_lgd_code is None:
            raise _missing_scope()
        return LocationScope(
            level=LocationScopeLevel.DISTRICT,
            state_lgd_code=user.state_lgd_code,
            district_lgd_code=user.district_lgd_code,
        )

    if role == UserRole.PI:
        if (
            user.state_lgd_code is None
            or user.district_lgd_code is None
            or user.block_lgd_code is None
            or user.centre_id is None
        ):
            raise _missing_scope()
        return LocationScope(
            level=LocationScopeLevel.CENTRE,
            state_lgd_code=user.state_lgd_code,
            district_lgd_code=user.district_lgd_code,
            block_lgd_code=user.block_lgd_code,
            centre_id=user.centre_id,
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="The user has no valid location scope.",
    )


def assert_scope_value(
    user: User,
    *,
    state_lgd_code: int | None = None,
    district_lgd_code: int | None = None,
    block_lgd_code: int | None = None,
    centre_id: int | None = None,
) -> LocationScope:
    scope = get_location_scope(user)

    if scope.level == LocationScopeLevel.GLOBAL:
        return scope

    checks = {
        "state": (scope.state_lgd_code, state_lgd_code),
        "district": (scope.district_lgd_code, district_lgd_code),
        "block": (scope.block_lgd_code, block_lgd_code),
        "centre": (scope.centre_id, centre_id),
    }

    required = {
        LocationScopeLevel.STATE: ("state",),
        LocationScopeLevel.DISTRICT: ("state", "district"),
        LocationScopeLevel.CENTRE: ("state", "district", "block", "centre"),
    }[scope.level]

    if any(checks[name][1] is None for name in required):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The requested resource has incomplete location data.",
        )

    if any(checks[name][0] != checks[name][1] for name in required):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this location.",
        )

    return scope


def apply_user_scope(query, user: User):
    """Apply the existing User location columns to a SQLAlchemy query."""
    scope = get_location_scope(user)

    if scope.level == LocationScopeLevel.GLOBAL:
        return query

    query = query.filter(
        User.state_lgd_code == scope.state_lgd_code,
    )
    if scope.level in {LocationScopeLevel.DISTRICT, LocationScopeLevel.CENTRE}:
        query = query.filter(
            User.district_lgd_code == scope.district_lgd_code,
        )
    if scope.level == LocationScopeLevel.CENTRE:
        query = query.filter(
            User.block_lgd_code == scope.block_lgd_code,
            User.centre_id == scope.centre_id,
        )

    return query


def user_is_in_scope(target: User, actor: User) -> bool:
    scope = get_location_scope(actor)

    if scope.level == LocationScopeLevel.GLOBAL:
        return True

    return (
        target.state_lgd_code == scope.state_lgd_code
        and (
            scope.level == LocationScopeLevel.STATE
            or target.district_lgd_code == scope.district_lgd_code
        )
        and (
            scope.level != LocationScopeLevel.CENTRE
            or (
                target.block_lgd_code == scope.block_lgd_code
                and target.centre_id == scope.centre_id
            )
        )
    )


def _missing_scope() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="The authenticated user has no complete location scope.",
    )
