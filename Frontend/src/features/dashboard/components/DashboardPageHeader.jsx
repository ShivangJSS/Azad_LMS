import { memo } from "react";
import { FiCalendar, FiDownload } from "react-icons/fi";

import { BRAND, INK, SUB } from "../hook/dashboardTheme";


const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const fmtDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

function describeRange(filters = {}) {
    const from = fmtDate(filters.from_date);
    const to = fmtDate(filters.to_date);

    if (from && to) return `${from} – ${to}`;
    if (from) return `From ${from}`;
    if (to) return `Up to ${to}`;
    return "All time";
}

function DashboardPageHeader({ filters = {}, onExport, exportDisabled = false }) {
    return (
        <div className="mb-[20px] flex flex-wrap items-end justify-between gap-[16px]">
            <div className="min-w-0">
                <h1
                    className="m-0 font-semibold tracking-[-0.01em]"
                    style={{ color: INK, fontSize: "26px", lineHeight: "34px" }}
                >
                    LMS Dashboard
                </h1>

                {/* <p
                    className="m-0 mt-[4px]"
                    style={{ color: SUB, fontSize: "13px", lineHeight: "20px" }}
                >
                    Here&apos;s what&apos;s happening across your training centres.
                </p> */}
            </div>

            <div className="flex flex-wrap items-center gap-[10px]">
                {/* Applied date range (reflects the filter, not a separate control). */}
                <span
                    title="Date range currently applied by the filters below"
                    className="glass-plain inline-flex items-center gap-[8px] rounded-[10px] border border-[#EDEAF2] bg-white px-[14px] py-[9px] text-[13px] font-medium leading-[18px]"
                    style={{ color: INK }}
                >
                    <FiCalendar size={14} style={{ color: SUB }} aria-hidden="true" />
                    {describeRange(filters)}
                </span>

                <button
                    type="button"
                    onClick={onExport}
                    disabled={exportDisabled}
                    className="glass-plain inline-flex items-center gap-[8px] rounded-[10px] px-2 py-1 text-[10px] leading-4 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: BRAND, border: `1px solid ${BRAND}` }}
                >
                    <FiDownload size={14} aria-hidden="true" />
                    Export Report
                </button>
            </div>
        </div>
    );
}

export default memo(DashboardPageHeader);
