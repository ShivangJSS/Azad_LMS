import API from "../../../../api/Api";


export const getMainContentList = async (moduleId, languageId) => {
    try {
        const response = await API.get(
            `/modules/main-content/${moduleId}`,
            {
                params: languageId
                    ? { language_id: languageId }
                    : {},
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching main content list:",
            error?.response?.data ?? error
        );

        throw error;
    }
};

export const getTopicsForMainContent = async (moduleId) => {
    try {
        const response = await API.get(
            `/modules/main-content/topics/${moduleId}`
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching topics for main content:",
            error?.response?.data ?? error
        );

        throw error;
    }
};

/**
 * Documents available to attach (Add Main Content dropdown).
 * GET /modules/main-content/documents
 */
export const getDocumentsForMainContent = async () => {
    try {
        const response = await API.get(
            "/modules/main-content/documents"
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching documents for main content:",
            error?.response?.data ?? error
        );

        throw error;
    }
};

/**
 * Assign a document as main content.
 * POST /modules/main-content
 * body: { module_id, topic_id, doc_id }
 */
export const createMainContent = async (payload) => {
    try {
        const response = await API.post(
            "/modules/main-content",
            payload
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error creating main content:",
            error?.response?.data ?? error
        );

        throw error;
    }
};

/**
 * Deactivate an assigned main-content / self-paced row.
 * PATCH /modules/main-content/{self_paced_learning_id}/deactivate
 */
export const deactivateMainContent = async (selfPacedLearningId) => {
    try {
        const response = await API.patch(
            `/modules/main-content/${selfPacedLearningId}/deactivate`
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error deactivating main content:",
            error?.response?.data ?? error
        );

        throw error;
    }
};

/**
 * Activate a previously deactivated main-content / self-paced row.
 * PATCH /modules/main-content/{self_paced_learning_id}/activate
 */
export const activateMainContent = async (selfPacedLearningId) => {
    try {
        const response = await API.patch(
            `/modules/main-content/${selfPacedLearningId}/activate`
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error activating main content:",
            error?.response?.data ?? error
        );

        throw error;
    }
};

/* ---------------------------------------------------------
   SELF-PACED LEARNING (Optional)
   Mirrors Main Content (same table, listing_type="self_paced").
   Activate / deactivate reuse the main-content endpoints above
   (they operate by self_paced_learning_id).
--------------------------------------------------------- */

export const getSelfPacedList = async (moduleId, languageId) => {
    try {
        const response = await API.get(
            `/modules/self-paced/${moduleId}`,
            {
                params: languageId
                    ? { language_id: languageId }
                    : {},
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching self-paced list:",
            error?.response?.data ?? error
        );

        throw error;
    }
};

export const createSelfPacedContent = async (payload) => {
    try {
        const response = await API.post(
            "/modules/self-paced",
            payload
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error creating self-paced content:",
            error?.response?.data ?? error
        );

        throw error;
    }
};

/* ---------------------------------------------------------
   POST-SESSION ASSESSMENT (Compulsory)
--------------------------------------------------------- */

/**
 * Post-session assessment container(s) for a module.
 * NOTE: the backend route is registered at the (double)
 * path below because the module router already has a
 * "/modules" prefix. We intentionally match it verbatim.
 * GET /modules/modules/{module_id}/post-assessments
 */
export const getPostAssessments = async (moduleId) => {
    try {
        const response = await API.get(
            `/modules/modules/${moduleId}/post-assessments`
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching post assessments:",
            error?.response?.data ?? error
        );

        throw error;
    }
};

/**
 * Pre-session assessment container for a module (mirrors post-session).
 * The backend bootstraps one on first access.
 * GET /modules/modules/{module_id}/pre-assessments
 */
export const getPreAssessments = async (moduleId) => {
    try {
        const response = await API.get(
            `/modules/modules/${moduleId}/pre-assessments`
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching pre assessments:",
            error?.response?.data ?? error
        );

        throw error;
    }
};

/* Maps a UI tab key -> backend route segment + mapping type. */
export const ASSESSMENT_TYPES = {
    MCQ: { path: "mcqs", type: "MCQ", refKey: "mcq_id", titleKey: "mcq_question_title" },
    SCQ: { path: "scqs", type: "SCQ", refKey: "scq_id", titleKey: "scq_question_title" },
    DB: { path: "drop-buckets", type: "DB", refKey: "drop_bucket_id", titleKey: "drop_bucket_question_title" },
    MM: { path: "match-makings", type: "MM", refKey: "match_making_id", titleKey: "match_making_question_title" },
};

/**
 * Question bank for a given assessment + type, each row
 * carrying is_checked (whether it is already mapped).
 * GET /modules/assessments/{assessment_id}/{mcqs|scqs|drop-buckets|match-makings}
 */
export const getAssessmentQuestions = async (
    assessmentId,
    typeKey,
    languageId
) => {
    try {
        const cfg = ASSESSMENT_TYPES[typeKey];

        const response = await API.get(
            `/modules/assessments/${assessmentId}/${cfg.path}`,
            {
                params: languageId
                    ? { language_id: languageId }
                    : {},
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching assessment questions:",
            error?.response?.data ?? error
        );

        throw error;
    }
};

/**
 * Persist selected questions for an assessment.
 * POST /modules/assessment-mapping
 * body: { assessment_type, assessments: [{ assessment_id, assessment_ref_id }] }
 */
export const saveAssessmentMapping = async (payload) => {
    try {
        const response = await API.post(
            "/modules/assessment-mapping",
            payload
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error saving assessment mapping:",
            error?.response?.data ?? error
        );

        throw error;
    }
};

/**
 * Deactivate a single assigned question mapping.
 * PATCH /modules/assessment-mapping/deactivate
 * body: { assessment_id, assessment_type, assessment_ref_id }
 */
export const deactivateAssessmentMapping = async (payload) => {
    try {
        const response = await API.patch(
            "/modules/assessment-mapping/deactivate",
            payload
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error deactivating assessment mapping:",
            error?.response?.data ?? error
        );

        throw error;
    }
};
