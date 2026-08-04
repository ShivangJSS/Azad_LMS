from fastapi import HTTPException

from app.modules.course.repository import CourseRepository
from app.modules.course.schema import CourseUpdateRequest


class CourseService:

    @staticmethod
    def get_courses(
        db,
        page,
        page_size,
        search,
        language_id,
    ):
        total, records = CourseRepository.get_courses(
            db=db,
            page=page,
            page_size=page_size,
            search=search,
            language_id=language_id,
        )

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": records,
        }

    @staticmethod
    def get_course_translation(
        db,
        course_id,
        language_id,
    ):
        course = CourseRepository.get_course_translation(
            db=db,
            course_id=course_id,
            language_id=language_id,
        )

        if not course:
            raise HTTPException(
                status_code=404,
                detail="Course not found",
            )

        return course

    @staticmethod
    def edit_course(
        db,
        course_id,
        language_id,
    ):
        course = CourseRepository.edit_course(
            db=db,
            course_id=course_id,
            language_id=language_id,
        )

        if not course:
            raise HTTPException(
                status_code=404,
                detail="Course not found",
            )

        return course

    @staticmethod
    def update_course(
        db,
        course_id,
        language_id,
        course_name,
        course_description,
        status,
        course_image,
    ):
        return CourseRepository.update_course(
            db=db,
            course_id=course_id,
            language_id=language_id,
            request=CourseUpdateRequest(
                course_name=course_name,
                course_description=course_description,
                status=status,
            ),
            course_image=course_image,
        )

    @staticmethod
    def export_courses(
        db,
        search: str = None,
        language_id: int = None,
    ):
        return CourseRepository.export_courses(
            db=db,
            language_id=language_id,
        )
