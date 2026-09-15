import unittest
from types import SimpleNamespace

from fastapi import HTTPException

from app.common.enums import UserRole
from app.modules.mobile.media.service import MediaService
from app.shared.dependencies.location_scope import (
    LocationScopeLevel,
    assert_scope_value,
    get_location_scope,
    user_is_in_scope,
)


def user(role: UserRole, **locations):
    values = {
        "state_lgd_code": None,
        "district_lgd_code": None,
        "block_lgd_code": None,
        "centre_id": None,
        "role": role.value,
    }
    values.update(locations)
    return SimpleNamespace(**values)


class LocationScopeTests(unittest.TestCase):
    def test_super_admin_and_admin_are_global(self):
        for role in (UserRole.SUPER_ADMIN, UserRole.ADMIN):
            self.assertEqual(
                get_location_scope(user(role)).level,
                LocationScopeLevel.GLOBAL,
            )

    def test_state_head_is_limited_to_state(self):
        current = user(UserRole.STATE_HEAD, state_lgd_code=10)
        assert_scope_value(current, state_lgd_code=10)
        with self.assertRaises(HTTPException):
            assert_scope_value(current, state_lgd_code=11)

    def test_district_head_requires_matching_state_and_district(self):
        current = user(
            UserRole.DISTRICT_HEAD,
            state_lgd_code=10,
            district_lgd_code=20,
        )
        assert_scope_value(current, state_lgd_code=10, district_lgd_code=20)
        with self.assertRaises(HTTPException):
            assert_scope_value(current, state_lgd_code=11, district_lgd_code=20)
        with self.assertRaises(HTTPException):
            assert_scope_value(current, state_lgd_code=10, district_lgd_code=21)

    def test_pi_requires_matching_hierarchy(self):
        current = user(
            UserRole.PI,
            state_lgd_code=10,
            district_lgd_code=20,
            block_lgd_code=30,
            centre_id=40,
        )
        assert_scope_value(
            current,
            state_lgd_code=10,
            district_lgd_code=20,
            block_lgd_code=30,
            centre_id=40,
        )
        with self.assertRaises(HTTPException):
            assert_scope_value(
                current,
                state_lgd_code=10,
                district_lgd_code=20,
                block_lgd_code=30,
                centre_id=41,
            )

    def test_incomplete_scope_is_denied(self):
        with self.assertRaises(HTTPException):
            get_location_scope(user(UserRole.PI, centre_id=40))

    def test_user_management_scope_uses_target_location(self):
        actor = user(
            UserRole.DISTRICT_HEAD,
            state_lgd_code=10,
            district_lgd_code=20,
        )
        same = user(
            UserRole.PI,
            state_lgd_code=10,
            district_lgd_code=20,
            block_lgd_code=30,
            centre_id=40,
        )
        other = user(
            UserRole.PI,
            state_lgd_code=10,
            district_lgd_code=21,
            block_lgd_code=30,
            centre_id=40,
        )
        self.assertTrue(user_is_in_scope(same, actor))
        self.assertFalse(user_is_in_scope(other, actor))


class MediaScopeTests(unittest.TestCase):
    def test_media_requires_exact_stored_path(self):
        self.assertTrue(
            MediaService.is_allowed_path(
                "/uploads/video_masters/a.mp4",
                {"uploads/video_masters/a.mp4"},
            )
        )
        self.assertFalse(
            MediaService.is_allowed_path(
                "/uploads/other/a.mp4",
                {"uploads/video_masters/a.mp4"},
            )
        )


if __name__ == "__main__":
    unittest.main()
