from sqlalchemy import func, or_
from sqlalchemy.orm import Session

# from Backend.app.database.database import db
from app.modules.document.model import TopicMaster
from app.modules.module.model import ModuleMaster


class TopicRepository:

    # =========================================================
    # GET TOPICS
    # =========================================================

    @staticmethod
    def get_topics(
        db: Session,
        language_id: int,
        search: str | None,
        skip: int,
        limit: int,
    ):
        """
        Return ONLY topics belonging to the requested language.

        Example:
            English -> language_id = 1
            Hindi   -> language_id = 2
            Bangla  -> language_id = 3
            Tamil   -> language_id = 4
        """

        print(
            f"BACKEND REPO: Fetching topics for language_id={language_id}"
        )

        # =====================================================
        # MAIN QUERY
        # =====================================================

        query = (
        db.query(
            TopicMaster.topic_id,
            TopicMaster.topic_name,
            TopicMaster.language_id,
            TopicMaster.is_active.label("status"),
            ModuleMaster.module_name,
        )
        .join(
            ModuleMaster,
            (
                ModuleMaster.language_id == TopicMaster.language_id
            )
            & (
                ModuleMaster.deleted_at.is_(None)
            )
            & (
                or_(
                    ModuleMaster.module_id == TopicMaster.module_id,
                    ModuleMaster.parent_id == TopicMaster.module_id,
                )
            ),
        )
        .filter(
            TopicMaster.language_id == language_id,
        )
)
        # =====================================================
        # SEARCH
        # =====================================================

        if search:
            query = query.filter(
                TopicMaster.topic_name.ilike(f"%{search}%")
            )

        # =====================================================
        # COUNT QUERY
        # =====================================================

        count_query = (
            db.query(
                func.count(
                    func.distinct(TopicMaster.topic_id)
                )
            )
            .join(
                ModuleMaster,
                (
                    ModuleMaster.language_id == TopicMaster.language_id
                )
                & (
                    ModuleMaster.deleted_at.is_(None)
                )
                & (
                    or_(
                        ModuleMaster.module_id == TopicMaster.module_id,
                        ModuleMaster.parent_id == TopicMaster.module_id,
                    )
                ),
            )
            .filter(
                TopicMaster.language_id == language_id,
            )
        )
        if search:
            count_query = count_query.filter(
                TopicMaster.topic_name.ilike(f"%{search}%")
            )

        total = count_query.scalar() or 0

        # =====================================================
        # FETCH ROWS
        # =====================================================

        print(
            "BACKEND REPO: Query built, about to execute..."
        )

        rows = (
            query
            .order_by(TopicMaster.topic_id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        print(
            f"BACKEND REPO: Raw rows count={len(rows)}"
        )

        # =====================================================
        # BUILD RESPONSE
        # =====================================================

        records = [
            {
                "topic_id": row.topic_id,
                "topic_name": row.topic_name,
                "module_name": row.module_name,
                "language_id": row.language_id,
                "status": row.status,
            }
            for row in rows
        ]

        print(
            f"BACKEND REPO: Returning {len(records)} records "
            f"with total={total} for language_id={language_id}"
        )

        if records:
            print(
                "BACKEND REPO: First record language_id="
                f"{records[0]['language_id']}"
            )

        return records, total

    # =========================================================
    # GET TOPIC BY ID
    # =========================================================

    @staticmethod
    def get_topic_by_id(
        db: Session,
        topic_id: int,
    ):
        parent_id = (
            db.query(TopicMaster.parent_id)
            .filter(
                TopicMaster.topic_id == topic_id
            )
            .scalar()
        )

        if not parent_id:
            return None

        topics = (
            db.query(
                TopicMaster.topic_id,
                TopicMaster.module_id,
                TopicMaster.parent_id,
                TopicMaster.topic_name,
                TopicMaster.language_id,
                TopicMaster.is_active.label("status"),
                ModuleMaster.module_name,
            )
            .join(
                ModuleMaster,
                ModuleMaster.module_id == TopicMaster.module_id,
            )
            .filter(
                TopicMaster.parent_id == parent_id,
                
            )
            .order_by(
                TopicMaster.language_id.asc()
            )
            .all()
        )

        return topics

    # =========================================================
    # DELETE TOPIC
    # =========================================================

    @staticmethod
    def delete_topic(
        db: Session,
        topic_id: int,
    ):
        topic = (
            db.query(TopicMaster)
            .filter(
                TopicMaster.topic_id == topic_id
            )
            .first()
        )

        if not topic:
            return False

        db.query(TopicMaster).filter(
            TopicMaster.parent_id == topic.parent_id
        ).delete(
            synchronize_session=False
        )

        db.commit()

        return True

    # =========================================================
    # CREATE TOPICS
    # =========================================================

    @staticmethod
    def create_topics(
        db: Session,
        module_id: int,
        topics: list,
        language_id: int = 1,
    ):
        created_topics = []

        for item in topics:

            # Each language can have its own independent
            # TopicMaster record.

            topic = TopicMaster(
                module_id=module_id,
                language_id=language_id,
                topic_name=item.topic_name,
                is_active=item.is_active,
            )

            db.add(topic)
            db.flush()

            # Self-parented record for independently
            # created language topics.
            topic.parent_id = topic.topic_id

            created_topics.append(topic)

        db.commit()

        for topic in created_topics:
            db.refresh(topic)

        return created_topics

    # =========================================================
    # SAVE TOPIC TRANSLATION
    # =========================================================

    @staticmethod
    def save_translation(
        db: Session,
        topic_id: int,
        language_id: int,
        topic_name: str,
        is_active: str,
    ):
        # Find original/parent topic
        parent = (
            db.query(TopicMaster)
            .filter(
                TopicMaster.topic_id == topic_id
            )
            .first()
        )

        if not parent:
            return None

        parent_id = parent.parent_id

        # =====================================================
        # CHECK EXISTING TRANSLATION
        # =====================================================

        translation = (
            db.query(TopicMaster)
            .filter(
                TopicMaster.parent_id == parent_id,
                TopicMaster.language_id == language_id,
            )
            .first()
        )

        # =====================================================
        # UPDATE EXISTING TRANSLATION
        # =====================================================

        if translation:
            translation.topic_name = topic_name
            translation.is_active = is_active

        # =====================================================
        # CREATE NEW TRANSLATION
        # =====================================================

        else:
            translation = TopicMaster(
                parent_id=parent_id,
                module_id=parent.module_id,
                language_id=language_id,
                topic_name=topic_name,
                is_active=is_active,
            )

            db.add(translation)

        db.commit()
        db.refresh(translation)

        return translation

    # =========================================================
    # UPDATE TOPIC
    # =========================================================

    @staticmethod
    def update_topic(
        db: Session,
        topic_id: int,
        module_id: int,
        topic_name: str,
        is_active: str,
    ):
        topic = (
            db.query(TopicMaster)
            .filter(
                TopicMaster.topic_id == topic_id
            )
            .first()
        )

        if not topic:
            return None

        topic.module_id = module_id
        topic.topic_name = topic_name
        topic.is_active = is_active

        db.commit()
        db.refresh(topic)

        return topic

    # =========================================================
    # GET TOPIC TRANSLATION
    # =========================================================

    @staticmethod
    def get_topic_translation(
        db: Session,
        topic_id: int,
        language_id: int,
    ):
        english = (
            db.query(TopicMaster)
            .filter(
                TopicMaster.topic_id == topic_id
            )
            .first()
        )

        if not english:
            return None

        # =====================================================
        # ENGLISH
        # =====================================================

        if language_id == 1:
            return {
                "topic_id": english.topic_id,
                "topic_name": english.topic_name,
                "module_id": english.module_id,
                "status": english.is_active,
            }

        # =====================================================
        # TRANSLATION
        # =====================================================

        translation = (
            db.query(TopicMaster)
            .filter(
                TopicMaster.parent_id == english.parent_id,
                TopicMaster.language_id == language_id,
                TopicMaster.is_active == "1",
                
            )
            .first()
        )

        if translation:
            return {
                "topic_id": translation.topic_id,
                "topic_name": translation.topic_name,
                "module_id": translation.module_id,
                "status": translation.is_active,
            }

        # =====================================================
        # NO TRANSLATION
        # =====================================================

        return {
            "topic_id": english.topic_id,
            "topic_name": "",
            "module_id": english.module_id,
            "status": english.is_active,
        }
