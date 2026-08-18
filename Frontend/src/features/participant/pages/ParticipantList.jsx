import { useState, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';
import {
    getParticipants,
    getStates,
    getDistricts,
    getAllCentres,
    getBatches,
} from '../services/participantService';
import ParticipantTable, { BRAND } from '../components/ParticipantTable';
import ParticipantFilter from '../components/ParticipantFilter';
import AppLayout from '../../../components/layout/AppLayout';
import Pagination from '../../../shared/components/table/Pagination';
import ManageModuleModal from '../components/ManageModuleModal';
import TimeSpentModal from '../components/TimeSpentModal';
import CredentialsModal from '../components/CredentialsModal';
import Breadcrumbs from '../../../shared/components/breadcrumbs/Breadcrumbs';
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

export default function ParticipantList() {
    // Filter dropdown data
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [centres, setCentres] = useState([]);
    const [batches, setBatches] = useState([]);
    const navigate = useNavigate();

    // Selected filters (pending vs applied so Search/Reset behave predictably)
    const [filters, setFilters] = useState({
        state_id: '',
        district_id: '',
        centre_id: '',
        batch_id: '',
        search: '',
    });
    const [appliedFilters, setAppliedFilters] = useState(filters);

    // Table data
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);

    // Row-action modals
    const [activeModal, setActiveModal] = useState(null); // 'modules' | 'time' | 'creds'
    const [activeParticipant, setActiveParticipant] = useState(null);

    // ---- load dropdown data ----

    useEffect(() => {
        getStates().then(setStates).catch(() => setStates([]));
        getAllCentres().then(setCentres).catch(() => setCentres([]));
        getBatches().then(setBatches).catch(() => setBatches([]));
    }, []);

    useEffect(() => {
        if (!filters.state_id) {
            setDistricts([]);
            return;
        }
        getDistricts(filters.state_id)
            .then(setDistricts)
            .catch(() => setDistricts([]));
    }, [filters.state_id]);

    useEffect(() => {
        getBatches(filters.centre_id || undefined)
            .then(setBatches)
            .catch(() => setBatches([]));
    }, [filters.centre_id]);

    // ---- load participants whenever applied filters change ----

    const loadParticipants = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getParticipants({
                state_id: appliedFilters.state_id || undefined,
                district_id: appliedFilters.district_id || undefined,
                centre_id: appliedFilters.centre_id || undefined,
                batch_id: appliedFilters.batch_id || undefined,
                search: appliedFilters.search || undefined,
            });
            setParticipants(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Could not load trainees. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [appliedFilters]);

    useEffect(() => {
        loadParticipants();
    }, [loadParticipants]);

    // ---- handlers ----

    const handleFilterChange = (key) => (e) => {
        const value = e.target.value;
        setFilters((prev) => {
            const next = { ...prev, [key]: value };
            if (key === 'state_id') next.district_id = ''; // clear dependent filter
            return next;
        });
    };

    const handleSearch = () => {
        setPage(1);
        setAppliedFilters(filters);
    };

    const handleReset = () => {
        const empty = { state_id: '', district_id: '', centre_id: '', batch_id: '', search: '' };
        setFilters(empty);
        setAppliedFilters(empty);
        setPage(1);
    };

    const handleExport = () => {
        const rows = [
            ['S. No.', 'Trainee Name', 'Enrollment Id', 'Status'],
            ...participants.map((p, i) => [i + 1, p.participant_name, p.enrollment_no, p.status]),
        ];
        const csv = rows.map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trainees.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleAddTrainee = () => {};

    // ---- action handlers passed down to the table (wire these to real routes) ----

    const handleEdit = (p) => {
        navigate(`/participants/${p.participant_id}/edit`);
    };
    const handleViewReport = (p) => {
        navigate(`/participants/view/${p.participant_id}`);
    };
    const handleManageModules = (p) => {
        setActiveParticipant(p);
        setActiveModal('modules');
    };
    const handleTimeSpent = (p) => {
        setActiveParticipant(p);
        setActiveModal('time');
    };
    const handleResetPassword = (p) => {
        setActiveParticipant(p);
        setActiveModal('creds');
    };

    const closeModal = () => {
        setActiveModal(null);
        setActiveParticipant(null);
    };

    // ---- client-side pagination (backend doesn't paginate yet) ----

    const totalPages = Math.max(1, Math.ceil(participants.length / PAGE_SIZE));
    const startIndex = (page - 1) * PAGE_SIZE;
    const pageRows = participants.slice(startIndex, startIndex + PAGE_SIZE);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
        Math.max(0, page - 5),
        Math.max(0, page - 5) + 10
    );

    return (
        <AppLayout>

            <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-[#1a1e22]">Trainees List</span>
                <Breadcrumbs
                    items={[
                        { label: 'Home', path: '/dashboard' },
                        { label: 'Trainees', path: '/participants/list' },
                        { label: 'Trainees List' },
                    ]}
                />
            </div>
            <div className="bg-gray-50 min-h-screen">

                {/* Filters + Total/Add row (separate component) */}
                <ParticipantFilter
                    filters={filters}
                    states={states}
                    districts={districts}
                    centres={centres}
                    batches={batches}
                    totalCount={participants.length}
                    onFilterChange={handleFilterChange}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onAddTrainee={handleAddTrainee}
                />

                {/* Table (separate component) */}
                <ParticipantTable
                    rows={pageRows}
                    loading={loading}
                    error={error}
                    startIndex={startIndex}
                    onEdit={handleEdit}
                    onViewReport={handleViewReport}
                    onManageModules={handleManageModules}
                    onTimeSpent={handleTimeSpent}
                    onResetPassword={handleResetPassword}
                />

                {/* Export + pagination */}
                <div className="flex items-center justify-between mt-4 px-3">
                    <button
                        onClick={handleExport}
                        style={{ borderColor: BRAND, color: BRAND }}
                        className="flex items-center gap-1 border text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            </div>

            {activeModal === 'modules' && activeParticipant && (
                <ManageModuleModal
                    participantId={activeParticipant.participant_id}
                    participantName={activeParticipant.participant_name}
                    onClose={closeModal}
                />
            )}

            {activeModal === 'time' && activeParticipant && (
                <TimeSpentModal
                    participantId={activeParticipant.participant_id}
                    participantName={activeParticipant.participant_name}
                    onClose={closeModal}
                />
            )}

            {activeModal === 'creds' && activeParticipant && (
                <CredentialsModal
                    participantId={activeParticipant.participant_id}
                    participantName={activeParticipant.participant_name}
                    onClose={closeModal}
                />
            )}
        </AppLayout>
    );
}