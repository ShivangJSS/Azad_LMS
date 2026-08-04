from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.Topic.repository import TopicRepository


class TopicService:

    @staticmethod
    def get_topics(
        db: Session,
        language_id: int,
        search: str | None,
        page: int,
        limit: int,
    ):
        skip = (page - 1) * limit

        records, total = TopicRepository.get_topics(
            db=db,
            language_id=language_id,
            search=search,
            skip=skip,
            limit=limit,
        )

        return {
            "topics": records,
            "pagination": {
                "page": page,
                "limit": limit,
                "total_records": total,
                "total_pages": (total + limit - 1) // limit,
            },
        }

    @staticmethod
    def get_topic_by_id(
        db: Session,
        topic_id: int,
    ):
        rows = TopicRepository.get_topic_by_id(
            db=db,
            topic_id=topic_id,
        )

        if not rows:
            raise HTTPException(
                status_code=404,
                detail="Topic not found."
            )

        return {
            "module_name": rows[0].module_name,
            "status": rows[0].status,
            "translations": [
                {
                    "topic_id": row.topic_id,
                    "parent_id": row.parent_id,
                    "language_id": row.language_id,
                    "topic_name": row.topic_name,
                }
                for row in rows
            ],
        }

    @staticmethod
    def delete_topic(
        db: Session,
        topic_id: int,
    ):
        deleted = TopicRepository.delete_topic(
            db=db,
            topic_id=topic_id,
        )

        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="Topic not found."
            )

        return

    @staticmethod
    def create_topics(
        db: Session,
        request,
    ):
        topics = TopicRepository.create_topics(
            db=db,
            module_id=request.module_id,
            topics=request.topics,
        )

        return {
            "topic_ids": [topic.topic_id for topic in topics]
        }

    @staticmethod
    def save_translation(
     db: Session,
     topic_id: int,
     request,
):
     topic = TopicRepository.save_translation(
        db=db,
        topic_id=topic_id,
        language_id=request.language_id,
        topic_name=request.topic_name,
        is_active=request.is_active,
    )

     if not topic:
        raise HTTPException(
            status_code=404,
            detail="Topic not found."
        )

     return {
        "topic_id": topic.topic_id,
        "parent_id": topic.parent_id,
        "language_id": topic.language_id,
        "topic_name": topic.topic_name,
    }



    @staticmethod
    def update_topic(
     db: Session,
     topic_id: int,
     request,
):

     topic = TopicRepository.update_topic(
        db=db,
        topic_id=topic_id,
        module_id=request.module_id,
        topic_name=request.topic_name,
        is_active=request.is_active,
    )

     if not topic:
        raise HTTPException(
            status_code=404,
            detail="Topic not found."
        )

     return {
        "topic_id": topic.topic_id
    }