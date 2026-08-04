import React, { useState } from "react";
import { FaSearch, FaRedo } from "react-icons/fa";

const dummyStates = ["Delhi", "Rajasthan", "Tamil Nadu", "West Bengal"];
const dummyDistricts = ["District 1", "District 2", "District 3"];
const dummyCentres = ["Centre 1", "Centre 2", "Centre 3"];

export default function DashboardFilter() {
    const [state, setState] = useState("");
    const [district, setDistrict] = useState("");
    const [centre, setCentre] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const handleSearch = () => {
        console.log({ state, district, centre, fromDate, toDate });
    };

    const handleReset = () => {
        setState("");
        setDistrict("");
        setCentre("");
        setFromDate("");
        setToDate("");
    };

    const panelStyle = {
        width: "100%",
        backgroundColor: "#F9F7FB",
        border: "0.8px solid #EDE8F0",
        borderRadius: "20px",
        padding: "16px 15px",
        boxShadow:
            "0 1px 3px 0 rgba(107,45,91,0.06), 0 1px 2px 0 rgba(107,45,91,0.04)",

    };

    // Bootstrap .form-control / .form-select equivalent
    const controlStyle = {
        width: "100%",
        height: "38px",
        padding: "0.375rem 0.75rem",
        fontSize: "1rem",
        lineHeight: "1.5",
        color: "#2D2235",
        backgroundColor: "#fff",
        border: "1px solid #D8E2EF",
        borderRadius: "0.375rem",
        outline: "none",
    };

    // .form-select = control + Bootstrap chevron + right padding
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
        height: "38px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "0 1.25rem",
        fontSize: "0.875rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
        borderRadius: "0.375rem",
        cursor: "pointer",
        transition: "all .2s ease",
    };

    const searchStyle = {
        ...btnBase,
        backgroundColor: "#6B2D5B",
        border: "1px solid #6B2D5B",
        color: "#fff",
    };

    const resetStyle = {
        ...btnBase,
        backgroundColor: "transparent",
        border: "1px solid #6B2D5B",
        color: "#6B2D5B",
    };

    return (
        <div className="p-4 w-full">
            <div className="w-full" style={panelStyle}>
                <div className="flex flex-wrap items-center" style={{ gap: "16px" }}>

                    <div className="flex-1 min-w-[150px]">
                        <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="">Select State</option>
                            {dummyStates.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="">Select District</option>
                            {dummyDistricts.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <select
                            value={centre}
                            onChange={(e) => setCentre(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="">Select Centre</option>
                            {dummyCentres.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={controlStyle}
                        />
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            style={controlStyle}
                        />
                    </div>

                    <div className="shrink-0">
                        <button type="button" onClick={handleSearch} style={searchStyle}>
                            <FaSearch size={12} />
                            Search
                        </button>
                    </div>

                    <div className="shrink-0">
                        <button type="button" onClick={handleReset} style={resetStyle}>
                            <FaRedo size={11} />
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


