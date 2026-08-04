import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable from "../../../shared/components/table/DataTable";
// import TableHeader from "../../../shared/components/table/TableHeader";
import Pagination from "../../../shared/components/table/Pagination";
import TableActions from "../../../shared/components/table/TableActions";
import AppLayout from "../../../components/layout/AppLayout";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";
import { FaChevronDown } from "react-icons/fa";
import EntriesDropdown from "../../../shared/components/table/EntriesDropdown";

import {
    getStates,
    getDistricts,
    getBlocks,
    getCentres,
    deleteCentre,
} from "../services/centerService";


const columns = [
    { key: "sno", title: "S. No.", className: "text-center" },
    { key: "centre_name", title: "Centre Name", sortable: true },
    { key: "state_name", title: "State", sortable: true },
    { key: "district_name", title: "District", sortable: true },
    { key: "block_name", title: "Block", sortable: true },
    { key: "phone_number", title: "Phone" },
    { key: "status", title: "Status", sortable: true },
    { key: "action", title: "Action", className: "text-center" },
];



export default function CenterList() {

    const navigate = useNavigate();

    /* ==============================
       API DATA
    ============================== */

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [centres, setCentres] = useState([]);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    /* ==============================
       FILTER
    ============================== */

    const [filters, setFilters] = useState({
        state_id: "",
        district_id: "",
        block_id: "",
        centre_name: "",
    });

    /* ==============================
       TABLE
    ============================== */

    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);


    /* ==============================
       INITIAL API CALL
    ============================== */

    useEffect(() => {
        fetchStates();
        fetchCentres();
    }, []);


    /* ==============================
       FETCH STATES
    ============================== */

    const fetchStates = async () => {
        try {
            const response = await getStates();
            setStates(response.data);
        } catch (error) {
            console.error("State API Error:", error);
            setStates([]);
        }
    };


    /* ==============================
       FETCH DISTRICTS (by state)
    ============================== */

    const fetchDistricts = async (stateId) => {
        try {
            const response = await getDistricts(stateId);
            setDistricts(response.data);
        } catch (error) {
            console.error("District API Error:", error);
            setDistricts([]);
        }
    };


    /* ==============================
       FETCH BLOCKS (by district)
    ============================== */

    const fetchBlocks = async (districtId) => {
        try {
            const response = await getBlocks(districtId);
            setBlocks(response.data);
        } catch (error) {
            console.error("Block API Error:", error);
            setBlocks([]);
        }
    };


    /* ==============================
       FETCH CENTRES
    ============================== */

    const fetchCentres = async (params = {}) => {
        try {
            setLoading(true);
            const response = await getCentres(params);
            setCentres(response.data);
        } catch (error) {
            console.error("Centre API Error:", error);
            setCentres([]);
        } finally {
            setLoading(false);
        }
    };


    /* ==============================
       FILTER CHANGE  (CASCADE)
    ============================== */

    const handleFilterChange = (e) => {

        const { name, value } = e.target;


        /* ---- STATE CHANGE : reset district + block ---- */

        if (name === "state_id") {

            setFilters((prev) => ({
                ...prev,
                state_id: value,
                district_id: "",
                block_id: "",
            }));

            setDistricts([]);
            setBlocks([]);

            if (value) {
                fetchDistricts(value);
            }

            return;
        }


        /* ---- DISTRICT CHANGE : reset block ---- */

        if (name === "district_id") {

            setFilters((prev) => ({
                ...prev,
                district_id: value,
                block_id: "",
            }));

            setBlocks([]);

            if (value) {
                fetchBlocks(value);
            }

            return;
        }


        /* ---- BLOCK / CENTRE NAME ---- */

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    /* ==============================
       SEARCH BUTTON
    ============================== */

    const handleSearch = () => {

        const params = {};

        if (filters.state_id) {
            params.state_id = filters.state_id;
        }

        if (filters.district_id) {
            params.district_id = filters.district_id;
        }

        if (filters.block_id) {
            params.block_id = filters.block_id;
        }

        if (filters.centre_name.trim()) {
            params.search = filters.centre_name.trim();
        }

        setCurrentPage(1);

        fetchCentres(params);
    };


    /* ==============================
       RESET
    ============================== */

    const handleReset = () => {

        setFilters({
            state_id: "",
            district_id: "",
            block_id: "",
            centre_name: "",
        });

        setDistricts([]);
        setBlocks([]);

        setSearch("");
        setSortField("");
        setSortDirection("asc");
        setCurrentPage(1);

        fetchCentres();
    };


    /* ==============================
       DELETE
    ============================== */

    const handleDelete = async (centreId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this centre?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await deleteCentre(centreId);

            setCentres((prev) =>
                prev.filter((centre) => centre.centre_id !== centreId)
            );

        } catch (error) {

            console.error("Delete Centre Error:", error);

            alert(
                error.response?.data?.detail ||
                "Unable to delete centre"
            );
        }
    };


    /* ==============================
       SORT
    ============================== */

    const handleSort = (field) => {

        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDirection("asc");
        }

        setCurrentPage(1);
    };


    /* ==============================
       TABLE SEARCH + SORT
    ============================== */

    const filtered = useMemo(() => {

        let rows = [...centres];

        if (search) {

            const q = search.toLowerCase();

            rows = rows.filter((centre) =>
                [
                    centre.centre_name,
                    centre.state_name,
                    centre.district_name,
                    centre.block_name,
                    centre.phone_number,
                ].some((value) =>
                    String(value || "").toLowerCase().includes(q)
                )
            );
        }

        if (sortField) {

            rows.sort((a, b) => {

                const x = String(a[sortField] ?? "").toLowerCase();
                const y = String(b[sortField] ?? "").toLowerCase();

                if (x < y) return sortDirection === "asc" ? -1 : 1;
                if (x > y) return sortDirection === "asc" ? 1 : -1;
                return 0;
            });
        }

        return rows;

    }, [centres, search, sortField, sortDirection]);


    /* ==============================
       PAGINATION
    ============================== */

    /* ==============================
    PAGINATION
 ============================== */

    const totalEntries = filtered.length;

    const totalPages =
        Math.max(1, Math.ceil(totalEntries / entriesPerPage));

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * entriesPerPage;

        return filtered.slice(
            start,
            start + entriesPerPage
        );
    }, [filtered, currentPage, entriesPerPage]);

    const startEntry =
        totalEntries === 0
            ? 0
            : (currentPage - 1) * entriesPerPage + 1;

    const endEntry = Math.min(
        currentPage * entriesPerPage,
        totalEntries);

    /* ==============================
           BREADCRUMB
      ============================== */

    const breadcrumbItems = [
        { label: "Home", path: "/dashboard" },
        { label: "Centre Masters" },
    ];



    /* ==============================
       CLASSES
    ============================== */

    const selectClass =
        "w-full h-[35px] px-[12px] pr-[34px] appearance-none bg-white border shadow-inner border-[#D8E2EF] rounded-[6px] text-[14px] text-[#5E6E82] outline-none cursor-pointer disabled:bg-[#F5F7FA] disabled:cursor-not-allowed bg-[length:14px_11px] bg-no-repeat bg-[right_12px_center] bg-[url('data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Cpath fill=%22none%22 stroke=%22%235E6E82%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.6%2２ d=%2２m2 5 6 6 6-6%2２/%3E%3C/svg%3E')]";

    const inputClass =
        "w-full h-[35px] px-[12px] bg-white border shadow-inner border-[#D8E2EF] rounded-[6px] text-[14px] text-[#5E6E82] outline-none ";

    const cellClass =
        "border border-gray-200 px-4 py-2 text-sm";


    return (

        <AppLayout>

            <div className="w-full flex items-center justify-between mb-[20px] px-3">

                <div className="text-[20px]  font-medium text-[#344050] font-[Poppins]">
                    Centre Masters
                </div>
                <Breadcrumbs items={breadcrumbItems} />
            </div>
            <div className="w-full bg-white p-[20px] rounded-[8px] border border-[#D8E2EF] shadow-sm">
                {/* ================= FILTER BAR ================= */}

                <div className="flex flex-wrap items-center gap-[12px]">


                    {/* STATE */}

                    <div className="w-full sm:w-[calc(50%-6px)] lg:flex-1 lg:min-w-40">
                        <div className="relative">
                            <select
                                name="state_id"
                                value={filters.state_id}
                                onChange={handleFilterChange}
                                className={`${selectClass} appearance-none pr-10 rounded-sm shadow-inner text-[#5E6E82]`}
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

                            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none" />
                        </div>
                    </div>


                    {/* DISTRICT */}

                    <div className="w-full sm:w-[calc(50%-6px)] lg:flex-1 lg:min-w-[170px]">
                        <div className="relative">
                            <select
                                name="district_id"
                                value={filters.district_id}
                                onChange={handleFilterChange}
                                className={`${selectClass} appearance-none pr-10 rounded-sm shadow-inner text-[#5E6E82]`}
                                disabled={!filters.state_id}
                            >
                                <option value="">Select District</option>

                                {districts.map((district) => (
                                    <option
                                        key={district.district_lgd_code}
                                        value={district.district_lgd_code}
                                    >
                                        {district.district_name}
                                    </option>
                                ))}
                            </select>

                            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none" />
                        </div>
                    </div>


                    {/* BLOCK */}

                    {/* <div className="w-full sm:w-[calc(50%-6px)] lg:flex-1 lg:min-w-[170px]">
                        <div className="relative">
                            <select
                                name="block_id"
                                value={filters.block_id}
                                onChange={handleFilterChange}
                                className={`${selectClass} appearance-none pr-10`}
                                disabled={!filters.district_id}
                            >
                                <option value="">Select Block</option>

                                {blocks.map((block) => (
                                    <option
                                        key={block.block_lgd_code}
                                        value={block.block_lgd_code}
                                    >
                                        {block.block_name}
                                    </option>
                                ))}
                            </select>

                            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none" />
                        </div>
                    </div> */}


                    {/* CENTRE NAME */}

                    <div className="w-full sm:w-[calc(50%-6px)] lg:flex-1 lg:min-w-[190px]">

                        <input
                            type="text"
                            name="centre_name"
                            value={filters.centre_name}
                            onChange={handleFilterChange}
                            placeholder="Search By Centre Name"
                            className={inputClass}
                        />

                    </div>


                    {/* BUTTONS */}

                    <div className="flex items-center gap-[10px] w-full lg:w-auto">

                        <button
                            type="button"
                            onClick={handleSearch}
                            className="flex-1 lg:flex-none lg:w-[130px] h-[38px] bg-[#732269] border border-[#732269] rounded-sm !text-white text-[14px] font-medium hover:opacity-90"
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex-1 lg:flex-none lg:w-[120px] h-[38px] bg-white border border-[#344050] rounded-sm text-[#344050] text-[14px] font-medium hover:bg-gray-50"
                        >
                            Reset
                        </button>

                    </div>

                </div>


                <div className="border-t border-[#4FC3C3] my-[20px]" />


                {/* ================= COUNT + ADD ================= */}

                <div className="flex flex-wrap items-center justify-between gap-[12px] mb-[16px]">

                    <h6 className="m-0 text-[14px] font-bold text-[#344050]">
                        Total Centre (s):{" "}
                        <span className="text-[#7b216f]">{totalEntries}</span>
                    </h6>

                    <Link
                        to="/centres/create"
                        className="inline-flex items-center h-[38px] px-[20px] bg-white border border-[#344050] rounded-sm text-[14px] font-bold !text-[#344050] no-underline hover:bg-gray-50"
                    >
                        +Add centre
                    </Link>

                </div>


                {/* ================= TABLE HEADER ================= */}

                {/* <TableHeader
                    totalEntries={totalEntries}
                    startEntry={startEntry}
                    endEntry={endEntry}
                    search={search}
                    setSearch={(value) => {
                        setSearch(value);
                        setCurrentPage(1);
                    }}
                /> */}


                {/* ================= TABLE ================= */}

                <DataTable
                    columns={columns}
                    data={paginated}
                    loading={loading}
                    emptyMessage="No centres found"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}

                    renderRow={(row, index) => (

                        <tr key={row.centre_id} className="hover:bg-gray-50">

                            <td className={`${cellClass} text-center font-semibold`}>
                                {(currentPage - 1) * entriesPerPage + index + 1}
                            </td>

                            <td className={cellClass}>{row.centre_name || "-"}</td>

                            <td className={cellClass}>{row.state_name || "-"}</td>

                            <td className={cellClass}>{row.district_name || "-"}</td>

                            <td className={cellClass}>{row.block_name || "-"}</td>

                            <td className={cellClass}>{row.phone_number || "-"}</td>

                            <td className={cellClass}>
                                <span
                                    className={`inline-block px-[8px] py-[3px] rounded-[4px] text-[11px] font-bold !text-white ${Number(row.status) === 1
                                        ? "bg-[#00864E]"
                                        : "bg-[#E63757]"
                                        }`}
                                >
                                    {Number(row.status) === 1 ? "Active" : "Not Active"}
                                </span>
                            </td>

                            <td className="border border-gray-200 px-4 py-2">
                                <div className="flex justify-center">
                                    <TableActions
                                        onView={() => navigate(`/centres/${row.centre_id}`)}
                                        onEdit={() => navigate(`/centres/edit/${row.centre_id}`)}
                                        onDelete={() => handleDelete(row.centre_id)}
                                    />
                                </div>
                            </td>

                        </tr>

                    )}
                />


                {/* ================= PAGINATION ================= */}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <EntriesDropdown
                        value={entriesPerPage}
                        onChange={(value) => {
                            setEntriesPerPage(Number(value));
                            setCurrentPage(1);
                        }}
                    />

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