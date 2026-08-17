from unittest import result
from urllib import response

from sqlalchemy import func
from app.modules.dashboard.model import ParticipantModule
from app.modules.module.model import ModuleMaster
from app.modules.users.model import ParticipantMaster, TimeSpentModuleLog
from app.utils.file_upload import save_image
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.users.repository import (
    UserRepository,
)
from app.modules.users.schema import (
    ParticipantProfileResponse,
    AssessmentSummaryResponse,
    ModuleReportResponse,
    ParticipantReportResponse,
)

from app.modules.users.schema import UserUpdateRequest
from app.modules.auth.model import User
from app.modules.auth.security import hash_password
from app.modules.users.constants import (
    CREATABLE_ROLES,
    ROLE_LABELS,
    UserRole,
)

from app.modules.users.schema import ParticipantCreateRequest, UserCreateRequest


class UserService:


    def __init__(self, repository: UserRepository):
            self.repository = repository

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
    # Logged-in user's role
        role = UserRole(int(current_user.role))

    # Roles this user is allowed to create
        allowed_roles = CREATABLE_ROLES.get(role, [])

    # Permission check
        if request.role not in [int(r) for r in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to create this role.",
        )

    # Check if email already exists
        existing_email = UserRepository.get_by_email(db, request.email)

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists.",
            )

    # Check if username already exists
        if request.username:
            existing_username = UserRepository.get_by_username(
                db, request.username
            )

            if existing_username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already exists.",
                )

    # Validate location fields based on role
        if request.role == UserRole.STATE_LEAD:
             if not request.state_lgd_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="State is required for State Lead.",
                )

        elif request.role == UserRole.DISTRICT_LEAD:
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

        elif request.role == UserRole.PI:
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

    # Hash password
        hashed_password = hash_password(request.password)

    # Create User model
        new_user = User(
            name=request.name,
            username=request.username,
            email=request.email,
            password=hashed_password,
            role=str(request.role),  # DB stores role as varchar
            responsibility=request.responsibility,
            state_lgd_code=request.state_lgd_code,
            district_lgd_code=request.district_lgd_code,
            block_lgd_code=request.block_lgd_code,
            centre_id=request.centre_id,
            status=request.status,
        )

    # Save user
        created_user = UserRepository.create_user(db, new_user)

        return created_user


    @staticmethod
    def get_users(db: Session):
     users = UserRepository.get_users(db)

     response = []

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
            "state_name": state_name or "N/A",
            "district_name": district_name or "N/A",
            "block_name": block_name or "N/A",
            "centre_name": centre_name or "N/A",
            "status": user.status,
        }




    @staticmethod
    def delete_user(
      db: Session,
      user_id: int,
    ):
      user = UserRepository.get_by_id(db, user_id)

      if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

      UserRepository.soft_delete_user(db, user)

      return {
        "message": "User deleted successfully."
      }


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

     UserRepository.assign_batch(
        db=db,
        batch_id=data.batch_id,
        participant_id=participant.participant_id,
    )

     return {
        "message": "Participant created successfully."
    }






    @staticmethod
    def update_user(
     db: Session,
     user_id: int,
     request: UserUpdateRequest,
     current_user: User,
):
    # Check user exists
     user = UserRepository.get_by_id(db, user_id)

     if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # Check duplicate email
     existing_email = UserRepository.get_by_email_except_user(
        db,
        request.email,
        user_id,
    )

     if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists.",
        )

    # Update fields
     user.name = request.name
     user.email = request.email
     user.role = str(request.role)

    # Update password only if provided
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

        if p.completed_questions == 0:
            performance = "YetToStart"
        else:
            percentage = (
                (p.correct_answers / p.completed_questions) * 100
                if p.completed_questions > 0
                else 0
            )

            if percentage >= 70:
                performance = "Good"
            elif percentage >= 40:
                performance = "Average"
            else:
                performance = "Poor"

        response.append(
            {
                "participant_id": p.participant_id,
                "participant_name": p.participant_name,
                "enrollment_no": p.enrollment_no,
                "state_name": p.state_name,
                "district_name": p.district_name,
                "centre_name": p.centre_name,
                "batch_name": p.batch_name,
                "status": (
                    "Active"
                    if p.status == "1"
                    else "Inactive"
                ),
                "course_progress": round(
                    (
                        (p.completed_modules or 0)
                        / (p.total_modules or 1)
                    ) * 100,
                    2,
                ) if (p.total_modules or 0) > 0 else 0,
                "performance": performance,
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
        participant=ParticipantProfileResponse(
            **report["participant_profile"]
        ),
        attempt_wise_result=report["attempt_wise_result"],
        assessment_summary=report["assessment_summary"],
    )


    @staticmethod
    def get_participant_key_details(
        db: Session,
        participant_id: int
    ):
        participant = (
            db.query(
                ParticipantMaster.participant_id,
                ParticipantMaster.username
            )
            .filter(
                ParticipantMaster.participant_id == participant_id
            )
            .first()
        )

        if not participant:
            raise HTTPException(
                status_code=404,
                detail="Participant not found"
            )

        return {
            "status": True,
            "message": "Participant credentials fetched successfully",
            "data": {
                "participant_id": participant.participant_id,
                "username": participant.username,
                "password": "-"
            }
        }

    @staticmethod
    def get_participant_time_spent(
     db: Session,
     participant_id: int
):
     participant = (
        db.query(ParticipantMaster)
        .filter(
            ParticipantMaster.participant_id ==
            participant_id
        )
        .first()
    )

     if not participant:
        raise HTTPException(
            status_code=404,
            detail="Participant not found"
        )

     module_rows = (
        db.query(
            ModuleMaster.module_id,
            ModuleMaster.module_name,
            func.sum(
                TimeSpentModuleLog.time_taken
            ).label("time_spent")
        )
        .join(
            ModuleMaster,
            ModuleMaster.module_id ==
            TimeSpentModuleLog.module_id
        )
        .filter(
            TimeSpentModuleLog.user_id ==
            participant_id
        )
        .group_by(
            ModuleMaster.module_id,
            ModuleMaster.module_name
        )
        .all()
    )

     total_time = sum(
        row.time_spent or 0
        for row in module_rows
    )

     return {
        "status": True,
        "message": "Time spent fetched successfully",
        "data": {
            "participant_id": participant_id,
            "participant_name": participant.participant_name,
            "total_time_spent_seconds": total_time,
            "modules": [
                {
                    "module_id": row.module_id,
                    "module_name": row.module_name,
                    "time_spent_seconds": int(row.time_spent or 0)
                }
                for row in module_rows
            ]
        }
    }



    def assign_module(
        self,
        participant_id: int,
        module_id: int
    ):
        module = self.repository.get_module_by_id(module_id)

        if not module:
            raise ValueError("Module not found")

        modules = self.repository.get_modules_by_parent_id(
            module.parent_id
        )

        for item in modules:

            existing = self.repository.get_participant_module(
                participant_id,
                item.module_id
            )

            if existing:
                continue

            participant_module = ParticipantModule(
                participant_id=participant_id,
                course_id=item.fk_course_id,
                module_id=item.module_id,
                lock_status=0,
                status="1"
            )

            self.repository.create_participant_module(
                participant_module
            )

        self.repository.commit()

        return {
            "success": True,
            "message": "Module assigned successfully"
        }

    def unassign_module(
        self,
        participant_id: int,
        module_id: int
    ):
        module = self.repository.get_module_by_id(module_id)

        if not module:
            raise ValueError("Module not found")

        modules = self.repository.get_modules_by_parent_id(
            module.parent_id
        )

        module_ids = [
            item.module_id
            for item in modules
        ]

        self.repository.delete_participant_modules(
            participant_id,
            module_ids
        )

        self.repository.commit()

        return {
            "success": True,
            "message": "Module unassigned successfully"
        }

    def get_modules(
        self,
        participant_id: int,
        language_id: int
    ):
        modules = self.repository.get_modules_by_language(
            language_id
        )

        assigned_ids = self.repository.get_assigned_module_ids(
            participant_id
        )

        response = []

        for module in modules:
            response.append({
                "module_id": module.module_id,
                "parent_id": module.parent_id,
                "module_name": module.module_name,
                "language_id": module.language_id,
                "assigned": module.module_id in assigned_ids
            })

        return response