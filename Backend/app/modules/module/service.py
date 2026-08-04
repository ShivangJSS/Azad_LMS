from fastapi import UploadFile

from app.modules.module.repository import ModuleRepository
from sqlalchemy.orm import Session
     
from app.modules.module.schema import  ModuleTranslation
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