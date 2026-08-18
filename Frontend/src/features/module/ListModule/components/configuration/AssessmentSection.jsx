import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

import ConfigSection from "./ConfigSection";
import AddAssessmentModal from "./AddAssessmentModal";
import {
    ASSESSMENT_TYPES,
    getAssessmentQuestions,
    deactivateAssessmentMapping,
} from "../../services/ConfigurationService";

/* =========================================================
   AssessmentSection

   Pre- / Post-Session assessment block:
   - MCQ | SCQ | Drop Bucket | Match Making tab bar
   - "Question | Action" table of ASSIGNED questions
   - "+" opens the question picker for the active tab

   `available` is false for sections whose backend endpoint
   does not exist yet (Pre-Session); the UI still renders to
   match the design, but data + add are gated.
========================================================= */

const TABS = [
    { key: "MCQ", label: "MCQ", emptyLabel: "MCQ" },
    { key: "SCQ", label: "SCQ", emptyLabel: "SCQ" },
    { key: "DB", label: "Drop Bucket", emptyLabel: "Drop Bucket" },
    { key: "MM", label: "Match Making", emptyLabel: "Match Making" },
];

export default function AssessmentSection({
    title,
    assessmentId = null,
    available = true,
    languageId = null,
    moduleName = "",
}) {
    // The modal header shows just the assessment name (e.g.
    // "Post-Session Assessment"), without the "(Optional)"/"(Compulsory)"
    // qualifier used in the section heading.
    const modalTitle = title
        .replace(/\s*\((Optional|Compulsory)\)\s*$/i, "")
        .trim();

    const [activeTab, setActiveTab] = useState("MCQ");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const cfg = ASSESSMENT_TYPES[activeTab];

    const loadQuestions = useCallback(async () => {
        if (!available || !assessmentId) {
            setQuestions([]);
            return;
        }

        try {
            setLoading(true);
            const data = await getAssessmentQuestions(
                assessmentId,
                activeTab,
                languageId
            );
            setQuestions(Array.isArray(data) ? data : []);
        } catch (error) {
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    }, [available, assessmentId, activeTab, languageId]);

    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    const assigned = questions.filter((q) => q.is_checked);

    const handleAdd = () => {
        if (!available) {
            toast(
                "This section's backend endpoint is not enabled yet."
            );
            return;
        }
        if (!assessmentId) {
            toast(
                "No assessment is linked to this module yet."
            );
            return;
        }
        setModalOpen(true);
    };

    const handleDeactivate = async (row) => {
        const confirmed = window.confirm(
            "Deactivate this question from the module?"
        );
        if (!confirmed) return;

        try {
            await deactivateAssessmentMapping({
                assessment_id: assessmentId,
                assessment_type: cfg.type,
                assessment_ref_id: row[cfg.refKey],
            });
            toast.success("Question deactivated.");
            loadQuestions();
        } catch (error) {
            toast.error(
                error?.response?.data?.detail ||
                "Unable to deactivate question."
            );
        }
    };

    const activeEmptyLabel =
        TABS.find((t) => t.key === activeTab)?.emptyLabel || activeTab;

    return (
        <ConfigSection
            title={title}
            onAdd={handleAdd}
            addTitle="Assign question"
        >

            {/* ================= TAB BAR ================= */}

            <div className="mb-[16px] flex overflow-hidden rounded-[4px] border border-[#e3d3e0] bg-[#f6edf5]">
                {TABS.map((tab, index) => {
                    const isActive = tab.key === activeTab;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 px-[14px] py-[10px] text-center text-[13px] font-semibold transition
                            ${index !== 0 ? "border-l border-[#e3d3e0]" : ""}
                            ${
                                isActive
                                    ? "bg-[#732269] text-white"
                                    : "bg-transparent text-[#5a3a54] hover:bg-[#efe1ec]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ================= QUESTION TABLE ================= */}

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#f6edf5]">
                            <th className="border-b border-[#e6d9e4] px-[14px] py-[12px] text-left text-[13px] font-semibold text-[#344050]">
                                <span className="inline-flex items-center gap-[6px]">
                                    Question
                                    <span className="flex flex-col leading-[6px] text-[#b9a7b6]">
                                        <IoIosArrowUp size={9} />
                                        <IoIosArrowDown size={9} />
                                    </span>
                                </span>
                            </th>
                            <th className="border-b border-[#e6d9e4] px-[14px] py-[12px] text-left text-[13px] font-semibold text-[#344050]">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={2} className="py-[26px] text-center text-[13px] text-[#6c757d]">
                                    Loading...
                                </td>
                            </tr>
                        ) : assigned.length === 0 ? (
                            <tr>
                                <td colSpan={2} className="py-[26px] text-center text-[13px] text-[#6c757d]">
                                    No {activeEmptyLabel} questions assigned
                                </td>
                            </tr>
                        ) : (
                            assigned.map((row, index) => (
                                <tr
                                    key={row[cfg.refKey] ?? `${cfg.refKey}-${index}`}
                                    className="border-b border-[#eef0f3] last:border-b-0"
                                >
                                    <td className="px-[14px] py-[13px] text-[13px] text-[#344050]">
                                        {row[cfg.titleKey] || "(untitled)"}
                                    </td>
                                    <td className="px-[14px] py-[13px]">
                                        <button
                                            type="button"
                                            onClick={() => handleDeactivate(row)}
                                            className="h-[30px] rounded-[4px] bg-[#732269] px-[14px] text-[12px] font-medium text-white hover:bg-[#611c58]"
                                        >
                                            Deactivate
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ================= ADD MODAL ================= */}

            <AddAssessmentModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                assessmentId={assessmentId}
                languageId={languageId}
                moduleName={moduleName}
                title={modalTitle}
                onSaved={loadQuestions}
            />

        </ConfigSection>
    );
}
