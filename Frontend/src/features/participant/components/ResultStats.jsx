import {
    FaRegQuestionCircle,
    FaTrophy,
    FaStar,
    FaChartLine,
    FaCheckCircle,
    FaTimesCircle,
    FaListUl,
} from "react-icons/fa";

import ScoreCard from "./ScoreCard";

const TEAL = "#1FA598";

// Show whole numbers without decimals, otherwise 2 dp.
const fmt = (n) => {
    const num = Number(n || 0);
    return Number.isInteger(num) ? String(num) : num.toFixed(2);
};

const fmtPct = (n) => `${fmt(n)}%`;

// Performance band from the score percentage — same thresholds the participant
// list uses (>=70 Good, >=40 Average, else Poor).
const performanceLabel = (pct) => {
    const n = Number(pct || 0);
    if (n >= 70) return { text: "Good", cls: "bg-emerald-100 text-emerald-700" };
    if (n >= 40) return { text: "Average", cls: "bg-amber-100 text-amber-700" };
    return { text: "Poor", cls: "bg-red-100 text-red-600" };
};

/**
 * The 4-card result row, shared by the overall summary ("overall") and each
 * module block ("module"). Reads straight from the report payload.
 */
export default function ResultStats({
    variant = "module",
    totalQuestions = 0,
    completed = 0,
    correct = 0,
    wrong = 0,
    score = 0,
    totalMarks = 0,
    percentage = 0,
    progress = 0,
}) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* QUESTIONS */}
            <ScoreCard
                icon={<FaRegQuestionCircle size={15} />}
                label={variant === "overall" ? "Total Questions" : "Questions"}
                footer={
                    variant === "overall" ? (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                            <span className="flex items-center gap-1 text-[#5E6E82]">
                                <FaListUl size={11} className="text-[#8A94A6]" />
                                Completed: {completed}
                            </span>
                            <span className="flex items-center gap-1 text-[#2E7D32]">
                                <FaCheckCircle size={11} />
                                Correct: {correct}
                            </span>
                            <span className="flex items-center gap-1 text-[#D74D43]">
                                <FaTimesCircle size={11} />
                                Wrong: {wrong}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 text-[11px]">
                            <span className="flex items-center gap-1 text-[#2E7D32]">
                                <FaCheckCircle size={11} />
                                {correct}
                            </span>
                            <span className="flex items-center gap-1 text-[#D74D43]">
                                <FaTimesCircle size={11} />
                                {wrong}
                            </span>
                        </div>
                    )
                }
            >
                <div className="text-[22px] font-semibold text-[#344050]">
                    {variant === "overall" ? (
                        totalQuestions
                    ) : (
                        <>
                            {completed}
                            <span className="text-[16px] text-[#8A94A6]">
                                {" "}/ {totalQuestions}
                            </span>
                        </>
                    )}
                </div>
            </ScoreCard>

            {/* SCORE */}
            <ScoreCard icon={<FaTrophy size={14} />} label="Score">
                <div className="text-[22px] font-semibold" style={{ color: TEAL }}>
                    {fmt(score)}
                    <span className="text-[16px] text-[#8A94A6]"> / {fmt(totalMarks)}</span>
                </div>
            </ScoreCard>

            {/* PERCENTAGE */}
            <ScoreCard icon={<FaStar size={14} />} label="Percentage">
                <div className="flex items-center gap-2">
                    <span className="text-[22px] font-semibold" style={{ color: TEAL }}>
                        {fmtPct(percentage)}
                    </span>
                    {completed > 0 &&
                        (() => {
                            const perf = performanceLabel(percentage);
                            return (
                                <span
                                    className={`inline-block rounded-full px-2 py-[2px] text-[11px] font-semibold ${perf.cls}`}
                                >
                                    {perf.text}
                                </span>
                            );
                        })()}
                </div>
            </ScoreCard>

            {/* PROGRESS */}
            <ScoreCard icon={<FaChartLine size={14} />} label="Progress">
                <div className="text-[22px] font-semibold" style={{ color: TEAL }}>
                    {fmtPct(progress)}
                </div>
                <div className="mt-2 h-[6px] w-full overflow-hidden rounded-full bg-[#F0E9EF]">
                    <div
                        className="h-full rounded-full bg-[#F5803E]"
                        style={{ width: `${Math.min(100, Number(progress) || 0)}%` }}
                    />
                </div>
            </ScoreCard>
        </div>
    );
}
