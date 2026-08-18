import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../../api/Api";

import {
    getModuleById,
    getModuleTranslation,
    saveModuleTranslation,
} from "../../../../api/moduleApi";

const LANGUAGES = [
    {
        id: 1,
        name: "English",
        label: "English (Base)",
    },
    {
        id: 2,
        name: "Hindi",
        label: "Hindi",
    },
    {
        id: 3,
        name: "Bangla",
        label: "Bangla",
    },
    {
        id: 4,
        name: "Tamil",
        label: "Tamil",
    },
];

const ASSESSMENT_TABS = [
    {
        key: "MCQ",
        label: "MCQ",
    },
    {
        key: "SCQ",
        label: "SCQ",
    },
    {
        key: "DB",
        label: "Drop Bucket",
    },
    {
        key: "MM",
        label: "Match Making",
    },
];

const EMPTY_TRANSLATION = {
    module_name: "",
    module_description: "",
    module_overview: "",
    module_objective: "",
};

export default function useConfigureModule() {
    const { moduleId } = useParams();

    /* =========================================================
       MODULE
    ========================================================= */

    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);

    /* =========================================================
       LANGUAGE / TRANSLATION
    ========================================================= */

    const [activeLanguage, setActiveLanguage] = useState(1);
    const [translations, setTranslations] = useState({});

    /* =========================================================
       MAIN CONTENT
    ========================================================= */

    const [mainContent, setMainContent] = useState([]);
    const [topics, setTopics] = useState([]);
    const [documents, setDocuments] = useState([]);

    const [selectedTopic, setSelectedTopic] = useState("");
    const [selectedDocument, setSelectedDocument] = useState("");

    const [showMainContentModal, setShowMainContentModal] =
        useState(false);

    const [savingContent, setSavingContent] = useState(false);

    /* =========================================================
       ASSESSMENT
    ========================================================= */

    const [postAssessments, setPostAssessments] = useState([]);

    const [activePostTab, setActivePostTab] = useState("MCQ");

    const [assessmentQuestions, setAssessmentQuestions] =
        useState([]);

    /* =========================================================
       GENERAL
    ========================================================= */

    const [error, setError] = useState("");

    /* =========================================================
       CURRENT TRANSLATION
    ========================================================= */

    const currentTranslation = useMemo(() => {
        if (activeLanguage === 1) {
            return {
                module_name: module?.module_name || "",
                module_description:
                    module?.module_description || "",
                module_overview: module?.module_overview || "",
                module_objective: module?.module_objective || "",
            };
        }

        return (
            translations[activeLanguage] || EMPTY_TRANSLATION
        );
    }, [
        activeLanguage,
        module,
        translations,
    ]);

    /* =========================================================
       INITIAL LOAD
    ========================================================= */

    useEffect(() => {
        if (!moduleId) return;

        loadModule();
        loadMainContent();
        loadPostAssessments();
    }, [moduleId]);

    /* =========================================================
       LOAD MODULE
    ========================================================= */

    const loadModule = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getModuleById(moduleId);

            const data = response?.data ?? response;

            setModule(data);
        } catch (error) {
            console.error(
                "Error loading module:",
                error?.response?.data ?? error
            );

            setError("Unable to load module.");
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================
       LANGUAGE CHANGE
    ========================================================= */

    const handleLanguageChange = (languageId) => {
        setActiveLanguage(languageId);
    };

    /* =========================================================
       LOAD TRANSLATION
    ========================================================= */

    useEffect(() => {
        if (!moduleId) return;

        if (activeLanguage === 1) return;

        loadTranslation(activeLanguage);
    }, [
        activeLanguage,
        moduleId,
    ]);

    const loadTranslation = async (languageId) => {
        try {
            const response = await getModuleTranslation(
                moduleId,
                languageId
            );

            const data = response?.data ?? response;

            setTranslations((previous) => ({
                ...previous,

                [languageId]: {
                    module_name:
                        data?.module_name || "",

                    module_description:
                        data?.module_description || "",

                    module_overview:
                        data?.module_overview || "",

                    module_objective:
                        data?.module_objective || "",
                },
            }));
        } catch (error) {
            console.error(
                "Error loading translation:",
                error?.response?.data ?? error
            );
        }
    };

    /* =========================================================
       SAVE TRANSLATION
    ========================================================= */

    const handleSaveTranslation = async (formData) => {
        try {
            const payload = {
                language_id: activeLanguage,

                module_name:
                    formData.module_name || "",

                module_description:
                    formData.module_description || "",

                module_overview:
                    formData.module_overview || "",

                module_objective:
                    formData.module_objective || "",

                status: 1,
            };

            await saveModuleTranslation(
                moduleId,
                payload
            );

            await loadTranslation(activeLanguage);

            return {
                success: true,
                message: "Translation saved successfully.",
            };
        } catch (error) {
            console.error(
                "Error saving translation:",
                error?.response?.data ?? error
            );

            return {
                success: false,
                message:
                    error?.response?.data?.detail ||
                    "Unable to save translation.",
            };
        }
    };

    /* =========================================================
       LOAD MAIN CONTENT
    ========================================================= */

    const loadMainContent = async () => {
        try {
            const [
                contentResponse,
                topicResponse,
                documentResponse,
            ] = await Promise.all([
                API.get(
                    `/modules/main-content/${moduleId}`
                ),

                API.get(
                    `/modules/main-content/topics/${moduleId}`
                ),

                API.get(
                    `/modules/main-content/documents`
                ),
            ]);

            setMainContent(
                contentResponse?.data || []
            );

            setTopics(
                topicResponse?.data || []
            );

            setDocuments(
                documentResponse?.data || []
            );
        } catch (error) {
            console.error(
                "Error loading main content:",
                error?.response?.data ?? error
            );
        }
    };

    /* =========================================================
       OPEN MAIN CONTENT MODAL
    ========================================================= */

    const openMainContentModal = () => {
        setSelectedTopic("");
        setSelectedDocument("");

        setShowMainContentModal(true);
    };

    /* =========================================================
       CLOSE MAIN CONTENT MODAL
    ========================================================= */

    const closeMainContentModal = () => {
        setShowMainContentModal(false);

        setSelectedTopic("");
        setSelectedDocument("");
    };

    /* =========================================================
       ASSIGN MAIN CONTENT
    ========================================================= */

    const assignMainContent = async () => {
        if (!selectedTopic) {
            return {
                success: false,
                message: "Please select a topic.",
            };
        }

        if (!selectedDocument) {
            return {
                success: false,
                message: "Please select a document.",
            };
        }

        try {
            setSavingContent(true);

            await API.post(
                "/modules/main-content",
                {
                    module_id: Number(moduleId),

                    topic_id: Number(
                        selectedTopic
                    ),

                    doc_id: Number(
                        selectedDocument
                    ),
                }
            );

            await loadMainContent();

            closeMainContentModal();

            return {
                success: true,
                message:
                    "Main content assigned successfully.",
            };
        } catch (error) {
            console.error(
                "Error assigning main content:",
                error?.response?.data ?? error
            );

            return {
                success: false,
                message:
                    error?.response?.data?.detail ||
                    error?.response?.data?.message ||
                    "Unable to assign main content.",
            };
        } finally {
            setSavingContent(false);
        }
    };

    /* =========================================================
       LOAD POST ASSESSMENTS
    ========================================================= */

    const loadPostAssessments = async () => {
        try {
            const response = await API.get(
                `/modules/${moduleId}/post-assessments`
            );

            const data =
                response?.data ?? response;

            setPostAssessments(
                data?.assessments || []
            );
        } catch (error) {
            console.error(
                "Error loading post assessments:",
                error?.response?.data ?? error
            );

            setPostAssessments([]);
        }
    };

    /* =========================================================
       LOAD ASSESSMENT QUESTIONS
    ========================================================= */

    useEffect(() => {
        if (!postAssessments.length) {
            setAssessmentQuestions([]);
            return;
        }

        loadAssessmentQuestions();
    }, [
        activePostTab,
        postAssessments,
    ]);

    const loadAssessmentQuestions = async () => {
        const assessmentId =
            postAssessments[0]?.assessment_id;

        if (!assessmentId) {
            setAssessmentQuestions([]);
            return;
        }

        try {
            let endpoint = "";

            switch (activePostTab) {
                case "MCQ":
                    endpoint =
                        `/modules/assessments/${assessmentId}/mcqs`;
                    break;

                case "SCQ":
                    endpoint =
                        `/modules/assessments/${assessmentId}/scqs`;
                    break;

                case "DB":
                    endpoint =
                        `/modules/assessments/${assessmentId}/drop-buckets`;
                    break;

                case "MM":
                    endpoint =
                        `/modules/assessments/${assessmentId}/match-makings`;
                    break;

                default:
                    setAssessmentQuestions([]);
                    return;
            }

            const response =
                await API.get(endpoint);

            setAssessmentQuestions(
                response?.data || []
            );
        } catch (error) {
            console.error(
                "Error loading assessment questions:",
                error?.response?.data ?? error
            );

            setAssessmentQuestions([]);
        }
    };

    /* =========================================================
       ASSESSMENT TAB CHANGE
    ========================================================= */

    const handleAssessmentTabChange = (
        tab
    ) => {
        setActivePostTab(tab);
    };

    /* =========================================================
       HELPERS
    ========================================================= */

    const getContentTitle = (item) => {
        return (
            item?.doc_title ||
            item?.topic_name ||
            "-"
        );
    };

    const getContentType = (item) => {
        return item?.doc_type || "-";
    };

    const getAssessmentQuestion = (
        item
    ) => {
        return (
            item?.mcq_question_title ||
            item?.scq_question_title ||
            item?.drop_bucket_question_title ||
            item?.match_making_question_title ||
            "-"
        );
    };

    /* =========================================================
       RETURN
    ========================================================= */

    return {
        /* Module */
        module,
        moduleId,
        loading,
        error,

        /* Languages */
        LANGUAGES,
        activeLanguage,
        setActiveLanguage:
            handleLanguageChange,

        translations,
        currentTranslation,

        /* Translation */
        loadTranslation,
        handleSaveTranslation,

        /* Main Content */
        mainContent,
        topics,
        documents,

        selectedTopic,
        setSelectedTopic,

        selectedDocument,
        setSelectedDocument,

        showMainContentModal,
        savingContent,

        openMainContentModal,
        closeMainContentModal,
        assignMainContent,

        loadMainContent,

        /* Assessment */
        ASSESSMENT_TABS,

        postAssessments,

        activePostTab,

        setActivePostTab:
            handleAssessmentTabChange,

        assessmentQuestions,

        loadPostAssessments,
        loadAssessmentQuestions,

        /* Helpers */
        getContentTitle,
        getContentType,
        getAssessmentQuestion,
    };
}