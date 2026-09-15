"""
Database models used by the mobile module feature.

No new model is declared here. Every table this feature reads already has a
model elsewhere in the project, so they are re-exported to keep the feature
folder self-describing without duplicating a table definition.
"""

from app.modules.dashboard.model import ParticipantModule
from app.modules.document.model import (
    DocumentMaster,
    LanguageMaster,
    PdfMaster,
    PptMaster,
    TopicMaster,
    VideoMaster,
)
from app.modules.module.model import ModuleMaster, ModuleType, TopicMapping

__all__ = [
    "DocumentMaster",
    "LanguageMaster",
    "ModuleMaster",
    "ModuleType",
    "ParticipantModule",
    "PdfMaster",
    "PptMaster",
    "TopicMapping",
    "TopicMaster",
    "VideoMaster",
]
