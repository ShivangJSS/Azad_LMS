from datetime import date

from sqlalchemy.orm import Session

from app.modules.dashboard.repository import DashboardRepository


class DashboardService:

    @staticmethod
    def get_dashboard_summary(
        db: Session,
        state_id=None,
        district_id=None,
        centre_id=None,
        from_date=None,
        to_date=None,
    ):

        total_centres = DashboardRepository.get_total_centres(
            db=db,
            state_id=state_id,
            district_id=district_id,
            centre_id=centre_id,
        )

        total_participants = DashboardRepository.get_total_participants(
            db=db,
            state_id=state_id,
            district_id=district_id,
            centre_id=centre_id,
            from_date=from_date,
            to_date=to_date,
        )

        active_participants = DashboardRepository.get_active_participants(
            db=db,
            state_id=state_id,
            district_id=district_id,
            centre_id=centre_id,
            from_date=from_date,
            to_date=to_date,
        )

        total_courses = DashboardRepository.get_total_courses(db)

        total_modules = DashboardRepository.get_total_modules(db)

        total_batches = DashboardRepository.get_total_batches(
            db=db,
            state_id=state_id,
            district_id=district_id,
            centre_id=centre_id,
        )

        gender_distribution = DashboardRepository.get_gender_distribution(
           db=db,
           state_id=state_id,
           district_id=district_id,
           centre_id=centre_id,
           from_date=from_date,
           to_date=to_date,
)




        total_documents = DashboardRepository.get_total_documents(db)

        total_assessments = DashboardRepository.get_total_assessments(db)

        completion_rate = (
            round(
                (active_participants / total_participants) * 100,
                2,
            )
            if total_participants
            else 0
        )



        monthly_login_trend = DashboardRepository.get_monthly_login_trend(
            db=db,
            state_id=state_id,
            district_id=district_id,
            centre_id=centre_id,
            from_date=from_date,
            to_date=to_date,
)


        age_group_distribution = DashboardRepository.get_age_group_distribution(
          db=db,
          state_id=state_id,
          district_id=district_id,
          centre_id=centre_id,
          from_date=from_date,
          to_date=to_date,
)

            
        # -----------------------------
        # State-wise Participants
        # -----------------------------
        state_wise_participants = (
            DashboardRepository.get_state_wise_participants(
                db=db,
                state_id=state_id,
                district_id=district_id,
                centre_id=centre_id,
                from_date=from_date,
                to_date=to_date,
            )


        )


        district_wise_participants = DashboardRepository.get_district_wise_participants(
                  db=db,
                  state_id=state_id,
                  district_id=district_id,
                  centre_id=centre_id,
                  from_date=from_date,
                  to_date=to_date,
)

        module_lock_status = DashboardRepository.get_module_lock_status(
                db=db,
                state_id=state_id,
                district_id=district_id,
                centre_id=centre_id,
                from_date=from_date,
                to_date=to_date,
)


        module_wise_performance = DashboardRepository.get_module_wise_performance_details(
                         db=db,
                         state_id=state_id,
                         district_id=district_id,
                         centre_id=centre_id,
                         from_date=from_date,
                         to_date=to_date,
)
        document_type_distribution = DashboardRepository.get_document_type_distribution(db)

        # -----------------------------
        # State-wise Centres
        # -----------------------------
        state_wise_centres = (
            DashboardRepository.get_state_wise_centres(
                db=db,
            )
        )

        return {
            "summary": {
                "total_centres": total_centres,
                "total_participants": total_participants,
                "active_participants": active_participants,
                "total_courses": total_courses,
                "total_modules": total_modules,
                "total_batches": total_batches,
                "total_documents": total_documents,
                "total_assessments": total_assessments,
                "completion_rate": completion_rate,
               
            },
            "state_wise_participants": [
                {
                    "state_id": row.state_id,
                    "state_name": row.state_name,
                    "total": row.total,
                }
                for row in state_wise_participants
            ],
            "state_wise_centres": [
                {
                    "state_id": row.state_id,
                    "state_name": row.state_name,
                    "total": row.total,
                }
                for row in state_wise_centres
            ],

            "gender_distribution": [
               {
                  "gender": row.gender,
                  "total": row.total,
                }
                for row in gender_distribution
            ],

            "monthly_login_trend": [
                {
                   "month": row.month,
                   "total": row.total,
                }
                for row in monthly_login_trend
            ],



            "age_group_distribution": [
                {
                "age_group": row.age_group,
                "total": row.total,
                }
                for row in age_group_distribution
            ],

            "document_type_distribution": [
                {
                "doc_type": row.doc_type,
                "total": row.total,
                }
                 for row in document_type_distribution
            ],


            "district_wise_participants": [        # ✅ Add it here
                {
                     "district_name": row.district_name,
                    "total": row.total,
                }
                for row in district_wise_participants
            ],
            
            "module_lock_status": [
               {
                 "lock_status": row.lock_status,
                 "total": row.total,
                }
                for row in module_lock_status
            ],


             "module_wise_performance": [
                 {
                     "module_name": row.module_name,
                     "total": row.total,
                  }
                  for row in module_wise_performance
                 ],

        }

    @staticmethod
    def get_state_wise_participants(
      db: Session,
      clicked_value=None,
      state_id=None,
      district_id=None,
      centre_id=None,
      from_date=None,
      to_date=None,
):
      return DashboardRepository.get_state_wise_participant_details(
        db=db,
        clicked_value=clicked_value,
        state_id=state_id,
        district_id=district_id,
        centre_id=centre_id,
        from_date=from_date,
        to_date=to_date,
    )



    @staticmethod
    def get_state_wise_participants(
        db: Session,
        clicked_value: int | None = None,
        state_id: int | None = None,
        district_id: int | None = None,
        centre_id: int | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
    ):
        return DashboardRepository.get_state_wise_participant_details(
            db=db,
            clicked_value=clicked_value,
            state_id=state_id,
            district_id=district_id,
            centre_id=centre_id,
            from_date=from_date,
            to_date=to_date,
        )

    @staticmethod
    def get_district_wise_participants(
        db: Session,
        clicked_value: str | None = None,
        state_id: int | None = None,
        district_id: int | None = None,
        centre_id: int | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
    ):
        return DashboardRepository.get_district_wise_participant_details(
            db=db,
            clicked_value=clicked_value,
            state_id=state_id,
            district_id=district_id,
            centre_id=centre_id,
            from_date=from_date,
            to_date=to_date,
        )

    @staticmethod
    def get_gender_distribution(
        db: Session,
        clicked_value: str | None = None,
        state_id: int | None = None,
        district_id: int | None = None,
        centre_id: int | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
    ):
        return DashboardRepository.get_gender_distribution_details(
            db=db,
            clicked_value=clicked_value,
            state_id=state_id,
            district_id=district_id,
            centre_id=centre_id,
            from_date=from_date,
            to_date=to_date,
        )

    @staticmethod
    def get_age_group_distribution(
        db: Session,
        clicked_value: str | None = None,
        state_id: int | None = None,
        district_id: int | None = None,
        centre_id: int | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
    ):
        return DashboardRepository.get_age_group_distribution_details(
            db=db,
            clicked_value=clicked_value,
            state_id=state_id,
            district_id=district_id,
            centre_id=centre_id,
            from_date=from_date,
            to_date=to_date,
        )

    @staticmethod
    def get_state_wise_centres(
     db,
     clicked_value=None,
     state_id=None,
     district_id=None,
     centre_id=None,
     from_date=None,
     to_date=None,
):
        return DashboardRepository.get_state_wise_centre_details(
            db=db,
            clicked_value=clicked_value,
            state_id=state_id,
            district_id=district_id,
            centre_id=centre_id,
            from_date=from_date,
            to_date=to_date
        )

    @staticmethod
    def get_module_wise_performance_details(
        db: Session,
        clicked_value: str | None = None,
        state_id: int | None = None,
        district_id: int | None = None,
        centre_id: int | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
    ):
        return DashboardRepository.get_module_wise_performance_details(
            db=db,
            clicked_value=clicked_value,
            state_id=state_id,
            district_id=district_id,
            centre_id=centre_id,
            from_date=from_date,
            to_date=to_date,
        )

    @staticmethod
    def get_document_type_distribution(
        db: Session,
    ):
        return DashboardRepository.get_document_type_distribution_details(
            db=db,
        )

    @staticmethod
    def get_monthly_logins(
        db: Session,
        clicked_value: str | None = None,
        state_id: int | None = None,
        district_id: int | None = None,
        centre_id: int | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
    ):
        return DashboardRepository.get_monthly_login_trend(
            db=db,
            clicked_value=clicked_value,
            state_id=state_id,
            district_id=district_id,
            centre_id=centre_id,
            from_date=from_date,
            to_date=to_date,
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
      return DashboardRepository.get_monthly_login_details(
        db=db,
        clicked_value=clicked_value,
        state_id=state_id,
        district_id=district_id,
        centre_id=centre_id,
        from_date=from_date,
        to_date=to_date,
    )