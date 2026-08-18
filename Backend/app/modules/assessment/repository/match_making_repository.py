from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.modules.assessment.model import (
    MatchLeftItem,
    MatchMakingMaster,
    MatchRightItem,
)
from app.modules.assessment.schema.match_making_schema import (
    MatchLeftItemCreate,
    MatchLeftItemUpdate,
    MatchMakingCreate,
    MatchMakingUpdate,
    MatchRightItemCreate,
    MatchRightItemUpdate,
)


class MatchMakingRepository:

    @staticmethod
    def get_all(
        db: Session,
        language_id: Optional[int] = None,
        search: Optional[str] = None,
        page: int = 1,
        limit: int = 10,
    ) -> List[MatchMakingMaster]:

        query = db.query(MatchMakingMaster).filter(
            MatchMakingMaster.deleted_at.is_(None)
        )

        if language_id:
            query = query.filter(MatchMakingMaster.language_id == language_id)

        if search:
            query = query.filter(
                MatchMakingMaster.match_making_question_title.ilike(f"%{search}%")
            )

        total = query.count()

        offset = (page - 1) * limit

        results = (
            query.order_by(MatchMakingMaster.match_making_id.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        return results

    @staticmethod
    def get_by_id(
        db: Session,
        match_making_id: int,
    ):
        return (
            db.query(MatchMakingMaster)
            .filter(
                MatchMakingMaster.match_making_id == match_making_id,
                MatchMakingMaster.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def get_by_parent_and_language(
        db: Session,
        parent_id: int,
        language_id: int,
    ):
        return (
            db.query(MatchMakingMaster)
            .filter(
                MatchMakingMaster.parent_id == parent_id,
                MatchMakingMaster.language_id == language_id,
                MatchMakingMaster.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def create(
        db: Session,
        data: MatchMakingCreate,
    ):

        match_making = MatchMakingMaster(
            parent_id=data.parent_id,
            match_making_question_title=data.match_making_question_title,
            match_making_question_description=data.match_making_question_description,
            image_url=data.image_url,
            marks=data.marks,
            status=data.status,
            language_id=data.language_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(match_making)
        db.flush()

        # A new English master has no parent — point it at itself so it can be
        # fetched/grouped by parent_id (translations reference this id). The
        # frontend sends parent_id=0 for new records, so treat 0 as "no parent".
        if not match_making.parent_id:
            match_making.parent_id = match_making.match_making_id

        db.commit()
        db.refresh(match_making)

        return match_making

    @staticmethod
    def update(
        db: Session,
        match_making: MatchMakingMaster,
        data: MatchMakingUpdate,
    ):

        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(match_making, key, value)

        match_making.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(match_making)

        return match_making

    @staticmethod
    def delete(
        db: Session,
        match_making: MatchMakingMaster,
    ):

        match_making.deleted_at = datetime.utcnow()

        db.commit()

    @staticmethod
    def get_left_items(
        db: Session,
        match_making_id: int,
        language_id: int | None = None,
    ):
        query = db.query(MatchLeftItem).filter(
            MatchLeftItem.match_making_id == match_making_id,
            MatchLeftItem.deleted_at.is_(None),
        )

        if language_id is not None:
            query = query.filter(MatchLeftItem.language_id == language_id)

        return query.order_by(MatchLeftItem.match_left_id.asc()).all()

    @staticmethod
    def get_left_item_by_id(
        db: Session,
        match_left_id: int,
    ):
        return (
            db.query(MatchLeftItem)
            .filter(
                MatchLeftItem.match_left_id == match_left_id,
                MatchLeftItem.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def create_left_item(
        db: Session,
        match_making_id: int,
        data: MatchLeftItemCreate,
    ):
        left_item = MatchLeftItem(
            match_making_id=match_making_id,
            match_left_text=data.match_left_text,
            sort_order=data.sort_order,
            language_id=data.language_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(left_item)
        db.commit()
        db.refresh(left_item)

        return left_item

    @staticmethod
    def update_left_item(
        db: Session,
        left_item: MatchLeftItem,
        data: MatchLeftItemUpdate,
    ):
        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(left_item, key, value)

        left_item.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(left_item)

        return left_item

    @staticmethod
    def delete_left_item(
        db: Session,
        left_item: MatchLeftItem,
    ):
        left_item.deleted_at = datetime.utcnow()

        db.commit()

    @staticmethod
    def get_right_items(
        db: Session,
        match_making_id: int,
        language_id: int | None = None,
    ):
        query = db.query(MatchRightItem).filter(
            MatchRightItem.match_making_id == match_making_id,
            MatchRightItem.deleted_at.is_(None),
        )

        if language_id is not None:
            query = query.filter(MatchRightItem.language_id == language_id)

        return query.order_by(MatchRightItem.match_right_id.asc()).all()

    @staticmethod
    def get_right_item_by_id(
        db: Session,
        match_right_id: int,
    ):
        return (
            db.query(MatchRightItem)
            .filter(
                MatchRightItem.match_right_id == match_right_id,
                MatchRightItem.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def create_right_item(
        db: Session,
        match_making_id: int,
        data: MatchRightItemCreate,
    ):
        right_item = MatchRightItem(
            match_making_id=match_making_id,
            match_right_text=data.match_right_text,
            sort_order=data.sort_order,
            language_id=data.language_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(right_item)
        db.commit()
        db.refresh(right_item)

        return right_item

    @staticmethod
    def update_right_item(
        db: Session,
        right_item: MatchRightItem,
        data: MatchRightItemUpdate,
    ):
        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(right_item, key, value)

        right_item.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(right_item)

        return right_item

    @staticmethod
    def delete_right_item(
        db: Session,
        right_item: MatchRightItem,
    ):
        right_item.deleted_at = datetime.utcnow()

        db.commit()
