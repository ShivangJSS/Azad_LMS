from datetime import datetime
import os
from uuid import uuid4
from fastapi import UploadFile, HTTPException, status
from sqlalchemy import func, distinct
from sqlalchemy.orm import Session
from app.modules.course.model import CourseMaster
from app.modules.module.model import ModuleMaster
from app.modules.document.model import LanguageMaster
from app.modules.course.schema import CourseUpdateRequest
from app.modules.dashboard.model import ParticipantModule
from app.utils.file_upload import validate_upload, IMAGE_EXTENSIONS


def _resolve_course_parent_id(db: Session, course_id: int):
    """Return the English-base course_id for whatever course_id is passed.

    The list now hands out each language's OWN row id (e.g. the Hindi row's
    id, not the English one), but translations are stored/looked up by the
    shared parent_id. Resolving to the parent first lets view/edit/update
    work no matter which language's id the caller sends.
    """
    row = (
        db.query(CourseMaster.parent_id, CourseMaster.course_id)
        .filter(
            CourseMaster.course_id == course_id,
            CourseMaster.deleted_at.is_(None),
        )
        .first()
    )
    if not row:
        return None
    return row.parent_id or row.course_id


class CourseRepository:
    @staticmethod
    def get_courses(
        db: Session,
        search: str = None,
        language_id: int = None,
        page: int = 1,
        page_size: int = 10,
    ):
        lang = language_id or 1

        # ---------------------------------------------------------
        # LANGUAGE-WISE MODULE COUNT
        #
        # Count only modules whose language_id matches the
        # current CourseMaster language.
        #
        # Module fk_course_id can point to:
        #   1. current language course_id
        #   2. English/base course_id
        #
        # But language_id MUST match.
        # ---------------------------------------------------------

        module_count_subquery = (
            db.query(
                func.count(distinct(ModuleMaster.module_id))
            )
            .filter(
                ModuleMaster.language_id == CourseMaster.language_id,
                ModuleMaster.deleted_at.is_(None),
                (
                    (ModuleMaster.fk_course_id == CourseMaster.course_id)
                    |
                    (
                        ModuleMaster.fk_course_id
                        == func.coalesce(
                            CourseMaster.parent_id,
                            CourseMaster.course_id,
                        )
                    )
                ),
            )
            .correlate(CourseMaster)
            .scalar_subquery()
        )

        query = (
            db.query(
                CourseMaster.course_id.label("course_id"),
                CourseMaster.course_name.label("course_name"),
                CourseMaster.status.label("status"),
                CourseMaster.language_id.label("language_id"),
                LanguageMaster.language_name.label("language_name"),
                module_count_subquery.label("module_count"),
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == CourseMaster.language_id,
            )
            .filter(
                CourseMaster.deleted_at.is_(None),
                CourseMaster.language_id == lang,
            )
        )

        # Search
        if search and search.strip():
            query = query.filter(
                CourseMaster.course_name.ilike(
                    f"%{search.strip()}%"
                )
            )

        # Total
        total = query.count()

        # Pagination
        rows = (
            query
            .order_by(CourseMaster.course_id.desc())
            .offset((page - 1) * page_size)
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
                    "module_count": int(row.module_count or 0),
                }
            )

        return total, records
    @staticmethod
    def _get_course_for_language(db: Session, course_id: int, language_id: int):
        """Shared lookup for view/edit.

        Resolves the course family from any passed id, then returns that
        language's row. When the translation doesn't exist yet, returns a
        BLANK editable record (keeping the base image) instead of nothing —
        so the screen shows blank fields to fill in, never English content.
        Returns None only when the course itself doesn't exist.
        """
        parent_id = _resolve_course_parent_id(db, course_id)
        if parent_id is None:
            return None

        base = (
            db.query(CourseMaster)
            .filter(
                CourseMaster.course_id == parent_id,
                CourseMaster.deleted_at.is_(None),
            )
            .first()
        )
        if not base:
            return None

        if language_id == 1:
            target = base
        else:
            target = (
                db.query(CourseMaster)
                .filter(
                    CourseMaster.parent_id == parent_id,
                    CourseMaster.language_id == language_id,
                    CourseMaster.deleted_at.is_(None),
                )
                .first()
            )

        language_name = (
            db.query(LanguageMaster.language_name)
            .filter(LanguageMaster.language_id == language_id)
            .scalar()
        )

        if target is None:
            # No translation yet — blank, editable, keeping the base image.
            return {
                "course_id": None,
                "parent_id": parent_id,
                "language_id": language_id,
                "language_name": language_name,
                "course_name": "",
                "course_description": "",
                "course_image": base.course_image,
                "status": base.status,
            }

        return {
            "course_id": target.course_id,
            "parent_id": target.parent_id,
            "language_id": target.language_id,
            "language_name": language_name,
            "course_name": target.course_name,
            "course_description": target.course_description,
            "course_image": target.course_image,
            "status": target.status,
        }

    @staticmethod
    def get_course_translation(
        db: Session,
        course_id: int,
        language_id: int,
    ):
        return CourseRepository._get_course_for_language(db, course_id, language_id)

    @staticmethod
    def edit_course(
        db: Session,
        course_id: int,
        language_id: int,
    ):
        return CourseRepository._get_course_for_language(db, course_id, language_id)

    @staticmethod
    def update_course(
        db: Session,
        course_id: int,
        language_id: int,
        request: CourseUpdateRequest,
        course_image: UploadFile = None,
    ):
        # Resolve the course family from whatever id was passed (may be a
        # translation row's own id), then find this language's row.
        parent_id = _resolve_course_parent_id(db, course_id)
        if parent_id is None:
            return None

        base = (
            db.query(CourseMaster)
            .filter(
                CourseMaster.course_id == parent_id,
                CourseMaster.deleted_at.is_(None),
            )
            .first()
        )
        if not base:
            return None

        if language_id == 1:
            course = base
        else:
            course = (
                db.query(CourseMaster)
                .filter(
                    CourseMaster.parent_id == parent_id,
                    CourseMaster.language_id == language_id,
                    CourseMaster.deleted_at.is_(None),
                )
                .first()
            )

        # No translation row for this language yet — create one so the user can
        # add the translation from the view/edit screen (English base always
        # exists, so this only happens for other languages).
        if not course:
            course = CourseMaster(
                parent_id=parent_id,
                language_id=language_id,
                course_image=base.course_image,
                created_by=base.created_by,
                status=base.status,
            )
            db.add(course)

        # Reject a duplicate course name within the same language (exact match).
        duplicate = (
            db.query(CourseMaster)
            .filter(
                CourseMaster.course_name == request.course_name,
                CourseMaster.language_id == language_id,
                CourseMaster.deleted_at.is_(None),
                CourseMaster.course_id != course.course_id,
            )
            .first()
        )
        if duplicate is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A course with this name already exists in this language.",
            )

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

            extension = validate_upload(course_image, IMAGE_EXTENSIONS)

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
        search: str = None,
        language_id: int = None,
    ):
        query = (
            db.query(
                CourseMaster.course_name,
                LanguageMaster.language_name,
                ModuleMaster.module_name,
                func.count(distinct(ParticipantModule.participant_module_id)).label(
                    "users"
                ),
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

        if search and search.strip():
            query = query.filter(CourseMaster.course_name.ilike(f"%{search.strip()}%"))

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
