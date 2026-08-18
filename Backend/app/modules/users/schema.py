from datetime import datetime
from typing import List, Optional
from typing import Optional
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ===========================
# Common Responses
# ===========================

class CreatableRoleResponse(BaseModel):
    id: int
    name: str


# ===========================
# Create User
# ===========================

class UserCreateRequest(BaseModel):
    name: str = Field(..., max_length=255)
    username: Optional[str] = Field(default=None, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)

    role: int
    responsibility: Optional[str] = None

    state_lgd_code: Optional[int] = None
    district_lgd_code: Optional[int] = None
    block_lgd_code: Optional[int] = None
    centre_id: Optional[int] = None

    status: str = "1"


# ===========================
# Update User
# ===========================

class UserUpdateRequest(BaseModel):
    name: str = Field(..., max_length=255)
    username: Optional[str] = None
    email: EmailStr

    role: int
    responsibility: Optional[str] = None

    state_lgd_code: Optional[int] = None
    district_lgd_code: Optional[int] = None
    block_lgd_code: Optional[int] = None
    centre_id: Optional[int] = None

    status: str


# ===========================
# User List Response
# ===========================

class UserResponse(BaseModel):
    id: int
    name: str
    username: Optional[str] = None
    email: EmailStr

    role: str
    responsibility: Optional[str] = None

    state_lgd_code: Optional[int] = None
    district_lgd_code: Optional[int] = None
    block_lgd_code: Optional[int] = None
    centre_id: Optional[int] = None

    status: str

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ===========================
# User Detail Response
# ===========================

class UserDetailResponse(BaseModel):
    id: int
    name: str
    username: Optional[str] = None
    email: EmailStr

    role: str
    responsibility: Optional[str] = None

    state_lgd_code: Optional[int] = None
    state_name: Optional[str] = None

    district_lgd_code: Optional[int] = None
    district_name: Optional[str] = None

    block_lgd_code: Optional[int] = None
    block_name: Optional[str] = None

    centre_id: Optional[int] = None
    centre_name: Optional[str] = None

    status: str

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ===========================
# State Response
# ===========================

class StateResponse(BaseModel):
    state_lgd_code: int
    state_name: str


# ===========================
# District Response
# ===========================

class DistrictResponse(BaseModel):
    district_lgd_code: int
    district_name: str


# ===========================
# Block Response
# ===========================

class BlockResponse(BaseModel):
    block_lgd_code: int
    block_name: str


# ===========================
# Centre Response
# ===========================

class CentreResponse(BaseModel):
    centre_id: int
    centre_name: str

class UserListItemResponse(BaseModel):
    id: int
    name: str
    email: str

    role: str
    role_name: str

    responsibility: Optional[str] = None

    status: str

    model_config = ConfigDict(from_attributes=True)


class UserDetailResponse(BaseModel):
    id: int

    name: str
    username: Optional[str] = None

    email: str

    role: str
    role_name: str

    responsibility: Optional[str] = None

    state_name: Optional[str] = None
    district_name: Optional[str] = None
    block_name: Optional[str] = None
    centre_name: Optional[str] = None

    status: str

    model_config = ConfigDict(from_attributes=True)   

class MessageResponse(BaseModel):
    message: str     


class UserUpdateRequest(BaseModel):
    name: str = Field(..., max_length=255)
    email: str
    role: int
    password: Optional[str] = None



class BatchResponse(BaseModel):
    batch_id: int
    batch_name: str
    fy_year: str
    centre_name: str    

class EnrollmentResponse(BaseModel):
    participant_id: int
    enrollment_no: str
    participant_name: str    

class ParticipantCreateRequest(BaseModel):
    state_id: int
    district_id: int
    block_id: Optional[int] = None
    centre_id: int
    batch_id: int
    
    participant_name: str
    enrollment_no: str
    username: str
    password: str

    gender: str
    age: int

    email: str | None = None
    mobile_no: str | None = None
    pin: str
    aadhaar_number: str | None = None

    location: str
    address: str    

class CentreResponse(BaseModel):
    centre_id: int
    centre_name: str

class CentreResponse(BaseModel):
    centre_id: int
    centre_name: str



class ParticipantListResponse(BaseModel):
    participant_id: int

    participant_name: str
    enrollment_no: str

    state_name: str | None = None
    district_name: str | None = None
    centre_name: str | None = None
    batch_name: str | None = None

    status: str
    course_progress: float = 0
    performance_status: str | None = None


# ===============================
# Participant Profile
# ===============================

class ParticipantProfileResponse(BaseModel):
    participant_id: int
    participant_name: str
    enrollment_no: str

    mobile_no: Optional[str] = None
    email: Optional[str] = None

    state_name: Optional[str] = None
    district_name: Optional[str] = None
    centre_name: Optional[str] = None
    location: Optional[str] = None

    image: Optional[str] = None

    class Config:
        from_attributes = True



# ===============================
# Module Wise Report
# ===============================

class ModuleReportResponse(BaseModel):
    module_id: int
    module_name: str

    total_questions: int = 0
    completed: int = 0
    correct: int = 0
    wrong: int = 0

    score: float = 0
    total_score: float = 0

    percentage: float = 0
    progress: float = 0



class AttemptResponse(BaseModel):
    attempt_id: int
    total_questions: int
    total_correct: int
    total_wrong: int
    total_marks: float
    total_score: float
    course_progress: float

    mcq_list: list = []
    scq_list: list = []
    bucket_list: list = []
    match_making_list: list = []


class ModuleAssessmentResponse(BaseModel):
    module_id: int
    module_name: str

    has_data: bool

    attempt_id: int | None = None
    attempted_module_id: int | None = None

    total_questions: int
    completed_questions: int
    correct: int
    wrong: int

    score: float
    total_marks: float

    percentage: float

    mcq_list: list = []
    scq_list: list = []
    bucket_list: list = []
    match_making_list: list = []


class AttemptWiseResultResponse(BaseModel):
    attempt_wise_result: List[AttemptResponse]

    overall_total_questions: int
    overall_total_correct: int
    overall_total_wrong: int
    overall_total_marks: float
    overall_total_score: float
    overall_course_progress: float

class AssessmentSummaryResponse(BaseModel):
    module_results: List[ModuleAssessmentResponse]

    total_questions: int
    completed_questions: int
    correct: int
    wrong: int
    score: float
    total_marks: float
    percentage: float
    progress: float

# ===============================
# Final Report Response
# ===============================

class ParticipantReportResponse(BaseModel):
    participant: ParticipantProfileResponse
    attempt_wise_result: AttemptWiseResultResponse
    assessment_summary: AssessmentSummaryResponse


# ===============================
# Manage Modules
# ===============================

class ParticipantModuleActionRequest(BaseModel):
    participant_id: int
    module_id: int
    action: Optional[Literal["assign", "unassign"]] = None


class ParticipantModuleResponse(BaseModel):
    module_id: int
    parent_id: int
    module_name: str
    module_type: Optional[str] = None
    language_id: int
    assigned: bool

    model_config = ConfigDict(from_attributes=True)
