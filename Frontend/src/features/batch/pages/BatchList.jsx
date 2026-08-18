import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../shared/components/table/DataTable';

import { getBatches, getStates, getDistricts, } from "../services/batchService";
import BatchFilter from '../components/BatchFilter';
import AppLayout from '../../../components/layout/AppLayout';
import Pagination from '../../../shared/components/table/Pagination';
import EntriesDropdown from '../../../shared/components/table/EntriesDropdown';
import BatchView from "./BatchView";
import { useRef } from "react";


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

    const [filters, setFilters] = useState({ state_id: '', district_id: '' });
    const [appliedFilters, setAppliedFilters] = useState(filters);
    const [search, setSearch] = useState('');

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
                search: search || undefined,
            });
            setBatches(Array.isArray(data) ? data : []);
        } catch {
            setError('Could not load batches. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [appliedFilters, search]);

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

    const handleReset = () => {
        const empty = { state_id: '', district_id: '' };
        setFilters(empty);
        setAppliedFilters(empty);
        setSearch('');
        setPage(1);
    };

    // Filters apply immediately on change (matching the reference UI, which
    // has no explicit Search button for this screen).
    useEffect(() => {
        setPage(1);
        setAppliedFilters(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.state_id, filters.district_id]);

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
            <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-semibold text-gray-800">Batches List</span>
                <nav className="text-sm italic" style={{ color: BRAND }}>
                    Home <span className="text-gray-400 mx-1">/</span> Batches{' '}
                    <span className="text-gray-400 mx-1">/</span>
                    <span>Batches List</span>
                </nav>
            </div>
            <div className="bg-white min-h-screen p-3">
                {/* Filters (separate component) */}
                <BatchFilter
                    filters={filters}
                    states={states}
                    districts={districts}
                    onFilterChange={handleFilterChange}
                    onReset={handleReset}
                    onAddBatch={() => navigate('/batches/create')}
                />

                {/* Entries + search */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500">
                        {totalEntries === 0
                            ? 'Showing 0 entries'
                            : `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Search:</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="border border-gray-300 rounded-md px-2 py-1 !shadow-inner text-sm w-56"
                        />
                    </div>
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
                                        className="flex items-center gap-2 px-4 py-1 text-[12px] font-medium text-[#4d5969] bg-white border-2 border-[#bfc7d1] rounded-sm hover:bg-[#f7f8fa]"
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
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 px-3">
                    <EntriesDropdown
                        value={entriesPerPage}
                        onChange={(value) => {
                            setEntriesPerPage(Number(value));
                            setPage(1);
                        }}
                    />
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
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