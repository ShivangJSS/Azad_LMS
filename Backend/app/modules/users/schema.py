# from datetime import datetime
# from typing import List, Optional
# from typing import Optional
# from typing import Literal
# from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

# # ===========================
# # Common Responses
# # ===========================


# class CreatableRoleResponse(BaseModel):
#     id: int
#     name: str


# # ===========================
# # Create User
# # ===========================


# class UserCreateRequest(BaseModel):
#     name: str = Field(..., max_length=255)
#     username: Optional[str] = Field(default=None, max_length=255)
#     email: EmailStr
#     password: str = Field(..., min_length=8)

#     role: int
#     responsibility: Optional[str] = None

#     state_lgd_code: Optional[int] = None
#     district_lgd_code: Optional[int] = None
#     block_lgd_code: Optional[int] = None
#     centre_id: Optional[int] = None

#     status: str = "1"

#     @field_validator("name", "username", "responsibility")
#     @classmethod
#     def validate_text_whitespace(cls, value):
#         if value is not None and value != value.strip():
#             raise ValueError(
#                 "Leading or trailing white space is not allowed."
#             )
#         return value


# # ===========================
# # Update User
# # ===========================


# class UserUpdateRequest(BaseModel):
#     name: str = Field(..., max_length=255)
#     username: Optional[str] = None
#     email: EmailStr

#     role: int
#     responsibility: Optional[str] = None

#     state_lgd_code: Optional[int] = None
#     district_lgd_code: Optional[int] = None
#     block_lgd_code: Optional[int] = None
#     centre_id: Optional[int] = None

#     status: str

#     @field_validator("name", "username", "responsibility")
#     @classmethod
#     def validate_text_whitespace(cls, value):
#         if value is not None and value != value.strip():
#             raise ValueError(
#                 "Leading or trailing white space is not allowed."
#             )
#         return value


# # ===========================
# # User List Response
# # ===========================


# class UserResponse(BaseModel):
#     id: int
#     name: str
#     username: Optional[str] = None
#     email: EmailStr

#     role: str
#     responsibility: Optional[str] = None

#     state_lgd_code: Optional[int] = None
#     district_lgd_code: Optional[int] = None
#     block_lgd_code: Optional[int] = None
#     centre_id: Optional[int] = None

#     status: str

#     created_at: Optional[datetime] = None
#     updated_at: Optional[datetime] = None

#     model_config = ConfigDict(from_attributes=True)


# # ===========================
# # User Detail Response
# # ===========================


# class UserDetailResponse(BaseModel):
#     id: int
#     name: str
#     username: Optional[str] = None
#     email: EmailStr

#     role: str
#     responsibility: Optional[str] = None

#     state_lgd_code: Optional[int] = None
#     state_name: Optional[str] = None

#     district_lgd_code: Optional[int] = None
#     district_name: Optional[str] = None

#     block_lgd_code: Optional[int] = None
#     block_name: Optional[str] = None

#     centre_id: Optional[int] = None
#     centre_name: Optional[str] = None

#     status: str

#     created_at: Optional[datetime] = None
#     updated_at: Optional[datetime] = None

#     model_config = ConfigDict(from_attributes=True)


# # ===========================
# # State Response
# # ===========================


# class StateResponse(BaseModel):
#     state_lgd_code: int
#     state_name: str


# # ===========================
# # District Response
# # ===========================


# class DistrictResponse(BaseModel):
#     district_lgd_code: int
#     district_name: str


# # ===========================
# # Block Response
# # ===========================


# class BlockResponse(BaseModel):
#     block_lgd_code: int
#     block_name: str


# # ===========================
# # Centre Response
# # ===========================


# class CentreResponse(BaseModel):
#     centre_id: int
#     centre_name: str


# class UserListItemResponse(BaseModel):
#     id: int
#     name: str
#     email: str

#     role: str
#     role_name: str

#     responsibility: Optional[str] = None

#     status: str

#     model_config = ConfigDict(from_attributes=True)


# class UserDetailResponse(BaseModel):
#     id: int

#     name: str
#     username: Optional[str] = None

#     email: str

#     role: str
#     role_name: str

#     responsibility: Optional[str] = None

#     state_name: Optional[str] = None
#     district_name: Optional[str] = None
#     block_name: Optional[str] = None
#     centre_name: Optional[str] = None

#     status: str

#     model_config = ConfigDict(from_attributes=True)


# class MessageResponse(BaseModel):
#     message: str

# class BatchResponse(BaseModel):
#     batch_id: int
#     batch_name: str
#     fy_year: str
#     centre_name: str


# class EnrollmentResponse(BaseModel):
#     participant_id: int
#     enrollment_no: str
#     participant_name: str


# class ParticipantCreateRequest(BaseModel):
#     state_id: int
#     district_id: int
#     block_id: Optional[int] = None
#     centre_id: int
#     batch_id: int

#     participant_name: str
#     enrollment_no: str
#     username: str
#     password: str

#     gender: str
#     age: int

#     email: str | None = None
#     mobile_no: str | None = None
#     pin: str
#     aadhaar_number: str | None = None

#     location: str
#     address: str | None = None
    
#     @field_validator(
#         "participant_name",
#         "username",
#         "gender",
#         "email",
#         "location",
#         "address",
#     )
#     @classmethod
#     def validate_text_whitespace(cls, value):
#         if value is not None and value != value.strip():
#             raise ValueError(
#                 "Leading or trailing white space is not allowed."
#             )
#         return value


# class CentreResponse(BaseModel):
#     centre_id: int
#     centre_name: str


# class CentreResponse(BaseModel):
#     centre_id: int
#     centre_name: str


# class ParticipantListResponse(BaseModel):
#     participant_id: int

#     participant_name: str
#     enrollment_no: str

#     state_name: str | None = None
#     district_name: str | None = None
#     centre_name: str | None = None
#     batch_name: str | None = None

#     status: str
#     course_progress: float = 0
#     performance_status: str | None = None


# # ===============================
# # Participant Profile
# # ===============================


# class ParticipantProfileResponse(BaseModel):
#     participant_id: int
#     participant_name: str
#     enrollment_no: str

#     mobile_no: Optional[str] = None
#     email: Optional[str] = None

#     state_name: Optional[str] = None
#     district_name: Optional[str] = None
#     centre_name: Optional[str] = None
#     location: Optional[str] = None

#     image: Optional[str] = None

#     class Config:
#         from_attributes = True


# # ===============================
# # Module Wise Report
# # ===============================


# class ModuleReportResponse(BaseModel):
#     module_id: int
#     module_name: str

#     total_questions: int = 0
#     completed: int = 0
#     correct: int = 0
#     wrong: int = 0

#     score: float = 0
#     total_score: float = 0

#     percentage: float = 0
#     progress: float = 0


# class AttemptResponse(BaseModel):
#     attempt_id: int
#     total_questions: int
#     total_correct: int
#     total_wrong: int
#     total_marks: float
#     total_score: float
#     course_progress: float

#     mcq_list: list = []
#     scq_list: list = []
#     bucket_list: list = []
#     match_making_list: list = []


# class ModuleAssessmentResponse(BaseModel):
#     module_id: int
#     module_name: str

#     has_data: bool

#     attempt_id: int | None = None
#     attempted_module_id: int | None = None

#     total_questions: int
#     completed_questions: int
#     correct: int
#     wrong: int

#     score: float
#     total_marks: float

#     percentage: float

#     mcq_list: list = []
#     scq_list: list = []
#     bucket_list: list = []
#     match_making_list: list = []


# class AttemptWiseResultResponse(BaseModel):
#     attempt_wise_result: List[AttemptResponse]

#     overall_total_questions: int
#     overall_total_correct: int
#     overall_total_wrong: int
#     overall_total_marks: float
#     overall_total_score: float
#     overall_course_progress: float


# class AssessmentSummaryResponse(BaseModel):
#     module_results: List[ModuleAssessmentResponse]

#     total_questions: int
#     completed_questions: int
#     correct: int
#     wrong: int
#     score: float
#     total_marks: float
#     percentage: float
#     progress: float


# # ===============================
# # Final Report Response
# # ===============================


# class ParticipantReportResponse(BaseModel):
#     participant: ParticipantProfileResponse
#     attempt_wise_result: AttemptWiseResultResponse
#     assessment_summary: AssessmentSummaryResponse


# # ===============================
# # Manage Modules
# # ===============================


# class ParticipantModuleActionRequest(BaseModel):
#     participant_id: int
#     module_id: int
#     action: Optional[Literal["assign", "unassign"]] = None


# class ParticipantModuleResponse(BaseModel):
#     module_id: int
#     parent_id: int
#     module_name: str
#     module_type: Optional[str] = None
#     language_id: int
#     assigned: bool

#     model_config = ConfigDict(from_attributes=True)





from datetime import datetime
from typing import List, Optional, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)


# =========================================================
# Common Responses
# =========================================================


class CreatableRoleResponse(BaseModel):
    id: int
    name: str


# =========================================================
# Create User
# =========================================================


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

    @field_validator("name", "username", "responsibility")
    @classmethod
    def validate_text_whitespace(cls, value):
        if value is not None:
            value = str(value)

            if value != value.strip():
                raise ValueError(
                    "Leading or trailing white space is not allowed."
                )

            if not value:
                raise ValueError("This field cannot be empty.")

        return value

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):
        if value is None:
            return value

        value = str(value).strip().lower()

        if not value:
            raise ValueError("Email is required.")

        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if value != value.strip():
            raise ValueError(
                "Leading or trailing white space is not allowed."
            )

        if len(value) < 8:
            raise ValueError(
                "Password must be at least 8 characters long."
            )

        return value


# =========================================================
# Update User
# =========================================================


class UserUpdateRequest(BaseModel):
    name: str = Field(..., max_length=255)
    username: Optional[str] = Field(default=None, max_length=255)
    email: EmailStr

    role: int
    responsibility: Optional[str] = None

    state_lgd_code: Optional[int] = None
    district_lgd_code: Optional[int] = None
    block_lgd_code: Optional[int] = None
    centre_id: Optional[int] = None

    status: str

    # Optional on edit.
    # Empty means keep the existing password.
    password: Optional[str] = None

    @field_validator("name", "username", "responsibility")
    @classmethod
    def validate_text_whitespace(cls, value):
        if value is not None:
            value = str(value)

            if value != value.strip():
                raise ValueError(
                    "Leading or trailing white space is not allowed."
                )

            if not value:
                raise ValueError("This field cannot be empty.")

        return value

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):
        if value is None:
            return value

        value = str(value).strip().lower()

        if not value:
            raise ValueError("Email is required.")

        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if value is None or value == "":
            return None

        if value != value.strip():
            raise ValueError(
                "Leading or trailing white space is not allowed."
            )

        if len(value) < 8:
            raise ValueError(
                "Password must be at least 8 characters long."
            )

        return value


# =========================================================
# User List Response
# =========================================================


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


# =========================================================
# User Detail Response
# =========================================================


class UserDetailResponse(BaseModel):
    id: int

    name: str
    username: Optional[str] = None

    email: EmailStr

    role: str
    role_name: str

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


# =========================================================
# User List Item Response
# =========================================================


class UserListItemResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    role: str
    role_name: str

    responsibility: Optional[str] = None

    status: str

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# Location Responses
# =========================================================


class StateResponse(BaseModel):
    state_lgd_code: int
    state_name: str


class DistrictResponse(BaseModel):
    district_lgd_code: int
    district_name: str


class BlockResponse(BaseModel):
    block_lgd_code: int
    block_name: str


class CentreResponse(BaseModel):
    centre_id: int
    centre_name: str


# =========================================================
# Common
# =========================================================


class MessageResponse(BaseModel):
    message: str


class BatchResponse(BaseModel):
    batch_id: int
    batch_name: str
    fy_year: str
    centre_name: str


class EnrollmentResponse(BaseModel):
    participant_id: int
    enrollment_no: str
    participant_name: str


# =========================================================
# Participant - Shared Validators
# =========================================================


def validate_required_text(value, field_name: str):
    if value is None:
        raise ValueError(f"{field_name} is required.")

    value = str(value)

    if not value:
        raise ValueError(f"{field_name} is required.")

    if value != value.strip():
        raise ValueError(
            f"Leading or trailing white space is not allowed in {field_name}."
        )

    return value


def validate_optional_text(value, field_name: str):
    if value is None:
        return None

    value = str(value)

    # Empty optional fields are treated as None.
    if value == "":
        return None

    if value != value.strip():
        raise ValueError(
            f"Leading or trailing white space is not allowed in {field_name}."
        )

    return value


def validate_digits(
    value,
    field_name: str,
    min_length: Optional[int] = None,
    max_length: Optional[int] = None,
    exact_length: Optional[int] = None,
    required: bool = False,
):
    if value is None:
        if required:
            raise ValueError(f"{field_name} is required.")
        return None

    value = str(value)

    if value == "":
        if required:
            raise ValueError(f"{field_name} is required.")
        return None

    if value != value.strip():
        raise ValueError(
            f"White space is not allowed in {field_name}."
        )

    if not value.isdigit():
        raise ValueError(
            f"{field_name} must contain numbers only."
        )

    if exact_length is not None and len(value) != exact_length:
        raise ValueError(
            f"{field_name} must contain exactly {exact_length} digits."
        )

    if min_length is not None and len(value) < min_length:
        raise ValueError(
            f"{field_name} must contain at least {min_length} digits."
        )

    if max_length is not None and len(value) > max_length:
        raise ValueError(
            f"{field_name} must contain at most {max_length} digits."
        )

    return value


# =========================================================
# Participant - Create
# =========================================================


class ParticipantCreateRequest(BaseModel):
    state_id: int
    district_id: int
    block_id: Optional[int] = None
    centre_id: int
    batch_id: int

    participant_name: str = Field(..., max_length=255)
    enrollment_no: str = Field(..., max_length=255)
    username: str = Field(..., max_length=255)
    password: str = Field(..., min_length=8)

    gender: str = Field(..., max_length=50)
    age: int = Field(..., ge=1)

    email: Optional[EmailStr] = None
    mobile_no: Optional[str] = None
    pin: str
    aadhaar_number: Optional[str] = None

    location: str = Field(..., max_length=255)
    address: Optional[str] = None

    @field_validator(
        "participant_name",
        "username",
        "gender",
        "location",
        "enrollment_no",
    )
    @classmethod
    def validate_required_text(cls, value, info):
        return validate_required_text(
            value,
            info.field_name.replace("_", " ").title(),
        )

    @field_validator("address")
    @classmethod
    def validate_address(cls, value):
        return validate_optional_text(value, "Address")

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value):
        if value is None or value == "":
            return None

        value = str(value)

        if value != value.strip():
            raise ValueError(
                "Leading or trailing white space is not allowed in Email."
            )

        if any(char.isspace() for char in value):
            raise ValueError("White space is not allowed in Email.")

        return value.lower()

    @field_validator("mobile_no", mode="before")
    @classmethod
    def validate_mobile(cls, value):
        return validate_digits(
            value,
            "Mobile Number",
            exact_length=10,
            required=False,
        )

    @field_validator("pin", mode="before")
    @classmethod
    def validate_pin(cls, value):
        return validate_digits(
            value,
            "PIN Code",
            exact_length=6,
            required=True,
        )

    @field_validator("aadhaar_number", mode="before")
    @classmethod
    def validate_aadhaar(cls, value):
        return validate_digits(
            value,
            "Aadhaar Number",
            exact_length=12,
            required=False,
        )

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if value != value.strip():
            raise ValueError(
                "Leading or trailing white space is not allowed in Password."
            )

        if len(value) < 8:
            raise ValueError(
                "Password must be at least 8 characters long."
            )

        return value


# =========================================================
# Participant - Update
# =========================================================


class ParticipantUpdateRequest(BaseModel):
    participant_name: str = Field(..., max_length=255)
    age: int = Field(..., ge=1)
    gender: str = Field(..., max_length=50)

    email: Optional[EmailStr] = None
    mobile_no: Optional[str] = None

    pin: str
    aadhaar_number: Optional[str] = None

    location: str = Field(..., max_length=255)
    address: Optional[str] = None

    state_id: Optional[int] = None
    district_id: Optional[int] = None
    block_id: Optional[int] = None

    centre_id: Optional[int] = None
    batch_id: Optional[int] = None
    enrollment_no: Optional[str] = Field(
        default=None,
        max_length=255,
    )

    @field_validator(
        "participant_name",
        "gender",
        "location",
    )
    @classmethod
    def validate_required_text(cls, value, info):
        return validate_required_text(
            value,
            info.field_name.replace("_", " ").title(),
        )

    @field_validator("enrollment_no")
    @classmethod
    def validate_enrollment(cls, value):
        return validate_optional_text(
            value,
            "Enrollment Number",
        )

    @field_validator("address")
    @classmethod
    def validate_address(cls, value):
        return validate_optional_text(value, "Address")

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, value):
        if value is None or value == "":
            return None

        value = str(value)

        if value != value.strip():
            raise ValueError(
                "Leading or trailing white space is not allowed in Email."
            )

        if any(char.isspace() for char in value):
            raise ValueError("White space is not allowed in Email.")

        return value.lower()

    @field_validator("mobile_no", mode="before")
    @classmethod
    def validate_mobile(cls, value):
        return validate_digits(
            value,
            "Mobile Number",
            exact_length=10,
            required=False,
        )

    @field_validator("pin", mode="before")
    @classmethod
    def validate_pin(cls, value):
        return validate_digits(
            value,
            "PIN Code",
            exact_length=6,
            required=True,
        )

    @field_validator("aadhaar_number", mode="before")
    @classmethod
    def validate_aadhaar(cls, value):
        return validate_digits(
            value,
            "Aadhaar Number",
            exact_length=12,
            required=False,
        )


# =========================================================
# Participant List
# =========================================================


class ParticipantListResponse(BaseModel):
    participant_id: int

    participant_name: str
    enrollment_no: str

    state_name: Optional[str] = None
    district_name: Optional[str] = None
    centre_name: Optional[str] = None
    batch_name: Optional[str] = None

    status: str
    course_progress: float = 0
    performance_status: Optional[str] = None


# =========================================================
# Participant Profile
# =========================================================


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

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# Module Wise Report
# =========================================================


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

    mcq_list: list = Field(default_factory=list)
    scq_list: list = Field(default_factory=list)
    bucket_list: list = Field(default_factory=list)
    match_making_list: list = Field(default_factory=list)


class ModuleAssessmentResponse(BaseModel):
    module_id: int
    module_name: str

    has_data: bool

    attempt_id: Optional[int] = None
    attempted_module_id: Optional[int] = None

    total_questions: int
    completed_questions: int
    correct: int
    wrong: int

    score: float
    total_marks: float

    percentage: float

    mcq_list: list = Field(default_factory=list)
    scq_list: list = Field(default_factory=list)
    bucket_list: list = Field(default_factory=list)
    match_making_list: list = Field(default_factory=list)


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


# =========================================================
# Final Report Response
# =========================================================


class ParticipantReportResponse(BaseModel):
    participant: ParticipantProfileResponse
    attempt_wise_result: AttemptWiseResultResponse
    assessment_summary: AssessmentSummaryResponse


# =========================================================
# Manage Modules
# =========================================================


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