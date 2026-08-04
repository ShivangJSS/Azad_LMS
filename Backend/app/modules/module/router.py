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

from app.database.database import get_db
from app.modules.module.schema import (
    ModuleUpdate,
    ModuleTranslation,
)
from app.modules.module.service import ModuleService

router = APIRouter(
    prefix="/modules",
    tags=["Module Master"],
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


