import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiBox, FiArrowLeft } from "react-icons/fi";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import LanguageTabs from "../../../../shared/components/language/LanguageTabs";
import { getLanguageByKey } from "../../../../shared/constants/languageConstants";

import { getModuleById, getModuleTranslation } from "../services/ListService";
import {
    getMainContentList,
    getPostAssessments,
    getPreAssessments,
    deactivateMainContent,
    activateMainContent,
    getSelfPacedList,
    createSelfPacedContent,
} from "../services/ConfigurationService";
import { getDocument } from "../../../document/services/DocumentServices";

import ConfigSection from "../components/configuration/ConfigSection";
import ContentTable from "../components/configuration/ContentTable";
import AssessmentSection from "../components/configuration/AssessmentSection";
import AddContentModal from "../components/configuration/AddContentModal";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Modules", path: "/modules" },
    { label: "Configuration" },
];

export default function ConfigureModule() {
    const { moduleId } = useParams();
    const navigate = useNavigate();

    /* ================= LANGUAGE ================= */

    const [languageKey, setLanguageKey] = useState("english");
    const language = getLanguageByKey(languageKey);
    const languageId = language?.id;

    /* ================= MODULE NAME ================= */

    const [moduleName, setModuleName] = useState("");

    const loadModuleName = useCallback(async () => {
        try {
            const res =
                languageId === 1
                    ? await getModuleById(moduleId)
                    : await getModuleTranslation(moduleId, languageId);

            setModuleName(res?.module_name || "");
        } catch (error) {
            setModuleName("");
        }
    }, [moduleId, languageId]);

    useEffect(() => {
        loadModuleName();
    }, [loadModuleName]);

    /* ================= MAIN CONTENT ================= */

    const [mainRows, setMainRows] = useState([]);
    const [mainLoading, setMainLoading] = useState(false);
    const [addContentOpen, setAddContentOpen] = useState(false);

    const loadMainContent = useCallback(async () => {
        try {
            setMainLoading(true);
            const data = await getMainContentList(moduleId, languageId);

            const rows = (Array.isArray(data) ? data : []).map((item) => ({
                id: item.self_paced_learning_id,
                document: item.doc_title,
                contentType: item.doc_type,
                docId: item.doc_id,
                docRefId: item.doc_ref_id,
                isActive: String(item.is_active) === "1",
            }));

            setMainRows(rows);
        } catch (error) {
            setMainRows([]);
        } finally {
            setMainLoading(false);
        }
    }, [moduleId, languageId]);

    useEffect(() => {
        loadMainContent();
    }, [loadMainContent]);

    // Toggle a content row between active/inactive. The row is NOT
    // removed — the button switches between Deactivate and Activate.
    const handleToggleMain = async (row) => {
        const nextAction = row.isActive ? "deactivate" : "activate";

        const confirmed = window.confirm(
            `${row.isActive ? "Deactivate" : "Activate"} "${row.document}"?`
        );
        if (!confirmed) return;

        try {
            if (row.isActive) {
                await deactivateMainContent(row.id);
                toast.success("Content deactivated.");
            } else {
                await activateMainContent(row.id);
                toast.success("Content activated.");
            }
            loadMainContent();
        } catch (error) {
            toast.error(
                error?.response?.data?.detail ||
                `Unable to ${nextAction} content.`
            );
        }
    };

    /* ================= SELF-PACED LEARNING ================= */

    const [selfRows, setSelfRows] = useState([]);
    const [selfLoading, setSelfLoading] = useState(false);
    const [addSelfOpen, setAddSelfOpen] = useState(false);

    const loadSelfContent = useCallback(async () => {
        try {
            setSelfLoading(true);
            const data = await getSelfPacedList(moduleId, languageId);

            const rows = (Array.isArray(data) ? data : []).map((item) => ({
                id: item.self_paced_learning_id,
                document: item.doc_title,
                contentType: item.doc_type,
                docId: item.doc_id,
                docRefId: item.doc_ref_id,
                isActive: String(item.is_active) === "1",
            }));

            setSelfRows(rows);
        } catch (error) {
            setSelfRows([]);
        } finally {
            setSelfLoading(false);
        }
    }, [moduleId, languageId]);

    useEffect(() => {
        loadSelfContent();
    }, [loadSelfContent]);

    // Self-paced rows reuse the same activate/deactivate endpoints (they act
    // on self_paced_learning_id regardless of listing_type).
    const handleToggleSelf = async (row) => {
        const nextAction = row.isActive ? "deactivate" : "activate";

        const confirmed = window.confirm(
            `${row.isActive ? "Deactivate" : "Activate"} "${row.document}"?`
        );
        if (!confirmed) return;

        try {
            if (row.isActive) {
                await deactivateMainContent(row.id);
                toast.success("Content deactivated.");
            } else {
                await activateMainContent(row.id);
                toast.success("Content activated.");
            }
            loadSelfContent();
        } catch (error) {
            toast.error(
                error?.response?.data?.detail ||
                `Unable to ${nextAction} content.`
            );
        }
    };

    /* ================= VIEW CONTENT ================= */

    // Each content type opens its dedicated Details page:
    //   PDF   -> /pdf-masters/:id
    //   PPT   -> /ppt-masters/:id
    //   Video -> /video-masters/:id
    // The target id is the document's doc_ref_id (the pdf/ppt/video id);
    // if the list didn't include it, resolve it from the document first.
    const TYPE_ROUTE = {
        PDF: "/pdf-masters",
        PPT: "/ppt-masters",
        VIDEO: "/video-masters",
    };

    const handleViewContent = async (row) => {
        const type = String(row.contentType).toUpperCase();
        const base = TYPE_ROUTE[type];

        if (base) {
            let refId = row.docRefId;

            if (!refId && row.docId) {
                try {
                    const res = await getDocument(row.docId);
                    const doc = res?.document ?? res?.data ?? res;
                    refId = doc?.doc_ref_id;
                } catch (error) {
                    refId = null;
                }
            }

            if (refId) {
                navigate(`${base}/${refId}`);
                return;
            }
        }

        navigate(
            `/module-master/configure/${moduleId}/content/${row.docId}`
        );
    };

    /* ================= POST-SESSION ASSESSMENT ================= */

    const [postAssessmentId, setPostAssessmentId] = useState(null);
    const [preAssessmentId, setPreAssessmentId] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getPostAssessments(moduleId);
                const first = res?.assessments?.[0]?.assessment_id ?? null;
                setPostAssessmentId(first);
            } catch (error) {
                setPostAssessmentId(null);
            }
        };
        load();
    }, [moduleId]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getPreAssessments(moduleId);
                const first = res?.assessments?.[0]?.assessment_id ?? null;
                setPreAssessmentId(first);
            } catch (error) {
                setPreAssessmentId(null);
            }
        };
        load();
    }, [moduleId]);

    /* ================= RENDER ================= */

    return (
        <AppLayout>

            {/* ================= HEADER ================= */}

            <div className="mb-3 flex items-center justify-between">
                <span className="text-[20px] font-medium text-[#344050]">
                    Module Configuration
                </span>

                <Breadcrumbs items={breadcrumbItems} />
            </div>

            {/* ================= LANGUAGE TABS ================= */}

            <LanguageTabs
                activeTab={languageKey}
                onChange={setLanguageKey}
            />

            {/* ================= MODULE NAME BANNER ================= */}

            <div className="mb-[24px] flex items-center gap-[10px] rounded-b-[6px] border border-t-0 border-[#D8E2EF] bg-white px-[16px] py-[14px]">
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#732269] text-white">
                    <FiBox size={14} />
                </span>
                <span className="text-[15px] font-semibold text-[#732269]">
                    Module Name ({language?.label}): {moduleName || "-"}
                </span>
            </div>

            {/* ================= 1. SELF-PACED LEARNING ================= */}

            <ConfigSection
                title="Self-Paced Learning (Optional)"
                addTitle="Add self-paced content"
                onAdd={() => setAddSelfOpen(true)}
            >
                <ContentTable
                    rows={selfRows}
                    loading={selfLoading}
                    emptyMessage="No data available in table"
                    renderAction={(row) => (
                        <div className="flex items-center gap-[8px]">
                            {row.isActive && (
                                <button
                                    type="button"
                                    onClick={() => handleViewContent(row)}
                                    className="h-[30px] rounded-[4px] border border-[#732269] bg-white px-[12px] text-[12px] font-medium text-[#732269] hover:bg-[#f7edf5]"
                                >
                                    View Content
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleToggleSelf(row)}
                                className={`h-[30px] rounded-[4px] px-[14px] text-[12px] font-medium text-white ${
                                    row.isActive
                                        ? "bg-[#732269] hover:bg-[#611c58]"
                                        : "bg-[#2E7D32] hover:bg-[#256628]"
                                }`}
                            >
                                {row.isActive ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    )}
                />
            </ConfigSection>

            {/* ================= 2. PRE-SESSION ASSESSMENT ================= */}

            <AssessmentSection
                title="Pre-Session Assessment (Optional)"
                assessmentId={preAssessmentId}
                available={Boolean(preAssessmentId)}
                languageId={languageId}
                moduleName={moduleName}
            />

            {/* ================= 3. MAIN CONTENT ================= */}

            <ConfigSection
                title="Main Content of the Module (Compulsory)"
                addTitle="Add content"
                onAdd={() => setAddContentOpen(true)}
            >
                <ContentTable
                    rows={mainRows}
                    loading={mainLoading}
                    emptyMessage="No data available in table"
                    renderAction={(row) => (
                        <div className="flex items-center gap-[8px]">
                            {row.isActive && (
                                <button
                                    type="button"
                                    onClick={() => handleViewContent(row)}
                                    className="h-[30px] rounded-[4px] border border-[#732269] bg-white px-[12px] text-[12px] font-medium text-[#732269] hover:bg-[#f7edf5]"
                                >
                                    View Content
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleToggleMain(row)}
                                className={`h-[30px] rounded-[4px] px-[14px] text-[12px] font-medium text-white ${
                                    row.isActive
                                        ? "bg-[#732269] hover:bg-[#611c58]"
                                        : "bg-[#2E7D32] hover:bg-[#256628]"
                                }`}
                            >
                                {row.isActive ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    )}
                />
            </ConfigSection>

            {/* ================= 4. POST-SESSION ASSESSMENT ================= */}

            <AssessmentSection
                title="Post-Session Assessment (Compulsory)"
                assessmentId={postAssessmentId}
                available={true}
                languageId={languageId}
                moduleName={moduleName}
            />

            {/* ================= BACK TO LIST ================= */}

            <div className="mt-[6px]">
                <button
                    type="button"
                    onClick={() => navigate("/modules")}
                    className="inline-flex h-[38px] items-center gap-[8px] rounded-[4px] border border-[#344050] bg-white px-[16px] text-[14px] font-medium text-[#344050] hover:bg-[#f8f9fa]"
                >
                    <FiArrowLeft size={16} />
                    Back to Module List
                </button>
            </div>

            {/* ================= MODALS ================= */}

            <AddContentModal
                open={addContentOpen}
                onClose={() => setAddContentOpen(false)}
                moduleId={moduleId}
                onSaved={loadMainContent}
            />

            <AddContentModal
                open={addSelfOpen}
                onClose={() => setAddSelfOpen(false)}
                moduleId={moduleId}
                onSaved={loadSelfContent}
                title="Add Self-Paced Learning Content"
                createContent={createSelfPacedContent}
            />

        </AppLayout>
    );
}