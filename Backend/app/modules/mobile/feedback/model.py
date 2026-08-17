from sqlalchemy import (
    BigInteger,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database.database import Base


class ParticipantFeedback(Base):
    """
    Full trainee feedback form. Every column below already exists on the
    table; the earlier version of this model mapped only the first four.
    """

    __tablename__ = "participant_feedback"

    feedback_id = Column(BigInteger, primary_key=True, index=True)

    participant_id = Column(BigInteger, nullable=False)

    # Short "mood" section
    lms_experience = Column(String(50))
    lms_ease = Column(String(50))
    useful_modules = Column(Text)

    # Full questionnaire
    visual_material = Column(String(50))
    reading_material = Column(String(50))
    assessment_help = Column(String(50))
    confidence_areas = Column(Text)
    work_preparedness = Column(String(50))
    challenges = Column(Text)
    helpful_content = Column(String(50))
    like_most = Column(Text)
    improve_lms = Column(Text)
    recommend = Column(String(50))

    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    deleted_at = Column(DateTime)


class ParticipantMoodAnswer(Base):
    __tablename__ = "participant_mood_answers"

    answer_id = Column(Integer, primary_key=True, index=True)

    participant_id = Column(BigInteger, nullable=False)

    question_id = Column(
        Integer,
        ForeignKey("mood_questions_master.question_id"),
        nullable=False,
    )

    selected_option_id = Column(
        Integer,
        ForeignKey("question_options.option_id"),
        nullable=False,
    )

    answer_time = Column(Date)

    lat = Column(String(100))
    long = Column(String(100))
    appversion = Column(String(50))
    status = Column(String(50))

    question = relationship("MoodQuestionMaster")


class MoodQuestionMaster(Base):
    __tablename__ = "mood_questions_master"

    question_id = Column(Integer, primary_key=True, index=True)

    question_name = Column(Text, nullable=False)
    question_description = Column(Text)
    question_type = Column(String(255), nullable=False)

    language_id = Column(Integer, nullable=False)

    is_active = Column(Integer, nullable=False, default=1)

    options = relationship(
        "QuestionOption",
        back_populates="question",
        lazy="joined",
    )


class QuestionOption(Base):
    __tablename__ = "question_options"

    option_id = Column(Integer, primary_key=True, index=True)

    question_id = Column(
        Integer,
        ForeignKey("mood_questions_master.question_id"),
        nullable=False,
    )

    option_name = Column(String(255), nullable=False)
    option_icon = Column(String(255))

    language_id = Column(Integer, nullable=False)

    is_active = Column(Integer, nullable=False, default=1)

    question = relationship(
        "MoodQuestionMaster",
        back_populates="options",
    )


__all__ = [
    "MoodQuestionMaster",
    "ParticipantFeedback",
    "ParticipantMoodAnswer",
    "QuestionOption",
]
