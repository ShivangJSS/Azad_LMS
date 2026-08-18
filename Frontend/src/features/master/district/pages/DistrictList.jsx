import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import Pagination from "../../../../shared/components/table/Pagination";

import { getAllDistricts, deleteDistrict } from "../services/DistrictService";
import { getReferenceStates } from "../../state/services/StateService";
import { FaChevronDown } from "react-icons/fa";

const PER_PAGE = 10;

const EMPTY_FILTERS = {
    state_lgd_code: "",
    district_name: "",
};

export default function DistrictList() {
    const navigate = useNavigate();

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [totalEntries, setTotalEntries] = useState(0);

    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    /* ==============================
       FETCH DISTRICTS
    ============================== */

    const fetchDistricts = useCallback(async () => {
        setLoading(true);

        try {
            const params = {
                page: currentPage,
                per_page: PER_PAGE,
            };

            if (appliedFilters.state_lgd_code) {
                params.state_lgd_code = appliedFilters.state_lgd_code;
            }

            if (appliedFilters.district_name.trim()) {
                params.district_name = appliedFilters.district_name.trim();
            }

            const response = await getAllDistricts(params);


            setDistricts(response.data || []);
            setTotalEntries(response.total || 0);

        } catch (error) {
            console.error(error);

            setDistricts([]);
            setTotalEntries(0);

        } finally {
            setLoading(false);
        }
    }, [currentPage, appliedFilters]);

    useEffect(() => {
        fetchDistricts();
    }, [fetchDistricts]);

    /* ==============================
       FETCH STATES (filter dropdown)
    ============================== */

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const states = await getReferenceStates();
                setStates(states);
            } catch (error) {
                console.error("State API Error:", error?.response?.data ?? error);
                setStates([]);
            }
        };

        fetchStates();
    }, []);

    /* ==============================
       HANDLERS
    ============================== */

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        setCurrentPage(1);
        setAppliedFilters(filters);
    };

    const handleReset = () => {
        setFilters(EMPTY_FILTERS);
        setAppliedFilters(EMPTY_FILTERS);
        setCurrentPage(1);
    };

    const handleDelete = async (districtCode) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this district?",
        );

        if (!confirmed) return;

        try {
            await deleteDistrict(districtCode);
            await fetchDistricts();
        } catch (error) {
            console.error("Delete District Error:", error?.response?.data ?? error);

            alert(error?.response?.data?.detail || "Unable to delete district");
        }
    };

    const totalPages = Math.ceil(totalEntries / PER_PAGE) || 1;

    const breadcrumbItems = [
        { label: "Home", path: "/dashboard" },
        { label: "District Masters" },
    ];

    /* ==============================
       CLASSES
    ============================== */

    const selectClass =
        "h-[35px] shadow-inner w-full cursor-pointer appearance-none rounded-[4px] border border-[#070808] bg-white px-[12px] pr-[40px] text-[14px] text-[#5E6E82] outline-none";

    const inputClass =
        "h-[35px] w-full rounded-[4px] border-1 border-[#D8E2EF] bg-white px-[10px] text-[14px] text-[#344050] shadow-inner placeholder:text-[#9DA9BB] outline-none";

    const headCellClass =
        "border border-[#6d1f5f] px-4 py-[10px] text-[14px] font-semibold text-white";

    const cellClass =
        "border border-[#E3E6ED] px-4 py-[10px] text-[14px] text-[#344050]";

    return (
        <AppLayout>
            <div className="mb-[16px] flex w-full items-center justify-between px-3">
                <div className="text-[20px] font-medium text-[#344050]">
                    District Masters
                </div>

                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="w-full rounded-[8px] border border-[#D8E2EF] bg-white p-[20px]">

                {/* ================= FILTER BAR ================= */}

                <div className="flex flex-col gap-[12px] lg:flex-row lg:items-center">

                    <div className="relative w-full lg:flex-1">
                        <select
                            name="state_lgd_code"
                            value={filters.state_lgd_code}
                            onChange={handleFilterChange}
                            className={selectClass}
                        >
                            <option value="">Select State</option>

                            {states.map((state) => (
                                <option
                                    key={state.state_lgd_code}
                                    value={state.state_lgd_code}
                                >
                                    {state.state_name}
                                </option>
                            ))}
                        </select>

                        <FaChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E6E82] pointer-events-none z-10"
                        />
                    </div>

                    <div className="w-full lg:flex-1">
                        <input
                            type="text"
                            name="district_name"
                            value={filters.district_name}
                            onChange={handleFilterChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                            placeholder="Search By District Name"
                            className={`${inputClass} rounded-sm shadow-inner text-[#5E6E82]`}
                        />
                    </div>

                    <div className="flex gap-[12px]">
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="h-8 w-24 rounded-sm! bg-[#732269] border border-[#732269] text-[14px] font-medium !text-white hover:opacity-90"
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="h-8 w-24 rounded-sm! border-1 border-[#010101] bg-white text-[14px] text-[#344050] hover:bg-gray-50"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* ================= COUNT + ADD ================= */}

                <div className="mt-[20px] mb-[14px] flex flex-wrap items-center justify-between gap-[12px]">
                    <p className="m-0 text-[14px] font-semibold text-[#344050]">
                        Total District(s):{" "}
                        <span className="text-[#7b216f]">{totalEntries}</span>
                    </p>

                    <Link
                        to="/master/districts/create"
                        className="inline-flex h-[36px] items-center rounded-sm! border-1 border-[#060606] bg-white px-[16px] text-[14px] text-[#070707]! no-underline hover:bg-gray-50 font-medium text-decoration-none"
                    >
                        + Add District
                    </Link>
                </div>

                {/* ================= TABLE ================= */}

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#732269]">
                                <th className={`${headCellClass} w-[100px] text-center`}>
                                    S. No.
                                </th>
                                <th className={`${headCellClass} w-[150px] text-left`}>
                                    LGD Code
                                </th>
                                <th className={`${headCellClass} text-left`}>
                                    District Name
                                </th>
                                <th className={`${headCellClass} text-left`}>
                                    State Name
                                </th>
                                <th className={`${headCellClass} w-[180px] text-left`}>
                                    Status
                                </th>
                                <th className={`${headCellClass} w-[280px] text-center`}>
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className={`${cellClass} py-[30px] text-center text-[#5E6E82]`}
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            )}

                            {!loading && districts.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className={`${cellClass} py-[30px] text-center text-[#5E6E82]`}
                                    >
                                        No districts found
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                districts.map((district, index) => (
                                    <tr
                                        key={district.district_lgd_code}
                                        className="hover:bg-[#FAFAFA]"
                                    >
                                        <td className={`${cellClass} text-center`}>
                                            {(currentPage - 1) * PER_PAGE + index + 1}
                                        </td>

                                        <td className={cellClass}>
                                            {district.district_lgd_code}
                                        </td>

                                        <td className={cellClass}>
                                            {district.district_name || "-"}
                                        </td>

                                        <td className={cellClass}>
                                            {district.state_name || "-"}
                                        </td>

                                        <td className={cellClass}>
                                            <span
                                                className={`inline-block rounded-[4px] px-[8px] py-[3px] text-[11px] font-bold !text-white ${String(district.status) === "1"
                                                    ? "bg-[#00864E]"
                                                    : "bg-[#E63757]"
                                                    }`}
                                            >
                                                {String(district.status) === "1"
                                                    ? "Active"
                                                    : "Not Active"}
                                            </span>
                                        </td>

                                        <td className={cellClass}>
                                            <div className="flex items-center justify-center gap-[10px]">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/master/districts/edit/${district.district_lgd_code}`,
                                                        )
                                                    }
                                                    className="h-7 w-16 rounded-sm! bg-[#732269] text-[13px] font-semibold !text-white hover:opacity-90"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            district.district_lgd_code,
                                                        )
                                                    }
                                                    className="h-7 w-16 rounded-sm! bg-[#E63757] text-[13px] font-semibold !text-white hover:opacity-90"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* ================= PAGINATION ================= */}

                <div className="mt-[20px] flex justify-end">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
