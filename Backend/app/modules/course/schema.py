from pydantic import BaseModel, ConfigDict, Field


class CourseListResponse(BaseModel):
    course_id: int
    course_name: str
    module_count: int
    users_enrolled: int
    language_id: int
    language_name: str
    status: int




class CourseUpdateRequest(BaseModel):
    course_name: str = Field(..., min_length=1)
    course_description: str
    status: int

    model_config = ConfigDict(from_attributes=True)
