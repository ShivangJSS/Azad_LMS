"""
Database models used by the mobile dashboard feature.

Everything the feature reads already had a model elsewhere in the project and
is re-exported below, with one exception: `didyouknow` has no model anywhere,
so it is declared here against the existing PostgreSQL table.
"""

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database.database import Base

from app.modules.assessment.model import (
    McqQuestionOption,
    ScqQuestionOption,
)
from app.modules.centres.model import ParticipantMcq, ParticipantScq
from app.modules.dashboard.model import ParticipantModule
from app.modules.module.model import ModuleMaster
from app.modules.users.model import TimeSpentModuleLog


class DidYouKnow(Base):
    """
    Safety tips shown on the dashboard. Mirrors the existing table exactly —
    note is_active is a varchar here, not an integer.
    """

    __tablename__ = "didyouknow"

    didyouknow_id = Column(Integer, primary_key=True, index=True)

    didyouknow_text = Column(Text)

    image_url = Column(String(255))

    is_active = Column(String(10))

    language_id = Column(Integer)

    created_at = Column(DateTime)
    updated_at = Column(DateTime)


__all__ = [
    "DidYouKnow",
    "McqQuestionOption",
    "ModuleMaster",
    "ParticipantMcq",
    "ParticipantModule",
    "ParticipantScq",
    "ScqQuestionOption",
    "TimeSpentModuleLog",
]
