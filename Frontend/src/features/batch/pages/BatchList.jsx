import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DataTable from '@/shared/components/table/DataTable';

import { getBatches, getStates, getDistricts, } from "@/features/batch/services/BatchService";
import BatchFilter from '@/features/batch/components/BatchFilter';
import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/shared/components/table/Pagination';
import EntriesDropdown from '@/shared/components/table/EntriesDropdown';
import BatchView from "./BatchView";
import Breadcrumbs from "@/shared/components/breadcrumbs/Breadcrumbs";


const BRAND = "#732269";
const td = "border border-[#dee2e6] px-3 py-[8px] text-[15px]";


const columns = [
    {
        key: "sr_no",
        title: "Sr No",
    },
    {
        key: "batch_name",
        title: "Batch Name",
        sortable: true,
    },
    {
        key: "fy_year",
        title: "FY",
        sortable: true,
    },
    {
        key: "created_by_name",
        title: "Created By",
        sortable: true,
    },
    {
        key: "centre_name",
        title: "Centre",
        sortable: true,
    },
    {
        key: "status",
        title: "Status",
        sortable: true,
    },
    {
        key: "action",
        title: "Action",
        className: "text-center",
    },
];

export default function BatchList() {
    const navigate = useNavigate();
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);

    // `filters` is the draft (edited in the filter row); `appliedFilters` is
    // what actually queries the table — updated only on Search / Reset, so
    // nothing auto-searches. Search lives inside the filter row (one bar).
    const [filters, setFilters] = useState({ state_id: '', district_id: '', search: '' });
    const [appliedFilters, setAppliedFilters] = useState(filters);

    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const [selectedBatchId, setSelectedBatchId] = useState(null);

    const batchViewRef = useRef(null);


    const getCreatedByName = (b) => {
        if (b.created_by_name) return b.created_by_name;
        if (typeof b.created_by === "string") return b.created_by;
        if (b.created_by && typeof b.created_by === "object") {
            return b.created_by.name || b.created_by.full_name || "—";
        }
        return "—";
    };

    // ---- dropdown data ----
    useEffect(() => {
        getStates().then(setStates).catch(() => setStates([]));
    }, []);

    useEffect(() => {
        if (!filters.state_id) {
            setDistricts([]);
            return;
        }
        getDistricts(filters.state_id).then(setDistricts).catch(() => setDistricts([]));
    }, [filters.state_id]);

    // ---- load batches ----
    const loadBatches = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getBatches({
                stateId: appliedFilters.state_id || undefined,
                districtId: appliedFilters.district_id || undefined,
                search: appliedFilters.search || undefined,
            });
            setBatches(Array.isArray(data) ? data : []);
        } catch {
            setError('Could not load batches. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [appliedFilters]);

    useEffect(() => {
        loadBatches();
    }, [loadBatches]);

    // ---- handlers ----
    const handleFilterChange = (key) => (e) => {
        const value = e.target.value;
        setFilters((prev) => {
            const next = { ...prev, [key]: value };
            if (key === 'state_id') next.district_id = '';
            return next;
        });
    };

    // Apply the draft filters (state, district, search) only when the user
    // clicks Search — matching the other list pages.
    const handleSearch = () => {
        setPage(1);
        setAppliedFilters(filters);
    };

    const handleReset = () => {
        const empty = { state_id: '', district_id: '', search: '' };
        setFilters(empty);
        setAppliedFilters(empty);
        setPage(1);
    };

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const sortedBatches = useMemo(() => {
        if (!sortConfig.key) return batches;
        const sorted = [...batches].sort((a, b) => {
            const av = a[sortConfig.key];
            const bv = b[sortConfig.key];
            if (av == null) return 1;
            if (bv == null) return -1;
            if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
            if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [batches, sortConfig]);

    const handleEdit = (b) => navigate(`/batches/${b.batch_id}/edit`);
    const handleAddParticipants = (b) =>
        navigate('/participants/create', {
            state: {
                batch_id: b.batch_id,
                centre_id: b.centre_id,
                state_id: b.state_id,
                district_id: b.district_id,
                block_id: b.block_id,
            },
        });

    const handleShowParticipants = (batchId) => {

        setSelectedBatchId(batchId);

        setTimeout(() => {
            batchViewRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 200);

    };


    const totalEntries = sortedBatches.length;
    const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
    const startIndex = (page - 1) * entriesPerPage;
    const pageRows = sortedBatches.slice(
        startIndex,
        startIndex + entriesPerPage
    );
    const endIndex = Math.min(
        startIndex + entriesPerPage,
        totalEntries
    );

    return (
        <AppLayout>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-semibold leading-tight text-gray-800">Batches List
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <Breadcrumbs
                        items={[
                            { label: "Home", path: "/dashboard" },
                            { label: "List" },
                        ]}
                    />

                </div>
            </div>
            <div className="bg-white min-h-screen p-3">
                {/* Filters (separate component) */}
                <BatchFilter
                    filters={filters}
                    states={states}
                    districts={districts}
                    onFilterChange={handleFilterChange}
                    onSearch={handleSearch}
                    onReset={handleReset}
                />

                {/* <div className="flex justify-end mb-2">
                    <button
                        type="button"
                        onClick={() => navigate('/batches/create')}
                        style={{ backgroundColor: BRAND }}
                        className="h-[39px] flex items-center !shadow-inner text-white text-sm font-medium px-3 !rounded-md hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-4.5 h-4.5" />
                        Add Batch
                    </button>
                </div> */}

                <div className="border-t border-[#4FC3C3] my-[20px]" />


                {/* ================= COUNT + ADD ================= */}

                <div className="flex flex-wrap items-center justify-between gap-[12px] mb-[16px]">

                    <h6 className="m-0 text-[14px] font-bold text-[#344050]">
                        Total Centre (s):{" "}
                        <span className="text-[#7b216f]">{totalEntries}</span>
                    </h6>

                    <Link
                        to="/batches/create"
                        className="inline-flex items-center h-[38px] px-[20px] bg-white border border-[#344050] rounded-sm text-[14px] font-bold !text-[#344050] !no-underline hover:bg-gray-50"
                    >
                        +Add Batch
                    </Link>

                </div>

                <DataTable
                    columns={columns}
                    data={pageRows}
                    loading={loading}
                    emptyMessage="No Batches Found"
                    sortField={sortConfig.key}
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                    renderRow={(b, index) => (
                        <tr key={b.batch_id} className="hover:bg-[#fafafa]">

                            <td className={`${td} text-[#4d5969]`}>
                                {startIndex + index + 1}
                            </td>

                            <td className={`${td} text-[#732269] font-medium`}>
                                {b.batch_name}
                            </td>

                            <td className={td}>
                                {b.fy_year}
                            </td>

                            <td className={td}>
                                {getCreatedByName(b)}
                            </td>

                            <td className={td}>
                                {b.centre_name}
                            </td>

                            <td className={td}>
                                {b.status === 1 ? "Active" : "Inactive"}
                            </td>

                            <td className={td}>
                                <div className="flex items-center justify-center gap-2">

                                    <button
                                        onClick={() => navigate(`/batches/${b.batch_id}/edit`)}
                                        className="px-4 py-1 text-[12px] font-medium text-white bg-[#732269] rounded-sm hover:bg-[#67205e]"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleAddParticipants(b)}
                                        className="px-4 py-1 text-[12px] font-medium text-[#67205e] bg-white border-2 border-[#67205e] rounded-sm hover:bg-[#f7f8fa]"
                                    >
                                        Add Participants
                                    </button>

                                    <button
                                        onClick={() => handleShowParticipants(b.batch_id)}
                                        disabled={b.participant_count === 0}
                                        className={`flex items-center gap-2 px-4 py-1 text-[12px] font-medium ${b.participant_count === 0 ? 'text-[#9DA9BB] bg-[#F5F7FA] border-[#D8E2EF] cursor-not-allowed' : 'text-[#4d5969] bg-white border-2 border-[#bfc7d1] rounded-sm hover:bg-[#f7f8fa]'}`}
                                    >
                                        Show Participants

                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eef1f5] text-[11px] font-semibold">
                                            {b.participant_count ?? 0}
                                        </span>
                                    </button>

                                </div>
                            </td>

                        </tr>
                    )}
                />
                {/* Bottom section: Add Batch (right), entries count + pagination */}
                <div className="mt-4 px-3 flex flex-col gap-3">

                    {/* Add Batch — bottom of the table, aligned right */}


                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-4">
                            <EntriesDropdown
                                value={entriesPerPage}
                                onChange={(value) => {
                                    setEntriesPerPage(Number(value));
                                    setPage(1);
                                }}
                            />

                        </div>
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                </div>
            </div>
            {selectedBatchId && (
                <div
                    ref={batchViewRef}
                    className="mt-8"
                >
                    <BatchView batchId={selectedBatchId} />
                </div>
            )}
        </AppLayout>
    );
}
export { BRAND };