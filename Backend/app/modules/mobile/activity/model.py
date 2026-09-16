"""
Tables the activity-logging feature writes to.

Only participant_time_spent_log, post_video_question_score and video_questions
are declared here — the same way the dashboard feature declares its one new
model inside the mobile package. time_spent_module_log is written by name in
the repository (raw SQL), so it needs no model here and this package stays
independent of where that table's model lives.

None of these tables carries an id sequence in this database, so their ids are
allocated in the repository, not by a column default.
"""

from sqlalchemy import BigInteger, Column, DateTime, Integer, String

from app.database.database import Base


class ParticipantTimeSpentLog(Base):
    __tablename__ = "participant_time_spent_log"

    id = Column(Integer, primary_key=True)
    participant_id = Column(Integer)
    time_spent_in_minutes = Column(Integer)
    created_at = Column(DateTime)


class PostVideoQuestionScore(Base):
    __tablename__ = "post_video_question_score"

    id = Column(BigInteger, primary_key=True)
    video_id = Column(BigInteger)
    topic_id = Column(BigInteger)
    module_id = Column(BigInteger)
    participant_id = Column(BigInteger)
    question_id = Column(BigInteger)
    option_id = Column(BigInteger)
    created_at = Column(DateTime)


class VideoQuestion(Base):
    """The questions a participant answers after watching a video."""

    __tablename__ = "video_questions"

    video_question_id = Column(BigInteger, primary_key=True)
    video_id = Column(BigInteger)
    question_type = Column(String(20))
    question_id = Column(BigInteger)
    is_active = Column(Integer)
    deleted_at = Column(DateTime)


__all__ = [
    "ParticipantTimeSpentLog",
    "PostVideoQuestionScore",
    "VideoQuestion",
]
