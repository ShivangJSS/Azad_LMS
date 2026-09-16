import { useState, useMemo } from "react";
import {
    FaBookOpen,
    FaCheckCircle,
    FaCheck,
    FaTimes,
    FaLongArrowAltRight,
    FaInfoCircle,
} from "react-icons/fa";

import ResultStats from "./ResultStats";
import { deriveModuleStats } from "../utils/assessmentStats";

const MEDIA_URL = import.meta.env.VITE_API_URL || "";
const PASS_THRESHOLD = 40;

const isTrue = (value) =>
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true";


/* ============================================================
   HELPERS
============================================================ */

const fmt = (n) => {
    const num = Number(n || 0);
    return Number.isInteger(num)
        ? String(num)
        : num.toFixed(2);
};


const toMediaUrl = (path) => {
    if (!path || typeof path !== "string") {
        return "";
    }

    if (/^(blob:|https?:\/\/)/i.test(path)) {
        return path;
    }

    return `${MEDIA_URL}/${path
        .replace(/^app\//, "")
        .replace(/^\/+/, "")}`;
};


/*
 * Normalize text so these are treated as duplicates:
 *
 * "Following speed limits"
 * " following speed limits "
 * "FOLLOWING SPEED LIMITS"
 * "Following   speed   limits"
 */
const normalizeText = (value) => {
    return String(value ?? "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
};


/*
 * Remove duplicate options.
 *
 * We use option text because the backend may accidentally
 * create duplicate records with different IDs.
 *
 * Example:
 *
 * ID 101 -> Following speed limits
 * ID 102 -> Following speed limits
 *
 * Only one will be displayed.
 */
const getUniqueOptions = (options = []) => {
    const seen = new Set();
    const unique = [];

    for (const option of options) {
        if (!option) {
            continue;
        }

        const text =
            option.mcq_option_text ??
            option.scq_option_text ??
            option.text ??
            "";

        const normalized = normalizeText(text);

        // Ignore completely empty options
        if (!normalized) {
            continue;
        }

        if (seen.has(normalized)) {
            continue;
        }

        seen.add(normalized);

        unique.push({
            ...option,
            text: String(text)
                .trim()
                .replace(/\s+/g, " "),
        });
    }

    return unique;
};


/*
 * Remove duplicate questions.
 *
 * This is additional protection in case the backend returns
 * the same question more than once.
 */
const getUniqueQuestions = (questions = [], type = "mcq") => {
    const seen = new Set();
    const unique = [];

    for (const question of questions) {
        if (!question) {
            continue;
        }

        const id =
            type === "mcq"
                ? question.mcq_id
                : question.scq_id;

        const title =
            question.mcq_question_title ??
            question.scq_question_title ??
            "";

        const key =
            id != null
                ? `${type}-${id}`
                : `${type}-${normalizeText(title)}`;

        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        unique.push(question);
    }

    return unique;
};


/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
    const correct = status === "Correct";

    return (
        <span
            className={`rounded-[3px] px-2 py-[2px] text-[11px] font-semibold ${correct
                ? "bg-[#DCF3E8] text-[#2E7D32]"
                : "bg-[#FDE7E7] text-[#D74D43]"
                }`}
            aria-hidden="true"
        >
            {status || "-"}
        </span>
    );
}


/* ============================================================
   QUESTION HEADER
============================================================ */

function QuestionHead({
    title,
    description,
    marks,
    status,
    image,
}) {
    const isCorrect = status === "Correct";

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

                <div className="flex flex-shrink-0 items-center gap-1.5">

                    <span className="rounded-[3px] bg-[#E2E8F0] px-2 py-[2px] text-[11px] font-semibold text-[#475569]">
                        Max: {fmt(marks)} Marks
                    </span>

                    <span
                        className={`rounded-[3px] px-2 py-[2px] text-[11px] font-semibold ${isCorrect
                            ? "bg-[#DCF3E8] text-[#2E7D32]"
                            : "bg-[#FDE7E7] text-[#D74D43]"
                            }`}
                    >
                        Obtained:{" "}
                        {isCorrect
                            ? fmt(marks)
                            : "0"}{" "}
                        Marks
                    </span>

                </div>
            </div>

            {image && (
                <img
                    src={toMediaUrl(image)}
                    alt={
                        title ||
                        "Question visual reference"
                    }
                    className="mt-2 max-h-28 rounded border object-contain"
                />
            )}
        </div>
    );
}


/* ============================================================
   OPTION ROW
============================================================ */

function OptionRow({
    option,
    variant = "mcq",
}) {
    const indicatorShape =
        variant === "scq"
            ? "rounded-full"
            : "rounded-[3px]";

    const status = option.option_status;

    const isSelected =
        option.is_selected ??
        (status === "Wrong");

    const isCorrect =
        option.is_correct ??
        (status === "Correct");

    const wrongPick =
        isSelected && !isCorrect;

    let label = null;

    if (isSelected && isCorrect) {
        label = {
            text: "(Your selection - Correct)",
            color: "text-[#2E7D32]",
        };
    } else if (wrongPick) {
        label = {
            text: "(Your selection - Wrong)",
            color: "text-[#D74D43]",
        };
    } else if (isCorrect) {
        label = {
            text: "(Correct answer)",
            color: "text-[#2E7D32]",
        };
    }

    return (
        <div
            className={`flex items-center gap-2 rounded-[4px] border px-3 py-2 text-[13px] ${isCorrect
                ? "border-[#C3E6CB] bg-[#F4FBF6]"
                : wrongPick
                    ? "border-[#F5C2C7] bg-[#FEF6F6]"
                    : "border-[#E3E6ED] bg-white"
                }`}
        >
            <span
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center border ${indicatorShape} ${isCorrect
                    ? "border-[#2E7D32] bg-[#2E7D32] text-white"
                    : wrongPick
                        ? "border-[#D74D43] bg-[#D74D43] text-white"
                        : "border-[#B7C0CE] bg-white"
                    }`}
            >
                {(isCorrect || wrongPick) && (
                    <FaCheck size={9} />
                )}
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
                <span
                    className={`text-[11px] ${label.color}`}
                >
                    {label.text}
                </span>
            )}
        </div>
    );
}


/* ============================================================
   MCQ / SCQ
============================================================ */

function ChoiceQuestion({
    title,
    description,
    marks,
    status,
    image,
    options,
    variant = "mcq",
}) {
    const uniqueOptions = useMemo(
        () => getUniqueOptions(options || []),
        [options]
    );

    const correctCount = uniqueOptions.filter(
        (option) => isTrue(option.is_correct)
    ).length;

    const selectedCount = uniqueOptions.filter(
        (option) => isTrue(option.is_selected)
    ).length;

    const incompleteAnswer =
        correctCount > 1 &&
        selectedCount > 0 &&
        selectedCount < correctCount;


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

                {uniqueOptions.map((option, index) => {
                    const optionKey =
                        option.mcq_option_id ??
                        option.scq_option_id ??
                        `${variant}-${normalizeText(option.text)}-${index}`;

                    return (
                        <OptionRow
                            key={optionKey}
                            variant={variant}
                            option={option}
                        />
                    );
                })}

                {incompleteAnswer && (
                    <div className="rounded-[4px] border border-[#F5D08A] bg-[#FFF8E7] px-3 py-2 text-[12px] font-medium text-[#A16207]">
                        You selected only {selectedCount} of{" "}
                        {correctCount} correct answers.
                    </div>
                )}

            </div>
        </div>
    );
}



/* ============================================================
   DROP BUCKET
============================================================ */

function BucketQuestion({ q }) {
    // Collect all items from all buckets
    const allItems = (q.buckets || []).flatMap(
        (bucket) => bucket.items || []
    );

    // Total correct answers/items
    const correctCount = allItems.filter(
        (item) =>
            item.is_answer === true ||
            item.is_correct === true
    ).length;

    // Total items selected by user
    const selectedCount = allItems.filter(
        (item) => item.is_selected === true
    ).length;

    // User selected some, but not all correct answers
    const incompleteAnswer =
        correctCount > 1 &&
        selectedCount > 0 &&
        selectedCount < correctCount;

    return (
        <div className="rounded-[4px] border border-[#E3E6ED]">

            <QuestionHead
                title={
                    q.drop_bucket_question_title
                }
                description={
                    q.drop_bucket_question_description
                }
                marks={q.marks}
                status={q.question_status}
                image={q.image_url}
            />

            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">

                {(q.buckets || []).map(
                    (bucket) => {

                        const hasItems =
                            (bucket.items || [])
                                .length > 0;

                        return (
                            <div
                                key={bucket.bucket_id}
                                className="rounded-[4px] border border-[#E3E6ED] bg-[#FAFBFD]"
                            >
                                <div className="border-b border-[#E3E6ED] bg-[#F1F5F9] px-3 py-2 text-[12px] font-semibold text-[#344050]">
                                    {bucket.bucket_name}
                                </div>

                                <div className="space-y-1.5 p-2">

                                    {!hasItems && (
                                        <div className="px-1 py-2 text-center text-[11px] italic text-[#8A94A6]">
                                            No items placed in this bucket
                                        </div>
                                    )}

                                    {hasItems &&
                                        bucket.items.map(
                                            (
                                                item,
                                                idx
                                            ) => {

                                                const isAnswer = isTrue(item.is_answer) || isTrue(item.is_correct);

                                                const isSelected = isTrue(item.is_selected);

                                                const wrongPick =
                                                    isSelected &&
                                                    !isAnswer;

                                                let label = "";

                                                if (
                                                    wrongPick
                                                ) {
                                                    label =
                                                        "(Your selection - Incorrect)";
                                                } else if (
                                                    isAnswer &&
                                                    isSelected
                                                ) {
                                                    label =
                                                        "(Your selection - Correct)";
                                                } else if (
                                                    isAnswer
                                                ) {
                                                    label =
                                                        "(Correct Answer)";
                                                }

                                                return (
                                                    <div
                                                        key={
                                                            item.item_id ??
                                                            idx
                                                        }
                                                        className={`flex items-center gap-2 rounded-[3px] border px-2 py-1.5 text-[12px] ${wrongPick
                                                            ? "border-[#F5C2C7] bg-[#FDECEA] text-[#D74D43]"
                                                            : isAnswer
                                                                ? "border-[#C3E6CB] bg-[#F4FBF6] text-[#2E7D32]"
                                                                : "border-[#E3E6ED] bg-white text-[#5E6E82]"
                                                            }`}
                                                    >

                                                        <span
                                                            aria-hidden="true"
                                                            className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full text-white ${wrongPick
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

                                                        <span className="font-medium">
                                                            {item.item_name}
                                                        </span>

                                                        {label && (
                                                            <span className="ml-auto text-[10px] font-semibold opacity-90">
                                                                {label}
                                                            </span>
                                                        )}

                                                    </div>
                                                );
                                            }
                                        )}

                                </div>
                            </div>
                        );
                    }
                )}

            </div>

            {/* Incomplete answer message */}
            {incompleteAnswer && (
                <div className="mx-3 mb-3 rounded-[4px] border border-[#F5D08A] bg-[#FFF8E7] px-3 py-2 text-[12px] font-medium text-[#A16207]">
                    You selected only {selectedCount} of{" "}
                    {correctCount} correct answers.
                </div>
            )}

        </div>
    );
}


/* ============================================================
   MATCH MAKING
============================================================ */

function MatchQuestion({ q }) {
    const totalItems = (q.left_items || []).length;
    const selectedCount = (q.left_items || []).filter((left) => isTrue(left.is_selected) || left.selected_right != null).length;
    const correctlyMatchedCount = (q.left_items || []).filter((left) => isTrue(left.is_correct)).length;
    const incompleteAnswer = totalItems > 1 && selectedCount > 0 && correctlyMatchedCount < totalItems;

    const rightMap = useMemo(() => {

        const map = {};

        (q.right_items || []).forEach(
            (r) => {
                map[
                    String(r.match_right_id)
                ] = r.match_right_text;
            }
        );

        return map;

    }, [q.right_items]);

    return (
        <div className="rounded-[4px] border border-[#E3E6ED]">

            <QuestionHead
                title={
                    q.match_making_question_title
                }
                description={
                    q.match_making_question_description
                }
                marks={q.marks}
                status={q.question_status}
                image={q.image_url}
            />

            <div className="space-y-2 p-3">

                {(q.left_items || []).map(
                    (left) => {

                        const isSelected = isTrue(left.is_selected) || left.selected_right != null;

                        const isCorrect = isTrue(left.is_correct);

                        const wrongPick =
                            isSelected &&
                            !isCorrect;

                        const selectedText =
                            rightMap[
                            String(
                                left.selected_right
                            )
                            ] ||
                            "Not Answered";

                        const correctText =
                            rightMap[
                            String(
                                left.correct_right
                            )
                            ] ||
                            "—";

                        return (
                            <div
                                key={
                                    left.match_left_id
                                }
                                className={`rounded-[4px] border px-3 py-2 text-[13px] ${isCorrect
                                    ? "border-[#C3E6CB] bg-[#F4FBF6]"
                                    : wrongPick
                                        ? "border-[#F5C2C7] bg-[#FEF6F6]"
                                        : "border-[#E3E6ED] bg-white"
                                    }`}
                            >

                                <div className="flex flex-wrap items-center gap-2">

                                    <span
                                        aria-hidden="true"
                                        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${isCorrect
                                            ? "border-[#2E7D32] bg-[#2E7D32] text-white"
                                            : wrongPick
                                                ? "border-[#D74D43] bg-[#D74D43] text-white"
                                                : "border-[#B7C0CE] bg-white"
                                            }`}
                                    >
                                        {isCorrect ? (
                                            <FaCheck size={9} />
                                        ) : wrongPick ? (
                                            <FaTimes size={9} />
                                        ) : null}
                                    </span>

                                    <span className="font-medium text-[#344050]">
                                        {
                                            left.match_left_text
                                        }
                                    </span>

                                    <FaLongArrowAltRight
                                        className="text-[#8A94A6]"
                                        size={13}
                                        aria-hidden="true"
                                    />

                                    <span
                                        className={
                                            isCorrect
                                                ? "font-semibold text-[#2E7D32]"
                                                : wrongPick
                                                    ? "font-semibold text-[#D74D43]"
                                                    : "italic text-[#8A94A6]"
                                        }
                                    >
                                        {selectedText}
                                    </span>

                                    {isCorrect && (
                                        <span className="text-[11px] font-medium text-[#2E7D32]">
                                            (Your selection - Correct)
                                        </span>
                                    )}

                                    {wrongPick && (
                                        <span className="text-[11px] font-medium text-[#D74D43]">
                                            (Your selection - Incorrect)
                                        </span>
                                    )}

                                    {!isSelected && (
                                        <span className="text-[11px] text-[#8A94A6]">
                                            (Not answered)
                                        </span>
                                    )}

                                </div>

                                {!isCorrect && (
                                    <div className="mt-1 flex flex-wrap items-center gap-2 pl-6 text-[12px]">

                                        <span className="text-[#8A94A6]">
                                            Correct match:
                                        </span>

                                        <span className="font-medium text-[#2E7D32]">
                                            {correctText}
                                        </span>

                                    </div>
                                )}

                            </div>
                        );
                    }
                )}

            </div>

            {incompleteAnswer && (
                <div className="mx-3 mb-3 rounded-[4px] border border-[#F5D08A] bg-[#FFF8E7] px-3 py-2 text-[12px] font-medium text-[#A16207]">You correctly matched only {correctlyMatchedCount} of {totalItems} items.</div>
            )}

        </div>
    );
}


/* ============================================================
   MODULE ACCORDION
============================================================ */

export default function ModuleAccordion({
    module,
}) {

    /*
     * Remove duplicate questions at module level.
     */
    const mcqList = useMemo(
        () =>
            getUniqueQuestions(
                module?.mcq_list || [],
                "mcq"
            ),
        [module?.mcq_list]
    );

    const scqList = useMemo(
        () =>
            getUniqueQuestions(
                module?.scq_list || [],
                "scq"
            ),
        [module?.scq_list]
    );

    const bucketList =
        module?.bucket_list || [];

    const matchMakingList =
        module?.match_making_list || [];


    const tabs = useMemo(
        () => [
            {
                key: "mcq",
                label: "MCQ",
                list: mcqList,
            },
            {
                key: "scq",
                label: "SCQ",
                list: scqList,
            },
            {
                key: "db",
                label: "Drop Bucket",
                list: bucketList,
            },
            {
                key: "mm",
                label: "Match Making",
                list: matchMakingList,
            },
        ],
        [
            mcqList,
            scqList,
            bucketList,
            matchMakingList,
        ]
    );


    const firstWithData =
        tabs.find(
            (tab) =>
                tab.list.length > 0
        )?.key || "mcq";


    const [active, setActive] =
        useState(firstWithData);


    /*
     * If module changes and the current tab no longer
     * has data, automatically select the first available tab.
     */
    useMemo(() => {
        const currentTab =
            tabs.find(
                (tab) =>
                    tab.key === active
            );

        if (
            !currentTab ||
            currentTab.list.length === 0
        ) {
            setActive(firstWithData);
        }
    }, [
        tabs,
        active,
        firstWithData,
    ]);


    const percentage =
        Number(module?.percentage || 0);

    const passed =
        percentage >= PASS_THRESHOLD;

    const total =
        Number(module?.total_questions || 0);

    const {
        completed,
        correct,
        wrong,
    } = deriveModuleStats(module);

    const progress =
        total > 0
            ? Math.round(
                (completed / total) *
                100
            )
            : 0;


    const activeTab =
        tabs.find(
            (tab) =>
                tab.key === active
        ) || tabs[0];


    const notAttempted =
        module?.has_data === false;


    /* ========================================================
       RENDER LIST
    ======================================================== */

    const renderList = () => {

        if (!activeTab?.list?.length) {
            return (
                <div className="rounded-[4px] border border-dashed border-[#E3E6ED] py-6 text-center text-[12px] text-[#8A94A6]">
                    No{" "}
                    {activeTab?.label ||
                        "questions"}{" "}
                    questions in this module.
                </div>
            );
        }


        /* ----------------------------------------------------
           DROP BUCKET
        ---------------------------------------------------- */

        if (active === "db") {

            return (
                <div className="space-y-4">

                    {activeTab.list.map(
                        (q) => (
                            <BucketQuestion
                                key={
                                    q.drop_bucket_id
                                }
                                q={q}
                            />
                        )
                    )}

                </div>
            );
        }


        /* ----------------------------------------------------
           MATCH MAKING
        ---------------------------------------------------- */

        if (active === "mm") {

            return (
                <div className="space-y-4">

                    {activeTab.list.map(
                        (q) => (
                            <MatchQuestion
                                key={
                                    q.match_making_id
                                }
                                q={q}
                            />
                        )
                    )}

                </div>
            );
        }


        /* ----------------------------------------------------
           MCQ / SCQ
        ---------------------------------------------------- */

        return (
            <div
                className={`grid gap-4 ${activeTab.list.length > 1
                    ? "lg:grid-cols-2"
                    : "grid-cols-1"
                    }`}
            >

                {activeTab.list.map(
                    (q, index) => {

                        const questionId =
                            q.mcq_id ??
                            q.scq_id ??
                            `${active}-${index}`;

                        return (
                            <ChoiceQuestion
                                key={`${active}-${questionId}`}
                                variant={active}
                                title={
                                    q.mcq_question_title ??
                                    q.scq_question_title
                                }
                                description={
                                    q.mcq_question_description ??
                                    q.scq_question_description
                                }
                                marks={q.marks}
                                status={
                                    q.question_status
                                }
                                image={
                                    q.image_url
                                }
                                options={
                                    q.option || []
                                }
                            />
                        );
                    }
                )}

            </div>
        );
    };


    /* ========================================================
       UI
    ======================================================== */

    return (
        <div className="overflow-hidden rounded-[6px] border border-[#D8E2EF] bg-white">

            {/* Purple header */}

            <div className="flex items-center gap-2 bg-[#732269] px-4 py-3 text-white">

                <FaBookOpen size={14} />

                <span className="text-[15px] font-semibold">
                    {module?.module_name}{" "}
                    – Post Assessment
                </span>

            </div>


            {notAttempted ? (

                <div className="p-4">

                    <div className="flex items-center gap-2 rounded-[4px] border border-[#D8E2EF] bg-[#F4F6FA] px-3 py-3 text-[13px] text-[#5E6E82]">

                        <FaInfoCircle
                            size={13}
                            className="text-[#8A94A6]"
                            aria-hidden="true"
                        />

                        <span>
                            No assessment attempted for this
                            module yet.
                        </span>

                    </div>

                </div>

            ) : (

                <div className="p-4">

                    {/* Status banner */}

                    <div
                        className={`mb-4 flex items-center gap-2 rounded-[4px] border px-3 py-2 text-[13px] ${passed
                            ? "border-[#C3E6CB] bg-[#EAF7EE] text-[#2E7D32]"
                            : "border-[#F5C2C7] bg-[#FDECEA] text-[#D74D43]"
                            }`}
                    >

                        <FaCheckCircle
                            size={13}
                            aria-hidden="true"
                        />

                        <span>
                            Score:{" "}
                            {fmt(
                                percentage
                            )}
                            % -{" "}
                            {passed
                                ? "Passed"
                                : "Failed"}{" "}
                            | Completed:{" "}
                            {completed} /{" "}
                            {total}{" "}
                            questions
                        </span>

                    </div>


                    <ResultStats
                        variant="module"
                        totalQuestions={
                            total
                        }
                        completed={
                            completed
                        }
                        correct={
                            correct
                        }
                        wrong={wrong}
                        score={
                            module?.score
                        }
                        totalMarks={
                            module?.total_marks
                        }
                        percentage={
                            module?.percentage
                        }
                        progress={
                            progress
                        }
                    />


                    {/* Tabs */}

                    <div className="mt-4 flex flex-wrap gap-1 border-b border-[#E3E6ED]">

                        {tabs.map(
                            (tab) => {

                                const isActive =
                                    tab.key ===
                                    active;

                                return (
                                    <button
                                        key={
                                            tab.key
                                        }
                                        type="button"
                                        onClick={() =>
                                            setActive(
                                                tab.key
                                            )
                                        }
                                        className={`rounded-t-[4px] px-4 py-2 text-[13px] font-medium transition-colors ${isActive
                                            ? "bg-[#732269] text-white"
                                            : "text-[#5E6E82] hover:bg-[#F4F6FA]"
                                            }`}
                                    >
                                        {
                                            tab.label
                                        }{" "}
                                        (
                                        {
                                            tab.list
                                                .length
                                        }
                                        )
                                    </button>
                                );
                            }
                        )}

                    </div>


                    {/* Tab content */}

                    <div className="pt-4">
                        {renderList()}
                    </div>

                </div>
            )}

        </div>
    );
}   