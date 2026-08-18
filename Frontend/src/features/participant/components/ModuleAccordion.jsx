import { useState } from "react";
import {
    FaBookOpen,
    FaCheckCircle,
    FaCheck,
    FaTimes,
    FaLongArrowAltRight,
    FaInfoCircle,
} from "react-icons/fa";

import ResultStats from "./ResultStats";

const MEDIA_URL = import.meta.env.VITE_API_URL || "";
const PASS_THRESHOLD = 40;

const fmt = (n) => {
    const num = Number(n || 0);
    return Number.isInteger(num) ? String(num) : num.toFixed(2);
};

const toMediaUrl = (path) => {
    if (!path || typeof path !== "string") return "";
    if (/^(blob:|https?:\/\/)/i.test(path)) return path;
    return `${MEDIA_URL}/${path.replace(/^app\//, "").replace(/^\/+/, "")}`;
};

/* ------------------------------------------------------------------ badges */

function StatusBadge({ status }) {
    const correct = status === "Correct";
    return (
        <span
            className={`rounded-[3px] px-2 py-[2px] text-[11px] font-semibold ${
                correct
                    ? "bg-[#DCF3E8] text-[#2E7D32]"
                    : "bg-[#FDE7E7] text-[#D74D43]"
            }`}
        >
            {status || "-"}
        </span>
    );
}

function QuestionHead({ title, description, marks, status, image }) {
    return (
        <div className="rounded-t-[4px] border-b border-[#E3E6ED] bg-[#F4F6FA] px-3 py-2">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[#344050]">
                        {title}
                    </div>
                    {description && (
                        <div className="mt-[2px] text-[12px] text-[#7A8699]">
                            {description}
                        </div>
                    )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="rounded-[3px] bg-[#E9F7EF] px-2 py-[2px] text-[11px] font-semibold text-[#2E7D32]">
                        {fmt(marks)} marks
                    </span>
                    <StatusBadge status={status} />
                </div>
            </div>
            {image && (
                <img
                    src={toMediaUrl(image)}
                    alt=""
                    className="mt-2 max-h-28 rounded border object-contain"
                />
            )}
        </div>
    );
}

/* ------------------------------------------------------------ option rows */

function OptionRow({ option, variant = "mcq" }) {
    // MCQ allows multiple correct answers → square checkbox indicator.
    // SCQ has a single answer → round radio indicator.
    const indicatorShape = variant === "scq" ? "rounded-full" : "rounded-[3px]";
    // `is_selected` = the trainee picked this option; `is_correct` = it is a
    // correct answer. These are distinct so a correct answer the trainee did
    // NOT pick is shown as the correct answer, not as "your selection".
    // Fall back to the legacy option_status when the flags aren't present.
    const status = option.option_status;
    const isSelected =
        option.is_selected ?? status === "Wrong";
    const isCorrect =
        option.is_correct ?? status === "Correct";

    const wrongPick = isSelected && !isCorrect;

    // Green highlight for any correct answer; red only for the trainee's
    // wrong pick.
    let label = null;
    if (isSelected && isCorrect) {
        label = { text: "(Your selection - Correct)", color: "text-[#2E7D32]" };
    } else if (wrongPick) {
        label = { text: "(Your selection - Wrong)", color: "text-[#D74D43]" };
    } else if (isCorrect) {
        label = { text: "(Correct answer)", color: "text-[#2E7D32]" };
    }

    return (
        <div
            className={`flex items-center gap-2 rounded-[4px] border px-3 py-2 text-[13px] ${
                isCorrect
                    ? "border-[#C3E6CB] bg-[#F4FBF6]"
                    : wrongPick
                    ? "border-[#F5C2C7] bg-[#FEF6F6]"
                    : "border-[#E3E6ED] bg-white"
            }`}
        >
            <span
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center border ${indicatorShape} ${
                    isCorrect
                        ? "border-[#2E7D32] bg-[#2E7D32] text-white"
                        : wrongPick
                        ? "border-[#D74D43] bg-[#D74D43] text-white"
                        : "border-[#B7C0CE] bg-white"
                }`}
            >
                {(isCorrect || wrongPick) && <FaCheck size={9} />}
            </span>

            <span
                className={
                    isCorrect
                        ? "text-[#2E7D32]"
                        : wrongPick
                        ? "text-[#D74D43]"
                        : "text-[#5E6E82]"
                }
            >
                {option.text}
            </span>

            {label && (
                <span className={`text-[11px] ${label.color}`}>{label.text}</span>
            )}
        </div>
    );
}

function ChoiceQuestion({ title, description, marks, status, image, options, variant = "mcq" }) {
    return (
        <div className="rounded-[4px] border border-[#E3E6ED]">
            <QuestionHead
                title={title}
                description={description}
                marks={marks}
                status={status}
                image={image}
            />
            <div className="space-y-2 p-3">
                {(options || []).map((opt, i) => (
                    <OptionRow
                        key={i}
                        variant={variant}
                        option={{
                            ...opt,
                            text: opt.mcq_option_text ?? opt.scq_option_text ?? "",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------- drop bucket */

function BucketQuestion({ q }) {
    return (
        <div className="rounded-[4px] border border-[#E3E6ED]">
            <QuestionHead
                title={q.drop_bucket_question_title}
                description={q.drop_bucket_question_description}
                marks={q.marks}
                status={q.question_status}
                image={q.image_url}
            />
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
                {(q.buckets || []).map((bucket) => (
                    <div
                        key={bucket.bucket_id}
                        className="rounded-[4px] border border-[#E3E6ED] bg-[#FAFBFD]"
                    >
                        <div className="border-b border-[#E3E6ED] px-3 py-2 text-[12px] font-semibold text-[#344050]">
                            {bucket.bucket_name}
                        </div>
                        <div className="space-y-1 p-2">
                            {(bucket.items || []).length === 0 && (
                                <div className="px-1 py-1 text-[11px] text-[#8A94A6]">
                                    No items
                                </div>
                            )}
                            {(bucket.items || []).map((item) => {
                                // is_answer   = the item belongs in this bucket
                                // is_selected = the trainee dropped it here
                                const isAnswer =
                                    item.is_answer ?? item.is_correct;
                                const isSelected =
                                    item.is_selected ?? item.is_correct;
                                const wrongPick = isSelected && !isAnswer;

                                let label = "";
                                if (wrongPick) {
                                    label = "(Your selection - Incorrect)";
                                } else if (isAnswer && isSelected) {
                                    label = "(Your selection - Correct)";
                                } else if (isAnswer) {
                                    label = "(Correct Answer)";
                                }

                                return (
                                    <div
                                        key={item.item_id}
                                        className={`flex items-center gap-2 rounded-[3px] px-2 py-1 text-[12px] ${
                                            wrongPick
                                                ? "bg-[#FDECEA] text-[#D74D43]"
                                                : isAnswer
                                                ? "bg-[#F4FBF6] text-[#2E7D32]"
                                                : "bg-white text-[#5E6E82]"
                                        }`}
                                    >
                                        <span
                                            className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full text-white ${
                                                wrongPick
                                                    ? "bg-[#D74D43]"
                                                    : isAnswer
                                                    ? "bg-[#2E7D32]"
                                                    : "border border-[#B7C0CE] bg-transparent"
                                            }`}
                                        >
                                            {wrongPick ? (
                                                <FaTimes size={7} />
                                            ) : isAnswer ? (
                                                <FaCheck size={7} />
                                            ) : null}
                                        </span>
                                        <span>{item.item_name}</span>
                                        {label && (
                                            <span className="text-[10px] font-medium opacity-80">
                                                {label}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------ match making */

function MatchQuestion({ q }) {
    const rightMap = {};
    (q.right_items || []).forEach((r) => {
        rightMap[String(r.match_right_id)] = r.match_right_text;
    });

    return (
        <div className="rounded-[4px] border border-[#E3E6ED]">
            <QuestionHead
                title={q.match_making_question_title}
                description={q.match_making_question_description}
                marks={q.marks}
                status={q.question_status}
                image={q.image_url}
            />
            <div className="space-y-2 p-3">
                {(q.left_items || []).map((left) => (
                    <div
                        key={left.match_left_id}
                        className="flex flex-wrap items-center gap-2 rounded-[4px] border border-[#E3E6ED] bg-white px-3 py-2 text-[13px]"
                    >
                        <span className="font-medium text-[#344050]">
                            {left.match_left_text}
                        </span>
                        <FaLongArrowAltRight className="text-[#8A94A6]" size={13} />
                        <span className="text-[#3f9d90]">
                            {rightMap[String(left.selected_right)] || "—"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------- container */

export default function ModuleAccordion({ module }) {
    const tabs = [
        { key: "mcq", label: "MCQ", list: module.mcq_list || [] },
        { key: "scq", label: "SCQ", list: module.scq_list || [] },
        { key: "db", label: "Drop Bucket", list: module.bucket_list || [] },
        { key: "mm", label: "Match Making", list: module.match_making_list || [] },
    ];

    const firstWithData = tabs.find((t) => t.list.length > 0)?.key || "mcq";
    const [active, setActive] = useState(firstWithData);

    const percentage = Number(module.percentage || 0);
    const passed = percentage >= PASS_THRESHOLD;
    const total = Number(module.total_questions || 0);
    const completed = Number(module.completed_questions || 0);
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const activeTab = tabs.find((t) => t.key === active) || tabs[0];

    // The backend flags an unattempted module with has_data === false; show a
    // clear message instead of misleading 0% / Failed stats.
    const notAttempted = module.has_data === false;

    const renderList = () => {
        if (!activeTab.list.length) {
            return (
                <div className="rounded-[4px] border border-dashed border-[#E3E6ED] py-6 text-center text-[12px] text-[#8A94A6]">
                    No {activeTab.label} questions in this module.
                </div>
            );
        }

        if (active === "db") {
            return (
                <div className="space-y-4">
                    {activeTab.list.map((q) => (
                        <BucketQuestion key={q.drop_bucket_id} q={q} />
                    ))}
                </div>
            );
        }

        if (active === "mm") {
            return (
                <div className="space-y-4">
                    {activeTab.list.map((q) => (
                        <MatchQuestion key={q.match_making_id} q={q} />
                    ))}
                </div>
            );
        }

        // MCQ / SCQ
        return (
            <div
                className={`grid gap-4 ${
                    activeTab.list.length > 1 ? "lg:grid-cols-2" : "grid-cols-1"
                }`}
            >
                {activeTab.list.map((q) => (
                    <ChoiceQuestion
                        key={q.mcq_id ?? q.scq_id}
                        variant={active}
                        title={q.mcq_question_title ?? q.scq_question_title}
                        description={
                            q.mcq_question_description ?? q.scq_question_description
                        }
                        marks={q.marks}
                        status={q.question_status}
                        image={q.image_url}
                        options={q.option}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="overflow-hidden rounded-[6px] border border-[#D8E2EF] bg-white">
            {/* Purple header */}
            <div className="flex items-center gap-2 bg-[#732269] px-4 py-3 text-white">
                <FaBookOpen size={14} />
                <span className="text-[15px] font-semibold">
                    {module.module_name} – Post Assessment
                </span>
            </div>

            {notAttempted ? (
                <div className="p-4">
                    <div className="flex items-center gap-2 rounded-[4px] border border-[#D8E2EF] bg-[#F4F6FA] px-3 py-3 text-[13px] text-[#5E6E82]">
                        <FaInfoCircle size={13} className="text-[#8A94A6]" />
                        <span>
                            No post assessment attempted for this module yet.{" "}
                            ({total} questions configured)
                        </span>
                    </div>
                </div>
            ) : (
            <div className="p-4">
                {/* Status banner */}
                <div
                    className={`mb-4 flex items-center gap-2 rounded-[4px] border px-3 py-2 text-[13px] ${
                        passed
                            ? "border-[#C3E6CB] bg-[#EAF7EE] text-[#2E7D32]"
                            : "border-[#F5C2C7] bg-[#FDECEA] text-[#D74D43]"
                    }`}
                >
                    <FaCheckCircle size={13} />
                    <span>
                        Score: {fmt(percentage)}% - {passed ? "Passed" : "Failed"} |
                        Completed: {completed} / {total} questions
                    </span>
                </div>

                <ResultStats
                    variant="module"
                    totalQuestions={total}
                    completed={completed}
                    correct={module.correct}
                    wrong={module.wrong}
                    score={module.score}
                    totalMarks={module.total_marks}
                    percentage={module.percentage}
                    progress={progress}
                />

                {/* Tabs */}
                <div className="mt-4 flex flex-wrap gap-1 border-b border-[#E3E6ED]">
                    {tabs.map((tab) => {
                        const isActive = tab.key === active;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActive(tab.key)}
                                className={`rounded-t-[4px] px-4 py-2 text-[13px] font-medium transition-colors ${
                                    isActive
                                        ? "bg-[#732269] text-white"
                                        : "text-[#5E6E82] hover:bg-[#F4F6FA]"
                                }`}
                            >
                                {tab.label} ({tab.list.length})
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div className="pt-4">{renderList()}</div>
            </div>
            )}
        </div>
    );
}
