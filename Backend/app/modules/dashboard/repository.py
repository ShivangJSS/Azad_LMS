from datetime import date

from sqlalchemy import and_, case, distinct, exists, func, or_, text
from sqlalchemy.orm import aliased, Session
from sqlalchemy.orm import Query

from app.modules.assessment.model import (
    AssessmentMaster,
    PostSessionAssessment,
)
from app.modules.batch.model import BatchMaster, BatchParticipant
from app.modules.course.model import CourseMaster
from app.modules.dashboard.Login_Log import LoginLog
from app.modules.dashboard.model import ParticipantModule
from app.modules.document.model import DocumentCategory, DocumentMaster

# This import is causing a ModuleNotFoundError. Assuming app.modules.users.model exists.
from app.modules.centres.model import CentreMaster
from app.modules.master.district.model import DistrictMaster
from app.modules.master.state.model import StateMaster
from app.modules.module.model import ModuleMaster
from app.modules.users.model import (
    ParticipantDb,
    ParticipantMaster,
    ParticipantMcq,
    ParticipantMm,
    ParticipantScq,
)

class DashboardRepository:

    @staticmethod
    def get_total_centres(
        db: Session,
        state_id=None,
        district_id=None,
        centre_id=None,
    ):
        query = (
            db.query(func.count(CentreMaster.centre_id))
            .filter(CentreMaster.deleted_at.is_(None))
        )

        if state_id:
            query = query.filter(CentreMaster.state_id == state_id)

        if district_id:
            query = query.filter(CentreMaster.district_id == district_id)

        if centre_id:
            query = query.filter(CentreMaster.centre_id == centre_id)

        return query.scalar() or 0


    @staticmethod
    def _apply_date_filter(
        query: Query,
        model,
        from_date=None,
        to_date=None,
    ):
        if from_date:
            query = query.filter(model.created_at >= from_date)

        if to_date:
            query = query.filter(model.created_at <= to_date)

        return query

    @staticmethod
    def _apply_centre_filter(
        query: Query,
        centre_id=None,
    ):
        if centre_id:
            query = (
                query.join(
                    BatchParticipant,
                    BatchParticipant.participant_id
                    == ParticipantMaster.participant_id,
                )
                .join(
                    BatchMaster,
                    BatchMaster.batch_id
                    == BatchParticipant.batch_id,
                )
                .filter(
                    BatchMaster.deleted_at.is_(None),
                    BatchParticipant.deleted_at.is_(None),
                    BatchMaster.centre_id == centre_id,
                )
            )

        return query

    @staticmethod
    def get_total_participants(
        db: Session,
        state_id=None,
        district_id=None,
        centre_id=None,
        from_date=None,
        to_date=None,
    ):

        query = (
            db.query(func.count(ParticipantMaster.participant_id))
            .filter(
                ParticipantMaster.deleted_at.is_(None)
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

        query = DashboardRepository._apply_centre_filter(
            query,
            centre_id,
        )

        query = DashboardRepository._apply_date_filter(
            query,
            ParticipantMaster,
            from_date,
            to_date,
        )

        return query.scalar() or 0

    @staticmethod
    def get_active_participants(
        db: Session,
        state_id=None,
        district_id=None,
        centre_id=None,
        from_date=None,
        to_date=None,
    ):

        query = (
            db.query(func.count(ParticipantMaster.participant_id))
            .filter(
                ParticipantMaster.deleted_at.is_(None),
                ParticipantMaster.status == "1",
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

        query = DashboardRepository._apply_centre_filter(
            query,
            centre_id,
        )

        query = DashboardRepository._apply_date_filter(
            query,
            ParticipantMaster,
            from_date,
            to_date,
        )

        return query.scalar() or 0

    @staticmethod
    def get_total_courses(db: Session):
     return (
        db.query(func.count(CourseMaster.course_id))
        .filter(
            CourseMaster.deleted_at.is_(None),
            CourseMaster.parent_id == CourseMaster.course_id,
        )
        .scalar()
        or 0
    )

    @staticmethod
    def get_total_modules(db: Session):
     return (
        db.query(func.count(ModuleMaster.module_id))
        .filter(
            ModuleMaster.deleted_at.is_(None),
            ModuleMaster.parent_id == ModuleMaster.module_id,
        )
        .scalar()
        or 0
    )

    @staticmethod
    def get_total_batches(
     db: Session,
     state_id=None,
     district_id=None,
     centre_id=None,
):

     query = (
        db.query(func.count(BatchMaster.batch_id))
        .join(
            CentreMaster,
            BatchMaster.centre_id == CentreMaster.centre_id,
        )
        .filter(
            BatchMaster.deleted_at.is_(None),
            CentreMaster.deleted_at.is_(None),
        )
    )

     if state_id:
        query = query.filter(CentreMaster.state_id == state_id)

     if district_id:
        query = query.filter(CentreMaster.district_id == district_id)


     if centre_id:
        query = query.filter(CentreMaster.centre_id == centre_id)

     return query.scalar() or 0



    @staticmethod
    def get_total_documents(db: Session):
     return (
        db.query(func.count(DocumentMaster.doc_id))
        .filter(
            DocumentMaster.parent_id == DocumentMaster.doc_id
        )
        .scalar()
        or 0
    )

    @staticmethod
    def get_total_assessments(db: Session):
     return (
        db.query(func.count(AssessmentMaster.assessment_id))
        .filter(
            AssessmentMaster.parent_id == AssessmentMaster.assessment_id
        )
        .scalar()
        or 0
    )


    @staticmethod
    def get_completion_rate(db: Session):
     total_assigned = (
        db.query(func.count(ParticipantModule.participant_module_id))
        .scalar()
        or 0
    )

     total_completed = (
        db.query(func.count(ParticipantModule.participant_module_id))
        .filter(ParticipantModule.status == "1")
        .scalar()
        or 0
    )

     if total_assigned == 0:
        return 0

     return round((total_completed / total_assigned) * 100)

    @staticmethod
    def get_state_wise_participants(
     db: Session,
     state_id=None,
     district_id=None,
     centre_id=None,
     from_date=None,
     to_date=None,
):
     query = (
      db.query(
        StateMaster.state_lgd_code.label("state_id"),
        StateMaster.state_name,
        func.count(ParticipantMaster.participant_id).label("total"),
    )
     .select_from(ParticipantMaster)
     .join(
        StateMaster,
        StateMaster.state_lgd_code == ParticipantMaster.state_id,
    )
     .filter(ParticipantMaster.deleted_at.is_(None))
)
     if state_id:
       query = query.filter(ParticipantMaster.state_id == state_id)

     if district_id:
       query = query.filter(ParticipantMaster.district_id == district_id)  

     query = DashboardRepository._apply_centre_filter(
     query,
     centre_id,
) 


     query = DashboardRepository._apply_date_filter(
      query,
      ParticipantMaster,
      from_date,
      to_date,
)

     query = query.group_by(
       StateMaster.state_lgd_code,
       StateMaster.state_name,
)

     query = query.order_by(
       func.count(ParticipantMaster.participant_id).desc()

)

     return query.all()



    @staticmethod
    def get_state_wise_centres(
     db: Session,
):
     query = (
        db.query(
            StateMaster.state_lgd_code.label("state_id"),
            StateMaster.state_name,
            func.count(CentreMaster.centre_id).label("total"),
        )
        .select_from(CentreMaster)
        .join(
            StateMaster,
            StateMaster.state_lgd_code == CentreMaster.state_id,
        )
        .filter(
            CentreMaster.deleted_at.is_(None),
        )
        .group_by(
            StateMaster.state_lgd_code,
            StateMaster.state_name,
        )
        .order_by(
            func.count(CentreMaster.centre_id).desc()
        )
    )

     return query.all()



    @staticmethod
    def get_gender_distribution(
     db: Session,
     state_id: int | None = None,
     district_id: int | None = None,
     centre_id: int | None = None,
     from_date: date | None = None,
     to_date: date | None = None,
):
     query = (
        db.query(
            ParticipantMaster.gender,
            func.count(ParticipantMaster.participant_id).label("total"),
        )
        .filter(
            ParticipantMaster.deleted_at.is_(None),
        )
    )

     if state_id:
        query = query.filter(ParticipantMaster.state_id == state_id)

     if district_id:
        query = query.filter(ParticipantMaster.district_id == district_id)

     query = DashboardRepository._apply_centre_filter(
       query,
       centre_id,
)

     query = DashboardRepository._apply_date_filter(
        query=query,
        model=ParticipantMaster,
        from_date=from_date,
        to_date=to_date,
    )

     return (
        query.group_by(ParticipantMaster.gender)
        .all()
    )


    @staticmethod
    def get_monthly_login_trend(
     db: Session,
     state_id: int | None = None,
     clicked_value=None,
     district_id: int | None = None,
     centre_id: int | None = None,
     from_date=None,
     to_date=None,
):
     query = (
        db.query(
            func.to_char(LoginLog.login_time, "YYYY-MM").label("month"),
            func.count().label("total"),
        )
        .join(
            ParticipantMaster,
            ParticipantMaster.participant_id == LoginLog.user_id,
        )
        .filter(
            ParticipantMaster.deleted_at.is_(None),
            LoginLog.login_time >= func.now() - text("INTERVAL '12 months'"),
        )
    )

     if clicked_value:
        query = query.filter(
          func.to_char(LoginLog.login_time, "Mon YYYY") == clicked_value
    )

      
     if state_id:
        query = query.filter(
            ParticipantMaster.state_id == state_id
        )

     if district_id:
        query = query.filter(
            ParticipantMaster.district_id == district_id
        )

     query = DashboardRepository._apply_centre_filter(
        query,
        centre_id,
    )

     query = DashboardRepository._apply_date_filter(
        query,
        ParticipantMaster,
        from_date,
        to_date,
    )

     return (
        query.group_by(
            func.to_char(LoginLog.login_time, "YYYY-MM")
        )
        .order_by(
            func.to_char(LoginLog.login_time, "YYYY-MM")
        )
        .all()
    )



    

    @staticmethod
    def get_age_group_distribution(
     db: Session,
     state_id=None,
     district_id=None,
     centre_id=None,
     from_date=None,
     to_date=None,
):
     age_group = case(
        (ParticipantMaster.age.between(18, 25), "18-25"),
        (ParticipantMaster.age.between(26, 35), "26-35"),
        (ParticipantMaster.age.between(36, 45), "36-45"),
        (ParticipantMaster.age.between(46, 55), "46-55"),
        (ParticipantMaster.age > 55, "55+"),
        else_="Under 18",
    ).label("age_group")

     query = (
        db.query(
            age_group,
            func.count(ParticipantMaster.participant_id).label("total"),
        )
        .filter(
            ParticipantMaster.deleted_at.is_(None),
            ParticipantMaster.age.is_not(None),
            ParticipantMaster.age > 0,
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

     query = DashboardRepository._apply_centre_filter(
        query,
        centre_id,
    )

     query = DashboardRepository._apply_date_filter(
        query,
        ParticipantMaster,
        from_date,
        to_date,
    )

     query = query.group_by(age_group)

     return query.all()


    @staticmethod
    def get_document_type_distribution(db: Session):
     return (
        db.query(
            DocumentCategory.doc_category_name.label("doc_type"),
            func.count(DocumentMaster.doc_id).label("total"),
        )
        .select_from(DocumentMaster)
        .join(
            DocumentCategory,
            DocumentCategory.doc_category_id == DocumentMaster.doc_category_id,
        )
        .filter(
            DocumentMaster.parent_id == DocumentMaster.doc_id,
            DocumentMaster.doc_category_id.is_not(None),
        )
        .group_by(DocumentCategory.doc_category_name)
        .order_by(func.count(DocumentMaster.doc_id).desc())
        .all()
    )

    @staticmethod
    def get_district_wise_participants(
     db: Session,
     state_id: int | None = None,
     district_id: int | None = None,
     centre_id: int | None = None,
     from_date: date | None = None,
     to_date: date | None = None,
):
     query = (
        db.query(
            DistrictMaster.district_name,
            func.count(ParticipantMaster.participant_id).label("total"),
        )
        .select_from(ParticipantMaster)
        .join(
            DistrictMaster,
            DistrictMaster.district_lgd_code == ParticipantMaster.district_id,
        )
        .filter(
            ParticipantMaster.deleted_at.is_(None),
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

     query = DashboardRepository._apply_centre_filter(
        query,
        centre_id,
    )

     query = DashboardRepository._apply_date_filter(
        query,
        ParticipantMaster,
        from_date,
        to_date,
    )

     return (
        query.group_by(
            DistrictMaster.district_name,
        )
        .order_by(
            func.count(ParticipantMaster.participant_id).desc(),
        )
        .limit(10)
        .all()
    )


    @staticmethod
    def get_module_lock_status(
     db: Session,
     state_id: int | None = None,
     district_id: int | None = None,
     centre_id: int | None = None,
     from_date: date | None = None,
     to_date: date | None = None,
):
     query = db.query(
        ParticipantModule.lock_status.label("lock_status"),
        func.count().label("total"),
    ).select_from(ParticipantModule)

     if state_id or district_id or centre_id or from_date or to_date:
        query = (
            query.join(
                ParticipantMaster,
                ParticipantMaster.participant_id == ParticipantModule.participant_id,
            )
            .filter(ParticipantMaster.deleted_at.is_(None))
        )

        if state_id:
            query = query.filter(ParticipantMaster.state_id == state_id)

        if district_id:
            query = query.filter(ParticipantMaster.district_id == district_id)

        query = DashboardRepository._apply_centre_filter(
            query,
            centre_id,
        )

        query = DashboardRepository._apply_date_filter(
            query,
            ParticipantMaster,
            from_date,
            to_date,
        )

     return (
        query.group_by(
            ParticipantModule.lock_status,
        )
        .all()
    )


    @staticmethod
  
    def get_module_wise_performance_details(
     db: Session,
     clicked_value=None,
     state_id=None,
     district_id=None,
     centre_id=None,
     from_date=None,
     to_date=None,
):
     ChildModule = aliased(ModuleMaster)
     ParentModule = aliased(ModuleMaster)

     query = (
        db.query(
            ParentModule.module_name.label("module_name"),
            func.count(
                distinct(ParticipantModule.participant_id)
            ).label("total"),
        )
        .select_from(ParticipantModule)
        .join(
            ChildModule,
            ChildModule.module_id == ParticipantModule.module_id,
        )
        .join(
            ParentModule,
            and_(
                ParentModule.module_id == ChildModule.parent_id,
                ParentModule.parent_id == ParentModule.module_id,
                ParentModule.deleted_at.is_(None),
            ),
        )
    ) 
     

# ---------------------------------------------------
# Module must have an active post-session assessment
# ---------------------------------------------------
     query = query.filter(
       exists().where(
        and_(
            PostSessionAssessment.module_id == ParticipantModule.module_id,
            PostSessionAssessment.is_active == 1,
            PostSessionAssessment.deleted_at.is_(None),
        )
    )
)

# ---------------------------------------------------
# Participant must have attempted the assessment
# ---------------------------------------------------
     query = query.filter(
      or_(

        exists().where(
            and_(
                ParticipantMcq.participant_id == ParticipantModule.participant_id,
                ParticipantMcq.module_id == ParticipantModule.module_id,
            )
        ),

        exists().where(
            and_(
                ParticipantScq.participant_id == ParticipantModule.participant_id,
                ParticipantScq.module_id == ParticipantModule.module_id,
            )
        ),

        exists().where(
            and_(
                ParticipantDb.participant_id == ParticipantModule.participant_id,
                ParticipantDb.module_id == ParticipantModule.module_id,
            )
        ),

        exists().where(
            and_(
                ParticipantMm.participant_id == ParticipantModule.participant_id,
                ParticipantMm.module_id == ParticipantModule.module_id,
            )
        ),

    )
)



     if state_id or district_id or centre_id or from_date or to_date:

      query = (
        query.join(
            ParticipantMaster,
            ParticipantMaster.participant_id == ParticipantModule.participant_id,
        )
        .filter(
            ParticipantMaster.deleted_at.is_(None)
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

     query = DashboardRepository._apply_centre_filter(
        query,
        centre_id,
    )

     query = DashboardRepository._apply_date_filter(
        query,
        ParticipantMaster,
        from_date,
        to_date,
    )

     query = (
        query.group_by(
            ParentModule.module_id,
            ParentModule.module_name,
        )
        .order_by(
            func.count(
                distinct(ParticipantModule.participant_id)
            ).desc()
        )
        .limit(10)
    )

     return query.all()

    @staticmethod
    def get_state_wise_participant_details(
      db: Session,
      clicked_value: int | None = None,
      state_id: int | None = None,
      district_id: int | None = None,
      centre_id: int | None = None,
      from_date: date | None = None,
      to_date: date | None = None,
):
      query = (
        db.query(
            ParticipantMaster.participant_id,
            ParticipantMaster.participant_name,
            ParticipantMaster.mobile_no,
            ParticipantMaster.email,
            ParticipantMaster.enrollment_no,
            ParticipantMaster.gender,
            ParticipantMaster.age,
            StateMaster.state_name,
            DistrictMaster.district_name,
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
            ParticipantMaster.deleted_at.is_(None)
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

      query = DashboardRepository._apply_centre_filter(
        query,
        centre_id,
    )

      query = DashboardRepository._apply_date_filter(
        query,
        ParticipantMaster,
        from_date,
        to_date,
    )

      if clicked_value:
        query = query.filter(
            ParticipantMaster.state_id == clicked_value
        )

      return (
        query.order_by(
            ParticipantMaster.participant_name
        ).all()
    )



    @staticmethod
    def get_district_wise_participant_details(
     db: Session,
     clicked_value: str | None = None,
     state_id: int | None = None,
     district_id: int | None = None,
     centre_id: int | None = None,
     from_date: date | None = None,
     to_date: date | None = None,
):
     query = (
        db.query(
            ParticipantMaster.participant_id,
            ParticipantMaster.participant_name,
            ParticipantMaster.mobile_no,
            ParticipantMaster.email,
            ParticipantMaster.enrollment_no,
            ParticipantMaster.gender,
            ParticipantMaster.age,
            StateMaster.state_name,
            DistrictMaster.district_name,
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
            ParticipantMaster.deleted_at.is_(None)
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

     query = DashboardRepository._apply_centre_filter(query, centre_id)

     query = DashboardRepository._apply_date_filter(
        query,
        ParticipantMaster,
        from_date,
        to_date,
    )

     if clicked_value:
        query = query.filter(
            DistrictMaster.district_name == clicked_value
        )

     return query.order_by(
        ParticipantMaster.participant_name
    ).all()


    @staticmethod
    def get_gender_distribution_details(
     db: Session,
     clicked_value: str | None = None,
     state_id: int | None = None,
     district_id: int | None = None,
     centre_id: int | None = None,
     from_date: date | None = None,
     to_date: date | None = None,
):
     query = (
        db.query(
            ParticipantMaster.participant_id,
            ParticipantMaster.participant_name,
            ParticipantMaster.mobile_no,
            ParticipantMaster.email,
            ParticipantMaster.enrollment_no,
            ParticipantMaster.gender,
            ParticipantMaster.age,
            StateMaster.state_name,
            DistrictMaster.district_name,
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
            ParticipantMaster.deleted_at.is_(None)
        )
    )

     if state_id:
        query = query.filter(ParticipantMaster.state_id == state_id)

     if district_id:
        query = query.filter(ParticipantMaster.district_id == district_id)

     query = DashboardRepository._apply_centre_filter(query, centre_id)

     query = DashboardRepository._apply_date_filter(
        query,
        ParticipantMaster,
        from_date,
        to_date,
    )

     if clicked_value:
        query = query.filter(
            ParticipantMaster.gender == clicked_value
        )

     return query.order_by(
        ParticipantMaster.participant_name
    ).all()



    @staticmethod
    def get_age_group_distribution_details(
     db: Session,
     clicked_value: str | None = None,
     state_id: int | None = None,
     district_id: int | None = None,
     centre_id: int | None = None,
     from_date: date | None = None,
     to_date: date | None = None,
):
     query = (
        db.query(
            ParticipantMaster.participant_id,
            ParticipantMaster.participant_name,
            ParticipantMaster.mobile_no,
            ParticipantMaster.email,
            ParticipantMaster.enrollment_no,
            ParticipantMaster.gender,
            ParticipantMaster.age,
            StateMaster.state_name,
            DistrictMaster.district_name,
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
            ParticipantMaster.deleted_at.is_(None),
            ParticipantMaster.age.is_not(None),
            ParticipantMaster.age > 0,
        )
    )

     if state_id:
        query = query.filter(ParticipantMaster.state_id == state_id)

     if district_id:
        query = query.filter(ParticipantMaster.district_id == district_id)

     query = DashboardRepository._apply_centre_filter(query, centre_id)

     query = DashboardRepository._apply_date_filter(
        query,
        ParticipantMaster,
        from_date,
        to_date,
    )

     if clicked_value == "Under 18":
        query = query.filter(ParticipantMaster.age.between(0, 17))
     elif clicked_value == "18-25":
        query = query.filter(ParticipantMaster.age.between(18, 25))
     elif clicked_value == "26-35":
        query = query.filter(ParticipantMaster.age.between(26, 35))
     elif clicked_value == "36-45":
        query = query.filter(ParticipantMaster.age.between(36, 45))
     elif clicked_value == "46-55":
        query = query.filter(ParticipantMaster.age.between(46, 55))
     elif clicked_value == "55+":
        query = query.filter(ParticipantMaster.age >= 56)

     return query.order_by(
        ParticipantMaster.participant_name
    ).all()



    @staticmethod
    def get_state_wise_centre_details(
     db: Session,
     clicked_value: str | None = None,
     state_id: int | None = None,
     district_id: int | None = None,
     centre_id: int | None = None,
     from_date: date | None = None,
     to_date: date | None = None,
):
     query = (
        db.query(
            CentreMaster.centre_name,
            CentreMaster.address,
            StateMaster.state_name,
            DistrictMaster.district_name,
            CentreMaster.status,
        )
        .outerjoin(
            StateMaster,
            StateMaster.state_lgd_code == CentreMaster.state_id,
        )
        .outerjoin(
            DistrictMaster,
            DistrictMaster.district_lgd_code == CentreMaster.district_id,
        )
        .filter(
            CentreMaster.deleted_at.is_(None)
        )
    )

     if state_id:
        query = query.filter(
            CentreMaster.state_id == state_id
        )

     if district_id:
        query = query.filter(
            CentreMaster.district_id == district_id
        )

     if centre_id:
        query = query.filter(
            CentreMaster.centre_id == centre_id
        )

     if clicked_value:
        query = query.filter(
            StateMaster.state_name == clicked_value
        )

    # Apply date filter only if CentreMaster has a created_at column
     if from_date or to_date:
        query = DashboardRepository._apply_date_filter(
            query,
            CentreMaster,
            from_date,
            to_date,
        )

     return (
        query.order_by(
            CentreMaster.centre_name
        )
        .all()
    )



    @staticmethod
    def get_document_type_distribution_details(
     db: Session,
):
     return (
        db.query(
            DocumentMaster.doc_title,
            DocumentCategory.doc_category_name.label("doc_type"),
            DocumentMaster.doc_type.label("format"),
            ModuleMaster.module_name,
            DocumentMaster.status,
        )
        .select_from(DocumentMaster)
        .outerjoin(
            DocumentCategory,
            DocumentCategory.doc_category_id == DocumentMaster.doc_category_id,
        )
        .outerjoin(
            ModuleMaster,
            ModuleMaster.module_id == DocumentMaster.module_id,
        )
        .filter(
            DocumentMaster.parent_id == DocumentMaster.doc_id,
        )
        .order_by(
            DocumentCategory.doc_category_name,
            DocumentMaster.doc_title,
        )
        .all()
    )


    @staticmethod
    def get_monthly_login_details(
     db: Session,
     clicked_value: str | None = None,
     state_id: int | None = None,
     district_id: int | None = None,
     centre_id: int | None = None,
     from_date: date | None = None,
     to_date: date | None = None,
):
     query = (
        db.query(
            ParticipantMaster.participant_name,
            ParticipantMaster.mobile_no,
            LoginLog.login_time,
            LoginLog.app_version,
        )
        .select_from(LoginLog)
        .join(
            ParticipantMaster,
            ParticipantMaster.participant_id == LoginLog.user_id,
        )
        .filter(
            ParticipantMaster.deleted_at.is_(None),
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

     query = DashboardRepository._apply_centre_filter(
        query,
        centre_id,
    )

     query = DashboardRepository._apply_date_filter(
        query,
        ParticipantMaster,
        from_date,
        to_date,
    )

     if clicked_value:
        query = query.filter(
            func.to_char(LoginLog.login_time, "YYYY-MM") == clicked_value
        )

     return query.order_by(
        LoginLog.login_time.desc()
    ).all()