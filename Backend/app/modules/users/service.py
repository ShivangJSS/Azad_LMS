# from typing import Any

# from fastapi import HTTPException, UploadFile, status
# from sqlalchemy import func
# from sqlalchemy.orm import Session

# from app.utils.file_upload import save_image

# from app.modules.module.model import ModuleMaster
# from app.modules.users.model import (
#     ParticipantMaster,
#     TimeSpentModuleLog,
# )

# from app.modules.users.repository import UserRepository

# from app.modules.users.schema import (
#     ParticipantProfileResponse,
#     AssessmentSummaryResponse,
#     ModuleReportResponse,
#     ParticipantReportResponse,
#     ParticipantCreateRequest,
#     UserCreateRequest,
#     UserUpdateRequest,
# )

# from app.modules.auth.model import User
# from app.modules.auth.security import hash_password

# from app.common.enums import UserRole as CanonicalUserRole

# from app.shared.dependencies.location_scope import (
#     LocationScopeLevel,
#     assert_scope_value,
#     get_location_scope,
# )

# from app.modules.users.constants import (
#     CREATABLE_ROLES,
#     ROLE_LABELS,
#     UserRole,
# )
# class UserService:

#     def __init__(self, repository=None):
#         self.repository = repository

#     # ------------------------------------------------------------------
#     # Scope / object-level authorization for participant (trainee) data.
#     # Super Admin ("1") and Admin ("2") have full access. State Head ("3"),
#     # District Head ("4") and PI ("5") are limited to their own
#     # state / district / centre so they cannot read or edit trainees outside
#     # their jurisdiction by changing the id in the URL (IDOR).
#     # ------------------------------------------------------------------

#     @staticmethod
#     def assert_participant_access(db, current_user, participant_id):
#         scope = get_location_scope(current_user)

#         if scope.level == LocationScopeLevel.GLOBAL:
#             return

#         record = UserRepository.get_participant_edit(db, participant_id)
#         if not record:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Participant not found.",
#             )

#         if (
#             scope.level == LocationScopeLevel.STATE
#             and record.get("state_id") == scope.state_lgd_code
#         ):
#             return
#         if (
#             scope.level == LocationScopeLevel.DISTRICT
#             and record.get("state_id") == scope.state_lgd_code
#             and record.get("district_id") == scope.district_lgd_code
#         ):
#             return
#         if (
#             scope.level == LocationScopeLevel.CENTRE
#             and record.get("state_id") == scope.state_lgd_code
#             and record.get("district_id") == scope.district_lgd_code
#             and record.get("block_id") == scope.block_lgd_code
#             and record.get("centre_id") == scope.centre_id
#         ):
#             return

#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="You don't have access to this trainee.",
#         )

#     @staticmethod
#     def clamp_scope(current_user, state_id, district_id, centre_id):
#         """Force scoped roles to their own jurisdiction; Super Admin/Admin
#         keep whatever filter they requested. Returns the effective
#         (state_id, district_id, centre_id)."""
#         role = CanonicalUserRole(str(current_user.role))

#         if role in (CanonicalUserRole.SUPER_ADMIN, CanonicalUserRole.ADMIN):
#             return state_id, district_id, centre_id
#         if role == CanonicalUserRole.STATE_HEAD:
#             return current_user.state_lgd_code, district_id, centre_id
#         if role == CanonicalUserRole.DISTRICT_HEAD:
#             return (
#                 current_user.state_lgd_code,
#                 current_user.district_lgd_code,
#                 centre_id,
#             )
#         if role == CanonicalUserRole.PI:
#             return (
#                 current_user.state_lgd_code,
#                 current_user.district_lgd_code,
#                 current_user.centre_id,
#             )
#         return state_id, district_id, centre_id

#     @staticmethod
#     def get_creatable_roles(current_user):
#         role = UserRole(int(current_user.role))

#         roles = CREATABLE_ROLES.get(role, [])

#         return [
#             {
#                 "id": int(r),
#                 "name": ROLE_LABELS[r],
#             }
#             for r in roles
#         ]

#     @staticmethod
#     def get_states(db: Session):
#         return UserRepository.get_states(db)

#     @staticmethod
#     def get_districts(db: Session, state_lgd_code: int):
#         return UserRepository.get_districts(db, state_lgd_code)

#     @staticmethod
#     def get_blocks(db: Session, district_lgd_code: int):
#         return UserRepository.get_blocks(db, district_lgd_code)

#     @staticmethod
#     def get_centres(db: Session, block_id: int):
#         return UserRepository.get_centres(db, block_id)

#     @staticmethod
#     def create_user(
#         db: Session,
#         request: UserCreateRequest,
#         current_user: User,
#     ):
#         # Logged-in user's canonical RBAC role
#         role = CanonicalUserRole(str(current_user.role))
#         normalized_email = request.email.strip().lower()
#         # Roles this user is allowed to create
#         allowed_roles = {
#             CanonicalUserRole.SUPER_ADMIN: {CanonicalUserRole.ADMIN},
#             CanonicalUserRole.ADMIN: {
#                 CanonicalUserRole.STATE_HEAD,
#                 CanonicalUserRole.DISTRICT_HEAD,
#                 CanonicalUserRole.PI,
#             },
#         }.get(role, set())

#         # Permission check
#         requested_role = CanonicalUserRole(str(request.role))
#         if requested_role not in allowed_roles:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="You are not allowed to create this role.",
#             )

#         # Check if email already exists
#         existing_email = UserRepository.get_by_email(db, normalized_email)

#         if existing_email:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Email already exists.",
#             )

#         # The form only collects email; derive the login username from it
#         # when one isn't explicitly provided.
#         username = request.username or normalized_email

#         existing_username = UserRepository.get_by_username(db, username)

#         if existing_username:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Username already exists.",
#             )

#         # Validate location fields based on role
#         if requested_role == CanonicalUserRole.STATE_HEAD:
#             if not request.state_lgd_code:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="State is required for State Lead.",
#                 )

#         elif requested_role == CanonicalUserRole.DISTRICT_HEAD:
#             if not request.state_lgd_code:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="State is required for District Lead.",
#                 )

#             if not request.district_lgd_code:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="District is required for District Lead.",
#                 )

#         elif requested_role == CanonicalUserRole.PI:
#             if not request.state_lgd_code:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="State is required for PI.",
#                 )

#             if not request.district_lgd_code:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="District is required for PI.",
#                 )

#             if not request.block_lgd_code:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="Block is required for PI.",
#                 )

#             if not request.centre_id:
#                 raise HTTPException(
#                     status_code=status.HTTP_400_BAD_REQUEST,
#                     detail="Centre is required for PI.",
#                 )

#         if requested_role != CanonicalUserRole.ADMIN:
#             assert_scope_value(
#                 current_user,
#                 state_lgd_code=request.state_lgd_code,
#                 district_lgd_code=request.district_lgd_code,
#                 block_lgd_code=request.block_lgd_code,
#                 centre_id=request.centre_id,
#             )

#         # Hash password
#         hashed_password = hash_password(request.password)

#         # Default responsibility to the role's label when not provided by the form
#         responsibility = (
#             request.responsibility
#             or {
#                 CanonicalUserRole.SUPER_ADMIN: "Super Admin",
#                 CanonicalUserRole.ADMIN: "Admin",
#                 CanonicalUserRole.STATE_HEAD: "State Head",
#                 CanonicalUserRole.DISTRICT_HEAD: "District Head",
#                 CanonicalUserRole.PI: "PI",
#             }[requested_role]
#         )

#         # Create User model
#         new_user = User(
#             name=request.name,
#             username=username,
#             email=normalized_email,
#             password=hashed_password,
#             role=str(request.role),  # DB stores role as varchar
#             responsibility=responsibility,
#             state_lgd_code=request.state_lgd_code,
#             district_lgd_code=request.district_lgd_code,
#             block_lgd_code=request.block_lgd_code,
#             centre_id=request.centre_id,
#             status="1",
#         )

#         # Save user
#         created_user = UserRepository.create_user(db, new_user)

#         return created_user

#     @staticmethod
#     def get_users(db: Session):
#         users = UserRepository.get_users(db)
#         response: list[dict[str, Any]] = []

#         for user in users:
#             response.append(
#                 {
#                     "id": user.id,
#                     "name": user.name,
#                     "email": user.email,
#                     "role": user.role,
#                     "role_name": ROLE_LABELS[UserRole(int(user.role))],
#                     "responsibility": user.responsibility,
#                     "status": user.status,
#                 }
#             )

#         return response

#     @staticmethod
#     def get_user_by_id(
#         db: Session,
#         user_id: int,
#     ):
#         result = UserRepository.get_user_by_id(db, user_id)

#         if not result:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="User not found.",
#             )

#         user, state_name, district_name, block_name, centre_name = result

#         return {
#             "id": user.id,
#             "name": user.name,
#             "username": user.username,
#             "email": user.email,
#             "role": user.role,
#             "role_name": ROLE_LABELS[UserRole(int(user.role))],
#             "responsibility": user.responsibility,
#             "state_name": state_name or "N/A",
#             "district_name": district_name or "N/A",
#             "block_name": block_name or "N/A",
#             "centre_name": centre_name or "N/A",
#             "status": user.status,
#         }

#     @staticmethod
#     def delete_user(
#         db: Session,
#         user_id: int,
#         current_user: User,
#     ):
#         user = UserRepository.get_by_id_for_delete(db, user_id)

#         if not user:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="User not found.",
#             )

#         # Role hierarchy guard: only manage users within the creatable set.
#         actor_role = UserRole(int(current_user.role))
#         manageable_ids = [int(r) for r in CREATABLE_ROLES.get(actor_role, [])]

#         if int(user.role) not in manageable_ids:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="You are not allowed to delete this user.",
#             )

#         UserRepository.delete_user(db, user)

#         return {"message": "User deleted successfully."}

#     @staticmethod
#     def get_batches(
#         db: Session,
#         centre_id: int,
#     ):
#         return UserRepository.get_batches(
#             db=db,
#             centre_id=centre_id,
#         )

#     @staticmethod
#     def get_enrollment(
#         db: Session,
#         batch_id: int,
#     ):
#         return UserRepository.get_enrollment(
#             db=db,
#             batch_id=batch_id,
#         )

#     @staticmethod
#     async def create_participant(
#         db: Session,
#         data: ParticipantCreateRequest,
#         image: UploadFile | None = None,
#     ):
#         image_name = await save_image(image)
#         participant = UserRepository.create_participant(
#             db=db,
#             data=data,
#             image_name=image_name,
#         )

#         # create_participant already inserts the batch mapping; do NOT assign again
#         # (a second BatchParticipant row makes the trainee appear twice in the list).
#         if participant == "duplicate_enrollment_no":
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Enrollment number already exists.",
#             )

#         if participant == "duplicate_username":
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Username already exists.",
#             )

#         return {"message": "Participant created successfully."}

#     @staticmethod
#     def update_user(
#         db: Session,
#         user_id: int,
#         request: UserUpdateRequest,
#         current_user: User,
#     ):
#         # Check user exists
#         user = UserRepository.get_by_id(db, user_id)

#         if not user:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="User not found.",
#             )

#         # Role hierarchy guard (prevents privilege escalation).
#         # The actor may only manage a target whose CURRENT role is within their
#         # creatable set, and may only assign a NEW role within that same set.
#         actor_role = UserRole(int(current_user.role))
#         manageable_ids = [int(r) for r in CREATABLE_ROLES.get(actor_role, [])]

#         if int(user.role) not in manageable_ids:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="You are not allowed to manage this user.",
#             )

#         if int(request.role) not in manageable_ids:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="You are not allowed to assign this role.",
#             )

#         # Check duplicate email
#         existing_email = UserRepository.get_by_email_except_user(
#             db,
#             request.email,
#             user_id,
#         )

#         if existing_email:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Email already exists.",
#             )

#         # Update fields
#         user.name = request.name
#         user.email = request.email
#         user.role = str(request.role)

#         # Update password only if provided
#         if request.password:
#             user.password = hash_password(request.password)

#         updated_user = UserRepository.update_user(db, user)

#         return updated_user

#     @staticmethod
#     def get_all_centres(db: Session):
#         return UserRepository.get_all_centres(db)

#     @staticmethod
#     def get_batches(
#         db: Session,
#         centre_id: int | None = None,
#     ):
#         return UserRepository.get_batches(db, centre_id)

#     @staticmethod
#     def get_participants(
#         db: Session,
#         state_id: int | None = None,
#         district_id: int | None = None,
#         centre_id: int | None = None,
#         batch_id: int | None = None,
#         search: str | None = None,
#     ):
#         participants = UserRepository.get_participants(
#             db=db,
#             state_id=state_id,
#             district_id=district_id,
#             centre_id=centre_id,
#             batch_id=batch_id,
#             search=search,
#         )

#         response = []

#         for p in participants:
#             # ---- Performance chip: MCQ + SCQ score percentage ----
#             mcq_attempted = getattr(p, "mcq_attempted", 0) or 0
#             mcq_correct = getattr(p, "mcq_correct", 0) or 0
#             scq_attempted = getattr(p, "scq_attempted", 0) or 0
#             scq_correct = getattr(p, "scq_correct", 0) or 0

#             attempted = mcq_attempted + scq_attempted
#             correct = mcq_correct + scq_correct
#             score_pct = (correct / attempted * 100) if attempted > 0 else 0

#             # ---- Course Progress: completion (completed / configured) ----
#             completed = (
#                 (getattr(p, "mcq_done", 0) or 0)
#                 + (getattr(p, "scq_done", 0) or 0)
#                 + (getattr(p, "mm_done", 0) or 0)
#                 + (getattr(p, "db_done", 0) or 0)
#             )
#             configured_total = getattr(p, "configured_total", 0) or 0

#             # Full completion = 100%, otherwise proportional to what's done.
#             course_progress = (
#                 min(100, round((completed / configured_total) * 100, 2))
#                 if configured_total > 0
#                 else 0
#             )

#             if completed == 0:
#                 performance_status = "Yet to Start"
#             elif score_pct >= 70:
#                 performance_status = "Good"
#             elif score_pct >= 40:
#                 performance_status = "Average"
#             else:
#                 performance_status = "Poor"

#             response.append(
#                 {
#                     "participant_id": p.participant_id,
#                     "participant_name": p.participant_name,
#                     "enrollment_no": p.enrollment_no,
#                     "mobile_no": p.mobile_no,
#                     "age": p.age,
#                     "image": getattr(p, "image", None),
#                     "state_name": p.state_name,
#                     "district_name": p.district_name,
#                     "centre_name": p.centre_name,
#                     "batch_name": p.batch_name,
#                     "status": ("Active" if p.status == "1" else "Inactive"),
#                     "course_progress": course_progress,
#                     "performance_status": performance_status,
#                 }
#             )

#         return response

#     @staticmethod
#     def get_participant_report(
#         db: Session,
#         participant_id: int,
#     ) -> ParticipantReportResponse:

#         report = UserRepository.get_module_report(
#             db=db,
#             participant_id=participant_id,
#         )

#         if not report["participant_profile"]:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Participant not found.",
#             )

#         return ParticipantReportResponse(
#             participant=ParticipantProfileResponse(**report["participant_profile"]),
#             attempt_wise_result=report["attempt_wise_result"],
#             assessment_summary=report["assessment_summary"],
#         )

#     # ==================================================================
#     # Manage Modules
#     # ==================================================================

#     def assign_module(self, participant_id: int, module_id: int):
#         module = self.repository.get_module_by_id(module_id)

#         if not module:
#             raise ValueError("Module not found")

#         for item in self.repository.get_module_group(module):
#             existing = self.repository.get_participant_module(
#                 participant_id,
#                 item.module_id,
#             )

#             if existing:
#                 if str(existing.status) != "1":
#                     existing.status = "1"
#                 continue

#             self.repository.create_participant_module(
#                 participant_id=participant_id,
#                 course_id=item.fk_course_id,
#                 module_id=item.module_id,
#             )

#         self.repository.commit()

#         return {
#             "success": True,
#             "message": "Module assigned successfully",
#         }

#     def unassign_module(self, participant_id: int, module_id: int):
#         module = self.repository.get_module_by_id(module_id)

#         if not module:
#             raise ValueError("Module not found")

#         module_ids = [
#             item.module_id for item in self.repository.get_module_group(module)
#         ]

#         self.repository.delete_participant_modules(
#             participant_id,
#             module_ids,
#         )

#         self.repository.commit()

#         return {
#             "success": True,
#             "message": "Module unassigned successfully",
#         }

#     def get_modules(self, participant_id: int, language_id: int):
#         modules = self.repository.get_modules_by_language(language_id)
#         assigned_ids = self.repository.get_assigned_module_ids(participant_id)

#         return [
#             {
#                 "module_id": m.module_id,
#                 "parent_id": m.parent_id or m.module_id,
#                 "module_name": m.module_name,
#                 "module_type": m.module_type,
#                 "language_id": m.language_id,
#                 "assigned": m.module_id in assigned_ids,
#             }
#             for m in modules
#         ]

#     # ==================================================================
#     # Credentials + Time Spent
#     # ==================================================================

#     @staticmethod
#     def get_participant_key_details(db: Session, participant_id: int):
#         participant = (
#             db.query(
#                 ParticipantMaster.participant_id,
#                 ParticipantMaster.username,
#             )
#             .filter(ParticipantMaster.participant_id == participant_id)
#             .filter(ParticipantMaster.deleted_at.is_(None))
#             .first()
#         )

#         if not participant:
#             raise HTTPException(status_code=404, detail="Participant not found")

#         return {
#             "status": True,
#             "message": "Participant credentials fetched successfully",
#             "data": {
#                 "participant_id": participant.participant_id,
#                 "username": participant.username,
#                 "password": "-",
#             },
#         }

#     @staticmethod
#     def get_participant_time_spent(db: Session, participant_id: int):
#         participant = (
#             db.query(ParticipantMaster)
#             .filter(ParticipantMaster.participant_id == participant_id)
#             .filter(ParticipantMaster.deleted_at.is_(None))
#             .first()
#         )

#         if not participant:
#             raise HTTPException(status_code=404, detail="Participant not found")

#         module_rows = (
#             db.query(
#                 ModuleMaster.module_id,
#                 ModuleMaster.module_name,
#                 func.sum(TimeSpentModuleLog.time_taken).label("time_spent"),
#             )
#             .join(
#                 ModuleMaster,
#                 ModuleMaster.module_id == TimeSpentModuleLog.module_id,
#             )
#             .filter(TimeSpentModuleLog.user_id == participant_id)
#             .group_by(ModuleMaster.module_id, ModuleMaster.module_name)
#             .all()
#         )

#         total_time = sum(row.time_spent or 0 for row in module_rows)

#         return {
#             "status": True,
#             "message": "Time spent fetched successfully",
#             "data": {
#                 "participant_id": participant_id,
#                 "participant_name": participant.participant_name,
#                 "total_time_spent_seconds": int(total_time),
#                 "modules": [
#                     {
#                         "module_id": row.module_id,
#                         "module_name": row.module_name,
#                         "time_spent_seconds": int(row.time_spent or 0),
#                     }
#                     for row in module_rows
#                 ],
#             },
#         }

#     # ==================================================================
#     # Edit / Update participant
#     # ==================================================================

#     @staticmethod
#     def get_participant_edit(db: Session, participant_id: int):
#         data = UserRepository.get_participant_edit(db, participant_id)
#         if not data:
#             raise HTTPException(status_code=404, detail="Participant not found")
#         return data

#     @staticmethod
#     async def update_participant(
#         db: Session,
#         participant_id: int,
#         data: dict,
#         image,
#     ):
#         # =========================================================
#         # GET EXISTING PARTICIPANT
#         # =========================================================
#         existing_participant = UserRepository.get_participant_edit(
#             db=db,
#             participant_id=participant_id,
#         )

#         if not existing_participant:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Participant not found",
#             )

#         # =========================================================
#         # LOCATION IS EDITABLE
#         # =========================================================
#         # State, District, Block and Centre are allowed to change.
#         # The frontend regenerates the enrollment number using the
#         # new location while keeping the original unique sequence.
#         #
#         # Example:
#         # OLD: WWW/UP/MZN/26-27/C01/B01/131
#         # NEW: WWW/HR/DEL/27-28/C05/B02/131
#         #
#         # The unique sequence (131) remains unchanged.
#         # =========================================================

#         # =========================================================
#         # SAVE IMAGE
#         # =========================================================
#         image_name = await save_image(image) if image else None

#         # =========================================================
#         # UPDATE PARTICIPANT
#         # =========================================================
#         participant = UserRepository.update_participant(
#             db=db,
#             participant_id=participant_id,
#             data=data,
#             image_name=image_name,
#         )

#         if not participant:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Participant not found",
#             )

#         return {
#             "message": "Participant updated successfully."
#         }

from typing import Any

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.utils.file_upload import save_image

from app.modules.module.model import ModuleMaster
from app.modules.users.model import (
    ParticipantMaster,
    TimeSpentModuleLog,
)

from app.modules.users.repository import UserRepository

from app.modules.users.schema import (
    ParticipantProfileResponse,
    AssessmentSummaryResponse,
    ModuleReportResponse,
    ParticipantReportResponse,
    ParticipantCreateRequest,
    ParticipantUpdateRequest,
    UserCreateRequest,
    UserUpdateRequest,
)

from app.modules.auth.model import User
from app.modules.auth.security import hash_password

from app.common.enums import UserRole as CanonicalUserRole

from app.shared.dependencies.location_scope import (
    LocationScopeLevel,
    assert_scope_value,
    get_location_scope,
)

from app.modules.users.constants import (
    CREATABLE_ROLES,
    ROLE_LABELS,
    UserRole,
)
class UserService:

    def __init__(self, repository=None):
        self.repository = repository

    # ------------------------------------------------------------------
    # Scope / object-level authorization for participant (trainee) data.
    # Super Admin ("1") and Admin ("2") have full access. State Head ("3"),
    # District Head ("4") and PI ("5") are limited to their own
    # state / district / centre so they cannot read or edit trainees outside
    # their jurisdiction by changing the id in the URL (IDOR).
    # ------------------------------------------------------------------

    @staticmethod
    def assert_participant_access(db, current_user, participant_id):
        scope = get_location_scope(current_user)

        if scope.level == LocationScopeLevel.GLOBAL:
            return

        record = UserRepository.get_participant_edit(db, participant_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Participant not found.",
            )

        if (
            scope.level == LocationScopeLevel.STATE
            and record.get("state_id") == scope.state_lgd_code
        ):
            return
        if (
            scope.level == LocationScopeLevel.DISTRICT
            and record.get("state_id") == scope.state_lgd_code
            and record.get("district_id") == scope.district_lgd_code
        ):
            return
        if (
            scope.level == LocationScopeLevel.CENTRE
            and record.get("state_id") == scope.state_lgd_code
            and record.get("district_id") == scope.district_lgd_code
            and record.get("block_id") == scope.block_lgd_code
            and record.get("centre_id") == scope.centre_id
        ):
            return

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this trainee.",
        )

    @staticmethod
    def clamp_scope(current_user, state_id, district_id, centre_id):
        """Force scoped roles to their own jurisdiction; Super Admin/Admin
        keep whatever filter they requested. Returns the effective
        (state_id, district_id, centre_id)."""
        role = CanonicalUserRole(str(current_user.role))

        if role in (CanonicalUserRole.SUPER_ADMIN, CanonicalUserRole.ADMIN):
            return state_id, district_id, centre_id
        if role == CanonicalUserRole.STATE_HEAD:
            return current_user.state_lgd_code, district_id, centre_id
        if role == CanonicalUserRole.DISTRICT_HEAD:
            return (
                current_user.state_lgd_code,
                current_user.district_lgd_code,
                centre_id,
            )
        if role == CanonicalUserRole.PI:
            return (
                current_user.state_lgd_code,
                current_user.district_lgd_code,
                current_user.centre_id,
            )
        return state_id, district_id, centre_id

    @staticmethod
    def get_creatable_roles(current_user):
        role = UserRole(int(current_user.role))

        roles = CREATABLE_ROLES.get(role, [])

        return [
            {
                "id": int(r),
                "name": ROLE_LABELS[r],
            }
            for r in roles
        ]

    @staticmethod
    def get_states(db: Session):
        return UserRepository.get_states(db)

    @staticmethod
    def get_districts(db: Session, state_lgd_code: int):
        return UserRepository.get_districts(db, state_lgd_code)

    @staticmethod
    def get_blocks(db: Session, district_lgd_code: int):
        return UserRepository.get_blocks(db, district_lgd_code)

    @staticmethod
    def get_centres(db: Session, block_id: int):
        return UserRepository.get_centres(db, block_id)

    @staticmethod
    def create_user(
        db: Session,
        request: UserCreateRequest,
        current_user: User,
    ):
        # Logged-in user's canonical RBAC role
        role = CanonicalUserRole(str(current_user.role))
        normalized_email = request.email.strip().lower()
        # Roles this user is allowed to create
        allowed_roles = {
            CanonicalUserRole.SUPER_ADMIN: {CanonicalUserRole.ADMIN},
            CanonicalUserRole.ADMIN: {
                CanonicalUserRole.STATE_HEAD,
                CanonicalUserRole.DISTRICT_HEAD,
                CanonicalUserRole.PI,
            },
        }.get(role, set())

        # Permission check
        requested_role = CanonicalUserRole(str(request.role))
        if requested_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to create this role.",
            )

        # Check if email already exists
        existing_email = UserRepository.get_by_email(db, normalized_email)

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists.",
            )

        # The form only collects email; derive the login username from it
        # when one isn't explicitly provided.
        username = request.username or normalized_email

        existing_username = UserRepository.get_by_username(db, username)

        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists.",
            )

        # Validate location fields based on role
        if requested_role == CanonicalUserRole.STATE_HEAD:
            if not request.state_lgd_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="State is required for State Lead.",
                )

        elif requested_role == CanonicalUserRole.DISTRICT_HEAD:
            if not request.state_lgd_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="State is required for District Lead.",
                )

            if not request.district_lgd_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="District is required for District Lead.",
                )

        elif requested_role == CanonicalUserRole.PI:
            if not request.state_lgd_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="State is required for PI.",
                )

            if not request.district_lgd_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="District is required for PI.",
                )

            if not request.block_lgd_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Block is required for PI.",
                )

            if not request.centre_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Centre is required for PI.",
                )

        if requested_role != CanonicalUserRole.ADMIN:
            assert_scope_value(
                current_user,
                state_lgd_code=request.state_lgd_code,
                district_lgd_code=request.district_lgd_code,
                block_lgd_code=request.block_lgd_code,
                centre_id=request.centre_id,
            )

        # Hash password
        hashed_password = hash_password(request.password)

        # Default responsibility to the role's label when not provided by the form
        responsibility = (
            request.responsibility
            or {
                CanonicalUserRole.SUPER_ADMIN: "Super Admin",
                CanonicalUserRole.ADMIN: "Admin",
                CanonicalUserRole.STATE_HEAD: "State Head",
                CanonicalUserRole.DISTRICT_HEAD: "District Head",
                CanonicalUserRole.PI: "PI",
            }[requested_role]
        )

        # Create User model
        new_user = User(
            name=request.name,
            username=username,
            email=normalized_email,
            password=hashed_password,
            role=str(request.role),  # DB stores role as varchar
            responsibility=responsibility,
            state_lgd_code=request.state_lgd_code,
            district_lgd_code=request.district_lgd_code,
            block_lgd_code=request.block_lgd_code,
            centre_id=request.centre_id,
            status="1",
        )

        # Save user
        created_user = UserRepository.create_user(db, new_user)

        return created_user

    @staticmethod
    def get_users(db: Session):
        users = UserRepository.get_users(db)
        response: list[dict[str, Any]] = []

        for user in users:
            response.append(
                {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role,
                    "role_name": ROLE_LABELS[UserRole(int(user.role))],
                    "responsibility": user.responsibility,
                    "status": user.status,
                }
            )

        return response

    @staticmethod
    def get_user_by_id(
        db: Session,
        user_id: int,
    ):
        result = UserRepository.get_user_by_id(db, user_id)

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        user, state_name, district_name, block_name, centre_name = result

        return {
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "role_name": ROLE_LABELS[UserRole(int(user.role))],
            "responsibility": user.responsibility,
            "state_lgd_code": user.state_lgd_code,
            "state_name": state_name or "N/A",
            "district_lgd_code": user.district_lgd_code,
            "district_name": district_name or "N/A",
            "block_lgd_code": user.block_lgd_code,
            "block_name": block_name or "N/A",
            "centre_id": user.centre_id,
            "centre_name": centre_name or "N/A",
            "status": user.status,
            "created_at": getattr(user, "created_at", None),
            "updated_at": getattr(user, "updated_at", None),
        }

    @staticmethod
    def delete_user(
        db: Session,
        user_id: int,
        current_user: User,
    ):
        user = UserRepository.get_by_id_for_delete(db, user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        # Role hierarchy guard: only manage users within the creatable set.
        actor_role = UserRole(int(current_user.role))
        manageable_ids = [int(r) for r in CREATABLE_ROLES.get(actor_role, [])]

        if int(user.role) not in manageable_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to delete this user.",
            )

        UserRepository.delete_user(db, user)

        return {"message": "User deleted successfully."}

    @staticmethod
    def get_batches(
        db: Session,
        centre_id: int,
    ):
        return UserRepository.get_batches(
            db=db,
            centre_id=centre_id,
        )

    @staticmethod
    def get_enrollment(
        db: Session,
        batch_id: int,
    ):
        return UserRepository.get_enrollment(
            db=db,
            batch_id=batch_id,
        )

    @staticmethod
    async def create_participant(
        db: Session,
        data: ParticipantCreateRequest,
        image: UploadFile | None = None,
    ):
        image_name = await save_image(image)
        participant = UserRepository.create_participant(
            db=db,
            data=data,
            image_name=image_name,
        )

        # create_participant already inserts the batch mapping; do NOT assign again
        # (a second BatchParticipant row makes the trainee appear twice in the list).
        if participant == "duplicate_enrollment_no":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Enrollment number already exists.",
            )

        if participant == "duplicate_username":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists.",
            )

        return {"message": "Participant created successfully."}

    @staticmethod
    def update_user(
        db: Session,
        user_id: int,
        request: UserUpdateRequest,
        current_user: User,
    ):
        # ---------------------------------------------------------
        # Get target user
        # ---------------------------------------------------------
        user = UserRepository.get_by_id(db, user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        # ---------------------------------------------------------
        # Role hierarchy / authorization
        # ---------------------------------------------------------
        actor_role = UserRole(int(current_user.role))
        manageable_ids = [
            int(r) for r in CREATABLE_ROLES.get(actor_role, [])
        ]

        # Actor must be allowed to manage the user's current role.
        if int(user.role) not in manageable_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to manage this user.",
            )

        # Actor must also be allowed to assign the requested role.
        requested_role = UserRole(int(request.role))
        if int(requested_role) not in manageable_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to assign this role.",
            )

        # ---------------------------------------------------------
        # Normalize values
        # ---------------------------------------------------------
        normalized_email = str(request.email).strip().lower()
        normalized_username = (
            request.username.strip()
            if request.username is not None
            else None
        )

        if not normalized_username:
            normalized_username = normalized_email

        responsibility = (
            request.responsibility.strip()
            if request.responsibility is not None
            else None
        )

        # ---------------------------------------------------------
        # Duplicate email check
        # ---------------------------------------------------------
        existing_email = UserRepository.get_by_email_except_user(
            db,
            normalized_email,
            user_id,
        )

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists.",
            )

        # ---------------------------------------------------------
        # Duplicate username check
        # ---------------------------------------------------------
        # Keep the same username uniqueness rule used during creation.
        existing_username = UserRepository.get_by_username(
            db,
            normalized_username,
        )

        if existing_username and int(existing_username.id) != int(user_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists.",
            )

        # ---------------------------------------------------------
        # Validate location according to requested role
        # ---------------------------------------------------------
        if requested_role == CanonicalUserRole.STATE_HEAD:
            if not request.state_lgd_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="State is required for State Lead.",
                )

        elif requested_role == CanonicalUserRole.DISTRICT_HEAD:
            if not request.state_lgd_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="State is required for District Lead.",
                )

            if not request.district_lgd_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="District is required for District Lead.",
                )

        elif requested_role == CanonicalUserRole.PI:
            if not request.state_lgd_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="State is required for PI.",
                )

            if not request.district_lgd_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="District is required for PI.",
                )

            if not request.block_lgd_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Block is required for PI.",
                )

            if not request.centre_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Centre is required for PI.",
                )

        # Scoped roles cannot move a user outside their own jurisdiction.
        if requested_role != CanonicalUserRole.ADMIN:
            assert_scope_value(
                current_user,
                state_lgd_code=request.state_lgd_code,
                district_lgd_code=request.district_lgd_code,
                block_lgd_code=request.block_lgd_code,
                centre_id=request.centre_id,
            )

        # ---------------------------------------------------------
        # Update all editable fields
        # ---------------------------------------------------------
        user.name = request.name
        user.username = normalized_username
        user.email = normalized_email
        user.role = str(request.role)
        user.responsibility = responsibility or ROLE_LABELS[requested_role]

        user.state_lgd_code = request.state_lgd_code
        user.district_lgd_code = request.district_lgd_code
        user.block_lgd_code = request.block_lgd_code
        user.centre_id = request.centre_id
        user.status = str(request.status)

        # Password is optional on edit. Blank/None means keep old password.
        if request.password:
            user.password = hash_password(request.password)

        updated_user = UserRepository.update_user(db, user)

        return updated_user

    @staticmethod
    def get_all_centres(db: Session):
        return UserRepository.get_all_centres(db)

    @staticmethod
    def get_batches(
        db: Session,
        centre_id: int | None = None,
    ):
        return UserRepository.get_batches(db, centre_id)

    @staticmethod
    def get_participants(
        db: Session,
        state_id: int | None = None,
        district_id: int | None = None,
        centre_id: int | None = None,
        batch_id: int | None = None,
        search: str | None = None,
    ):
        participants = UserRepository.get_participants(
            db=db,
            state_id=state_id,
            district_id=district_id,
            centre_id=centre_id,
            batch_id=batch_id,
            search=search,
        )

        response = []

        for p in participants:
            # ---- Performance chip: MCQ + SCQ score percentage ----
            mcq_attempted = getattr(p, "mcq_attempted", 0) or 0
            mcq_correct = getattr(p, "mcq_correct", 0) or 0
            scq_attempted = getattr(p, "scq_attempted", 0) or 0
            scq_correct = getattr(p, "scq_correct", 0) or 0

            attempted = mcq_attempted + scq_attempted
            correct = mcq_correct + scq_correct
            score_pct = (correct / attempted * 100) if attempted > 0 else 0

            # ---- Course Progress: completion (completed / configured) ----
            completed = (
                (getattr(p, "mcq_done", 0) or 0)
                + (getattr(p, "scq_done", 0) or 0)
                + (getattr(p, "mm_done", 0) or 0)
                + (getattr(p, "db_done", 0) or 0)
            )
            configured_total = getattr(p, "configured_total", 0) or 0

            # Full completion = 100%, otherwise proportional to what's done.
            course_progress = (
                min(100, round((completed / configured_total) * 100, 2))
                if configured_total > 0
                else 0
            )

            if completed == 0:
                performance_status = "Yet to Start"
            elif score_pct >= 70:
                performance_status = "Good"
            elif score_pct >= 40:
                performance_status = "Average"
            else:
                performance_status = "Poor"

            response.append(
                {
                    "participant_id": p.participant_id,
                    "participant_name": p.participant_name,
                    "enrollment_no": p.enrollment_no,
                    "mobile_no": p.mobile_no,
                    "age": p.age,
                    "image": getattr(p, "image", None),
                    "state_name": p.state_name,
                    "district_name": p.district_name,
                    "centre_name": p.centre_name,
                    "batch_name": p.batch_name,
                    "status": ("Active" if p.status == "1" else "Inactive"),
                    "course_progress": course_progress,
                    "performance_status": performance_status,
                }
            )

        return response

    @staticmethod
    def get_participant_report(
        db: Session,
        participant_id: int,
    ) -> ParticipantReportResponse:

        report = UserRepository.get_module_report(
            db=db,
            participant_id=participant_id,
        )

        if not report["participant_profile"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Participant not found.",
            )

        return ParticipantReportResponse(
            participant=ParticipantProfileResponse(**report["participant_profile"]),
            attempt_wise_result=report["attempt_wise_result"],
            assessment_summary=report["assessment_summary"],
        )

    # ==================================================================
    # Manage Modules
    # ==================================================================

    def assign_module(self, participant_id: int, module_id: int):
        module = self.repository.get_module_by_id(module_id)

        if not module:
            raise ValueError("Module not found")

        for item in self.repository.get_module_group(module):
            existing = self.repository.get_participant_module(
                participant_id,
                item.module_id,
            )

            if existing:
                if str(existing.status) != "1":
                    existing.status = "1"
                continue

            self.repository.create_participant_module(
                participant_id=participant_id,
                course_id=item.fk_course_id,
                module_id=item.module_id,
            )

        self.repository.commit()

        return {
            "success": True,
            "message": "Module assigned successfully",
        }

    def unassign_module(self, participant_id: int, module_id: int):
        module = self.repository.get_module_by_id(module_id)

        if not module:
            raise ValueError("Module not found")

        module_ids = [
            item.module_id for item in self.repository.get_module_group(module)
        ]

        self.repository.delete_participant_modules(
            participant_id,
            module_ids,
        )

        self.repository.commit()

        return {
            "success": True,
            "message": "Module unassigned successfully",
        }

    def get_modules(self, participant_id: int, language_id: int):
        modules = self.repository.get_modules_by_language(language_id)
        assigned_ids = self.repository.get_assigned_module_ids(participant_id)

        return [
            {
                "module_id": m.module_id,
                "parent_id": m.parent_id or m.module_id,
                "module_name": m.module_name,
                "module_type": m.module_type,
                "language_id": m.language_id,
                "assigned": m.module_id in assigned_ids,
            }
            for m in modules
        ]

    # ==================================================================
    # Credentials + Time Spent
    # ==================================================================

    @staticmethod
    def get_participant_key_details(db: Session, participant_id: int):
        participant = (
            db.query(
                ParticipantMaster.participant_id,
                ParticipantMaster.username,
            )
            .filter(ParticipantMaster.participant_id == participant_id)
            .filter(ParticipantMaster.deleted_at.is_(None))
            .first()
        )

        if not participant:
            raise HTTPException(status_code=404, detail="Participant not found")

        return {
            "status": True,
            "message": "Participant credentials fetched successfully",
            "data": {
                "participant_id": participant.participant_id,
                "username": participant.username,
                "password": "-",
            },
        }

    @staticmethod
    def get_participant_time_spent(db: Session, participant_id: int):
        participant = (
            db.query(ParticipantMaster)
            .filter(ParticipantMaster.participant_id == participant_id)
            .filter(ParticipantMaster.deleted_at.is_(None))
            .first()
        )

        if not participant:
            raise HTTPException(status_code=404, detail="Participant not found")

        module_rows = (
            db.query(
                ModuleMaster.module_id,
                ModuleMaster.module_name,
                func.sum(TimeSpentModuleLog.time_taken).label("time_spent"),
            )
            .join(
                ModuleMaster,
                ModuleMaster.module_id == TimeSpentModuleLog.module_id,
            )
            .filter(TimeSpentModuleLog.user_id == participant_id)
            .group_by(ModuleMaster.module_id, ModuleMaster.module_name)
            .all()
        )

        total_time = sum(row.time_spent or 0 for row in module_rows)

        return {
            "status": True,
            "message": "Time spent fetched successfully",
            "data": {
                "participant_id": participant_id,
                "participant_name": participant.participant_name,
                "total_time_spent_seconds": int(total_time),
                "modules": [
                    {
                        "module_id": row.module_id,
                        "module_name": row.module_name,
                        "time_spent_seconds": int(row.time_spent or 0),
                    }
                    for row in module_rows
                ],
            },
        }

    # ==================================================================
    # Edit / Update participant
    # ==================================================================

    @staticmethod
    def get_participant_edit(db: Session, participant_id: int):
        data = UserRepository.get_participant_edit(db, participant_id)
        if not data:
            raise HTTPException(status_code=404, detail="Participant not found")
        return data

    @staticmethod
    async def update_participant(
        db: Session,
        participant_id: int,
        data: ParticipantUpdateRequest | dict,
        image: UploadFile | None,
    ):
        # =========================================================
        # GET EXISTING PARTICIPANT
        # =========================================================
        existing_participant = UserRepository.get_participant_edit(
            db=db,
            participant_id=participant_id,
        )

        if not existing_participant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Participant not found",
            )

        # =========================================================
        # LOCATION IS EDITABLE
        # =========================================================
        # State, District, Block and Centre are allowed to change.
        # The frontend regenerates the enrollment number using the
        # new location while keeping the original unique sequence.
        #
        # Example:
        # OLD: WWW/UP/MZN/26-27/C01/B01/131
        # NEW: WWW/HR/DEL/27-28/C05/B02/131
        #
        # The unique sequence (131) remains unchanged.
        # =========================================================

        # =========================================================
        # VALIDATED DATA
        # =========================================================
        if isinstance(data, ParticipantUpdateRequest):
            data = data.model_dump(exclude_unset=True)

        # Normalize validated string values before repository update.
        for key in (
            "participant_name",
            "gender",
            "location",
            "address",
            "enrollment_no",
            "email",
            "mobile_no",
            "pin",
            "aadhaar_number",
        ):
            if key in data and isinstance(data[key], str):
                data[key] = data[key].strip()

        if "email" in data and data["email"]:
            data["email"] = data["email"].lower()

        # =========================================================
        # SAVE IMAGE
        # =========================================================
        image_name = await save_image(image) if image else None

        # =========================================================
        # UPDATE PARTICIPANT
        # =========================================================
        participant = UserRepository.update_participant(
            db=db,
            participant_id=participant_id,
            data=data,
            image_name=image_name,
        )

        if not participant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Participant not found",
            )

        return {
            "message": "Participant updated successfully."
        }
