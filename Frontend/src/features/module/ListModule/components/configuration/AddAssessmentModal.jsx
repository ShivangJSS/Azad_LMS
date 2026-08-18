import { useState, useMemo, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

import {
    ASSESSMENT_TYPES,
    getAssessmentQuestions,
    saveAssessmentMapping,
} from "../../services/ConfigurationService";

/* =========================================================
   AddAssessmentModal

   Full assessment question picker matching the design:
   - dark purple header ("Add <title>" + "Module Name: <x>")
   - MCQ | SCQ | Drop Bucket | Match Making tabs INSIDE the modal
   - question table with a select-all header checkbox + per-row
     checkboxes (already-assigned rows are pre-checked & disabled)
   - Save / Cancel footer

   Reuses the existing ConfigurationService endpoints. Loads the
   active tab's question bank itself and, on save, sends only the
   newly-selected questions to POST /modules/assessment-mapping.

   Scroll behaviour: the background page is locked while open and
   only the question list scrolls (overscroll contained), so the
   header and footer stay put and the page never moves.
========================================================= */

const TABS = [
    { key: "MCQ", label: "MCQ" },
    { key: "SCQ", label: "SCQ" },
    { key: "DB", label: "Drop Bucket" },
    { key: "MM", label: "Match Making" },
];

export default function AddAssessmentModal({
    open,
    onClose,
    assessmentId,
    languageId = null,
    moduleName = "",
    title = "Assessment",
    onSaved,
}) {
    const [activeTab, setActiveTab] = useState("MCQ");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(() => new Set());
    const [saving, setSaving] = useState(false);

    const cfg = ASSESSMENT_TYPES[activeTab] || {};

    const alreadyChecked = useMemo(() => {
        const set = new Set();
        questions.forEach((q) => {
            if (q.is_checked) set.add(q[cfg.refKey]);
        });
        return set;
    }, [questions, cfg.refKey]);

    // Load the question bank for the active tab.
    const loadQuestions = useCallback(async () => {
        if (!open || !assessmentId) {
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
    }, [open, assessmentId, activeTab, languageId]);

    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    // Pre-check already-assigned questions each time the bank (re)loads.
    useEffect(() => {
        setSelected(new Set(alreadyChecked));
    }, [alreadyChecked]);

    // Always open on the first (MCQ) tab.
    useEffect(() => {
        if (open) setActiveTab("MCQ");
    }, [open]);

    // Lock the background scroll + close on Escape while the modal is open.
    // The page scrolls on the window (AppLayout uses min-h-screen), so locking
    // <body> alone doesn't stop it — lock <html> as well. A right-side padding
    // equal to the scrollbar width keeps the page from shifting when the bar
    // disappears.
    useEffect(() => {
        if (!open) return undefined;

        const html = document.documentElement;
        const body = document.body;

        const prevHtmlOverflow = html.style.overflow;
        const prevBodyOverflow = body.style.overflow;
        const prevBodyPaddingRight = body.style.paddingRight;

        const scrollbarWidth = window.innerWidth - html.clientWidth;

        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        const onKeyDown = (event) => {
            if (event.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKeyDown);

        return () => {
            html.style.overflow = prevHtmlOverflow;
            body.style.overflow = prevBodyOverflow;
            body.style.paddingRight = prevBodyPaddingRight;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [open, onClose]);

    if (!open) return null;

    const toggle = (refId) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(refId)) next.delete(refId);
            else next.add(refId);
            return next;
        });
    };

    // Select-all applies only to rows that aren't already assigned.
    const selectableIds = questions
        .map((q) => q[cfg.refKey])
        .filter((id) => !alreadyChecked.has(id));

    const allSelected =
        selectableIds.length > 0 &&
        selectableIds.every((id) => selected.has(id));

    const toggleAll = () => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (allSelected) selectableIds.forEach((id) => next.delete(id));
            else selectableIds.forEach((id) => next.add(id));
            return next;
        });
    };

    const handleSave = async () => {
        const toAdd = [...selected].filter((id) => !alreadyChecked.has(id));

        if (toAdd.length === 0) {
            toast("No new questions selected.");
            return;
        }

        try {
            setSaving(true);
            await saveAssessmentMapping({
                assessment_type: cfg.type,
                assessments: toAdd.map((refId) => ({
                    assessment_id: assessmentId,
                    assessment_ref_id: refId,
                })),
            });

            toast.success("Questions assigned successfully.");
            onSaved?.();
            onClose?.();
        } catch (error) {
            toast.error(
                error?.response?.data?.detail ||
                "Unable to assign questions."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-[28px]"
            onClick={onClose}
        >
            <div
                className="flex max-h-[calc(100vh-56px)] w-full max-w-[1120px] flex-col overflow-hidden rounded-[8px] bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >

                {/* ================= HEADER (stays visible) ================= */}
                <div className="flex items-start justify-between bg-[#732269] px-[22px] py-[16px]">
                    <div className="flex items-start gap-[12px]">
                        <span className="mt-[2px] text-white">
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M9 2h6a1 1 0 0 1 1 1v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1z" />
                                <path d="M9 13l2 2 4-4" />
                            </svg>
                        </span>
                        <div>
                            <h3 className="m-0 text-[20px] font-semibold leading-[26px] text-white">
                                Add {title}
                            </h3>
                            <p className="m-0 text-[13px] text-white/85">
                                Module Name: {moduleName || "-"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[24px] leading-none text-white/90 hover:text-white"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                {/* ================= TABS (stay visible) ================= */}
                <div className="flex gap-[6px] border-b border-[#e6d9e4] px-[22px] pt-[14px]">
                    {TABS.map((tab) => {
                        const isActive = tab.key === activeTab;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`rounded-t-[6px] px-[22px] py-[10px] text-[14px] font-semibold transition ${
                                    isActive
                                        ? "bg-[#732269] text-white"
                                        : "text-[#5a3a54] hover:bg-[#f6edf5]"
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ================= SCROLLABLE CONTENT (only this scrolls) ============= */}
                <div
                    className="flex-1 overflow-y-auto px-[22px] py-[16px]"
                    style={{ overscrollBehavior: "contain" }}
                >
                    <div className="overflow-hidden rounded-[4px] border border-[#e6d9e4]">
                        <div className="overflow-x-auto"><table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#f6edf5]">
                                    <th className="w-[56px] border-b border-[#e6d9e4] px-[16px] py-[13px] text-center">
                                        <input
                                            type="checkbox"
                                            className="h-[15px] w-[15px] accent-[#732269]"
                                            checked={allSelected}
                                            onChange={toggleAll}
                                            disabled={selectableIds.length === 0}
                                            aria-label="Select all"
                                        />
                                    </th>
                                    <th className="border-b border-[#e6d9e4] px-[16px] py-[13px] text-left text-[14px] font-semibold text-[#344050]">
                                        <span className="inline-flex items-center gap-[6px]">
                                            Question
                                            <span className="flex flex-col leading-[6px] text-[#b9a7b6]">
                                                <IoIosArrowUp size={9} />
                                                <IoIosArrowDown size={9} />
                                            </span>
                                        </span>
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={2}
                                            className="py-[28px] text-center text-[13px] text-[#6c757d]"
                                        >
                                            Loading questions…
                                        </td>
                                    </tr>
                                ) : questions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={2}
                                            className="py-[28px] text-center text-[13px] text-[#6c757d]"
                                        >
                                            No questions available in the bank.
                                        </td>
                                    </tr>
                                ) : (
                                    questions.map((q) => {
                                        const refId = q[cfg.refKey];
                                        const isMapped = alreadyChecked.has(refId);

                                        return (
                                            <tr
                                                key={refId}
                                                className="border-b border-[#eef0f3] last:border-b-0 hover:bg-[#faf6f9]"
                                            >
                                                <td className="px-[16px] py-[12px] text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-[15px] w-[15px] accent-[#732269]"
                                                        checked={selected.has(refId)}
                                                        disabled={isMapped}
                                                        onChange={() => toggle(refId)}
                                                    />
                                                </td>
                                                <td className="px-[16px] py-[12px] text-[14px] text-[#344050]">
                                                    {q[cfg.titleKey] || "(untitled)"}
                                                    {isMapped && (
                                                        <span className="ml-[8px] text-[11px] text-[#8a94a6]">
                                                            • already assigned
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table></div>
                    </div>
                </div>

                {/* ================= FOOTER (stays accessible) ================= */}
                <div className="flex justify-end gap-[10px] border-t border-[#eef0f3] px-[22px] py-[14px]">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="h-[36px] rounded-[4px] bg-[#732269] px-[22px] text-[13px] font-semibold text-white hover:bg-[#611c58] disabled:opacity-60"
                    >
                        {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-[36px] rounded-[4px] border border-[#adb5bd] bg-white px-[22px] text-[13px] font-semibold text-[#344050] hover:bg-[#f5f6f8]"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
}
