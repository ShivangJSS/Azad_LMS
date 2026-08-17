"""
Module progress constants shared by the mobile module and dashboard features.

The values mirror what the existing LMS already writes into
``participant_module.lock_status``.
"""

# -------------------------
# participant_module.lock_status
# -------------------------
LOCK_STATUS_LOCKED = 0
LOCK_STATUS_ACTIVE = 1
LOCK_STATUS_COMPLETED = 2

# -------------------------
# Status exposed to the app
# -------------------------
MODULE_STATUS_LOCKED = "locked"
MODULE_STATUS_ACTIVE = "active"
MODULE_STATUS_COMPLETED = "completed"

LOCK_STATUS_MAP = {
    LOCK_STATUS_LOCKED: MODULE_STATUS_LOCKED,
    LOCK_STATUS_ACTIVE: MODULE_STATUS_ACTIVE,
    LOCK_STATUS_COMPLETED: MODULE_STATUS_COMPLETED,
}

# -------------------------
# Filters
# -------------------------
DEFAULT_LANGUAGE_ID = 1

# module_masters.status / module_type.status
ACTIVE_STATUS = 1

# topic_mapping.status is a varchar
MAPPING_ACTIVE_STATUS = "1"

# -------------------------
# document_masters.doc_type
# -------------------------
DOC_TYPE_VIDEO = "Video"
DOC_TYPE_PDF = "PDF"
DOC_TYPE_PPT = "PPT"

# Topics are listed in this order within a module: watch, then present,
# then any other document, and reading material last.
DOC_TYPE_ORDER = {
    DOC_TYPE_VIDEO: 0,
    DOC_TYPE_PPT: 1,
    DOC_TYPE_PDF: 3,
}

# Anything unrecognised sits between presentations and pdfs.
DOC_TYPE_ORDER_FALLBACK = 2
