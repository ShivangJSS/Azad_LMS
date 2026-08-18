import { useEffect, useState } from "react";

import ChartDetailModal from "./ChartDetailModal";
import { getMonthlyLoginDetails } from "../services/DashboardService";
import {
    getDashboardStates,
    getDashboardDistricts,
} from "../services/DashboardFilterService";

/* ---- formatters (kept local so this modal is self-contained) ---- */

const MONTHS_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// "2026-06" -> "Jun 26"
const fmtMonthLabel = (m) => {
    if (!m) return "";
    const parts = String(m).split("-");
    if (parts.length >= 2) {
        const idx = Number(parts[1]) - 1;
        if (idx >= 0 && idx < 12) {
            return `${MONTHS_SHORT[idx]} ${parts[0].slice(-2)}`;
        }
    }
    return m;
};

// "2026-06-30T07:55:19" -> "30/6/2026 07:55 am"
const fmtLoginTime = (t) => {
    if (!t) return "-";
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return t;
    let h = d.getHours();
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${String(h).padStart(2, "0")}:${mm} ${ampm}`;
};

const pad2 = (n) => String(n).padStart(2, "0");

const DURATIONS = [
    { value: "12", label: "Last 12 months" },
    { value: "6", label: "Last 6 months" },
    { value: "3", label: "Last 3 months" },
    { value: "1", label: "This month" },
];

// Compute { from_date, to_date } for the selected duration, relative to today.
const durationRange = (months) => {
    const now = new Date();
    const to = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
    const start = new Date(
        now.getFullYear(),
        now.getMonth() - (Number(months) - 1),
        1
    );
    const from = `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-01`;
    return { from_date: from, to_date: to };
};

const SELECT =
    "h-[42px] w-full rounded-[6px] border border-[#D8E2EF] bg-white px-3 text-[14px] text-[#344050] outline-none focus:border-[#6B2D5B]";
const LABEL = "mb-1 block text-[13px] font-medium text-[#5E6E82]";

export default function MonthlyLoginModal({ month, baseFilters = {}, onClose }) {
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [stateId, setStateId] = useState("");
    const [districtId, setDistrictId] = useState("");
    const [duration, setDuration] = useState("12");

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: "participant_name", label: "Participant Name" },
        { key: "mobile_no", label: "Mobile" },
        {
            key: "login_time",
            label: "Login Time",
            render: (r) => fmtLoginTime(r.login_time),
        },
        { key: "app_version", label: "App Version" },
    ];

    // Load states once.
    useEffect(() => {
        getDashboardStates()
            .then((d) => setStates(Array.isArray(d) ? d : []))
            .catch(() => setStates([]));
    }, []);

    // Load districts whenever the state changes.
    useEffect(() => {
        if (!stateId) {
            setDistricts([]);
            setDistrictId("");
            return;
        }
        getDashboardDistricts(stateId)
            .then((d) => setDistricts(Array.isArray(d) ? d : []))
            .catch(() => setDistricts([]));
    }, [stateId]);

    const fetchRows = async () => {
        setLoading(true);
        try {
            const params = { ...baseFilters, clicked_value: month };
            if (stateId) params.state_id = stateId;
            if (districtId) params.district_id = districtId;
            if (duration) {
                const { from_date, to_date } = durationRange(duration);
                params.from_date = from_date;
                params.to_date = to_date;
            }
            const data = await getMonthlyLoginDetails(params);
            setRows(Array.isArray(data) ? data : []);
        } catch (error) {
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial load for the clicked month.
    useEffect(() => {
        fetchRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [month]);

    const headerControls = (
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
                <label className={LABEL}>State</label>
                <select
                    className={SELECT}
                    value={stateId}
                    onChange={(e) => setStateId(e.target.value)}
                >
                    <option value="">All States</option>
                    {states.map((s) => (
                        <option key={s.state_lgd_code} value={s.state_lgd_code}>
                            {s.state_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex-1">
                <label className={LABEL}>District</label>
                <select
                    className={SELECT}
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    disabled={!stateId}
                >
                    <option value="">All Districts</option>
                    {districts.map((d) => (
                        <option
                            key={d.district_lgd_code}
                            value={d.district_lgd_code}
                        >
                            {d.district_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex-1">
                <label className={LABEL}>Duration</label>
                <select
                    className={SELECT}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                >
                    {DURATIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                            {d.label}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="button"
                onClick={fetchRows}
                disabled={loading}
                className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[6px] bg-[#6B2D5B] px-6 text-[14px] font-medium text-white hover:bg-[#571a4e] disabled:opacity-60"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Filter
            </button>
        </div>
    );

    return (
        <ChartDetailModal
            title={`Monthly Login Trend — ${fmtMonthLabel(month)}`}
            columns={columns}
            rows={rows}
            loading={loading}
            onClose={onClose}
            headerControls={headerControls}
        />
    );
}
