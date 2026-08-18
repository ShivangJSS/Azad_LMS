import { useEffect, useState } from "react";
import { FaSearch, FaRedo } from "react-icons/fa";

import {
    getDashboardStates,
    getDashboardDistricts,
    getDashboardCentres,
} from "../services/DashboardFilterService";

export default function DashboardFilter({
    filters,
    setFilters,
}) {

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [centres, setCentres] = useState([]);

    const [stateId, setStateId] = useState("");
    const [districtId, setDistrictId] = useState("");
    const [centreId, setCentreId] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        loadStates();
    }, []);

    useEffect(() => {

        if (!stateId) {
            setDistricts([]);
            setCentres([]);
            return;
        }

        loadDistricts();

    }, [stateId]);

    useEffect(() => {

        if (!districtId) {
            setCentres([]);
            return;
        }

        loadCentres();

    }, [districtId]);

    const loadStates = async () => {
        try {

            const response = await getDashboardStates();

            setStates(response);

        } catch (error) {
        }
    };

    const loadDistricts = async () => {

        try {

            const response =
                await getDashboardDistricts(stateId);

            setDistricts(response);

        } catch (error) {
        }

    };

    const loadCentres = async () => {

        try {

            const response =
                await getDashboardCentres(
                    stateId,
                    districtId
                );

            setCentres(response);

        } catch (error) {
        }

    };

    const handleSearch = () => {

        setFilters({
            state_id: stateId || undefined,
            district_id: districtId || undefined,
            centre_id: centreId || undefined,
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
        });

    };

    const handleReset = () => {

        setStateId("");
        setDistrictId("");
        setCentreId("");

        setFromDate("");
        setToDate("");

        setDistricts([]);
        setCentres([]);

        setFilters({});

    };

    const panelStyle = {
        width: "100%",
        backgroundColor: "#F9F7FB",
        border: "0.8px solid #EDE8F0",
        borderRadius: "12px",
        padding: "10px 12px",
        boxShadow:
            "0 1px 3px 0 rgba(107,45,91,0.06), 0 1px 2px 0 rgba(107,45,91,0.04)",
    };

    const controlStyle = {
        width: "100%",
        height: "34px",
        padding: "0 0.65rem",
        fontSize: "0.78rem",
        color: "#2D2235",
        backgroundColor: "#fff",
        border: "1px solid #D8E2EF",
        borderRadius: "0.375rem",
        outline: "none",
    };

    const selectStyle = {
        ...controlStyle,
        paddingRight: "2.25rem",
        appearance: "none",
        backgroundImage:
            "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
        backgroundSize: "16px 12px",
    };

    const btnBase = {
        height: "34px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        padding: "0 1rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
        borderRadius: "0.375rem",
        cursor: "pointer",
    };

    const searchStyle = {
        ...btnBase,
        backgroundColor: "#6B2D5B",
        border: "1px solid #6B2D5B",
        color: "#fff",
    };

    const resetStyle = {
        ...btnBase,
        backgroundColor: "#fff",
        border: "1px solid #6B2D5B",
        color: "#6B2D5B",
    };

    return (
        <div className="w-full px-4">

            <div style={panelStyle}>

                <div
                    className="flex flex-wrap items-center gap-4"
                >

                    {/* State */}

                    <div className="flex-1 min-w-[170px]">

                        <select
                            value={stateId}
                            style={selectStyle}
                            onChange={(e) => {

                                setStateId(e.target.value);
                                setDistrictId("");
                                setCentreId("");

                            }}
                        >

                            <option key="state-placeholder" value="">
                                Select State
                            </option>

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

                    <div className="flex-1 min-w-[170px]">

                        <select
                            value={districtId}
                            style={selectStyle}
                            onChange={(e) => {

                                setDistrictId(e.target.value);
                                setCentreId("");

                            }}
                        >

                            <option key="district-placeholder" value="">
                                Select District
                            </option>

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

                    <div className="flex-1 min-w-[170px]">

                        <select
                            value={centreId}
                            style={selectStyle}
                            onChange={(e) =>
                                setCentreId(e.target.value)
                            }
                        >

                            <option key="centre-placeholder" value="">
                                Select Centre
                            </option>

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

                    <div className="flex-1 min-w-[160px]">

                        <input
                            type="date"
                            value={fromDate}
                            style={controlStyle}
                            onChange={(e) =>
                                setFromDate(e.target.value)
                            }
                        />

                    </div>

                    {/* To Date */}

                    <div className="flex-1 min-w-[160px]">

                        <input
                            type="date"
                            value={toDate}
                            style={controlStyle}
                            onChange={(e) =>
                                setToDate(e.target.value)
                            }
                        />

                    </div>

                    {/* Search */}

                    <button
                        style={searchStyle}
                        onClick={handleSearch}
                    >
                        <FaSearch size={12} />
                        Search
                    </button>

                    {/* Reset */}

                    <button
                        style={resetStyle}
                        onClick={handleReset}
                    >
                        <FaRedo size={11} />
                        Reset
                    </button>

                </div>

            </div>

        </div>
    );
}