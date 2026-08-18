from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.shared.dependencies.module_access import Module, require_module_access
from app.modules.auth.model import User
from app.modules.users.service import UserService
from app.modules.users.repository import UserRepository
from app.modules.users.schema import ParticipantModuleActionRequest

from app.modules.users.schema import (
    BatchResponse,
    BlockResponse,
    CentreResponse,
    CreatableRoleResponse,
    DistrictResponse,
    EnrollmentResponse,
    MessageResponse,
    ParticipantCreateRequest,
    ParticipantListResponse,
    ParticipantReportResponse,
    StateResponse,
    UserCreateRequest,
    UserDetailResponse,
    UserListItemResponse,
    UserResponse,
    UserUpdateRequest,
)

user_router = APIRouter(
    prefix="/users",
    tags=["Users"],
    dependencies=[Depends(require_module_access(Module.CREATE_USER))],
)

participants_router = APIRouter(
    prefix="/participants",
    tags=["Participants"],
    dependencies=[Depends(require_module_access(Module.CREATE_PARTICIPANT))],
)


# ===========================
# USER APIs
# ===========================

@user_router.get("/creatable-roles", response_model=list[CreatableRoleResponse])
def get_creatable_roles(
    current_user: User = Depends(get_current_user),
):
    return UserService.get_creatable_roles(current_user)


@user_router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    request: UserCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return UserService.create_user(
        db=db,
        request=request,
        current_user=current_user,
    )


@user_router.get("", response_model=list[UserListItemResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return UserService.get_users(db)


@user_router.get("/{user_id}", response_model=UserDetailResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return UserService.get_user_by_id(
        db=db,
        user_id=user_id,
    )


@user_router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    request: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return UserService.update_user(
        db=db,
        user_id=user_id,
        request=request,
        current_user=current_user,
    )


@user_router.delete("/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return UserService.delete_user(
        db=db,
        user_id=user_id,
        current_user=current_user,
    )


# ===========================
# LOCATION APIs
# ===========================

@participants_router.get("/states", response_model=list[StateResponse])
def get_states(
    db: Session = Depends(get_db),
):
    return UserService.get_states(db)


@participants_router.get("/districts/{state_lgd_code}", response_model=list[DistrictResponse])
def get_districts(
    state_lgd_code: int,
    db: Session = Depends(get_db),
):
    return UserService.get_districts(db, state_lgd_code)


@participants_router.get("/blocks/{district_lgd_code}", response_model=list[BlockResponse])
def get_blocks(
    district_lgd_code: int,
    db: Session = Depends(get_db),
):
    return UserService.get_blocks(
        db=db,
        district_lgd_code=district_lgd_code,
    )


@participants_router.get("/centres/{block_id}", response_model=list[CentreResponse])
def get_centres(
    block_id: int,
    db: Session = Depends(get_db),
):
    return UserService.get_centres(
        db=db,
        block_id=block_id,
    )


@participants_router.get("/participants/all-centres", response_model=list[CentreResponse])
def get_all_centres(
    db: Session = Depends(get_db),
):
    return UserService.get_all_centres(db)


@participants_router.get("/participants/batches", response_model=list[BatchResponse])
def get_batches(
    centre_id: int | None = None,
    db: Session = Depends(get_db),
):
    return UserService.get_batches(db, centre_id)


@participants_router.get("/enrollment/{batch_id}", response_model=list[EnrollmentResponse])
def get_enrollment(
    batch_id: int,
    db: Session = Depends(get_db),
):
    return UserService.get_enrollment(
        db=db,
        batch_id=batch_id,
    )


# ===========================
# PARTICIPANTS
# ===========================

@participants_router.post("/")
async def create_participant(
    state_id: int = Form(...),
    district_id: int = Form(...),
    block_id: int = Form(...),
    centre_id: int = Form(...),
    batch_id: int = Form(...),

    participant_name: str = Form(...),
    enrollment_no: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),

    gender: str = Form(...),
    age: int = Form(...),

    email: str | None = Form(None),
    mobile_no: str | None = Form(None),
    pin: str = Form(...),
    aadhaar_number: str | None = Form(None),

    location: str = Form(...),
    address: str = Form(...),

    image: UploadFile | None = File(None),

    db: Session = Depends(get_db),
):

    # 👇 YE YAHAN ADD KARO

    data = ParticipantCreateRequest(
        state_id=state_id,
        district_id=district_id,
        block_id=block_id,
        centre_id=centre_id,
        batch_id=batch_id,
        participant_name=participant_name,
        enrollment_no=enrollment_no,
        username=username,
        password=password,
        gender=gender,
        age=age,
        email=email,
        mobile_no=mobile_no,
        pin=pin,
        aadhaar_number=aadhaar_number,
        location=location,
        address=address,
    )

    return await UserService.create_participant(
        db=db,
        data=data,
        image=image,
    )
    data = ParticipantCreateRequest(
        state_id=state_id,
        district_id=district_id,
        block_id=block_id,
        centre_id=centre_id,
        batch_id=batch_id,
        participant_name=participant_name,
        enrollment_no=enrollment_no,
        username=username,
        password=password,
        gender=gender,
        age=age,
        email=email,
        mobile_no=mobile_no,
        pin=pin,
        aadhaar_number=aadhaar_number,
        location=location,
        address=address,
    )

    return await UserService.create_participant(
        db=db,
        data=data,
        image=image,
    )


@participants_router.get("", response_model=list[ParticipantListResponse])
def get_participants(
    state_id: int | None = None,
    district_id: int | None = None,
    centre_id: int | None = None,
    batch_id: int | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Restrict scoped roles to their own jurisdiction (Super Admin/Admin
    # keep the requested filter). Prevents a locally-scoped user from
    # listing trainees nationwide by omitting/forging the filters.
    state_id, district_id, centre_id = UserService.clamp_scope(
        current_user, state_id, district_id, centre_id
    )
    return UserService.get_participants(
        db=db,
        state_id=state_id,
        district_id=district_id,
        centre_id=centre_id,
        batch_id=batch_id,
        search=search,
    )


@participants_router.get("/{participant_id}/report", response_model=ParticipantReportResponse)
def get_participant_report(
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    UserService.assert_participant_access(db, current_user, participant_id)
    return UserService.get_participant_report(
        db=db,
        participant_id=participant_id,
    )



# ===========================
# MANAGE MODULES
# ===========================


@participants_router.get("/{participant_id}/modules")
def get_participant_modules(
    participant_id: int,
    language_id: int = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    UserService.assert_participant_access(db, current_user, participant_id)
    service = UserService(UserRepository(db))
    return service.get_modules(
        participant_id=participant_id,
        language_id=language_id,
    )


@participants_router.post("/assign", response_model=MessageResponse)
def assign_module(
    request: ParticipantModuleActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    UserService.assert_participant_access(db, current_user, request.participant_id)
    try:
        service = UserService(UserRepository(db))
        result = service.assign_module(
            participant_id=request.participant_id,
            module_id=request.module_id,
        )
        return MessageResponse(message=result["message"])
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@participants_router.post("/unassign", response_model=MessageResponse)
def unassign_module(
    request: ParticipantModuleActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    UserService.assert_participant_access(db, current_user, request.participant_id)
    try:
        service = UserService(UserRepository(db))
        result = service.unassign_module(
            participant_id=request.participant_id,
            module_id=request.module_id,
        )
        return MessageResponse(message=result["message"])
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


# ===========================
# CREDENTIALS + TIME SPENT
# ===========================


@participants_router.get("/{participant_id}/key-details")
def get_participant_key_details(
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    UserService.assert_participant_access(db, current_user, participant_id)
    return UserService.get_participant_key_details(
        db=db,
        participant_id=participant_id,
    )


@participants_router.get("/{participant_id}/time-spent")
def get_participant_time_spent(
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    UserService.assert_participant_access(db, current_user, participant_id)
    return UserService.get_participant_time_spent(
        db=db,
        participant_id=participant_id,
    )


# ===========================
# EDIT / UPDATE PARTICIPANT
# ===========================


@participants_router.get("/{participant_id}/edit")
def get_participant_edit(
    participant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    UserService.assert_participant_access(db, current_user, participant_id)
    return UserService.get_participant_edit(db=db, participant_id=participant_id)


@participants_router.put("/{participant_id}")
async def update_participant(
    participant_id: int,
    participant_name: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    email: str | None = Form(None),
    mobile_no: str | None = Form(None),
    pin: str = Form(...),
    aadhaar_number: str | None = Form(None),
    location: str = Form(...),
    address: str = Form(...),
    state_id: int | None = Form(None),
    district_id: int | None = Form(None),
    block_id: int | None = Form(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    UserService.assert_participant_access(db, current_user, participant_id)
    data = {
        "participant_name": participant_name,
        "age": age,
        "gender": gender,
        "email": email,
        "mobile_no": mobile_no,
        "pin": pin,
        "aadhaar_number": aadhaar_number,
        "location": location,
        "address": address,
        "state_id": state_id,
        "district_id": district_id,
        "block_id": block_id,
    }
    return await UserService.update_participant(
        db=db,
        participant_id=participant_id,
        data=data,
        image=image,
    )


# ===========================
# COMBINED ROUTER
# ===========================

router = APIRouter()

router.include_router(user_router)
router.include_router(participants_router)