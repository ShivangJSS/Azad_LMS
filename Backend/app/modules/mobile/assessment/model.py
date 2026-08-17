"""
Database models used by the mobile assessment feature.

No new model is declared here. Every table this feature touches already has a
model elsewhere in the project, so they are re-exported to keep the feature
folder self-describing without duplicating a table definition.
"""

from app.modules.assessment.model import (
    AssessmentMapping,
    DropBucket,
    DropBucketItem,
    DropBucketMaster,
    MatchCorrectAnswer,
    MatchLeftItem,
    MatchMakingMaster,
    MatchRightItem,
    McqMaster,
    McqQuestionOption,
    PostSessionAssessment,
    ScqMaster,
    ScqQuestionOption,
)
from app.modules.centres.model import (
    ParticipantDb,
    ParticipantMcq,
    ParticipantMm,
    ParticipantScq,
)
from app.modules.dashboard.model import ParticipantModule
from app.modules.module.model import ModuleMaster

__all__ = [
    "AssessmentMapping",
    "DropBucket",
    "DropBucketItem",
    "DropBucketMaster",
    "MatchCorrectAnswer",
    "MatchLeftItem",
    "MatchMakingMaster",
    "MatchRightItem",
    "McqMaster",
    "McqQuestionOption",
    "ModuleMaster",
    "ParticipantDb",
    "ParticipantMcq",
    "ParticipantMm",
    "ParticipantModule",
    "ParticipantScq",
    "PostSessionAssessment",
    "ScqMaster",
    "ScqQuestionOption",
]
