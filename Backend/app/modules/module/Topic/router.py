from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.modules.module.Topic.schema import CreateTopicRequest,TopicTranslationRequest,UpdateTopicRequest
from app.modules.module.Topic.service import TopicService

router = APIRouter(
    prefix="/topics",
    tags=["Topic Master"],
)


@router.get("")
def get_topics(
    language_id: int = Query(...),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
):
    data = TopicService.get_topics(
        db=db,
        language_id=language_id,
        search=search,
        page=page,
        limit=limit,
    )

    return {
        "success": True,
        "message": "Topics fetched successfully.",
        "data": data,
    }


@router.get("/{topic_id}")
def get_topic(
    topic_id: int,
    db: Session = Depends(get_db),
):
    return {
        "success": True,
        "message": "Topic fetched successfully.",
        "data": TopicService.get_topic_by_id(
            db=db,
            topic_id=topic_id,
        ),
    }


@router.delete("/{topic_id}")
def delete_topic(
    topic_id: int,
    db: Session = Depends(get_db),
):
    TopicService.delete_topic(
        db=db,
        topic_id=topic_id,
    )

    return {
        "success": True,
        "message": "Topic deleted successfully.",
    }


@router.post("")
def create_topics(
    request: CreateTopicRequest,
    db: Session = Depends(get_db),
):
    data = TopicService.create_topics(
        db=db,
        request=request,
    )

    return {
        "success": True,
        "message": "Topics created successfully.",
        "data": data,
    }


@router.post("/{topic_id}/translation")
def save_translation(
    topic_id: int,
    request: TopicTranslationRequest,
    db: Session = Depends(get_db),
):

    data = TopicService.save_translation(
        db=db,
        topic_id=topic_id,
        request=request,
    )

    return {
        "success": True,
        "message": "Translation saved successfully.",
        "data": data,
    }





@router.put("/{topic_id}")
def update_topic(
    topic_id: int,
    request: UpdateTopicRequest,
    db: Session = Depends(get_db),
):

    data = TopicService.update_topic(
        db=db,
        topic_id=topic_id,
        request=request,
    )

    return {
        "success": True,
        "message": "Topic updated successfully.",
        "data": data,
    }