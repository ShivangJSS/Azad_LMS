from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.assessment.repository.match_making_repository import (
    MatchMakingRepository,
)
from app.modules.assessment.schema.match_making_schema import (
    MatchLeftItemCreate,
    MatchLeftItemUpdate,
    MatchMakingCreate,
    MatchMakingUpdate,
    MatchRightItemCreate,
    MatchRightItemUpdate,
)




class MatchMakingService:

    @staticmethod
    def get_all(
        db: Session,
        language_id: int | None = None,
        search: str | None = None,
    ):
        return MatchMakingRepository.get_all(
            db=db,
            language_id=language_id,
            search=search,
        )

    @staticmethod
    def get_by_id(
     db: Session,
     parent_id: int,
     language_id: int,
):

    # English
     if language_id == 1:

        english = MatchMakingRepository.get_by_id(
            db=db,
            match_making_id=parent_id,
        )

        if not english:
            raise HTTPException(
                status_code=404,
                detail="Match Making not found.",
            )

        english.is_translation = True

        return english

    # Translation
     translation = MatchMakingRepository.get_by_parent_and_language(
        db=db,
        parent_id=parent_id,
        language_id=language_id,
    )

     if translation:
        translation.is_translation = True
        return translation

    # Translation doesn't exist
     english = MatchMakingRepository.get_by_id(
        db=db,
        match_making_id=parent_id,
    )

     if not english:
        raise HTTPException(
            status_code=404,
            detail="Match Making not found.",
        )

     english.match_making_id = None
     english.parent_id = parent_id
     english.language_id = language_id

     english.match_making_question_title = ""
     english.match_making_question_description = ""

     english.is_translation = False

     return english
    
    @staticmethod
    def create(
        db: Session,
        data: MatchMakingCreate,
    ):
        return MatchMakingRepository.create(
            db=db,
            data=data,
        )

    @staticmethod
    def update(
        db: Session,
        match_making_id: int,
        data: MatchMakingUpdate,
    ):
        match_making = MatchMakingRepository.get_by_id(
            db=db,
            match_making_id=match_making_id,
        )

        if not match_making:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Match Making Question not found.",
            )

        return MatchMakingRepository.update(
            db=db,
            match_making=match_making,
            data=data,
        )

    @staticmethod
    def delete(
        db: Session,
        match_making_id: int,
    ):
        match_making = MatchMakingRepository.get_by_id(
            db=db,
            match_making_id=match_making_id,
        )

        if not match_making:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Match Making Question not found.",
            )

        MatchMakingRepository.delete(
            db=db,
            match_making=match_making,
        )

        return {
            "message": "Match Making Question deleted successfully."
        }


    @staticmethod
    def get_left_items(
        db: Session,
        match_making_id: int,
        language_id: int | None = None,
    ):
        return MatchMakingRepository.get_left_items(
            db=db,
            match_making_id=match_making_id,
            language_id=language_id,
        )

    @staticmethod
    def create_left_item(
        db: Session,
        match_making_id: int,
        data: MatchLeftItemCreate,
    ):
        return MatchMakingRepository.create_left_item(
            db=db,
            match_making_id=match_making_id,
            data=data,
        )

    @staticmethod
    def update_left_item(
        db: Session,
        match_left_id: int,
        data: MatchLeftItemUpdate,
    ):
        left_item = MatchMakingRepository.get_left_item_by_id(
            db=db,
            match_left_id=match_left_id,
        )

        if not left_item:
            raise HTTPException(
                status_code=404,
                detail="Left Item not found.",
            )

        return MatchMakingRepository.update_left_item(
            db=db,
            left_item=left_item,
            data=data,
        )

    @staticmethod
    def delete_left_item(
        db: Session,
        match_left_id: int,
    ):
        left_item = MatchMakingRepository.get_left_item_by_id(
            db=db,
            match_left_id=match_left_id,
        )

        if not left_item:
            raise HTTPException(
                status_code=404,
                detail="Left Item not found.",
            )

        MatchMakingRepository.delete_left_item(
            db=db,
            left_item=left_item,
        )

        return {
            "message": "Left Item deleted successfully."
        }



    @staticmethod
    def get_right_items(
     db: Session,
     match_making_id: int,
     language_id: int | None = None,
):
     return MatchMakingRepository.get_right_items(
        db=db,
        match_making_id=match_making_id,
        language_id=language_id,
    )


    @staticmethod
    def create_right_item(
     db: Session,
     match_making_id: int,
     data: MatchRightItemCreate,
):
     return MatchMakingRepository.create_right_item(
        db=db,
        match_making_id=match_making_id,
        data=data,
    )


    @staticmethod
    def update_right_item(
     db: Session,
     match_right_id: int,
     data: MatchRightItemUpdate,
):
     right_item = MatchMakingRepository.get_right_item_by_id(
        db=db,
        match_right_id=match_right_id,
    )

     if not right_item:
        raise HTTPException(
            status_code=404,
            detail="Right Item not found.",
        )

     return MatchMakingRepository.update_right_item(
        db=db,
        right_item=right_item,
        data=data,
    )


    @staticmethod
    def delete_right_item(
     db: Session,
     match_right_id: int,
):
     right_item = MatchMakingRepository.get_right_item_by_id(
        db=db,
        match_right_id=match_right_id,
    )

     if not right_item:
        raise HTTPException(
            status_code=404,
            detail="Right Item not found.",
        )

     MatchMakingRepository.delete_right_item(
        db=db,
        right_item=right_item,
    )

     return {
        "message": "Right Item deleted successfully."
    }