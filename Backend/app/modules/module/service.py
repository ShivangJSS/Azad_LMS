from fastapi import UploadFile
from sqlalchemy import and_, case, exists

from app.modules.document.model import LanguageMaster
from app.modules.assessment.model import AssessmentMapping, AssessmentMaster, McqMaster, PostSessionAssessment
from app.modules.module.repository import ModuleRepository
from sqlalchemy.orm import Session
from app.modules.module.repository import ModuleRepository
from app.modules.module.schema import  AssessmentResponse, MainContentCreateRequest, McqAssessmentMappingResponse, ModulePostAssessmentResponse, ModuleTranslation
class ModuleService:

    @staticmethod
    def get_modules(
        db,
        language_id: int,
        search: str | None,
        page: int,
        limit: int,
    ):

        skip = (page - 1) * limit

        records, total = ModuleRepository.get_modules(
            db=db,
            language_id=language_id,
            search=search,
            skip=skip,
            limit=limit,
        )

        return {
            "data": records,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (
                    (total + limit - 1) // limit
                    if limit
                    else 1
                ),
            },
        }

    @staticmethod
    def get_module_by_id(
        db,
        module_id: int,
    ):
        return ModuleRepository.get_module_by_id(
            db=db,
            module_id=module_id,
        )

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
     return ModuleRepository.create_module(
        db=db,
        fk_course_id=fk_course_id,
        module_name=module_name,
        module_description=module_description,
        module_type=module_type,
        module_duration=module_duration,
        publishing_status=publishing_status,
        status=status,
       
        module_overview=module_overview,
        module_objective=module_objective,
        module_icon=module_icon,
    )



    @staticmethod
    def delete_module(
        db,
        module_id: int,
    ):
        return ModuleRepository.delete_module(
            db=db,
            module_id=module_id,
        )

    @staticmethod
    def save_translation(
        db,
        module_id: int,
        request,
    ):
        return ModuleRepository.save_translation(
            db=db,
            module_id=module_id,
            language_id=request.language_id,
            module_name=request.module_name,
            module_description=request.module_description,
            module_overview=request.module_overview,
            module_objective=request.module_objective,
            status=request.status,
        )







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
     return ModuleRepository.update_module(
        db=db,
        module_id=module_id,
        fk_course_id=fk_course_id,
        module_name=module_name,
        module_description=module_description,
        module_type=module_type,
        module_duration=module_duration,
        publishing_status=publishing_status,
        status=status,
      
        module_overview=module_overview,
        module_objective=module_objective,
        module_icon=module_icon,
    )


    @staticmethod
    def get_module_by_id(
     db: Session,
     module_id: int,
):
     return ModuleRepository.get_module_by_id(
        db=db,
        module_id=module_id,
    )


    @staticmethod
    def delete_module(
     db: Session,
     module_id: int,
):
     return ModuleRepository.delete_module(
        db=db,
        module_id=module_id,
    )



    
    @staticmethod
    def save_translation(
     db: Session,
     module_id: int,
     request: ModuleTranslation,
):
     return ModuleRepository.save_translation(
        db=db,
        module_id=module_id,
        request=request,
    )



    @staticmethod
    def get_translation(
     db: Session,
     module_id: int,
     language_id: int,
):
     return ModuleRepository.get_translation(
        db=db,
        module_id=module_id,
        language_id=language_id,
    )

    @staticmethod
    def export_modules(
     db: Session,
     language_id: int,
):
     return ModuleRepository.export_modules(
        db=db,
        language_id=language_id,
    )


    @staticmethod
    def get_post_assessments(
        db: Session,
        module_id: int
    ) -> ModulePostAssessmentResponse:

        assessments = (

            ModuleRepository.get_post_assessments_by_module(
                db=db,
                module_id=module_id
            )
        )

        return ModulePostAssessmentResponse(
            module_id=module_id,
            assessments=[
                AssessmentResponse(
                    assessment_id=row.assessment_id,
                    assessment_name=row.assessment_name
                )
                for row in assessments
            ]
        )

    @staticmethod
    def get_scq_assessment_mapping(
     db: Session,
     assessment_id: int
):
     rows = ModuleRepository.get_scq_assessment_mapping(
        db=db,
        assessment_id=assessment_id
    )

     return [
        {
            "scq_id": row.scq_id,
            "scq_question_title": row.scq_question_title,
            "scq_question_description": row.scq_question_description,
            "image_url": row.image_url,
            "status": row.status,
            "marks": row.marks,
            "language_id": row.language_id,
            "language_name": row.language_name,
            "is_checked": row.is_checked,
        }
        for row in rows
    ]


    @staticmethod
    def get_mcq_assessment_mapping(
     db: Session,
     assessment_id: int
):
     rows = ModuleRepository.get_mcq_assessment_mapping(
        db=db,
        assessment_id=assessment_id
    )

     return [
        McqAssessmentMappingResponse(
            mcq_id=row.mcq_id,
            mcq_question_title=row.mcq_question_title,
            mcq_question_description=row.mcq_question_description,
            image_url=row.image_url,
            status=row.status,
            marks=row.marks,
            language_id=row.language_id,
            language_name=row.language_name,
            is_checked=row.is_checked,
        )
        for row in rows
    ]


    @staticmethod
    def get_match_making_assessment_mapping(
     db: Session,
     assessment_id: int
):
     records = (
        ModuleRepository
        .get_match_making_assessment_mapping(
            db=db,
            assessment_id=assessment_id
        )
    )

     return [
        {
            "match_making_id": row.match_making_id,
            "match_making_question_title":
                row.match_making_question_title,
            "match_making_question_description":
                row.match_making_question_description,
            "image_url": row.image_url,
            "status": row.status,
            "marks": float(row.marks)
            if row.marks is not None else None,
            "language_id": row.language_id,
            "language_name": row.language_name,
            "is_checked": row.is_checked
        }
        for row in records
    ]

    @staticmethod
    def get_drop_bucket_assessment_mapping(
     db: Session,
     assessment_id: int
):
     records = (
        ModuleRepository
        .get_drop_bucket_assessment_mapping(
            db=db,
            assessment_id=assessment_id
        )
    )

     return [
        {
            "drop_bucket_id": row.drop_bucket_id,
            "drop_bucket_question_title":
                row.drop_bucket_question_title,
            "drop_bucket_question_description":
                row.drop_bucket_question_description,
            "image_url": row.image_url,
            "status": row.status,
            "marks": float(row.marks)
            if row.marks is not None else None,
            "language_id": row.language_id,
            "language_name": row.language_name,
            "is_checked": row.is_checked
        }
        for row in records
    ]

    @staticmethod
    def save_assessment_mapping(
     db,
     request
):
     count = (
        ModuleRepository
        .save_assessment_mapping(
            db=db,
            assessment_type=request.assessment_type,
            assessments=request.assessments
        )
    )

     return {
        "success": True,
        "message": "Assessment mapping saved successfully",
        "count": count
    }


    @staticmethod
    def get_topics_for_main_content(
        db: Session,
        module_id: int,
    ):
        return (
            ModuleRepository
            .get_topics_for_main_content(
                db=db,
                module_id=module_id,
            )
        )

    @staticmethod
    def get_documents_for_main_content(
        db: Session,
    ):
        return (
            ModuleRepository
            .get_documents_for_main_content(
                db=db,
            )
        )

    @staticmethod
    def create_main_content(
        db: Session,
        payload: MainContentCreateRequest,
    ):

        exists = (
            ModuleRepository
            .check_main_content_exists(
                db=db,
                module_id=payload.module_id,
                topic_id=payload.topic_id,
                doc_id=payload.doc_id,
            )
        )

        if exists:
            return {
                "success": False,
                "message": "Record already exists!"
            }

        try:

            ModuleRepository.create_main_content(
                db=db,
                module_id=payload.module_id,
                topic_id=payload.topic_id,
                doc_id=payload.doc_id,
            )

            ModuleRepository.create_topic_mapping(
                db=db,
                module_id=payload.module_id,
                topic_id=payload.topic_id,
                doc_id=payload.doc_id,
            )

            ModuleRepository.update_module_main_content_flag(
                db=db,
                module_id=payload.module_id,
            )

            ModuleRepository.update_document_main_content_flag(
                db=db,
                doc_id=payload.doc_id,
            )

            db.commit()

            return {
                "success": True,
                "message": "Main content assigned successfully"
            }

        except Exception:
            db.rollback()
            raise

    @staticmethod
    def get_main_content_list(
        db: Session,
        module_id: int,
    ):
        return (
            ModuleRepository
            .get_main_content_list(
                db=db,
                module_id=module_id,
            )
        )