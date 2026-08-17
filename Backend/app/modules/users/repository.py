from collections import defaultdict
from sqlalchemy import BigInteger, case, cast, func
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.modules.centres.model import BlockMaster, CentreMaster, ParticipantDb, ParticipantMcq, ParticipantMm, ParticipantScq, StateMaster
from app.modules.centres.model import DistrictMaster
from app.modules.auth.model import User
from app.modules.batch.model import BatchMaster
from app.modules.users.schema import ParticipantCreateRequest
from app.modules.assessment.model import DropBucketMaster,DropBucketItem,DropBucket
from app.modules.assessment.model import McqQuestionOption,ScqQuestionOption,MatchLeftItem,MatchRightItem
from app.modules.dashboard.model import  ParticipantModule

from app.modules.users.model import ParticipantMaster, TimeSpentModuleLog
from app.modules.batch.model import BatchParticipant, BatchMaster
from app.modules.centres.model import (
    StateMaster,
    DistrictMaster,
    CentreMaster,
)

from app.modules.module.model import ModuleMaster
from app.modules.assessment.model import AssessmentMapping, AssessmentMaster, PostSessionAssessment
from app.modules.assessment.model import McqMaster
from app.modules.assessment.model import ScqMaster
from app.modules.assessment.model import MatchMakingMaster
from app.modules.users.model import ParticipantMaster
from app.modules.batch.model import BatchParticipant
from app.modules.centres.model import CentreMaster
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")



class UserRepository:
    @staticmethod
    def get_states(db: Session):
        return (
            db.query(
                StateMaster.state_lgd_code,
                StateMaster.state_name,
            )
            .filter(StateMaster.status == "1")
            .order_by(StateMaster.state_name.asc())
            .all()
        )
    @staticmethod
    def get_districts(db: Session, state_lgd_code: int):
     return (
        db.query(
            DistrictMaster.district_lgd_code,
            DistrictMaster.district_name,
        )
        .filter(
            DistrictMaster.state_lgd_code == state_lgd_code,
            DistrictMaster.status == "1",
        )
        .order_by(DistrictMaster.district_name.asc())
        .all()
       )

    @staticmethod
    def get_blocks(db: Session, district_lgd_code: int):
      return (
        db.query(
            BlockMaster.block_lgd_code,
            BlockMaster.block_name,
        )
        .filter(
            BlockMaster.district_lgd_code == district_lgd_code,
            BlockMaster.status == "1",
        )
        .order_by(BlockMaster.block_name.asc())
        .all()
    )


    @staticmethod
    def get_centres(db: Session, block_id: int):
     return (
        db.query(
            CentreMaster.centre_id,
            CentreMaster.centre_name,
        )
        .filter(
            CentreMaster.block_id == block_id,
            CentreMaster.status == 1,
        )
        .order_by(CentreMaster.centre_name.asc())
        .all()
    )         

    @staticmethod
    def get_by_email(db: Session, email: str):
        return (
            db.query(User).filter(User.status == "1")
            .filter(User.email == email)
            .first()
        )

    @staticmethod
    def get_by_username(db: Session, username: str):
        return (
            db.query(User).filter(User.status == "1")
            .filter(User.username == username)
            .first()
        )

    @staticmethod
    def create_user(db: Session, user: User):
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


    @staticmethod
    def get_users(db: Session):
     return (
        db.query(User)
        .filter(User.status == "1")
        .order_by(User.id.desc())
        .all()
    )


    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
      return (
        db.query(
            User,
            StateMaster.state_name,
            DistrictMaster.district_name,
            BlockMaster.block_name,
            CentreMaster.centre_name,
        )
        .outerjoin(
            StateMaster,
            User.state_lgd_code == StateMaster.state_lgd_code,
        )
        .outerjoin(
            DistrictMaster,
            User.district_lgd_code == DistrictMaster.district_lgd_code,
        )
        .outerjoin(
            BlockMaster,
            User.block_lgd_code == BlockMaster.block_lgd_code,
        )
        .outerjoin(
            CentreMaster,
            User.centre_id == CentreMaster.centre_id,
        )
        .filter(User.id == user_id)
        .first()
      )

    @staticmethod
    def update_user(db: Session, user: User):
      db.commit()
      db.refresh(user)
      return user


    @staticmethod
    def soft_delete_user(db: Session, user: User):
      user.status = "0"
      db.commit()
      db.refresh(user)
      return user


    @staticmethod
    def get_by_id(db: Session, user_id: int):
      return (
        db.query(User).filter(User.status == "1")
        .filter(User.id == user_id)
        .first()
      )



    @staticmethod
    def get_by_email_except_user(
      db: Session,
      email: str,
      user_id: int,
    ):
      return (
        db.query(User)
        .filter(
            User.email == email,
            User.id != user_id,
            User.status == "1",
        )
        .first()
    )


    @staticmethod
    def get_batches(
      db: Session,
      centre_id: int,
 ):
     return (
        db.query(
            BatchMaster.batch_id,
            BatchMaster.batch_name,
            BatchMaster.fy_year,
            CentreMaster.centre_name,
        )
        .join(
            CentreMaster,
            BatchMaster.centre_id == CentreMaster.centre_id,
        )
        .filter(
            BatchMaster.centre_id == centre_id,
            BatchMaster.status == 1,
            BatchMaster.deleted_at.is_(None),
        )
        .order_by(BatchMaster.batch_name)
        .all()
    )

    @staticmethod
    def get_enrollment(
     db: Session,
     batch_id: int,
):
     return (
        db.query(
            ParticipantMaster.participant_id,
            ParticipantMaster.enrollment_no,
            ParticipantMaster.participant_name,
        )
        .select_from(BatchParticipant)
        .join(
            ParticipantMaster,
            BatchParticipant.participant_id == ParticipantMaster.participant_id,
        )
        .filter(
            BatchParticipant.batch_id == batch_id,
            BatchParticipant.deleted_at.is_(None),
        )
        .order_by(ParticipantMaster.participant_name)
        .all()
    )


    @staticmethod
    def create_participant(
     db: Session,
     data: ParticipantCreateRequest,
     image_name: str | None,
):

     hashed_password = pwd_context.hash(data.password)

     participant = ParticipantMaster(
        enrollment_no=data.enrollment_no,
        participant_name=data.participant_name,
        username=data.username,
        password=hashed_password,
        gender=data.gender,
        age=data.age,
        email=data.email,
        mobile_no=data.mobile_no,
        location=data.location,
        address=data.address,
        block_id=data.block_id,
        district_id=data.district_id,
        state_id=data.state_id,
        pin=data.pin,
        aadhaar_number=data.aadhaar_number,
        images=image_name,
        status="1",
        progress_status=0,
        course_progress=0,
    )

     db.add(participant)
     db.flush()   # Generates participant_id

     batch_participant = BatchParticipant(
        batch_id=data.batch_id,
        participant_id=participant.participant_id,
    )

     db.add(batch_participant)

     db.commit()

     db.refresh(participant)

     return participant

    @staticmethod
    def assign_batch(
     db: Session,
     batch_id: int,
     participant_id: int,
):
     mapping = BatchParticipant(
        batch_id=batch_id,
        participant_id=participant_id,
    )

     db.add(mapping)
     db.commit()
     db.refresh(mapping)

     return mapping



    @staticmethod
    def get_all_centres(db: Session):
     return (
        db.query(
            CentreMaster.centre_id,
            CentreMaster.centre_name,
        )
        .filter(CentreMaster.status == 1)
        .order_by(CentreMaster.centre_name)
        .all()
    )



    @staticmethod
    def get_batches(
     db: Session,
     centre_id: int | None = None,
):
     query = (
        db.query(
            BatchMaster.batch_id,
            BatchMaster.batch_name,
            BatchMaster.fy_year,
            CentreMaster.centre_name,
        )
        .join(
            CentreMaster,
            BatchMaster.centre_id == CentreMaster.centre_id,
        )
        .filter(
            BatchMaster.status == 1,
            BatchMaster.deleted_at.is_(None),
        )
    )

     if centre_id:
        query = query.filter(
            BatchMaster.centre_id == centre_id
        )

     return query.order_by(
        BatchMaster.batch_name
    ).all()





    @staticmethod
    def get_participants(
     db: Session,
     state_id: int | None = None,
     district_id: int | None = None,
     centre_id: int | None = None,
     batch_id: int | None = None,
     search: str | None = None,
):
     performance_subquery = (
     db.query(
        ParticipantMaster.participant_id.label("participant_id"),

        func.count(
            case(
                (ParticipantMcq.option_selected.isnot(None), 1)
            )
        ).label("completed_questions"),

        (
            func.count(
                case(
                    (
                        McqQuestionOption.is_mcq_option_correct == 1,
                        1
                    )
                )
            )
        ).label("correct_answers")
    )
     .outerjoin(
        ParticipantMcq,
        ParticipantMaster.participant_id
        == ParticipantMcq.participant_id
    )
     .outerjoin(
        McqQuestionOption,
        cast(
            ParticipantMcq.option_selected,
            BigInteger
        )
        == McqQuestionOption.mcq_option_id
    )
     .group_by(
        ParticipantMaster.participant_id
    )
     .subquery()
)
     
     progress_subquery = (
        db.query(
            ParticipantModule.participant_id.label("participant_id"),
            func.count(ParticipantModule.module_id).label("total_modules"),
            func.count(
                case(
                    (ParticipantModule.status == "1", 1)
                )
            ).label("completed_modules")
        )
        .group_by(ParticipantModule.participant_id)
        .subquery()
     )
     query = (
        db.query(
            ParticipantMaster.participant_id,
            ParticipantMaster.participant_name,
            ParticipantMaster.enrollment_no,
            ParticipantMaster.status,

            StateMaster.state_name,
            DistrictMaster.district_name,
            CentreMaster.centre_name,
            BatchMaster.batch_name,

            progress_subquery.c.total_modules,
            progress_subquery.c.completed_modules,
            performance_subquery.c.completed_questions,
            performance_subquery.c.correct_answers,
        )
        .join(
            BatchParticipant,
            ParticipantMaster.participant_id
            == BatchParticipant.participant_id,
        )
        .join(
            BatchMaster,
            BatchParticipant.batch_id == BatchMaster.batch_id,
        )
        .join(
            CentreMaster,
            BatchMaster.centre_id == CentreMaster.centre_id,
        )
        .join(
            StateMaster,
            ParticipantMaster.state_id == StateMaster.state_lgd_code,
        )
        .join(
            DistrictMaster,
            ParticipantMaster.district_id
            == DistrictMaster.district_lgd_code,
        )
        .outerjoin(
           progress_subquery,
           ParticipantMaster.participant_id
           == progress_subquery.c.participant_id,

    )
        .outerjoin(
            performance_subquery,
            ParticipantMaster.participant_id
            == performance_subquery.c.participant_id,
        )

        .filter(
            ParticipantMaster.deleted_at.is_(None),
            BatchParticipant.deleted_at.is_(None),
            BatchMaster.deleted_at.is_(None),
        )
    )


     if state_id:
        query = query.filter(
            ParticipantMaster.state_id == state_id
        )

     if district_id:
       query = query.filter(
            ParticipantMaster.district_id == district_id
        )

     if centre_id:
        query = query.filter(
            BatchMaster.centre_id == centre_id
        )

     if batch_id:
        query = query.filter(
            BatchMaster.batch_id == batch_id
        )

     if search:
        query = query.filter(
            ParticipantMaster.participant_name.ilike(
                f"%{search}%"
            )
        )

     return query.order_by(
        ParticipantMaster.participant_name
    ).all()



    @staticmethod
    def get_participant_profile(
     db: Session,
     participant_id: int,
):
    

     return (
        db.query(
            ParticipantMaster.participant_id,
            ParticipantMaster.participant_name,
            ParticipantMaster.enrollment_no,
            ParticipantMaster.mobile_no,
            ParticipantMaster.email,
            ParticipantMaster.location,
            ParticipantMaster.images.label("image"),
            StateMaster.state_name.label("state_name"),
            DistrictMaster.district_name.label("district_name"),
            CentreMaster.centre_name.label("centre_name"),
        )
        .outerjoin(
            BatchParticipant,
            BatchParticipant.participant_id == ParticipantMaster.participant_id,
        )
        .outerjoin(
            BatchMaster,
            BatchMaster.batch_id == BatchParticipant.batch_id,
        )
        .outerjoin(
            CentreMaster,
            CentreMaster.centre_id == BatchMaster.centre_id,
        )
        .outerjoin(
            StateMaster,
            StateMaster.state_lgd_code == ParticipantMaster.state_id,
        )
        .outerjoin(
            DistrictMaster,
            DistrictMaster.district_lgd_code == ParticipantMaster.district_id,
        )
        .filter(
            ParticipantMaster.participant_id == participant_id,
            ParticipantMaster.status == "1",
            ParticipantMaster.deleted_at.is_(None),
        )
        .first()
    )




    @staticmethod
    def get_assessment_summary(
        db: Session,
        participant_id: int,
        attempt_wise_result: list,
    ):
        # ============================================================
        # Get assigned modules
        # ============================================================
        assigned_module_ids = [
            row.module_id
            for row in db.query(ParticipantModule.module_id)
            .filter(
                ParticipantModule.participant_id == participant_id,
                ParticipantModule.status == "1",
            )
            .all()
        ]

        if not assigned_module_ids:
            return {
                "module_results": [],
                "total_questions": 0,
                "completed_questions": 0,
                "correct": 0,
                "wrong": 0,
                "score": 0,
                "total_marks": 0,
                "percentage": 0,
                "progress": 0,
            }

        # ============================================================
        # Load assigned modules
        # ============================================================
        modules = (
            db.query(ModuleMaster)
            .filter(
                ModuleMaster.module_id.in_(assigned_module_ids),
                ModuleMaster.deleted_at.is_(None),
            )
            .all()
        )

        module_map = {
            module.module_id: module
            for module in modules
        }

        # ============================================================
        # Group by parent module
        # ============================================================
        modules_by_parent = defaultdict(list)

        for module in modules:
            parent_id = module.parent_id or module.module_id
            modules_by_parent[parent_id].append(module.module_id)

        # ============================================================
        # Get all language variants
        # ============================================================
        parent_ids = list(modules_by_parent.keys())

        sibling_modules = (
            db.query(ModuleMaster)
            .filter(
                ModuleMaster.parent_id.in_(parent_ids),
                ModuleMaster.deleted_at.is_(None),
            )
            .all()
        )

        for sibling in sibling_modules:
            if sibling.module_id not in modules_by_parent[sibling.parent_id]:
                modules_by_parent[sibling.parent_id].append(
                    sibling.module_id
                )

        # ============================================================
        # Get all child module ids
        # ============================================================
        all_module_ids = []

        for child_ids in modules_by_parent.values():
            all_module_ids.extend(child_ids)

        all_module_ids = list(set(all_module_ids))

        # ============================================================
        # Load all post assessments
        # ============================================================
        post_assessments = (
            db.query(PostSessionAssessment)
            .filter(
                PostSessionAssessment.module_id.in_(all_module_ids),
                PostSessionAssessment.is_active == 1,
                PostSessionAssessment.deleted_at.is_(None),
            )
            .all()
        )

        module_assessment_map = defaultdict(list)

        for assessment in post_assessments:
            module_assessment_map[
                assessment.module_id
            ].append(
                assessment.assessment_id
            )

        # ============================================================
        # Overall counters
        # ============================================================
        module_results = []

        overall_total_questions = 0
        overall_completed_questions = 0
        overall_correct = 0
        overall_wrong = 0
        overall_score = 0
        overall_total_marks = 0

        # ============================================================
        # Process each parent module
        # ============================================================
        for parent_id, child_module_ids in modules_by_parent.items():

            module_name = (
                module_map.get(parent_id).module_name
                if module_map.get(parent_id)
                else (
                    db.query(ModuleMaster.module_name)
                    .filter(ModuleMaster.module_id == parent_id)
                    .scalar()
                )
            )

            last_attempt_id = None
            attempted_module_id = None

            # ============================================================
            # Find latest attempt across all language variants
            # ============================================================
            for module_id in child_module_ids:

                mcq_attempt = (
                    db.query(func.max(ParticipantMcq.attempt_id))
                    .filter(
                        ParticipantMcq.participant_id == participant_id,
                        ParticipantMcq.module_id == module_id,
                    )
                    .scalar()
                )

                scq_attempt = (
                    db.query(func.max(ParticipantScq.attempt_id))
                    .filter(
                        ParticipantScq.participant_id == participant_id,
                        ParticipantScq.module_id == module_id,
                    )
                    .scalar()
                )

                db_attempt = (
                    db.query(func.max(ParticipantDb.attempt_id))
                    .filter(
                        ParticipantDb.participant_id == participant_id,
                        ParticipantDb.module_id == module_id,
                    )
                    .scalar()
                )

                mm_attempt = (
                    db.query(func.max(ParticipantMm.attempt_id))
                    .filter(
                        ParticipantMm.participant_id == participant_id,
                        ParticipantMm.module_id == module_id,
                    )
                    .scalar()
                )

                attempts = [
                    attempt
                    for attempt in (
                        mcq_attempt,
                        scq_attempt,
                        db_attempt,
                        mm_attempt,
                    )
                    if attempt is not None
                ]

                if attempts:
                    latest_attempt = max(attempts)

                    if (
                        last_attempt_id is None
                        or latest_attempt > last_attempt_id
                    ):
                        last_attempt_id = latest_attempt
                        attempted_module_id = module_id

            # ============================================================
            # Collect assessment ids from ALL language variants
            # ============================================================
            assessment_ids = []

            for module_id in child_module_ids:
                assessment_ids.extend(
                    module_assessment_map.get(module_id, [])
                )

            assessment_ids = list(set(assessment_ids))

            # No configured assessment for this module
            if not assessment_ids:
                module_results.append(
                    {
                        "module_id": parent_id,
                        "module_name": module_name,
                        "has_data": False,
                        "total_questions": 0,
                        "completed_questions": 0,
                        "correct": 0,
                        "wrong": 0,
                        "score": 0,
                        "total_marks": 0,
                        "percentage": 0,
                        "mcq_list": [],
                        "scq_list": [],
                        "bucket_list": [],
                        "match_making_list": [],
                    }
                )
                continue

            # ============================================================
            # Get configured question ids
            # ============================================================
            configured_mcq_ids = [
                row.assessment_ref_id
                for row in db.query(AssessmentMapping.assessment_ref_id)
                .filter(
                    AssessmentMapping.assessment_id.in_(assessment_ids),
                    AssessmentMapping.assessment_type == "MCQ",
                    AssessmentMapping.is_active == 1,
                )
                .all()
            ]

            configured_scq_ids = [
                row.assessment_ref_id
                for row in db.query(AssessmentMapping.assessment_ref_id)
                .filter(
                    AssessmentMapping.assessment_id.in_(assessment_ids),
                    AssessmentMapping.assessment_type == "SCQ",
                    AssessmentMapping.is_active == 1,
                )
                .all()
            ]

            configured_db_ids = [
                row.assessment_ref_id
                for row in db.query(AssessmentMapping.assessment_ref_id)
                .filter(
                    AssessmentMapping.assessment_id.in_(assessment_ids),
                    AssessmentMapping.assessment_type == "DB",
                    AssessmentMapping.is_active == 1,
                )
                .all()
            ]

            configured_mm_ids = [
                row.assessment_ref_id
                for row in db.query(AssessmentMapping.assessment_ref_id)
                .filter(
                    AssessmentMapping.assessment_id.in_(assessment_ids),
                    AssessmentMapping.assessment_type == "MM",
                    AssessmentMapping.is_active == 1,
                )
                .all()
            ]

            # ============================================================
            # No attempt made for this module
            # ============================================================
            if last_attempt_id is None:

                total_questions = (
                    len(configured_mcq_ids)
                    + len(configured_scq_ids)
                    + len(configured_db_ids)
                    + len(configured_mm_ids)
                )

                total_marks = 0

                if configured_mcq_ids:
                    total_marks += (
                        db.query(func.coalesce(func.sum(McqMaster.marks), 0))
                        .filter(McqMaster.mcq_id.in_(configured_mcq_ids))
                        .scalar()
                        or 0
                    )

                if configured_scq_ids:
                    total_marks += (
                        db.query(func.coalesce(func.sum(ScqMaster.marks), 0))
                        .filter(ScqMaster.scq_id.in_(configured_scq_ids))
                        .scalar()
                        or 0
                    )

                if configured_db_ids:
                    total_marks += (
                        db.query(func.coalesce(func.sum(DropBucketMaster.marks), 0))
                        .filter(DropBucketMaster.drop_bucket_id.in_(configured_db_ids))
                        .scalar()
                        or 0
                    )

                if configured_mm_ids:
                    total_marks += (
                        db.query(func.coalesce(func.sum(MatchMakingMaster.marks), 0))
                        .filter(MatchMakingMaster.match_making_id.in_(configured_mm_ids))
                        .scalar()
                        or 0
                    )

                module_results.append(
                    {
                        "module_id": parent_id,
                        "module_name": module_name,
                        "has_data": False,
                        "attempt_id": None,
                        "attempted_module_id": None,
                        "total_questions": total_questions,
                        "completed_questions": 0,
                        "correct": 0,
                        "wrong": 0,
                        "score": 0,
                        "total_marks": total_marks,
                        "percentage": 0,
                        "mcq_list": [],
                        "scq_list": [],
                        "bucket_list": [],
                        "match_making_list": [],
                    }
                )

                overall_total_questions += total_questions
                overall_total_marks += total_marks

                continue

            # ============================================================
            # Find matching attempt
            # ============================================================
            matched_attempt = next(
                (
                    attempt
                    for attempt in attempt_wise_result
                    if attempt["attempt_id"] == last_attempt_id
                ),
                None,
            )

            if matched_attempt is None:
                module_results.append(
                    {
                        "module_id": parent_id,
                        "module_name": module_name,
                        "has_data": False,
                        "total_questions": 0,
                        "completed_questions": 0,
                        "correct": 0,
                        "wrong": 0,
                        "score": 0,
                        "total_marks": 0,
                        "percentage": 0,
                        "mcq_list": [],
                        "scq_list": [],
                        "bucket_list": [],
                        "match_making_list": [],
                    }
                )
                continue

            # ============================================================
            # Get question ids actually answered in this attempt
            # ============================================================
            module_mcq_ids = {
                row.mcq_id
                for row in db.query(ParticipantMcq.mcq_id)
                .filter(
                    ParticipantMcq.participant_id == participant_id,
                    ParticipantMcq.attempt_id == last_attempt_id,
                    ParticipantMcq.module_id.in_(child_module_ids),
                )
                .all()
            }

            module_scq_ids = {
                row.single_choice_id
                for row in db.query(ParticipantScq.single_choice_id)
                .filter(
                    ParticipantScq.participant_id == participant_id,
                    ParticipantScq.attempt_id == last_attempt_id,
                    ParticipantScq.module_id.in_(child_module_ids),
                )
                .all()
            }

            module_db_ids = {
                row.bucket_id
                for row in db.query(ParticipantDb.bucket_id)
                .filter(
                    ParticipantDb.participant_id == participant_id,
                    ParticipantDb.attempt_id == last_attempt_id,
                    ParticipantDb.module_id.in_(child_module_ids),
                )
                .all()
            }

            module_mm_ids = {
                row.question_id
                for row in db.query(ParticipantMm.question_id)
                .filter(
                    ParticipantMm.participant_id == participant_id,
                    ParticipantMm.attempt_id == last_attempt_id,
                    ParticipantMm.module_id.in_(child_module_ids),
                )
                .all()
            }

            # ============================================================
            # Merge configured + attempted question ids
            # ============================================================
            effective_mcq_ids = set(configured_mcq_ids).union(module_mcq_ids)
            effective_scq_ids = set(configured_scq_ids).union(module_scq_ids)
            effective_db_ids = set(configured_db_ids).union(module_db_ids)
            effective_mm_ids = set(configured_mm_ids).union(module_mm_ids)

            # ============================================================
            # Filter matched attempt
            # ============================================================
            post_mcq = [
                item
                for item in matched_attempt.get("mcq_list", [])
                if item["mcq_id"] in effective_mcq_ids
            ]

            post_scq = [
                item
                for item in matched_attempt.get("scq_list", [])
                if item["scq_id"] in effective_scq_ids
            ]

            post_bucket = [
                item
                for item in matched_attempt.get("bucket_list", [])
                if item["drop_bucket_id"] in effective_db_ids
            ]

            post_mm = [
                item
                for item in matched_attempt.get("match_making_list", [])
                if item["match_making_id"] in effective_mm_ids
            ]

            completed_questions = (
                len(post_mcq)
                + len(post_scq)
                + len(post_bucket)
                + len(post_mm)
            )

            # ============================================================
            # Calculate module statistics
            # ============================================================
            all_post_items = (
                post_mcq
                + post_scq
                + post_bucket
                + post_mm
            )

            total_correct = sum(
                1
                for item in all_post_items
                if item.get("question_status") == "Correct"
            )

            total_wrong = sum(
                1
                for item in all_post_items
                if item.get("question_status") == "Wrong"
            )

            total_marks = sum(
                item.get("marks", 0)
                for item in all_post_items
            )

            total_score = sum(
                item.get("marks", 0)
                for item in all_post_items
                if item.get("question_status") == "Correct"
            )

            # Laravel treats attempted questions as configured questions
            total_configured_questions = completed_questions
            total_configured_marks = total_marks

            percentage = (
                min(
                    100,
                    round(
                        (total_score / total_configured_marks) * 100,
                        2,
                    ),
                )
                if total_configured_marks > 0
                else 0
            )

            module_results.append(
                {
                    "module_id": parent_id,
                    "module_name": module_name,
                    "has_data": completed_questions > 0,
                    "attempt_id": last_attempt_id,
                    "attempted_module_id": attempted_module_id,
                    "total_questions": total_configured_questions,
                    "completed_questions": completed_questions,
                    "correct": total_correct,
                    "wrong": total_wrong,
                    "score": total_score,
                    "total_marks": total_configured_marks,
                    "percentage": percentage,
                    "mcq_list": post_mcq,
                    "scq_list": post_scq,
                    "bucket_list": post_bucket,
                    "match_making_list": post_mm,
                }
            )

            # ============================================================
            # Update overall totals
            # ============================================================
            overall_total_questions += total_configured_questions
            overall_completed_questions += completed_questions
            overall_correct += total_correct
            overall_wrong += total_wrong
            overall_score += total_score
            overall_total_marks += total_configured_marks

        # ============================================================
        # Calculate overall summary
        # ============================================================
        overall_percentage = (
            round(
                (overall_score / overall_total_marks) * 100,
                2,
            )
            if overall_total_marks > 0
            else 0
        )

        overall_progress = (
            round(
                (overall_completed_questions / overall_total_questions) * 100,
                2,
            )
            if overall_total_questions > 0
            else 0
        )

        # ============================================================
        # Optional: Sort modules by module name
        # (Remove if original order should be preserved)
        # ============================================================
        module_results = sorted(
            module_results,
            key=lambda x: x["module_name"] or ""
        )

        # ============================================================
        # Return summary
        # ============================================================
        return {
            "module_results": module_results,
            "total_questions": overall_total_questions,
            "completed_questions": overall_completed_questions,
            "correct": overall_correct,
            "wrong": overall_wrong,
            "score": overall_score,
            "total_marks": overall_total_marks,
            "percentage": overall_percentage,
            "progress": overall_progress,
        }

    @staticmethod
    def get_attempt_wise_result(
        db: Session,
        participant_id: int,
    ):

        # ============================================================
        # LOAD MASTER DATA
        # ============================================================

        mcq_master_data = {
            x.mcq_id: x
            for x in db.query(McqMaster).all()
        }

        scq_master_data = {
            x.scq_id: x
            for x in db.query(ScqMaster).all()
        }

        bucket_master_data = {
            x.drop_bucket_id: x
            for x in db.query(DropBucketMaster).all()
        }

        match_making_data = {
            x.match_making_id: x
            for x in db.query(MatchMakingMaster).all()
        }

        # ============================================================
        # MCQ OPTIONS
        # ============================================================

        mcq_options = defaultdict(list)

        for option in db.query(McqQuestionOption).all():
            mcq_options[option.mcq_id].append(option)

        # ============================================================
        # SCQ OPTIONS
        # ============================================================

        scq_options = defaultdict(list)

        for option in db.query(ScqQuestionOption).all():
            scq_options[option.scq_id].append(option)

        # ============================================================
        # DROP BUCKET DATA
        # ============================================================

        buckets = db.query(DropBucket).all()

        bucket_items = db.query(DropBucketItem).all()

        bucket_items_grouped = defaultdict(list)

        for item in bucket_items:
            bucket_items_grouped[item.bucket_id].append(item)

        # ============================================================
        # FETCH ALL ATTEMPT IDS
        # ============================================================

        attempt_ids = set()

        attempt_ids.update(
            x[0]
            for x in db.query(ParticipantMcq.attempt_id)
            .filter(
                ParticipantMcq.participant_id == participant_id
            )
            .distinct()
            .all()
            if x[0] is not None
        )

        attempt_ids.update(
            x[0]
            for x in db.query(ParticipantScq.attempt_id)
            .filter(
                ParticipantScq.participant_id == participant_id
            )
            .distinct()
            .all()
            if x[0] is not None
        )

        attempt_ids.update(
            x[0]
            for x in db.query(ParticipantDb.attempt_id)
            .filter(
                ParticipantDb.participant_id == participant_id
            )
            .distinct()
            .all()
            if x[0] is not None
        )

        attempt_ids.update(
            x[0]
            for x in db.query(ParticipantMm.attempt_id)
            .filter(
                ParticipantMm.participant_id == participant_id
            )
            .distinct()
            .all()
            if x[0] is not None
        )

        all_attempt_ids = sorted(attempt_ids)

        # ============================================================
        # INITIALIZE RESULT
        # ============================================================

        attempt_wise_result = []

        # ============================================================
        # LOOP THROUGH EACH ATTEMPT
        # ============================================================

        for attempt_id in all_attempt_ids:

            attempt_total_questions = 0
            attempt_total_correct = 0
            attempt_total_wrong = 0
            attempt_total_marks = 0
            attempt_total_score = 0

            attempt_mcq_list = []
            attempt_scq_list = []
            attempt_bucket_list = []
            attempt_mm_list = []

            left_items = defaultdict(list)
            for item in db.query(MatchLeftItem).all():
                left_items[item.match_making_id].append(item)

            right_items = defaultdict(list)
            for item in db.query(MatchRightItem).all():
                right_items[item.match_making_id].append(item)

            # ============================================================
            # PROCESS MCQ FOR THIS ATTEMPT
            # ============================================================

            mcq_attempted_ids = [
                row[0]
                for row in (
                    db.query(ParticipantMcq.mcq_id)
                    .filter(
                        ParticipantMcq.participant_id == participant_id,
                        ParticipantMcq.attempt_id == attempt_id,
                    )
                    .distinct()
                    .all()
                )
            ]

            if mcq_attempted_ids:

                mcq_selected_options = {
                    row.mcq_id: row.option_selected
                    for row in (
                        db.query(
                            ParticipantMcq.mcq_id,
                            ParticipantMcq.option_selected,
                        )
                        .filter(
                            ParticipantMcq.participant_id == participant_id,
                            ParticipantMcq.attempt_id == attempt_id,
                        )
                        .all()
                    )
                }

                for mcq_id in mcq_attempted_ids:

                    mcq = mcq_master_data.get(mcq_id)

                    if not mcq:
                        continue

                    attempt_total_questions += 1
                    attempt_total_marks += mcq.marks or 0

                    selected_option = mcq_selected_options.get(mcq_id)

                    question_status = "Wrong"

                    option_list = []

                    wrong_already_counted = False

                    for option in mcq_options.get(mcq_id, []):

                        option_status = ""

                        if (
                            option.mcq_option_id == selected_option
                            and str(option.is_mcq_option_correct) == "1"
                        ):

                            option_status = "Correct"

                            question_status = "Correct"

                            attempt_total_correct += 1

                            attempt_total_score += mcq.marks or 0

                        elif (
                            option.mcq_option_id == selected_option
                            and str(option.is_mcq_option_correct) == "0"
                        ):

                            option_status = "Wrong"


                        elif str(option.is_mcq_option_correct) == "1":

                            option_status = "Correct"

                        option_list.append(
                            {
                                "mcq_option_text": option.mcq_option_text,
                                "option_status": option_status,
                            }
                        )

                    if question_status == "Wrong":
                    
                        attempt_total_wrong += 1

                    attempt_mcq_list.append(
                        {
                            "mcq_id": mcq.mcq_id,
                            "mcq_question_title": mcq.mcq_question_title,
                            "mcq_question_description": mcq.mcq_question_description,
                            "image_url": mcq.image_url,
                            "marks": mcq.marks,
                            "question_status": question_status,
                            "option": option_list,
                        }
                    )

            # ============================================================
            # PROCESS SCQ FOR THIS ATTEMPT
            # ============================================================

            scq_attempted_ids = [
                row[0]
                for row in (
                    db.query(ParticipantScq.single_choice_id)
                    .filter(
                        ParticipantScq.participant_id == participant_id,
                        ParticipantScq.attempt_id == attempt_id,
                    )
                    .distinct()
                    .all()
                )
            ]

            if scq_attempted_ids:

                scq_selected_options = defaultdict(list)

                for row in (
                    db.query(
                        ParticipantScq.single_choice_id,
                        ParticipantScq.option_selected,
                    )
                    .filter(
                        ParticipantScq.participant_id == participant_id,
                        ParticipantScq.attempt_id == attempt_id,
                    )
                    .all()
                ):
                    scq_selected_options[row.single_choice_id].append(
                        row.option_selected
                    )

                for scq_id in scq_attempted_ids:

                    scq = scq_master_data.get(scq_id)

                    if not scq:
                        continue

                    attempt_total_questions += 1
                    attempt_total_marks += scq.marks or 0

                    selected = (
                        scq_selected_options.get(scq_id, [None])[0]
                    )

                    question_status = "Wrong"

                    option_list = []

                    for option in scq_options.get(scq_id, []):

                        option_status = ""

                        if (
                            option.scq_option_id == selected
                            and int(option.is_scq_option_correct) == 1
                        ):

                            option_status = "Correct"

                            question_status = "Correct"

                            attempt_total_correct += 1

                            attempt_total_score += scq.marks or 0

                        elif (
                            option.scq_option_id == selected
                            and int(option.is_scq_option_correct) == 0
                        ):

                            option_status = "Wrong"

                           

                        elif int(option.is_scq_option_correct) == 1:

                            option_status = "Correct"

                        option_list.append(
                            {
                                "scq_option_text": option.scq_option_text,
                                "option_status": option_status,
                            }
                        )

                    attempt_scq_list.append(
                        {
                            "scq_id": scq.scq_id,
                            "scq_question_title": scq.scq_question_title,
                            "scq_question_description": scq.scq_question_description,
                            "image_url": scq.image_url,
                            "marks": scq.marks,
                            "question_status": question_status,
                            "option": option_list,
                        }
                    )

            # ============================================================
            # PROCESS DROP BUCKET FOR THIS ATTEMPT
            # ============================================================

            # bucket_id -> drop_bucket_id mapping
            bucket_to_master = {
                bucket.bucket_id: bucket.drop_bucket_id
                for bucket in buckets
            }

            bucket_attempted_ids = list(
                {
                    bucket_to_master[row.bucket_id]
                    for row in (
                        db.query(ParticipantDb.bucket_id)
                        .filter(
                            ParticipantDb.participant_id == participant_id,
                            ParticipantDb.attempt_id == attempt_id,
                        )
                        .all()
                    )
                    if row.bucket_id in bucket_to_master
                }
            )

            print("bucket_attempted_ids:", bucket_attempted_ids)
            print("bucket_to_master:", bucket_to_master)

            if bucket_attempted_ids:

                participant_bucket_answers = defaultdict(
                    lambda: defaultdict(set)
                )

                for row in (
                    db.query(ParticipantDb)
                    .filter(
                        ParticipantDb.participant_id == participant_id,
                        ParticipantDb.attempt_id == attempt_id,
                    )
                    .all()
                ):
                    participant_bucket_answers[row.bucket_id][
                        row.item_id
                    ].add(row.item_id)

                for bucket_master_id in bucket_attempted_ids:

                    bucket_master = bucket_master_data.get(bucket_master_id)

                    if not bucket_master:
                        continue

                    attempt_total_questions += 1
                    attempt_total_marks += bucket_master.marks or 0

                    bucket_list = []

                    question_correct_items = 0
                    question_total_items = 0

                    for bucket in buckets:

                        if bucket.drop_bucket_id != bucket_master_id:
                            continue

                        item_list = []

                        for item in bucket_items_grouped.get(
                            bucket.bucket_id,
                            [],
                        ):

                            question_total_items += 1

                            is_correct = (
                                item.drop_bucket_item_id
                                in participant_bucket_answers.get(
                                    bucket.bucket_id,
                                    {},
                                )
                            )

                            if is_correct:
                                question_correct_items += 1

                            item_list.append(
                                {
                                    "item_id": item.drop_bucket_item_id,
                                    "item_name": item.item_name,
                                    "is_correct": is_correct,
                                }
                            )

                        bucket_list.append(
                            {
                                "bucket_id": bucket.bucket_id,
                                "bucket_name": bucket.bucket_name,
                                "bucket_image": bucket.bucket_image,
                                "items": item_list,
                            }
                        )

                    question_status = "Wrong"

                    if question_correct_items > 0:

                        if question_correct_items == question_total_items:

                            question_status = "Correct"

                            attempt_total_correct += 1

                            attempt_total_score += (
                                bucket_master.marks or 0
                            )

                        else:

                            attempt_total_wrong += 1

                    else:

                        attempt_total_wrong += 1

                    attempt_bucket_list.append(
                        {
                            "drop_bucket_id": bucket_master_id,
                            "drop_bucket_question_title": bucket_master.drop_bucket_question_title,
                            "drop_bucket_question_description": bucket_master.drop_bucket_question_description,
                            "image_url": bucket_master.image_url,
                            "marks": bucket_master.marks,
                            "question_status": question_status,
                            "buckets": bucket_list,
                        }
                    )

            # ============================================================
            # PROCESS MATCH MAKING
            # ============================================================

            mm_attempted_ids = [
                row[0]
                for row in (
                    db.query(ParticipantMm.question_id)
                    .filter(
                        ParticipantMm.participant_id == participant_id,
                        ParticipantMm.attempt_id == attempt_id,
                    )
                    .distinct()
                    .all()
                )
            ]

            if mm_attempted_ids:

                participant_mm_answers = defaultdict(list)

                for row in (
                    db.query(ParticipantMm)
                    .filter(
                        ParticipantMm.participant_id == participant_id,
                        ParticipantMm.attempt_id == attempt_id,
                    )
                    .all()
                ):
                    participant_mm_answers[row.question_id].append(row)

                for mm_id in mm_attempted_ids:

                    mm_master = match_making_data.get(mm_id)

                    if not mm_master:
                        continue

                    attempt_total_questions += 1
                    attempt_total_marks += mm_master.marks or 0

                    answers = participant_mm_answers.get(mm_id, [])

                    question_status = "Correct"

                    if any(str(a.is_correct) != "1" for a in answers):
                        question_status = "Wrong"

                    if question_status == "Correct":
                        attempt_total_correct += 1
                        attempt_total_score += mm_master.marks or 0
                    else:
                        attempt_total_wrong += 1

                    left_list = []

                    for left in left_items.get(mm_id, []):

                        selected = next(
                            (
                                a.right_option
                                for a in answers
                                if str(a.left_option) == str(left.match_left_id)
                            ),
                            None,
                        )

                        left_list.append(
                            {
                                "match_left_id": left.match_left_id,
                                "match_left_text": left.match_left_text,
                                "selected_right": selected,
                            }
                        )

                    right_list = []

                    for right in right_items.get(mm_id, []):

                        right_list.append(
                            {
                                "match_right_id": right.match_right_id,
                                "match_right_text": right.match_right_text,
                            }
                        )

                    attempt_mm_list.append(
                        {
                            "match_making_id": mm_id,
                            "match_making_question_title": mm_master.match_making_question_title,
                            "match_making_question_description": mm_master.match_making_question_description,
                            "image_url": mm_master.image_url,
                            "marks": mm_master.marks,
                            "question_status": question_status,
                            "left_items": left_list,
                            "right_items": right_list,
                        }
                    )

            # ============================================================
            # STORE THIS ATTEMPT
            # ============================================================

            course_progress = (
                round(
                    (attempt_total_correct / attempt_total_questions) * 100,
                    2,
                )
                if attempt_total_questions > 0
                else 0
            )

            attempt_wise_result.append(
                {
                    "attempt_id": attempt_id,
                    "total_questions": attempt_total_questions,
                    "total_correct": attempt_total_correct,
                    "total_wrong": attempt_total_wrong,
                    "total_marks": float(attempt_total_marks),
                    "total_score": float(attempt_total_score),
                    "course_progress": course_progress,
                    "mcq_list": attempt_mcq_list,
                    "scq_list": attempt_scq_list,
                    "bucket_list": attempt_bucket_list,
                    "match_making_list": attempt_mm_list,
                }
            )

        # ============================================================
        # CALCULATE OVERALL TOTALS
        # ============================================================

        overall_total_questions = sum(
            x["total_questions"] for x in attempt_wise_result
        )

        overall_total_correct = sum(
            x["total_correct"] for x in attempt_wise_result
        )

        overall_total_wrong = sum(
            x["total_wrong"] for x in attempt_wise_result
        )

        overall_total_marks = sum(
            x["total_marks"] for x in attempt_wise_result
        )

        overall_total_score = sum(
            x["total_score"] for x in attempt_wise_result
        )

        overall_course_progress = (
            round(
                (overall_total_correct / overall_total_questions) * 100,
                2,
            )
            if overall_total_questions > 0
            else 0
        )

        return {
            "attempt_wise_result": attempt_wise_result,
            "overall_total_questions": overall_total_questions,
            "overall_total_correct": overall_total_correct,
            "overall_total_wrong": overall_total_wrong,
            "overall_total_marks": overall_total_marks,
            "overall_total_score": overall_total_score,
            "overall_course_progress": overall_course_progress,
        }

    @staticmethod
    def get_module_report(
        db: Session,
        participant_id: int,
    ):

        # ============================================================
        # PARTICIPANT PROFILE
        # ============================================================
        participant = UserRepository.get_participant_profile(
            db=db,
            participant_id=participant_id,
        )

        participant_profile = None

        if participant:
            participant_profile = {
                "participant_id": participant.participant_id,
                "participant_name": participant.participant_name,
                "enrollment_no": participant.enrollment_no,
                "mobile_no": participant.mobile_no,
                "email": participant.email,
                "state_name": participant.state_name,
                "district_name": participant.district_name,
                "centre_name": participant.centre_name,
                "location": participant.location,
                "image": participant.image,
            }

        # ============================================================
        # ATTEMPT WISE RESULT
        # ============================================================
        attempt_result = UserRepository.get_attempt_wise_result(
            db=db,
            participant_id=participant_id,
        )

        # ============================================================
        # ASSESSMENT SUMMARY
        # ============================================================
        assessment_summary = UserRepository.get_assessment_summary(
            db=db,
            participant_id=participant_id,
            attempt_wise_result=attempt_result["attempt_wise_result"],
        
        
        )


        print("========================")
        print("assessment_summary")
        print(assessment_summary)
        print("========================")
        # ============================================================
        # RETURN
        # ============================================================
        return {
            "participant_profile": participant_profile,
            "attempt_wise_result": attempt_result,
            "assessment_summary": assessment_summary,
        }



    @staticmethod
    def get_participant_key_details(
     db: Session,
     participant_id: int
):
     return (
        db.query(
            ParticipantMaster.participant_id,
            ParticipantMaster.username
        )
        .filter(
            ParticipantMaster.participant_id == participant_id
        )
        .first()
    )


    @staticmethod
    def get_time_spent(
     db: Session,
     participant_id: int
):
     return (
        db.query(
            ModuleMaster.module_id,
            ModuleMaster.module_name,
            func.sum(
                TimeSpentModuleLog.time_taken
            ).label("time_spent")
        )
        .join(
            ModuleMaster,
            ModuleMaster.module_id ==
            TimeSpentModuleLog.module_id
        )
        .filter(
            TimeSpentModuleLog.user_id ==
            participant_id
        )
        .group_by(
            ModuleMaster.module_id,
            ModuleMaster.module_name
        )
        .all()
    )



    def __init__(self, db: Session):
        self.db = db

    def get_module_by_id(self, module_id: int):
        return (
            self.db.query(ModuleMaster)
            .filter(ModuleMaster.module_id == module_id)
            .first()
        )

    def get_modules_by_parent_id(self, parent_id: int):
        return (
            self.db.query(ModuleMaster)
            .filter(ModuleMaster.parent_id == parent_id)
            .all()
        )

    def get_participant_module(
        self,
        participant_id: int,
        module_id: int
    ):
        return (
            self.db.query(ParticipantModule)
            .filter(
                ParticipantModule.participant_id == participant_id,
                ParticipantModule.module_id == module_id
            )
            .first()
        )

    def create_participant_module(
        self,
        participant_id: int,
        course_id: int,
        module_id: int
    ):
        participant_module = ParticipantModule(
            participant_id=participant_id,
            course_id=course_id,
            module_id=module_id,
            lock_status=0,
            status="1"
        )

        self.db.add(participant_module)
        return participant_module

    def delete_participant_module(
        self,
        participant_id: int,
        module_ids: list[int]
    ):
        return (
            self.db.query(ParticipantModule)
            .filter(
                ParticipantModule.participant_id == participant_id,
                ParticipantModule.module_id.in_(module_ids)
            )
            .delete(synchronize_session=False)
        )

    def commit(self):
        self.db.commit()

    def rollback(self):
        self.db.rollback()