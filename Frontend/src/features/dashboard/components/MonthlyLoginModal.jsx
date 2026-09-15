import { useCallback, useEffect, useMemo, useState } from "react";

import ChartDetailModal from "./ChartDetailModal";

import { getMonthlyLoginDetails } from "@/features/dashboard/services/DashboardService";
import {
    getDashboardDistricts,
    getDashboardStates,
} from "@/features/dashboard/services/DashboardFilterService";

// ============================================================
// Constants
// ============================================================

const MONTHS_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const DURATIONS = [
    { value: "12", label: "Last 12 months" },
    { value: "6", label: "Last 6 months" },
    { value: "3", label: "Last 3 months" },
    { value: "1", label: "This month" },
];

const SELECT =
    "h-[42px] w-full rounded-[6px] border border-[#D8E2EF] bg-white px-3 text-[14px] text-[#344050] outline-none focus:border-[#6B2D5B]";

const LABEL = "mb-1 block text-[13px] font-medium text-[#5E6E82]";

// ============================================================
// Helpers
// ============================================================

const pad2 = (value) => String(value).padStart(2, "0");

const formatMonthLabel = (month) => {
    if (!month) return "";

    const [year, monthNumber] = String(month).split("-");

    const index = Number(monthNumber) - 1;

    if (
        !year ||
        !Number.isInteger(index) ||
        index < 0 ||
        index >= MONTHS_SHORT.length
    ) {
        return month;
    }

    return `${MONTHS_SHORT[index]} ${year.slice(-2)}`;
};

const formatLoginTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    let hours = date.getHours();

    const minutes = String(date.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "pm" : "am";

    hours = hours % 12 || 12;

    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${String(
        hours
    ).padStart(2, "0")}:${minutes} ${period}`;
};

const getDurationRange = (months) => {
    const now = new Date();

    const toDate = `${now.getFullYear()}-${pad2(
        now.getMonth() + 1
    )}-${pad2(now.getDate())}`;

    const startDate = new Date(
        now.getFullYear(),
        now.getMonth() - (Number(months) - 1),
        1
    );

    const fromDate = `${startDate.getFullYear()}-${pad2(
        startDate.getMonth() + 1
    )}-01`;

    return {
        from_date: fromDate,
        to_date: toDate,
    };
};

// ============================================================
// Static table configuration
// ============================================================

const COLUMNS = [
    {
        key: "participant_name",
        label: "Participant Name",
    },
    {
        key: "mobile_no",
        label: "Mobile",
    },
    {
        key: "login_time",
        label: "Login Time",
        render: (row) => formatLoginTime(row.login_time),
    },
    {
        key: "app_version",
        label: "App Version",
    },
];

// ============================================================
// Component
// ============================================================

export default function MonthlyLoginModal({
    month,
    baseFilters = {},
    onClose,
}) {
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [stateId, setStateId] = useState("");
    const [districtId, setDistrictId] = useState("");
    const [duration, setDuration] = useState("12");

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    // ========================================================
    // Load states once
    // ========================================================

    useEffect(() => {
        let active = true;

        const loadStates = async () => {
            try {
                const data = await getDashboardStates();

                if (active) {
                    setStates(Array.isArray(data) ? data : []);
                }
            } catch {
                if (active) {
                    setStates([]);
                }
            }
        };

        loadStates();

        return () => {
            active = false;
        };
    }, []);

    // ========================================================
    // Load districts when state changes
    // ========================================================

    useEffect(() => {
        let active = true;

        if (!stateId) {
            setDistricts([]);
            setDistrictId("");

            return () => {
                active = false;
            };
        }

        const loadDistricts = async () => {
            try {
                const data = await getDashboardDistricts(stateId);

                if (active) {
                    setDistricts(Array.isArray(data) ? data : []);
                }
            } catch {
                if (active) {
                    setDistricts([]);
                }
            }
        };

        loadDistricts();

        return () => {
            active = false;
        };
    }, [stateId]);

    // ========================================================
    // Fetch login rows
    // ========================================================

    const fetchRows = useCallback(async () => {
        setLoading(true);

        try {
            const params = {
                ...baseFilters,
                clicked_value: month,
            };

            if (stateId) {
                params.state_id = stateId;
            }

            if (districtId) {
                params.district_id = districtId;
            }

            if (duration) {
                Object.assign(params, getDurationRange(duration));
            }

            const data = await getMonthlyLoginDetails(params);

            setRows(Array.isArray(data) ? data : []);
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [baseFilters, month, stateId, districtId, duration]);

    // ========================================================
    // Initial / month change load
    // ========================================================

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    // ========================================================
    // Header controls
    // ========================================================

    const headerControls = useMemo(
        () => (
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
                {/* State */}

                <div className="flex-1">
                    <label className={LABEL}>State</label>

                    <select
                        className={SELECT}
                        value={stateId}
                        onChange={(event) => {
                            setStateId(event.target.value);
                            setDistrictId("");
                        }}
                    >
                        <option value="">All States</option>

                        {states.map((state) => (
                            <option
                                key={state.state_lgd_code}
                                value={state.state_lgd_code}
                            >
                                {state.state_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* District */}

                <div className="flex-1">
                    <label className={LABEL}>District</label>

                    <select
                        className={SELECT}
                        value={districtId}
                        disabled={!stateId}
                        onChange={(event) =>
                            setDistrictId(event.target.value)
                        }
                    >
                        <option value="">All Districts</option>

                        {districts.map((district) => (
                            <option
                                key={district.district_lgd_code}
                                value={district.district_lgd_code}
                            >
                                {district.district_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Duration */}

                <div className="flex-1">
                    <label className={LABEL}>Duration</label>

                    <select
                        className={SELECT}
                        value={duration}
                        onChange={(event) =>
                            setDuration(event.target.value)
                        }
                    >
                        {DURATIONS.map((item) => (
                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filter */}

                <button
                    type="button"
                    onClick={fetchRows}
                    disabled={loading}
                    className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[6px] bg-[#6B2D5B] px-6 text-[14px] font-medium text-white hover:bg-[#571a4e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line
                            x1="21"
                            y1="21"
                            x2="16.65"
                            y2="16.65"
                        />
                    </svg>

                    Filter
                </button>
            </div>
        ),
        [
            states,
            districts,
            stateId,
            districtId,
            duration,
            loading,
            fetchRows,
        ]
    );

    return (
        <ChartDetailModal
            title={`Monthly Login Trend — ${formatMonthLabel(month)}`}
            columns={COLUMNS}
            rows={rows}
            loading={loading}
            onClose={onClose}
            headerControls={headerControls}
        />
    );
}