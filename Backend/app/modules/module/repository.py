from datetime import datetime
from io import BytesIO
import os
from openpyxl.styles import Font
import uuid

from fastapi import UploadFile
from fastapi import HTTPException
from openpyxl import Workbook
from sqlalchemy import BigInteger, cast, func, distinct
from sqlalchemy.orm import Session
from app.modules.module.schema import  ModuleTranslation
from app.modules.module.model import (
    ModuleMaster,
    ModuleType,
    TopicMapping,
)
from app.modules.document.model import (
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
                LanguageMaster.language_name,
                func.count(
                    distinct(TopicMapping.topic_mapping_id)
                ).label("topic_count"),
            )

            # Module Type
            .outerjoin(
                ModuleType,
    (
                  ModuleType.module_type_id
                  == cast(ModuleMaster.module_type, BigInteger)
    )
                & (ModuleType.status == 1),
)

            # Language
            .outerjoin(
                LanguageMaster,
                (
                    LanguageMaster.language_id
                    == ModuleMaster.language_id
                )
                & (LanguageMaster.is_active == 1),
            )

            # Topic Mapping
            .outerjoin(
                TopicMapping,
                TopicMapping.module_id
                == ModuleMaster.module_id,
            )

            # Active Topics Only
            .outerjoin(
                TopicMaster,
                (
                    TopicMaster.topic_id
                    == TopicMapping.topic_id
                )
                & (TopicMaster.is_active == "1"),
            )

            .filter(
                ModuleMaster.language_id == language_id,
                ModuleMaster.status == 1,
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

        if search:
            query = query.filter(
                ModuleMaster.module_name.ilike(f"%{search}%")
            )

        total = query.count()

        rows = (
            query.order_by(
                ModuleMaster.module_id.desc()
            )
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
                    "module_name": row.module_name,
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
):
 
     upload_dir = "uploads/module_icons"
     os.makedirs(upload_dir, exist_ok=True)

     extension = os.path.splitext(module_icon.filename)[1]
     filename = f"{uuid.uuid4()}{extension}"
 
     filepath = os.path.join(upload_dir, filename)

     with open(filepath, "wb") as buffer:
        buffer.write(module_icon.file.read())

     module = ModuleMaster(
        fk_course_id=fk_course_id,
        module_name=module_name,
        module_description=module_description,
        module_type=module_type,
        module_duration=module_duration,
        publishing_status=publishing_status,
        status=status,
        language_id=1,      
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

        extension = os.path.splitext(module_icon.filename)[1]
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
        raise HTTPException(
            status_code=404,
            detail="Module not found"
        )

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
        raise HTTPException(
            status_code=404,
            detail="Module not found"
        )

     module.deleted_at = datetime.utcnow()

     db.commit()

     return {
        "message": "Module deleted successfully"
    }



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

     if existing:
        raise HTTPException(
            status_code=400,
            detail="Translation already exists",
        )

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
        lock_status=parent_module.lock_status,
    )

     db.add(translation)
     db.commit()
     db.refresh(translation)






     return {
        "message": "Translation saved successfully",
        "module_id": translation.module_id
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
            "module_icon": translation.module_icon,
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
):
     rows = (
        db.query(
            ModuleMaster.module_name,
            ModuleType.module_type,
            LanguageMaster.language_name,
            ModuleMaster.publishing_status,
            ModuleMaster.status,
        )
        .outerjoin(
            ModuleType,
            cast(ModuleMaster.module_type, BigInteger)
            == ModuleType.module_type_id,
        )
        .outerjoin(
            LanguageMaster,
            ModuleMaster.language_id
            == LanguageMaster.language_id,
        )
        .filter(
            ModuleMaster.language_id == language_id,
            ModuleMaster.deleted_at.is_(None),
        )
        .order_by(ModuleMaster.module_id.desc())
        .all()
    )

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
            "Active"
            if row.status == 1
            else "Inactive"
        )

     stream = BytesIO()
     wb.save(stream)
     stream.seek(0)

     return stream