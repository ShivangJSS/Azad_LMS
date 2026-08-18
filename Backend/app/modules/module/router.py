from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Form,
    File,
    UploadFile,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.modules.module.service import ModuleService
from app.database.database import get_db
from app.modules.module.schema import (
    AssessmentMappingCreateRequest,
    AssessmentMappingDeactivateRequest,
    DocumentDropdownResponse,
    DropBucketAssessmentMappingResponse,
    MainContentCreateRequest,
    MainContentListResponse,
    MainContentResponse,
    MatchMakingAssessmentMappingResponse,
    ModulePostAssessmentResponse,
    ModuleUpdate,
    ModuleTranslation,
    TopicDropdownResponse,
)
from app.modules.module.service import ModuleService

from app.shared.dependencies.module_access import Module, require_module_access

router = APIRouter(
    prefix="/modules",
    tags=["Module Master"],
    dependencies=[Depends(require_module_access(Module.MODULE_MANAGEMENT))],
)


# ==========================
# Get Modules
# ==========================
@router.get("")
def get_modules(
    language_id: int = Query(...),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
):
    return ModuleService.get_modules(
        db=db,
        language_id=language_id,
        search=search,
        page=page,
        limit=limit,
    )


@router.get("/export")
def export_modules(
    language_id: int = Query(...),
    db: Session = Depends(get_db),
):

    file = ModuleService.export_modules(
        db=db,
        language_id=language_id,
    )

    return StreamingResponse(
        file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=Modules.xlsx"
        },
    )



# ==========================
# Create Module
# ==========================
@router.post("")
async def create_module(
    fk_course_id: int = Form(...),
    module_name: str = Form(...),
    module_description: str = Form(...),
    module_type: int = Form(...),
    module_duration: str = Form(...),
    publishing_status: str = Form(...),
    status: int = Form(...),
   
    module_overview: str = Form(...),
    module_objective: str = Form(...),
    module_icon: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return ModuleService.create_module(
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



# ==========================
# Get Module By Id
# ==========================
@router.get("/{module_id}")
def get_module_by_id(
    module_id: int,
    db: Session = Depends(get_db),
):
    return ModuleService.get_module_by_id(
        db=db,
        module_id=module_id,
    )


# ==========================
# Update Module
# ==========================


@router.put("/{module_id}")
async def update_module(
    module_id: int,

    fk_course_id: int = Form(...),
    module_name: str = Form(...),
    module_description: str = Form(...),
    module_type: int = Form(...),
    module_duration: str = Form(...),
    publishing_status: str = Form(...),
    status: int = Form(...),
    
    module_overview: str = Form(...),
    module_objective: str = Form(...),

    module_icon: UploadFile | None = File(None),

    db: Session = Depends(get_db),
):

    return ModuleService.update_module(
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




# ==========================
# Delete Module
# ==========================
@router.delete("/{module_id}")
def delete_module(
    module_id: int,
    db: Session = Depends(get_db),
):
    return ModuleService.delete_module(
        db=db,
        module_id=module_id,
    )






# ==========================
# Save Translation
# ==========================
@router.post("/{module_id}/translation")
def save_translation(
    module_id: int,
    request: ModuleTranslation,
    db: Session = Depends(get_db),
):
    return ModuleService.save_translation(
        db=db,
        module_id=module_id,
        request=request,
    )





@router.get("/{module_id}/translation")
def get_translation(
    module_id: int,
    language_id: int = Query(...),
    db: Session = Depends(get_db),
):
    return ModuleService.get_translation(
        db=db,
        module_id=module_id,
        language_id=language_id,
    )


@router.get(
    "/modules/{module_id}/post-assessments",
    response_model=ModulePostAssessmentResponse
)
def get_post_assessments(
    module_id: int,
    db: Session = Depends(get_db)
):
    return ModuleService.get_post_assessments(
        db=db,
        module_id=module_id
    )


@router.get(
    "/modules/{module_id}/pre-assessments",
    response_model=ModulePostAssessmentResponse
)
def get_pre_assessments(
    module_id: int,
    db: Session = Depends(get_db)
):
    return ModuleService.get_pre_assessments(
        db=db,
        module_id=module_id
    )


@router.get(
    "/assessments/{assessment_id}/scqs"
)
def get_scq_assessment_mapping(
    assessment_id: int,
    language_id: int | None = Query(None),
    db: Session = Depends(get_db)
):
    return ModuleService.get_scq_assessment_mapping(
        db=db,
        assessment_id=assessment_id,
        language_id=language_id
    )



@router.get(
    "/assessments/{assessment_id}/mcqs"
)
def get_mcq_assessment_mapping(
    assessment_id: int,
    language_id: int | None = Query(None),
    db: Session = Depends(get_db)
):
    return ModuleService.get_mcq_assessment_mapping(
        db=db,
        assessment_id=assessment_id,
        language_id=language_id
    )

@router.get(
    "/assessments/{assessment_id}/match-makings",
    response_model=list[MatchMakingAssessmentMappingResponse]
)
def get_match_making_assessment_mapping(
    assessment_id: int,
    language_id: int | None = Query(None),
    db: Session = Depends(get_db)
):
    return ModuleService.get_match_making_assessment_mapping(
        db=db,
        assessment_id=assessment_id,
        language_id=language_id
    )



@router.get(
    "/assessments/{assessment_id}/drop-buckets",
    response_model=list[
        DropBucketAssessmentMappingResponse
    ]
)
def get_drop_bucket_assessment_mapping(
    assessment_id: int,
    language_id: int | None = Query(None),
    db: Session = Depends(get_db)
):
    return (
        ModuleService
        .get_drop_bucket_assessment_mapping(
            db=db,
            assessment_id=assessment_id,
            language_id=language_id
        )
    )


@router.post(
    "/assessment-mapping"
)
def save_assessment_mapping(
    request: AssessmentMappingCreateRequest,
    db: Session = Depends(get_db)
):
    return ModuleService.save_assessment_mapping(
        db=db,
        request=request
    )



@router.get(
    "/main-content/topics/{module_id}",
    response_model=list[TopicDropdownResponse]
)
def get_topics_for_main_content(
    module_id: int,
    db: Session = Depends(get_db)
):
    return ModuleService.get_topics_for_main_content(
        db=db,
        module_id=module_id
    )


@router.get(
    "/main-content/documents",
    response_model=list[DocumentDropdownResponse]
)
def get_documents_for_main_content(
    db: Session = Depends(get_db)
):
    return ModuleService.get_documents_for_main_content(
        db=db
    )


@router.post(
    "/main-content",
    response_model=MainContentResponse
)
def create_main_content(
    payload: MainContentCreateRequest,
    db: Session = Depends(get_db)
):
    return ModuleService.create_main_content(
        db=db,
        payload=payload
    )


@router.get(
    "/main-content/{module_id}",
    response_model=list[MainContentListResponse]
)
def get_main_content_list(
    module_id: int,
    language_id: int | None = Query(None),
    db: Session = Depends(get_db)
):
    return ModuleService.get_main_content_list(
        db=db,
        module_id=module_id,
        language_id=language_id
    )

# ==========================
# Self-Paced Learning (Optional)
# Mirrors Main Content but stored with listing_type="self" (the column is
# varchar(4), so a short code is used).
# Reuses the same topic/document dropdowns and the activate/deactivate
# endpoints below (which operate by self_paced_learning_id).
# ==========================
@router.post(
    "/self-paced",
    response_model=MainContentResponse,
)
def create_self_paced_content(
    payload: MainContentCreateRequest,
    db: Session = Depends(get_db),
):
    return ModuleService.create_main_content(
        db=db,
        payload=payload,
        listing_type="self",
    )


@router.get(
    "/self-paced/{module_id}",
    response_model=list[MainContentListResponse],
)
def get_self_paced_list(
    module_id: int,
    language_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    return ModuleService.get_main_content_list(
        db=db,
        module_id=module_id,
        language_id=language_id,
        listing_type="self",
    )


# ==========================
# Deactivate Main Content
# (additive – Module Configuration UI)
# ==========================
@router.patch(
    "/main-content/{self_paced_learning_id}/deactivate"
)
def deactivate_main_content(
    self_paced_learning_id: int,
    db: Session = Depends(get_db),
):
    return ModuleService.deactivate_main_content(
        db=db,
        self_paced_learning_id=self_paced_learning_id,
    )


# ==========================
# Activate Main Content
# (additive – Module Configuration UI toggle)
# ==========================
@router.patch(
    "/main-content/{self_paced_learning_id}/activate"
)
def activate_main_content(
    self_paced_learning_id: int,
    db: Session = Depends(get_db),
):
    return ModuleService.activate_main_content(
        db=db,
        self_paced_learning_id=self_paced_learning_id,
    )


# ==========================
# Deactivate Assessment Mapping
# (additive – Module Configuration UI)
# ==========================
@router.patch(
    "/assessment-mapping/deactivate"
)
def deactivate_assessment_mapping(
    request: AssessmentMappingDeactivateRequest,
    db: Session = Depends(get_db),
):
    return ModuleService.deactivate_assessment_mapping(
        db=db,
        request=request,
    )
