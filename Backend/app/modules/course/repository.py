from datetime import datetime
import os
from uuid import uuid4
from fastapi import UploadFile
from sqlalchemy import func, distinct
from sqlalchemy.orm import Session
from app.modules.course.model import CourseMaster
from app.modules.module.model import ModuleMaster
from app.modules.document.model import LanguageMaster
from app.modules.course.schema import CourseUpdateRequest
from app.modules.dashboard.model import ParticipantModule


class CourseRepository:

    @staticmethod
    def get_courses(
        db: Session,
        search: str = None,
        language_id: int = None,
        page: int = 1,
        page_size: int = 10,
    ):
        query = (
            db.query(
                CourseMaster.course_id,
                CourseMaster.course_name,
                CourseMaster.status,
                CourseMaster.language_id,
                LanguageMaster.language_name,
                func.count(
                    distinct(ModuleMaster.module_id)
                ).label("module_count"),
                func.count(
                    distinct(ParticipantModule.participant_module_id)
                ).label("users_enrolled"),
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == CourseMaster.language_id,
            )
            .outerjoin(
                ModuleMaster,
                ModuleMaster.fk_course_id == CourseMaster.course_id,
            )
            .outerjoin(
                ParticipantModule,
                ParticipantModule.module_id == ModuleMaster.module_id,
            )
            .filter(CourseMaster.deleted_at.is_(None))
        )

        # Search by course name
        if search:
            query = query.filter(
                CourseMaster.course_name.ilike(f"%{search}%")
            )

        # Language filter
        if language_id:

            if language_id == 1:
                # English tab
                query = query.filter(
                    CourseMaster.language_id == 1,
                    CourseMaster.parent_id == CourseMaster.course_id,
                )
            else:
                query = query.filter(
                    CourseMaster.language_id == language_id
                )

        query = (
            query.group_by(
                CourseMaster.course_id,
                CourseMaster.course_name,
                CourseMaster.status,
                CourseMaster.language_id,
                LanguageMaster.language_name,
            )
            .order_by(CourseMaster.course_id.desc())
        )

        total = query.count()

        rows = (
          query.offset((page - 1) * page_size)
          .limit(page_size)
          .all()
)

        records = []

        for row in rows:
          records.append(
        {
            "course_id": row.course_id,
            "course_name": row.course_name,
            "status": row.status,
            "language_id": row.language_id,
            "language_name": row.language_name,
            "module_count": row.module_count,
            "users_enrolled": row.users_enrolled,
        }
    )

        return total, records



    @staticmethod
    def get_course_translation(
     db: Session,
     course_id: int,
     language_id: int,
):

     query = (
        db.query(
            CourseMaster.course_id,
            CourseMaster.parent_id,
            CourseMaster.course_name,
            CourseMaster.course_description,
            CourseMaster.course_image,
            CourseMaster.status,
            CourseMaster.language_id,
            LanguageMaster.language_name,
        )
        .outerjoin(
            LanguageMaster,
            LanguageMaster.language_id == CourseMaster.language_id,
        )
    )

     if language_id == 1:
        query = query.filter(
            CourseMaster.course_id == course_id,
            CourseMaster.parent_id == CourseMaster.course_id,
        )
     else:
        query = query.filter(
            CourseMaster.parent_id == course_id,
            CourseMaster.language_id == language_id,
        )

     row = query.first()

     if not row:
        return None

     return {
        "course_id": row.course_id,
        "parent_id": row.parent_id,
        "course_name": row.course_name,
        "course_description": row.course_description,
        "course_image": row.course_image,
        "status": row.status,
        "language_id": row.language_id,
        "language_name": row.language_name,
    }



    @staticmethod
    def edit_course(
     db: Session,
     course_id: int,
     language_id: int,
):

     query = (
        db.query(
            CourseMaster.course_id,
            CourseMaster.parent_id,
            CourseMaster.course_name,
            CourseMaster.course_description,
            CourseMaster.course_image,
            CourseMaster.status,
            CourseMaster.language_id,
            LanguageMaster.language_name,
        )
        .outerjoin(
            LanguageMaster,
            LanguageMaster.language_id == CourseMaster.language_id,
        )
    )

     if language_id == 1:

        query = query.filter(
            CourseMaster.course_id == course_id,
            CourseMaster.parent_id == CourseMaster.course_id,
        )

     else:

        query = query.filter(
            CourseMaster.parent_id == course_id,
            CourseMaster.language_id == language_id,
        )

     course = query.first()

     if not course:
        return None

     return {
        "course_id": course.course_id,
        "parent_id": course.parent_id,
        "language_id": course.language_id,
        "language_name": course.language_name,
        "course_name": course.course_name,
        "course_description": course.course_description,
        "course_image": course.course_image,
        "status": course.status,
    }




    @staticmethod
    def update_course(
     db: Session,
     course_id: int,
     language_id: int,
     request: CourseUpdateRequest,
     course_image: UploadFile = None,
):
    # Find course
     if language_id == 1:
        course = (
            db.query(CourseMaster)
            .filter(
                CourseMaster.course_id == course_id,
                CourseMaster.parent_id == CourseMaster.course_id,
                CourseMaster.deleted_at.is_(None),
            )
            .first()
        )
     else:
        course = (
            db.query(CourseMaster)
            .filter(
                CourseMaster.parent_id == course_id,
                CourseMaster.language_id == language_id,
                CourseMaster.deleted_at.is_(None),
            )
            .first()
        )

     if not course:
        return None

    # Update fields
     course.course_name = request.course_name
     course.course_description = request.course_description
     course.status = request.status

    # Update image only if a new file is uploaded
     if course_image is not None:

        today = datetime.now()

        upload_dir = os.path.join(
            "uploads",
            "course_master",
            str(today.year),
            f"{today.month:02d}",
        )

        os.makedirs(upload_dir, exist_ok=True)

        extension = os.path.splitext(course_image.filename)[1]

        filename = f"{uuid4().hex}{extension}"

        image_path = os.path.join(upload_dir, filename)

        with open(image_path, "wb") as buffer:
            buffer.write(course_image.file.read())

        # Save relative path
        course.course_image = image_path.replace("\\", "/")

     db.commit()
     db.refresh(course)

     return {
        "course_id": course.course_id,
        "parent_id": course.parent_id,
        "language_id": course.language_id,
        "course_name": course.course_name,
        "course_description": course.course_description,
        "course_image": course.course_image,
        "status": course.status,
    }



  
    @staticmethod
    def export_courses(
     db: Session,
     language_id: int = None,
):
     query = (
        db.query(
            CourseMaster.course_name,
            LanguageMaster.language_name,
            ModuleMaster.module_name,
            func.count(
                distinct(ParticipantModule.participant_module_id)
            ).label("users"),
            CourseMaster.status,
        )
        .outerjoin(
            LanguageMaster,
            LanguageMaster.language_id == CourseMaster.language_id,
        )
        .outerjoin(
            ModuleMaster,
            ModuleMaster.fk_course_id == CourseMaster.course_id,
        )
        .outerjoin(
            ParticipantModule,
            ParticipantModule.module_id == ModuleMaster.module_id,
        )
        .filter(CourseMaster.deleted_at.is_(None))
    )

    # Language filter
     if language_id:
        if language_id == 1:
            query = query.filter(
                CourseMaster.language_id == 1,
                CourseMaster.parent_id == CourseMaster.course_id,
            )
        else:
            query = query.filter(
                CourseMaster.language_id == language_id,
            )

     rows = (
        query.group_by(
            CourseMaster.course_name,
            LanguageMaster.language_name,
            ModuleMaster.module_name,
            CourseMaster.status,
        )
        .order_by(
            CourseMaster.course_name,
            ModuleMaster.module_name,
        )
        .all()
    )

     records = []

     for row in rows:
        records.append(
            {
                "course_name": row.course_name,
                "language_name": row.language_name,
                "module_name": row.module_name,
                "users": row.users,
                "status": "Active" if row.status == 1 else "Inactive",
            }
        )

     return records
