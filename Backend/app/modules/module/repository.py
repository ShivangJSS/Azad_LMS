from datetime import datetime
from io import BytesIO
import os
from re import search
from openpyxl.styles import Font
import uuid
from app.modules.assessment.model import (
    AssessmentMapping,
    AssessmentMaster,
    DropBucketMaster,
    MatchMakingMaster,
    McqMaster,
    PostSessionAssessment,
    ScqMaster,
)
from fastapi import UploadFile
from fastapi import HTTPException
from app.utils.file_upload import validate_upload, IMAGE_EXTENSIONS
from openpyxl import Workbook
from sqlalchemy import BigInteger, and_, case, cast, exists, func, distinct
from sqlalchemy.orm import Session, aliased
from app.modules.module.schema import ModuleTranslation
from app.modules.module.model import (
    ModuleMaster,
    ModuleType,
    PreSessionAssessment,
    SelfPacedLearning,
    TopicMapping,
)
from app.modules.document.model import (
    DocumentMaster,
    LanguageMaster,
    TopicMaster,
)


class ModuleRepository:

    @staticmethod
    def get_modules(
            db: Session,
            language_id: int,
            search: str | None,
            skip: int,
            limit: int,
    ):
        query = (
            db.query(
                ModuleMaster.module_id,
                ModuleMaster.parent_id,
                ModuleMaster.module_name,
                ModuleMaster.fk_course_id,
                ModuleMaster.language_id,
                ModuleMaster.status,
                ModuleMaster.publishing_status,
                ModuleType.module_type.label("module_type"),
                LanguageMaster.language_name.label("language_name"),
                func.count(distinct(TopicMapping.topic_mapping_id)).label(
                    "topic_count"
                ),
            )
            .outerjoin(
                ModuleType,
                (
                        ModuleType.module_type_id
                        == cast(ModuleMaster.module_type, BigInteger)
                )
                & (ModuleType.status == 1),
            )
            .outerjoin(
                LanguageMaster,
                (LanguageMaster.language_id == ModuleMaster.language_id)
                & (LanguageMaster.is_active == 1),
            )
            .outerjoin(
                TopicMapping,
                TopicMapping.module_id == ModuleMaster.module_id,
            )
            .filter(
                # Show both Active and Inactive modules (status is a display
                # column, not a visibility filter). Only soft-deleted rows
                # are hidden.
                ModuleMaster.language_id == language_id,
                ModuleMaster.deleted_at.is_(None),
            )
            .group_by(
                ModuleMaster.module_id,
                ModuleMaster.parent_id,
                ModuleMaster.module_name,
                ModuleMaster.fk_course_id,
                ModuleMaster.language_id,
                ModuleMaster.status,
                ModuleMaster.publishing_status,
                ModuleType.module_type,
                LanguageMaster.language_name,
            )
        )

        # if search:
        #     query = query.filter(ModuleMaster.module_name.ilike(f"%{search}%"))

        if search and search.strip():
            search_value = (
                search.strip()
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_")
            )

            query = query.filter(
                ModuleMaster.module_name.ilike(
                    f"%{search_value}%",
                    escape="\\",
                )
            )

        total = query.count()

        rows = (
            query.order_by(ModuleMaster.module_id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        records = []

        for row in rows:
            records.append(
                {
                    "module_id": row.module_id,
                    "parent_id": row.parent_id,
                    "module_name": row.module_name or "",
                    "fk_course_id": row.fk_course_id,
                    "module_type": row.module_type,
                    "language_id": row.language_id,
                    "language_name": row.language_name,
                    "topic_count": row.topic_count,
                    "status": row.status,
                    "publishing_status": row.publishing_status,
                }
            )

        return records, total

    @staticmethod
    def create_module(
            db: Session,
            fk_course_id: int,
            module_name: str,
            module_description: str,
            module_type: int,
            module_duration: str,
            publishing_status: str,
            status: int,
            module_overview: str,
            module_objective: str,
            module_icon: UploadFile,
            language_id: int = 1,
    ):

        upload_dir = "uploads/module_icons"
        os.makedirs(upload_dir, exist_ok=True)

        extension = validate_upload(module_icon, IMAGE_EXTENSIONS)
        filename = f"{uuid.uuid4()}{extension}"

        filepath = os.path.join(upload_dir, filename)

        with open(filepath, "wb") as buffer:
            buffer.write(module_icon.file.read())

        # A module added from any language tab is a fully independent record
        # (self-parented, like the English one) — NOT a translation of
        # anything. Translations are created separately via save_translation.
        module = ModuleMaster(
            fk_course_id=fk_course_id,
            module_name=module_name,
            module_description=module_description,
            module_type=module_type,
            module_duration=module_duration,
            publishing_status=publishing_status,
            status=status,
            language_id=language_id,
            module_overview=module_overview,
            module_objective=module_objective,
            module_icon=filename,
            lock_status=0,
        )

        db.add(module)
        db.flush()

        module.parent_id = module.module_id

        db.commit()
        db.refresh(module)

        return {
            "message": "Module created successfully",
            "module_id": module.module_id,
            "module_icon": filename,
        }

    @staticmethod
    def update_module(
            db: Session,
            module_id: int,
            fk_course_id: int,
            module_name: str,
            module_description: str,
            module_type: int,
            module_duration: str,
            publishing_status: str,
            status: int,
            module_overview: str,
            module_objective: str,
            module_icon: UploadFile | None,
    ):
        module = (
            db.query(ModuleMaster)
            .filter(
                ModuleMaster.module_id == module_id,
                ModuleMaster.deleted_at.is_(None),
            )
            .first()
        )

        if not module:
            raise HTTPException(
                status_code=404,
                detail="Module not found",
            )

        # Update fields
        module.fk_course_id = fk_course_id
        module.module_name = module_name
        module.module_description = module_description
        module.module_type = module_type
        module.module_duration = module_duration
        module.publishing_status = publishing_status
        module.status = status

        module.module_overview = module_overview
        module.module_objective = module_objective

        # Update image only if a new file is uploaded
        if module_icon and module_icon.filename:

            upload_dir = "uploads/module_icons"
            os.makedirs(upload_dir, exist_ok=True)

            # Delete old image (optional)
            if module.module_icon:
                old_file = os.path.join(upload_dir, module.module_icon)
                if os.path.exists(old_file):
                    os.remove(old_file)

            extension = validate_upload(module_icon, IMAGE_EXTENSIONS)
            filename = f"{uuid.uuid4()}{extension}"

            filepath = os.path.join(upload_dir, filename)

            with open(filepath, "wb") as buffer:
                buffer.write(module_icon.file.read())

            module.module_icon = filename

        db.commit()
        db.refresh(module)

        return {
            "message": "Module updated successfully",
            "module_id": module.module_id,
            "module_icon": module.module_icon,
        }

    @staticmethod
    def get_module_by_id(
            db: Session,
            module_id: int,
    ):
        module = (
            db.query(ModuleMaster)
            .filter(
                ModuleMaster.module_id == module_id,
                ModuleMaster.deleted_at.is_(None),
            )
            .first()
        )

        if not module:
            raise HTTPException(status_code=404, detail="Module not found")

        return {
            "module_id": module.module_id,
            "parent_id": module.parent_id,
            "fk_course_id": module.fk_course_id,
            "module_name": module.module_name,
            "module_description": module.module_description,
            "module_type": module.module_type,
            "module_duration": module.module_duration,
            "publishing_status": module.publishing_status,
            "status": module.status,
            "language_id": module.language_id,
            "module_icon": module.module_icon,
            "icon_images": module.icon_images,
            "module_overview": module.module_overview,
            "module_objective": module.module_objective,
            "created_by": module.created_by,
            "self_paced_learning": module.self_paced_learning,
            "pre_session_assessment": module.pre_session_assessment,
            "main_content_of_the_module": module.main_content_of_the_module,
            "post_session_assessment": module.post_session_assessment,
            "lock_status": module.lock_status,
            "module_part_id": module.module_part_id,
            "module_part_type": module.module_part_type,
            "created_at": module.created_at,
            "updated_at": module.updated_at,
        }

    @staticmethod
    def delete_module(
            db: Session,
            module_id: int,
    ):
        module = (
            db.query(ModuleMaster)
            .filter(
                ModuleMaster.module_id == module_id,
                ModuleMaster.deleted_at.is_(None),
            )
            .first()
        )

        if not module:
            raise HTTPException(status_code=404, detail="Module not found")

        module.deleted_at = datetime.utcnow()

        db.commit()

        return {"message": "Module deleted successfully"}

    @staticmethod
    def save_translation(
            db: Session,
            module_id: int,
            request: ModuleTranslation,
    ):
        parent_module = (
            db.query(ModuleMaster)
            .filter(
                ModuleMaster.module_id == module_id,
                ModuleMaster.deleted_at.is_(None),
            )
            .first()
        )

        if not parent_module:
            raise HTTPException(
                status_code=404,
                detail="Module not found",
            )

        existing = (
            db.query(ModuleMaster)
            .filter(
                ModuleMaster.parent_id == parent_module.parent_id,
                ModuleMaster.language_id == request.language_id,
                ModuleMaster.deleted_at.is_(None),
            )
            .first()
        )

        # If a translation for this language already exists, UPDATE it instead of
        # erroring — this lets the same screen be used to edit a translation.
        if existing:
            existing.module_name = request.module_name
            existing.module_description = request.module_description
            existing.module_overview = request.module_overview
            existing.module_objective = request.module_objective

            db.commit()
            db.refresh(existing)

            return {
                "message": "Translation updated successfully",
                "module_id": existing.module_id,
            }

        translation = ModuleMaster(
            parent_id=parent_module.parent_id,
            fk_course_id=parent_module.fk_course_id,
            module_name=request.module_name,
            module_description=request.module_description,
            module_type=parent_module.module_type,
            module_duration=parent_module.module_duration,
            publishing_status=parent_module.publishing_status,
            status=parent_module.status,
            language_id=request.language_id,
            module_overview=request.module_overview,
            module_objective=request.module_objective,
            # Inherit the parent's icon so the image stays associated with the
            # record on every language tab — a blank translation must not lose
            # the image. (There is no per-language icon upload yet.)
            module_icon=parent_module.module_icon,
            lock_status=parent_module.lock_status,
        )

        db.add(translation)
        db.commit()
        db.refresh(translation)

        return {
            "message": "Translation saved successfully",
            "module_id": translation.module_id,
        }

    @staticmethod
    def get_translation(
            db: Session,
            module_id: int,
            language_id: int,
    ):
        parent_module = (
            db.query(ModuleMaster)
            .filter(
                ModuleMaster.module_id == module_id,
                ModuleMaster.deleted_at.is_(None),
            )
            .first()
        )

        if not parent_module:
            raise HTTPException(
                status_code=404,
                detail="Module not found",
            )

        translation = (
            db.query(ModuleMaster)
            .filter(
                ModuleMaster.parent_id == parent_module.parent_id,
                ModuleMaster.language_id == language_id,
                ModuleMaster.deleted_at.is_(None),
            )
            .first()
        )

        if translation:
            return {
                "is_translated": True,
                "module_id": translation.module_id,
                "parent_id": translation.parent_id,
                "language_id": translation.language_id,
                "module_name": translation.module_name,
                "module_description": translation.module_description,
                "module_overview": translation.module_overview,
                "module_objective": translation.module_objective,
                # Fall back to the parent's icon when this translation row has
                # none of its own — switching tabs must not hide the image.
                "module_icon": translation.module_icon or parent_module.module_icon,
            }

        return {
            "is_translated": False,
            "module_id": parent_module.module_id,
            "parent_id": parent_module.parent_id,
            "language_id": language_id,
            "module_name": "",
            "module_description": "",
            "module_overview": "",
            "module_objective": "",
            "module_icon": parent_module.module_icon,
        }

    @staticmethod
    def export_modules(
            db: Session,
            language_id: int,
            search: str | None = None,
    ):
        rows_query = (
            db.query(
                ModuleMaster.module_name,
                ModuleType.module_type,
                LanguageMaster.language_name,
                ModuleMaster.publishing_status,
                ModuleMaster.status,
            )
            .outerjoin(
                ModuleType,
                cast(ModuleMaster.module_type, BigInteger) == ModuleType.module_type_id,
            )
            .outerjoin(
                LanguageMaster,
                ModuleMaster.language_id == LanguageMaster.language_id,
            )
            .filter(
                ModuleMaster.language_id == language_id,
                ModuleMaster.deleted_at.is_(None),
            )
        )

        if search and search.strip():
            rows_query = rows_query.filter(
                ModuleMaster.module_name.ilike(f"%{search.strip()}%")
            )

        rows = rows_query.order_by(ModuleMaster.module_id.desc()).all()

        wb = Workbook()
        ws = wb.active
        ws.title = "Modules"

        headers = [
            "S.No",
            "Module Name",
            "Module Type",
            "Language",
            "Publishing Status",
            "Status",
        ]

        for col, header in enumerate(headers, start=1):
            cell = ws.cell(row=1, column=col)
            cell.value = header
            cell.font = Font(bold=True)

        for index, row in enumerate(rows, start=2):
            ws.cell(row=index, column=1).value = index - 1
            ws.cell(row=index, column=2).value = row.module_name
            ws.cell(row=index, column=3).value = row.module_type
            ws.cell(row=index, column=4).value = row.language_name
            ws.cell(row=index, column=5).value = row.publishing_status
            ws.cell(row=index, column=6).value = (
                "Active" if row.status == 1 else "Inactive"
            )

        stream = BytesIO()
        wb.save(stream)
        stream.seek(0)

        return stream

    @staticmethod
    def _resolve_base_module_id(db: Session, module_id: int):
        """Return the base/English module_id for any language variant's id.

        Assessment (and content) configuration is shared across a module's
        language versions through the common parent group, so it must always
        be keyed to the base module — never a translation's own id.
        """
        row = (
            db.query(ModuleMaster.parent_id, ModuleMaster.module_id)
            .filter(ModuleMaster.module_id == module_id)
            .first()
        )
        if row is None:
            return module_id
        return row.parent_id or row.module_id

    @staticmethod
    def get_post_assessments_by_module(db: Session, module_id: int):
        """Return the post-session assessment container(s) for a module.

        Older modules had theirs seeded during migration, but a module
        created through the app since then has none — which surfaced as a
        misleading "assessment is not linked" block on an otherwise brand
        new module. Bootstrap one on first access instead, the same way
        get_pre_assessments_by_module already does, so the question-assign
        flow just works without a separate linking step.
        """

        # Always operate on the base module so every language version of the
        # module shares one assessment container / set of assigned questions.
        module_id = ModuleRepository._resolve_base_module_id(db, module_id)

        def _query():
            return (
                db.query(
                    AssessmentMaster.assessment_id, AssessmentMaster.assessment_name
                )
                .join(
                    PostSessionAssessment,
                    PostSessionAssessment.assessment_id
                    == AssessmentMaster.assessment_id,
                )
                .filter(
                    PostSessionAssessment.module_id == module_id,
                    PostSessionAssessment.is_active == 1,
                )
                .order_by(AssessmentMaster.assessment_id)
                .all()
            )

        rows = _query()
        if rows:
            return rows

        # --- bootstrap a post-session container for this module ---
        last_am = (
            db.query(AssessmentMaster.assessment_id)
            .order_by(AssessmentMaster.assessment_id.desc())
            .first()
        )
        assessment_id = (last_am[0] if last_am and last_am[0] else 0) + 1

        db.add(
            AssessmentMaster(
                assessment_id=assessment_id,
                parent_id=assessment_id,
                assessment_name="Post-Session Assessment",
                module_id=module_id,
                is_active=1,
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )
        )
        db.flush()

        last_post = (
            db.query(PostSessionAssessment.post_session_assessment_id)
            .order_by(PostSessionAssessment.post_session_assessment_id.desc())
            .first()
        )
        post_id = (last_post[0] if last_post and last_post[0] else 0) + 1

        db.add(
            PostSessionAssessment(
                post_session_assessment_id=post_id,
                assessment_id=assessment_id,
                module_id=module_id,
                is_active=1,
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )
        )
        db.commit()

        return _query()

    @staticmethod
    def get_pre_assessments_by_module(
            db: Session,
            module_id: int,
    ):
        """Return the pre-session assessment container(s) for a module.

        Unlike post-session (whose container was seeded during migration), no
        pre-session container exists until it's used, so we bootstrap one on
        first access (an AssessmentMaster + PreSessionAssessment row). Ids are
        assigned explicitly because these migrated tables have no sequence.
        After it exists, the normal assessment-mapping endpoints work exactly
        like post-session (keyed by this assessment_id).
        """

        # Share one container across every language version of the module.
        module_id = ModuleRepository._resolve_base_module_id(db, module_id)

        def _query():
            return (
                db.query(
                    AssessmentMaster.assessment_id,
                    AssessmentMaster.assessment_name,
                )
                .join(
                    PreSessionAssessment,
                    PreSessionAssessment.assessment_id
                    == AssessmentMaster.assessment_id,
                )
                .filter(
                    PreSessionAssessment.module_id == module_id,
                    PreSessionAssessment.is_active == 1,
                )
                .order_by(AssessmentMaster.assessment_id)
                .all()
            )

        rows = _query()
        if rows:
            return rows

        # --- bootstrap a pre-session container for this module ---
        last_am = (
            db.query(AssessmentMaster.assessment_id)
            .order_by(AssessmentMaster.assessment_id.desc())
            .first()
        )
        assessment_id = (last_am[0] if last_am and last_am[0] else 0) + 1

        db.add(
            AssessmentMaster(
                assessment_id=assessment_id,
                parent_id=assessment_id,
                assessment_name="Pre-Session Assessment",
                module_id=module_id,
                is_active=1,
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )
        )
        db.flush()

        last_pre = (
            db.query(PreSessionAssessment.pre_session_assessment_id)
            .order_by(PreSessionAssessment.pre_session_assessment_id.desc())
            .first()
        )
        pre_id = (last_pre[0] if last_pre and last_pre[0] else 0) + 1

        db.add(
            PreSessionAssessment(
                pre_session_assessment_id=pre_id,
                assessment_id=assessment_id,
                module_id=module_id,
                is_active=1,
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )
        )
        db.commit()

        return _query()

    @staticmethod
    def get_scq_assessment_mapping(db: Session, assessment_id: int):
        return (
            db.query(
                ScqMaster.scq_id,
                ScqMaster.parent_id,
                ScqMaster.scq_question_title,
                ScqMaster.scq_question_description,
                ScqMaster.image_url,
                ScqMaster.status,
                ScqMaster.marks,
                ScqMaster.language_id,
                LanguageMaster.language_name,
                case(
                    (
                        exists().where(
                            and_(
                                AssessmentMapping.assessment_ref_id == ScqMaster.scq_id,
                                AssessmentMapping.assessment_type == "SCQ",
                                AssessmentMapping.is_active == 1,
                                AssessmentMapping.assessment_id == assessment_id,
                            )
                        ),
                        True,
                    ),
                    else_=False,
                ).label("is_checked"),
            )
            .outerjoin(
                LanguageMaster, LanguageMaster.language_id == ScqMaster.language_id
            )
            .filter(ScqMaster.deleted_at.is_(None))
            .all()
        )

    @staticmethod
    def get_mcq_assessment_mapping(db: Session, assessment_id: int):
        return (
            db.query(
                McqMaster.mcq_id,
                McqMaster.parent_id,
                McqMaster.mcq_question_title,
                McqMaster.mcq_question_description,
                McqMaster.image_url,
                McqMaster.status,
                McqMaster.marks,
                McqMaster.language_id,
                LanguageMaster.language_name,
                case(
                    (
                        exists().where(
                            and_(
                                AssessmentMapping.assessment_ref_id == McqMaster.mcq_id,
                                AssessmentMapping.assessment_type == "MCQ",
                                AssessmentMapping.is_active == 1,
                                AssessmentMapping.assessment_id == assessment_id,
                            )
                        ),
                        True,
                    ),
                    else_=False,
                ).label("is_checked"),
            )
            .outerjoin(
                LanguageMaster, LanguageMaster.language_id == McqMaster.language_id
            )
            .filter(McqMaster.deleted_at.is_(None))
            .all()
        )

    @staticmethod
    def get_match_making_assessment_mapping(db: Session, assessment_id: int):
        return (
            db.query(
                MatchMakingMaster.match_making_id,
                MatchMakingMaster.parent_id,
                MatchMakingMaster.match_making_question_title,
                MatchMakingMaster.match_making_question_description,
                MatchMakingMaster.image_url,
                MatchMakingMaster.status,
                MatchMakingMaster.marks,
                MatchMakingMaster.language_id,
                LanguageMaster.language_name,
                case(
                    (
                        exists().where(
                            and_(
                                AssessmentMapping.assessment_ref_id
                                == MatchMakingMaster.match_making_id,
                                AssessmentMapping.assessment_type == "MM",
                                AssessmentMapping.is_active == 1,
                                AssessmentMapping.assessment_id == assessment_id,
                            )
                        ),
                        True,
                    ),
                    else_=False,
                ).label("is_checked"),
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == MatchMakingMaster.language_id,
            )
            .filter(MatchMakingMaster.deleted_at.is_(None))
            .all()
        )

    @staticmethod
    def get_drop_bucket_assessment_mapping(db: Session, assessment_id: int):
        return (
            db.query(
                DropBucketMaster.drop_bucket_id,
                DropBucketMaster.parent_id,
                DropBucketMaster.drop_bucket_question_title,
                DropBucketMaster.drop_bucket_question_description,
                DropBucketMaster.image_url,
                DropBucketMaster.status,
                DropBucketMaster.marks,
                DropBucketMaster.language_id,
                LanguageMaster.language_name,
                case(
                    (
                        exists().where(
                            and_(
                                AssessmentMapping.assessment_ref_id
                                == DropBucketMaster.drop_bucket_id,
                                AssessmentMapping.assessment_type == "DB",
                                AssessmentMapping.is_active == 1,
                                AssessmentMapping.assessment_id == assessment_id,
                            )
                        ),
                        True,
                    ),
                    else_=False,
                ).label("is_checked"),
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == DropBucketMaster.language_id,
            )
            .filter(DropBucketMaster.deleted_at.is_(None))
            .all()
        )

    @staticmethod
    def save_assessment_mapping(
            db: Session,
            assessment_type: str,
            assessments: list,
    ):
        """
        Add/reactivate assessment question mappings.

        Rules:
        - One mapping per assessment + type + question.
        - Existing active mapping -> do nothing.
        - Existing inactive mapping -> reactivate it.
        - Missing mapping -> create it.
        - Never create duplicate mappings.
        """

        now = datetime.now()
        changed_count = 0

        valid_types = {"MCQ", "SCQ", "DB", "MM"}

        if assessment_type not in valid_types:
            raise ValueError(f"Invalid assessment type: {assessment_type}")

        for item in assessments:

            assessment_id = item.assessment_id
            assessment_ref_id = item.assessment_ref_id

            if not assessment_id or not assessment_ref_id:
                continue

            mapping = (
                db.query(AssessmentMapping)
                .filter(
                    AssessmentMapping.assessment_id == assessment_id,
                    AssessmentMapping.assessment_type == assessment_type,
                    AssessmentMapping.assessment_ref_id == assessment_ref_id,
                )
                .first()
            )

            # ---------------------------------------------------------
            # Existing mapping
            # ---------------------------------------------------------
            if mapping:

                # Already active -> nothing to change
                if mapping.is_active == 1:
                    continue

                # Previously removed -> reactivate
                mapping.is_active = 1
                mapping.updated_at = now

                changed_count += 1
                continue

            # ---------------------------------------------------------
            # New mapping
            # ---------------------------------------------------------
            mapping = AssessmentMapping(
                assessment_id=assessment_id,
                assessment_type=assessment_type,
                assessment_ref_id=assessment_ref_id,
                is_active=1,
                created_at=now,
                updated_at=now,
            )

            db.add(mapping)
            changed_count += 1

        db.commit()

        return changed_count

    @staticmethod
    def _assessment_sibling_ref_ids(db, assessment_type, ref_id):
        """All question ids that are language variants of `ref_id`.

        Variants share a parent_id (the base question points to itself), so a
        question assigned in English maps every translated version too.
        Falls back to just `ref_id` for an unknown type or missing row.
        """
        models = {
            "MCQ": (McqMaster.mcq_id, McqMaster.parent_id),
            "SCQ": (ScqMaster.scq_id, ScqMaster.parent_id),
            "DB": (DropBucketMaster.drop_bucket_id, DropBucketMaster.parent_id),
            "MM": (MatchMakingMaster.match_making_id, MatchMakingMaster.parent_id),
        }

        info = models.get(assessment_type)
        if info is None:
            return [ref_id]

        pk_col, parent_col = info

        row = db.query(pk_col, parent_col).filter(pk_col == ref_id).first()
        if row is None:
            return [ref_id]

        # parent group id: the row's parent_id, or itself when it's the base.
        parent = row[1] or row[0]

        sibling_rows = (
            db.query(pk_col).filter((parent_col == parent) | (pk_col == parent)).all()
        )

        ids = [r[0] for r in sibling_rows]
        return ids or [ref_id]

    @staticmethod
    def get_topics_for_main_content(
            db: Session,
            module_id: int,
    ):
        return (
            db.query(
                TopicMaster.topic_id,
                TopicMaster.topic_name,
                TopicMaster.module_id,
                LanguageMaster.language_name,
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == TopicMaster.language_id,
            )
            .filter(
                TopicMaster.module_id == module_id,
                TopicMaster.parent_id == TopicMaster.topic_id,
                TopicMaster.is_active == "1",
            )
            .order_by(TopicMaster.topic_name)
            .all()
        )

    @staticmethod
    def get_documents_for_main_content(
            db: Session,
    ):
        return (
            db.query(
                DocumentMaster.doc_id,
                DocumentMaster.doc_title,
                DocumentMaster.doc_description,
                DocumentMaster.doc_type,
                LanguageMaster.language_name,
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == DocumentMaster.language_id,
            )
            .filter(
                DocumentMaster.status == 1,
                DocumentMaster.deleted_at.is_(None),
                DocumentMaster.parent_id == DocumentMaster.doc_id,
            )
            .all()
        )

    @staticmethod
    def check_main_content_exists(
            db: Session,
            module_id: int,
            topic_id: int,
            doc_id: int,
            listing_type: str = "main",
    ):
        return (
            db.query(SelfPacedLearning)
            .filter(
                SelfPacedLearning.module_id == module_id,
                SelfPacedLearning.topic_id == topic_id,
                SelfPacedLearning.doc_id == doc_id,
                SelfPacedLearning.listing_type == listing_type,
                SelfPacedLearning.is_active == 1,
            )
            .first()
        )

    @staticmethod
    def create_main_content(
            db: Session,
            module_id: int,
            topic_id: int,
            doc_id: int,
            listing_type: str = "main",
    ):
        # The self_paced_learning PK has no DB sequence, so assign the next id
        # explicitly instead of relying on auto-increment (which sends NULL).
        last = (
            db.query(SelfPacedLearning.self_paced_learning_id)
            .order_by(SelfPacedLearning.self_paced_learning_id.desc())
            .first()
        )
        next_id = (last[0] if last and last[0] else 0) + 1

        record = SelfPacedLearning(
            self_paced_learning_id=next_id,
            module_id=module_id,
            topic_id=topic_id,
            doc_id=doc_id,
            listing_type=listing_type,
            is_active=1,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        db.add(record)
        db.flush()

        return record

    @staticmethod
    def create_topic_mapping(
            db: Session,
            module_id: int,
            topic_id: int,
            doc_id: int,
    ):
        mapping = (
            db.query(TopicMapping)
            .filter(
                TopicMapping.module_id == module_id,
                TopicMapping.topic_id == topic_id,
                TopicMapping.doc_id == doc_id,
            )
            .first()
        )

        if not mapping:
            mapping = TopicMapping(
                module_id=module_id,
                topic_id=topic_id,
                doc_id=doc_id,
                status="1",
            )
            db.add(mapping)

        return mapping

    @staticmethod
    def update_module_main_content_flag(
            db: Session,
            module_id: int,
    ):
        (
            db.query(ModuleMaster)
            .filter(ModuleMaster.module_id == module_id)
            .update({ModuleMaster.main_content_of_the_module: 1})
        )

    @staticmethod
    def update_document_main_content_flag(
            db: Session,
            doc_id: int,
    ):
        (
            db.query(DocumentMaster)
            .filter(DocumentMaster.doc_id == doc_id)
            .update(
                {
                    DocumentMaster.main_content_of_the_module: 1,
                }
            )
        )

    @staticmethod
    def get_main_content_list(
            db: Session,
            module_id: int,
            language_id: int | None = None,
            listing_type: str = "main",
    ):
        # The document is attached in ONE language (the base doc). To show the
        # content in another language we resolve its translation via parent_id
        # (all language variants of a document share the same parent_id), and
        # fall back to the base document when no translation exists.
        DocBase = aliased(DocumentMaster)
        DocLang = aliased(DocumentMaster)

        doc_title = func.coalesce(DocLang.doc_title, DocBase.doc_title).label(
            "doc_title"
        )
        doc_type = func.coalesce(DocLang.doc_type, DocBase.doc_type).label("doc_type")
        doc_ref_id = func.coalesce(DocLang.doc_ref_id, DocBase.doc_ref_id).label(
            "doc_ref_id"
        )
        doc_language_id = func.coalesce(DocLang.language_id, DocBase.language_id).label(
            "language_id"
        )

        # When no language is requested, resolve to the base doc's own language.
        wanted_language = language_id if language_id else DocBase.language_id

        query = (
            db.query(
                SelfPacedLearning.self_paced_learning_id,
                SelfPacedLearning.module_id,
                SelfPacedLearning.topic_id,
                SelfPacedLearning.doc_id,
                SelfPacedLearning.is_active,
                TopicMaster.topic_name,
                doc_title,
                doc_type,
                doc_ref_id,
                doc_language_id,
                LanguageMaster.language_name,
            )
            .join(
                TopicMaster,
                TopicMaster.topic_id == SelfPacedLearning.topic_id,
            )
            .join(
                DocBase,
                DocBase.doc_id == SelfPacedLearning.doc_id,
            )
            .outerjoin(
                DocLang,
                and_(
                    DocLang.parent_id == DocBase.parent_id,
                    DocLang.language_id == wanted_language,
                    DocLang.deleted_at.is_(None),
                ),
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id
                == func.coalesce(DocLang.language_id, DocBase.language_id),
            )
            .filter(
                SelfPacedLearning.module_id == module_id,
                SelfPacedLearning.listing_type == listing_type,
            )
            # NOTE: inactive rows are intentionally kept so the Module Config
            # list still shows a deactivated item (with its "View Content"
            # button hidden and an Activate action) instead of removing it.
        )

        return query.all()

    # =========================================================
    # Deactivate helpers (additive – used by Module Config UI)
    # =========================================================

    @staticmethod
    def deactivate_main_content(
            db: Session,
            self_paced_learning_id: int,
    ):
        record = (
            db.query(SelfPacedLearning)
            .filter(
                SelfPacedLearning.self_paced_learning_id == self_paced_learning_id,
            )
            .first()
        )

        if not record:
            return None

        record.is_active = 0
        record.updated_at = datetime.now()

        db.commit()

        return record

    @staticmethod
    def activate_main_content(
            db: Session,
            self_paced_learning_id: int,
    ):
        record = (
            db.query(SelfPacedLearning)
            .filter(
                SelfPacedLearning.self_paced_learning_id == self_paced_learning_id,
            )
            .first()
        )

        if not record:
            return None

        record.is_active = 1
        record.updated_at = datetime.now()

        db.commit()
        db.refresh(record)

        return record

    @staticmethod
    def deactivate_assessment_mapping(
            db: Session,
            assessment_id: int,
            assessment_type: str,
            assessment_ref_id: int,
    ):
        """
        Soft-remove an assessment question mapping.

        The mapping row is retained so that re-adding the same
        question can reactivate it instead of creating a duplicate.
        """

        updated = (
            db.query(AssessmentMapping)
            .filter(
                AssessmentMapping.assessment_id == assessment_id,
                AssessmentMapping.assessment_type == assessment_type,
                AssessmentMapping.assessment_ref_id == assessment_ref_id,
                AssessmentMapping.is_active == 1,
            )
            .update(
                {
                    AssessmentMapping.is_active: 0,
                    AssessmentMapping.updated_at: datetime.now(),
                },
                synchronize_session=False,
            )
        )

        db.commit()

        return updated
