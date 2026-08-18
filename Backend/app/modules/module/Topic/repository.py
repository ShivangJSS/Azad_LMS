from sqlalchemy import and_, func
from sqlalchemy.orm import Session, aliased

from app.modules.document.model import TopicMaster
from app.modules.module.model import ModuleMaster


# Language rows to auto-create for every new topic: (language_id, translate code)
TOPIC_TRANSLATION_LANGUAGES = [
    (2, "hi"),  # Hindi
    (3, "bn"),  # Bengali
    (4, "ta"),  # Tamil
]


def _translate_text(text: str, target_lang: str) -> str:
    """Translate `text` into `target_lang` (best-effort).

    Uses deep-translator's Google backend when available. If the package is
    not installed or the call fails (e.g. no network), the original English
    text is returned so topic creation never breaks.
    """
    if not text or not str(text).strip():
        return text

    try:
        from deep_translator import GoogleTranslator

        translated = GoogleTranslator(
            source="auto",
            target=target_lang,
        ).translate(str(text))

        return translated or text
    except Exception:
        return text


class TopicRepository:

    @staticmethod
    def get_topics(
        db: Session,
        language_id: int,
        search: str | None,
        skip: int,
        limit: int,
    ):

        if language_id == 1:
            # English is the base language: list the English topics directly.
            query = (
                db.query(
                    TopicMaster.topic_id,
                    TopicMaster.topic_name,
                    ModuleMaster.module_name,
                    TopicMaster.is_active.label("status"),
                )
                .join(
                    ModuleMaster,
                    ModuleMaster.module_id == TopicMaster.module_id,
                )
                .filter(
                    TopicMaster.language_id == 1,
                    TopicMaster.is_active == "1",
                )
            )

            if search:
                query = query.filter(
                    TopicMaster.topic_name.ilike(f"%{search}%")
                )
        else:
            # Other languages: show EVERY English topic (so newly added topics
            # appear automatically), with its translation for this language if
            # one exists, otherwise the English name as a fallback.
            translation = aliased(TopicMaster)

            display_name = func.coalesce(
                translation.topic_name,
                TopicMaster.topic_name,
            )

            query = (
                db.query(
                    TopicMaster.topic_id,
                    display_name.label("topic_name"),
                    ModuleMaster.module_name,
                    TopicMaster.is_active.label("status"),
                )
                .join(
                    ModuleMaster,
                    ModuleMaster.module_id == TopicMaster.module_id,
                )
                .outerjoin(
                    translation,
                    and_(
                        translation.parent_id == TopicMaster.parent_id,
                        translation.language_id == language_id,
                        translation.is_active == "1",
                    ),
                )
                .filter(
                    TopicMaster.language_id == 1,
                    TopicMaster.is_active == "1",
                )
            )

            if search:
                query = query.filter(
                    display_name.ilike(f"%{search}%")
                )

        total = query.count()

        # Newest topics first (a just-added topic shows at the top).
        rows = (
            query.order_by(TopicMaster.topic_id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        records = [
            {
                "topic_id": row.topic_id,
                "topic_name": row.topic_name,
                "module_name": row.module_name,
                "language_id": language_id,
                "status": row.status,
            }
            for row in rows
        ]

        return records, total

    @staticmethod
    def get_topic_by_id(
        db: Session,
        topic_id: int,
    ):

        parent_id = (
            db.query(TopicMaster.parent_id)
            .filter(TopicMaster.topic_id == topic_id)
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
                 TopicMaster.is_active == "1",
            )
            .order_by(TopicMaster.language_id.asc())
            .all()
        )

        return topics

    @staticmethod
    def delete_topic(
        db: Session,
        topic_id: int,
    ):

        topic = (
            db.query(TopicMaster)
            .filter(TopicMaster.topic_id == topic_id)
            .first()
        )

        if not topic:
            return False

        (
            db.query(TopicMaster)
            .filter(
                TopicMaster.parent_id == topic.parent_id
            )
            .update(
                {
                    TopicMaster.is_active: "0"
                },
                synchronize_session=False,
            )
        )

        db.commit()

        return True

    @staticmethod
    def create_topics(
        db: Session,
        module_id: int,
        topics: list,
    ):

        created_topics = []

        for item in topics:

            topic = TopicMaster(
                module_id=module_id,
                language_id=1,
                topic_name=item.topic_name,
                is_active=item.is_active,
            )

            db.add(topic)
            db.flush()

            # Parent points to itself for English record
            topic.parent_id = topic.topic_id

            # Auto-create translated rows (Hindi / Bengali / Tamil) so the
            # topic shows up—already translated—when the user switches tabs.
            for lang_id, lang_code in TOPIC_TRANSLATION_LANGUAGES:
                translated_name = _translate_text(
                    item.topic_name,
                    lang_code,
                )

                db.add(
                    TopicMaster(
                        module_id=module_id,
                        language_id=lang_id,
                        parent_id=topic.topic_id,
                        topic_name=translated_name,
                        is_active=item.is_active,
                    )
                )

            created_topics.append(topic)

        db.commit()

        for topic in created_topics:
            db.refresh(topic)

        return created_topics



    @staticmethod
    def save_translation(
        db: Session,
        topic_id: int,
        language_id: int,
        topic_name: str,
        is_active: str,
    ):
        # Find English (or parent) record
        parent = (
            db.query(TopicMaster)
            .filter(TopicMaster.topic_id == topic_id)
            .first()
        )

        if not parent:
            return None

        parent_id = parent.parent_id

        # Check if translation already exists
        translation = (
            db.query(TopicMaster)
            .filter(
                TopicMaster.parent_id == parent_id,
                TopicMaster.language_id == language_id,
            )
            .first()
        )

        if translation:
            # Update existing translation
            translation.topic_name = topic_name
            translation.is_active = is_active

        else:
            # Insert new translation
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

        if language_id == 1:
            return {
                "topic_id": english.topic_id,
                "topic_name": english.topic_name,
                "module_id": english.module_id,
                "status": english.is_active,
            }

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

        return {
            "topic_id": english.topic_id,
            "topic_name": "",
            "module_id": english.module_id,
            "status": english.is_active,
        }