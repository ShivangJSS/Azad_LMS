from datetime import datetime
from typing import Optional
 
from pydantic import BaseModel, ConfigDict


class DashboardFilterRequest(BaseModel):
    state_id: Optional[int] = None
    district_id: Optional[int] = None
    centre_id: Optional[int] = None

    from_date: Optional[str] = None
    to_date: Optional[str] = None


class DashboardSummaryResponse(BaseModel):
    total_centres: int
    total_participants: int
    active_participants: int

    total_courses: int
    total_modules: int
    total_batches: int

    total_documents: int
    total_assessments: int

    completion_rate: float

class StateWiseParticipant(BaseModel):
    state_id: int
    state_name: str
    total: int        

class ChartItem(BaseModel):
    state_id: int
    state_name: str
    total: int    

class GenderDistributionItem(BaseModel):
    gender: str | None
    total: int

class MonthlyLoginTrendItem(BaseModel):
    month: str
    total: int


class AgeGroupDistributionItem(BaseModel):
    age_group: str
    total: int

class DocumentTypeDistributionItem(BaseModel):
    doc_type: str
    total: int    

class DistrictWiseParticipantItem(BaseModel):
    district_name: str
    total: int


class ModuleLockStatusItem(BaseModel):
    lock_status: int
    total: int


class ModuleWisePerformanceItem(BaseModel):
    module_name: str
    total: int


class TraineeStatusItem(BaseModel):
    status: str
    label: str
    total: int


class TraineeStatusDetail(BaseModel):
    participant_id: int | None = None
    participant_name: str | None = None
    mobile_no: str | None = None
    enrollment_no: str | None = None
    age: int | None = None
    state_name: str | None = None
    district_name: str | None = None
    centre_name: str | None = None
    course_progress: float | int | None = None
    performance_status: str | None = None


class DashboardParticipantDetail(BaseModel):
    participant_id: int
    participant_name: str
    mobile_no: str | None
    email: str | None
    enrollment_no: str | None
    gender: str | None
    age: int | None
    state_name: str | None
    district_name: str | None




class DashboardCentreDetail(BaseModel):
    centre_name: str
    address: str | None
    state_name: str | None
    district_name: str | None
    status: int | None


class DashboardModuleDetail(BaseModel):
    module_name: str
    total: int


class DashboardDocumentDetail(BaseModel):
    doc_title: str
    doc_type: str | None
    format: str | None
    module_name: str | None
    status: int | None


class DashboardLoginDetail(BaseModel):
    participant_name: str
    mobile_no: str | None
    login_time: datetime
    app_version: str | None

class DashboardResponse(BaseModel):
    summary: DashboardSummaryResponse
    trainee_status: list[TraineeStatusItem] = []
    state_wise_participants: list[StateWiseParticipant]
    state_wise_centres: list[ChartItem]
    gender_distribution: list[GenderDistributionItem]
    monthly_login_trend: list[MonthlyLoginTrendItem]
    document_type_distribution: list[DocumentTypeDistributionItem]
    district_wise_participants: list[DistrictWiseParticipantItem]
    age_group_distribution: list[AgeGroupDistributionItem]
    module_lock_status: list[ModuleLockStatusItem]
    module_wise_performance: list[ModuleWisePerformanceItem]
    model_config = ConfigDict(from_attributes=True)
