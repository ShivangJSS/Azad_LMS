import { useEffect, useState } from "react";
import { FaRedo, FaSearch } from "react-icons/fa";

import { CARD_CLASS } from "../hook/dashboardTheme";

import {
    getDashboardCentres,
    getDashboardDistricts,
    getDashboardStates,
} from "@/features/dashboard/services/DashboardFilterService";

// ============================================================
// Constants
// ============================================================

const EMPTY_FILTERS = Object.freeze({});

// Flat white filter card matching the redesigned dashboard surface.
// Inline styles on the controls (rather than utility classes) keep the
// global form-sizing rules in index.css from overriding the new heights.
const CONTROL_STYLE = {
    width: "100%",
    height: "40px",
    padding: "0 0.75rem",
    fontSize: "13px",
    color: "#1F1B2E",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E4E0EB",
    borderRadius: "10px",
    outline: "none",
    boxShadow: "none",
};

const SELECT_STYLE = {
    ...CONTROL_STYLE,
    paddingRight: "2.25rem",
    appearance: "none",
    backgroundImage:
        "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%236B6478' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.8rem center",
    backgroundSize: "14px 10px",
};

const DISABLED_STYLE = {
    backgroundColor: "#FAF9FC",
    color: "#9C94A8",
    cursor: "not-allowed",
};

const BUTTON_BASE_STYLE = {
    height: "40px",
    minWidth: "96px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "0 18px",
    fontSize: "13px",
    fontWeight: 500,
    whiteSpace: "nowrap",
    borderRadius: "10px",
    cursor: "pointer",
};

const SEARCH_STYLE = {
    ...BUTTON_BASE_STYLE,
    backgroundColor: "#732269",
    border: "1px solid #732269",
    color: "#fff",
};

const RESET_STYLE = {
    ...BUTTON_BASE_STYLE,
    backgroundColor: "#fff",
    border: "1px solid #E4E0EB",
    color: "#4A4356",
};

const LABEL_CLASS =
    "mb-[6px] block text-[11px] font-medium uppercase leading-[14px] tracking-[0.06em] text-[#6B6478]";

// ============================================================
// Helpers
// ============================================================

const areFiltersEqual = (current, next) => {
    const currentKeys = Object.keys(current);
    const nextKeys = Object.keys(next);

    if (currentKeys.length !== nextKeys.length) {
        return false;
    }

    return currentKeys.every((key) => current[key] === next[key]);
};

const createFilters = ({
    stateId,
    districtId,
    centreId,
    fromDate,
    toDate,
}) =>
    Object.fromEntries(
        Object.entries({
            state_id: stateId,
            district_id: districtId,
            centre_id: centreId,
            from_date: fromDate,
            to_date: toDate,
        }).filter(([, value]) => value)
    );

// ============================================================
// Component
// ============================================================

export default function DashboardFilter({ setFilters, loading = false }) {
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [centres, setCentres] = useState([]);

    const [stateId, setStateId] = useState("");
    const [districtId, setDistrictId] = useState("");
    const [centreId, setCentreId] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // ========================================================
    // Load States
    // ========================================================

    useEffect(() => {
        let isCurrentRequest = true;

        const loadStates = async () => {
            try {
                const response = await getDashboardStates();

                if (isCurrentRequest) {
                    setStates(Array.isArray(response) ? response : []);
                }
            } catch {
                if (isCurrentRequest) {
                    setStates([]);
                }
            }
        };

        loadStates();

        return () => {
            isCurrentRequest = false;
        };
    }, []);

    // ========================================================
    // Load Districts
    // ========================================================

    useEffect(() => {
        let isCurrentRequest = true;

        if (!stateId) {
            setDistricts([]);
            setCentres([]);
            return () => {
                isCurrentRequest = false;
            };
        }

        const loadDistricts = async () => {
            try {
                const response = await getDashboardDistricts(stateId);

                if (isCurrentRequest) {
                    setDistricts(Array.isArray(response) ? response : []);
                }
            } catch {
                if (isCurrentRequest) {
                    setDistricts([]);
                }
            }
        };

        loadDistricts();

        return () => {
            isCurrentRequest = false;
        };
    }, [stateId]);

    // ========================================================
    // Load Centres
    // ========================================================

    useEffect(() => {
        let isCurrentRequest = true;

        if (!stateId || !districtId) {
            setCentres([]);
            return () => {
                isCurrentRequest = false;
            };
        }

        const loadCentres = async () => {
            try {
                const response = await getDashboardCentres(
                    stateId,
                    districtId
                );

                if (isCurrentRequest) {
                    setCentres(Array.isArray(response) ? response : []);
                }
            } catch {
                if (isCurrentRequest) {
                    setCentres([]);
                }
            }
        };

        loadCentres();

        return () => {
            isCurrentRequest = false;
        };
    }, [stateId, districtId]);

    // ========================================================
    // Search
    // ========================================================

    const handleSearch = () => {
        const nextFilters = createFilters({
            stateId,
            districtId,
            centreId,
            fromDate,
            toDate,
        });

        setFilters((current) =>
            areFiltersEqual(current, nextFilters) ? current : nextFilters
        );
    };

    // ========================================================
    // Reset
    // ========================================================

    const handleReset = () => {
        setStateId("");
        setDistrictId("");
        setCentreId("");
        setFromDate("");
        setToDate("");

        setDistricts([]);
        setCentres([]);

        setFilters((current) =>
            areFiltersEqual(current, EMPTY_FILTERS) ? current : EMPTY_FILTERS
        );
    };

    // ========================================================
    // Render
    // ========================================================

    return (
        <div className="w-full">
            <div className={`${CARD_CLASS} px-[18px] py-[16px]`}>
                <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
                    {/* State */}

                    <div className="min-w-0">
                        <label className={LABEL_CLASS} htmlFor="dash-state">
                            State
                        </label>

                        <select
                            id="dash-state"
                            value={stateId}
                            style={SELECT_STYLE}
                            onChange={(event) => {
                                const value = event.target.value;

                                setStateId(value);
                                setDistrictId("");
                                setCentreId("");
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

                    <div className="min-w-0">
                        <label className={LABEL_CLASS} htmlFor="dash-district">
                            District
                        </label>

                        <select
                            id="dash-district"
                            value={districtId}
                            style={
                                stateId
                                    ? SELECT_STYLE
                                    : { ...SELECT_STYLE, ...DISABLED_STYLE }
                            }
                            disabled={!stateId}
                            onChange={(event) => {
                                const value = event.target.value;

                                setDistrictId(value);
                                setCentreId("");
                            }}
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

                    {/* Centre */}

                    <div className="min-w-0">
                        <label className={LABEL_CLASS} htmlFor="dash-centre">
                            Centre
                        </label>

                        <select
                            id="dash-centre"
                            value={centreId}
                            style={
                                districtId
                                    ? SELECT_STYLE
                                    : { ...SELECT_STYLE, ...DISABLED_STYLE }
                            }
                            disabled={!districtId}
                            onChange={(event) =>
                                setCentreId(event.target.value)
                            }
                        >
                            <option value="">All Centres</option>

                            {centres.map((centre) => (
                                <option
                                    key={centre.centre_id}
                                    value={centre.centre_id}
                                >
                                    {centre.centre_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* From Date */}

                    <div className="min-w-0">
                        <label className={LABEL_CLASS} htmlFor="dash-from">
                            From Date
                        </label>

                        <input
                            id="dash-from"
                            type="date"
                            value={fromDate}
                            max={toDate || undefined}
                            style={CONTROL_STYLE}
                            onChange={(event) =>
                                setFromDate(event.target.value)
                            }
                        />
                    </div>

                    {/* To Date */}

                    <div className="min-w-0">
                        <label className={LABEL_CLASS} htmlFor="dash-to">
                            To Date
                        </label>

                        <input
                            id="dash-to"
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            style={CONTROL_STYLE}
                            onChange={(event) =>
                                setToDate(event.target.value)
                            }
                        />
                    </div>

                    {/* Actions */}

                    <div className="flex min-w-0 items-end gap-[10px]">
                        <button
                            type="button"
                            disabled={loading}
                            style={
                                loading
                                    ? { ...SEARCH_STYLE, opacity: 0.75, cursor: "wait" }
                                    : SEARCH_STYLE
                            }
                            onClick={handleSearch}
                        >
                            {loading ? (
                                <span
                                    aria-hidden="true"
                                    className="h-[13px] w-[13px] animate-spin rounded-full border-[2px] border-white/45 border-t-white"
                                />
                            ) : (
                                <FaSearch size={12} />
                            )}
                            {loading ? "Searching…" : "Search"}
                        </button>

                        <button
                            type="button"
                            disabled={loading}
                            style={
                                loading
                                    ? { ...RESET_STYLE, opacity: 0.6, cursor: "wait" }
                                    : RESET_STYLE
                            }
                            onClick={handleReset}
                        >
                            <FaRedo size={11} />
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
