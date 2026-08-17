from io import BytesIO

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from openpyxl import Workbook
from app.modules.course.schema import  CourseUpdateRequest
from app.database.database import get_db
from app.modules.course.service import CourseService

router = APIRouter(
    prefix="/courses",
    tags=["Courses"],
)


@router.get("")
def get_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    language_id: int | None = None,
    db: Session = Depends(get_db),
):

    data = CourseService.get_courses(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        language_id=language_id,
    )

    return {
        "success": True,
        "message": "Courses fetched successfully",
        "data": data,
    }


@router.get("/{course_id}/translation")
def get_course_translation(
    course_id: int,
    language_id: int,
    db: Session = Depends(get_db),
):
    data = CourseService.get_course_translation(
        db=db,
        course_id=course_id,
        language_id=language_id,
    )

    return {
        "success": True,
        "message": "Course translation fetched successfully",
        "data": data,
    }

@router.get("/{course_id}/edit")
def edit_course(
    course_id: int,
    language_id: int,
    db: Session = Depends(get_db),
):
    data = CourseService.edit_course(
        db=db,
        course_id=course_id,
        language_id=language_id,
    )

    return {
        "success": True,
        "message": "Course fetched successfully",
        "data": data,
    }




@router.put("/{course_id}")
def update_course(
    course_id: int,
    language_id: int,
    course_name: str = Form(...),
    course_description: str = Form(...),
    status: int = Form(...),
    course_image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    return CourseService.update_course(
        db=db,
        course_id=course_id,
        language_id=language_id,
        course_name=course_name,
        course_description=course_description,
        status=status,
        course_image=course_image,
    )



@router.get("/export")
def export_courses(
    search: str | None = Query(None),
    language_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    records = CourseService.export_courses(
        db=db,
        search=search,
        language_id=language_id,
    )




    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "Courses"

    # Header
    worksheet.append(
    [
        "Course Name",
        "Language",
        "Module",
        "Users",
        "Status",
    ]
)
    # Data
    for record in records:
     worksheet.append(
        [
            record["course_name"],
            record["language_name"],
            record["module_name"],
            record["users"],
            record["status"],
        ]
    )

    output = BytesIO()
    workbook.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=courses.xlsx"
        },
    )