import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import DataTable from "../../../../shared/components/table/DataTable";
import EntriesDropdown from "../../../../shared/components/table/EntriesDropdown";
import Pagination from "../../../../shared/components/table/Pagination";

import useTable from "../../../../shared/hooks/useTable";

import { getAllStates, deleteState } from "../services/StateService";

export default function StateList() {
    const navigate = useNavigate();

    const [states, setStates] = useState([]);
    const [loading, setLoading] = useState(false);

    const [stateName, setStateName] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // =====================================================
    // FETCH STATES
    // =====================================================

    const fetchStates = async () => {
        try {
            setLoading(true);

            const response = await getAllStates();

            setStates(response.data || []);
        } catch (error) {
            console.error("Error fetching states:", error);
            setStates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStates();
    }, []);

    // =====================================================
    // FILTERED DATA
    // =====================================================

    const filteredStates = states.filter((state) => {
        const nameMatch = state.state_name
            ?.toLowerCase()
            .includes(stateName.toLowerCase());

        const statusMatch =
            !statusFilter || String(state.status) === statusFilter;

        return nameMatch && statusMatch;
    });

    // =====================================================
    // TABLE
    // =====================================================

    const table = useTable({
        data: filteredStates,
        searchableFields: ["state_lgd_code", "state_name", "status"],
        initialEntries: 10,
    });

    // =====================================================
    // COLUMNS
    // =====================================================

    const columns = [
        { key: "sr_no", title: "S. No.", sortable: false, className: "text-center" },
        { key: "state_lgd_code", title: "LGD Code", sortable: true, className: "text-center" },
        { key: "state_name", title: "State Name", sortable: true, className: "text-center" },
        { key: "status", title: "Status", sortable: true, className: "text-center" },
        { key: "action", title: "Action", sortable: false, className: "text-center" },
    ];

    // =====================================================
    // DELETE STATE
    // =====================================================
    const performDelete = async (stateId) => {
        console.log("Delete clicked:", stateId);

        const deleteToast = toast.loading("Deleting state...");

        try {
            const response = await deleteState(stateId);

            console.log("Delete Response:", response);

            toast.success("State deleted successfully", {
                id: deleteToast,
            });

            await fetchStates();
        } catch (error) {
            console.log("Status:", error.response?.status);
            console.log("Data:", error.response?.data);
            console.log(error);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Failed to delete state.",
                {
                    id: deleteToast,
                }
            );
        }
    };

    const handleDelete = (stateId) => {
        toast(
            (t) => (
                <div className="flex flex-col items-center gap-4 rounded-md bg-white p-4 shadow-lg">
                    <p className="text-center font-medium text-gray-800">
                        Are you sure you want to delete this state?
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                toast.dismiss(t.id);
                                performDelete(stateId);
                            }}
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Delete
                        </button>
                        <button
                            type="button"
                            onClick={() => toast.dismiss(t.id)}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            {
                duration: Infinity, // Toast won't dismiss automatically
            }
        );
    };

    // =====================================================
    // RESET FILTER
    // =====================================================

    const handleReset = () => {
        setStateName("");
        setStatusFilter("");
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <AppLayout>
            <div className="min-h-screen w-full bg-[#eef3f9] px-2 py-2">

                {/* ================= TITLE ================= */}

                <div className="w-full flex items-center justify-between mb-3">
                    <span className="text-[24px] leading-none font-semibold text-[#43324a]">
                        State Masters
                    </span>

                    <Breadcrumbs
                        items={[
                            { label: "Home", path: "/dashboard" },
                            { label: "State Masters" },
                        ]}
                    />
                </div>

                {/* ================= MAIN CARD ================= */}

                <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4">

                    {/* ================= FILTER ================= */}

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_115px_110px] gap-3 items-center">

                        {/* STATE NAME */}

                        <input
                            type="text"
                            value={stateName}
                            onChange={(e) => setStateName(e.target.value)}
                            placeholder="Search By State Name" 
                            className="w-full h-[38px] border border-gray-300 rounded-md px-4 text-[14px] text-gray-700 placeholder:text-gray-400  shadow-inner focus:outline-none focus:ring-1 focus:ring-[#7e2081]"
                        />

                        {/* STATUS */}

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)} 
                            className="w-full h-[38px] border border-gray-300 rounded-md px-3 text-[14px] text-gray-700 bg-white focus:outline-none focus:ring-1 shadow-inner focus:ring-[#7e2081]"
                        >
                            <option value="">Select Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>

                        {/* SEARCH */}

                        <button
                            type="button"
                            className="h-[35px] bg-[#732269] text-white text-[14px] font-medium rounded-sm! hover:bg-[#69186c] transition-colors"
                        >
                            Search
                        </button>

                        {/* RESET */}

                        <button
                            type="button"
                            onClick={handleReset}
                            className="h-[35px] border-1 border-[#171616e3] text-[14px] text-black rounded-sm! hover:bg-gray-100 transition-colors"
                        >
                            Reset
                        </button>
                    </div>

                    {/* LINE */}

                    <div className="border-t-2 border-[#28d7c0] my-3" />

                    {/* ================= TOTAL + ADD ================= */}

                    <div className="flex items-center justify-between mb-3 gap-3 flex-col md:flex-row">
                        <p className="text-[14px] font-semibold text-gray-800">
                            Total State(s):{" "}
                            <span className="text-[#7e2081]">
                                {filteredStates.length}
                            </span>
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/master/states/create")}
                            className=" border border-gray-400 text-[14px] font-medium text-gray-700 rounded-sm px-4 py-1  hover:bg-gray-50 transition-colors"
                        >
                            + Add State
                        </button>
                    </div>

                    {/* ================= TABLE ================= */}

                    <DataTable
                        columns={columns}
                        data={table.paginatedData}
                        sortField={table.sortField}
                        sortDirection={table.sortDirection}
                        onSort={table.handleSort}
                        loading={loading}
                        emptyMessage="No States Found"
                        renderRow={(state, index) => (
                            <tr
                                key={state.state_lgd_code}
                                className="hover:bg-[#fafafa]"
                            >
                                {/* SERIAL NUMBER */}

                                <td className="border border-[#dee2e6] px-3 py-2 text-center text-[14px] text-gray-700">
                                    {(table.currentPage - 1) *
                                        table.entriesPerPage +
                                        index +
                                        1}
                                </td>

                                {/* LGD CODE */}

                                <td className="border border-[#dee2e6] px-3 py-2 text-[14px] text-gray-700">
                                    {state.state_lgd_code}
                                </td>

                                {/* STATE NAME */}

                                <td className="border border-[#dee2e6] px-3 py-2 text-[14px] text-[#5f7d8b]">
                                    {state.state_name}
                                </td>

                                {/* STATUS */}

                                <td className="border border-[#dee2e6] px-3 py-2">
                                    {String(state.status) === "1" ? (
                                        <span className="inline-block bg-[#28a745] text-white text-[11px] font-bold px-2 py-[3px] rounded">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-block bg-[#dc3545] text-white text-[11px] font-bold px-2 py-[3px] rounded">
                                            Inactive
                                        </span>
                                    )}
                                </td>

                                {/* ACTION */}

                                <td className="border border-[#dee2e6] px-3 py-2">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/master/states/edit/${state.state_lgd_code}`
                                                )
                                            }
                                            className="bg-[#732269] hover:bg-[#69186c] text-white text-[13px] font-semibold px-3 py-[5px] rounded-sm transition-colors"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => 
                                                handleDelete(state.state_lgd_code)
                                            }
                                            className="bg-[#dc3545] hover:bg-[#c82333] text-white text-[13px] font-semibold px-3 py-[5px] rounded-sm transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    />

                    {/* ================= PAGINATION ================= */}

                    <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-3">
                        <EntriesDropdown
                            value={table.entriesPerPage}
                            onChange={table.setEntriesPerPage}
                        />

                        <Pagination
                            currentPage={table.currentPage}
                            totalPages={table.totalPages}
                            onPageChange={table.setCurrentPage}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}