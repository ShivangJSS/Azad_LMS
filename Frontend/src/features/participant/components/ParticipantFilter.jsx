import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BRAND } from './ParticipantTable';

export default function ParticipantFilter({
    filters,
    states,
    districts,
    centres,
    batches,
    totalCount,
    onFilterChange,
    onSearch,
    onReset,
    onAddTrainee,
}) {
    const navigate = useNavigate();

    const handleAddTrainee = () => {
        onAddTrainee?.();
        navigate('/participants/create');
    };

    return (
        <div>
            {/* Filters */}
            <div className="bg-white rounded-lg  p-4 flex flex-wrap items-center gap-3">
                <select
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 min-w-[160px]"
                    value={filters.state_id}
                    onChange={onFilterChange('state_id')}
                >
                    <option value="">Select State</option>
                    {states.map((s) => (
                        <option key={s.state_lgd_code} value={s.state_lgd_code}>
                            {s.state_name}
                        </option>
                    ))}
                </select>

                <select
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 min-w-[160px]"
                    value={filters.district_id}
                    onChange={onFilterChange('district_id')}
                    disabled={!filters.state_id}
                >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                        <option key={d.district_lgd_code} value={d.district_lgd_code}>
                            {d.district_name}
                        </option>
                    ))}
                </select>

                <select
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 min-w-[160px]"
                    value={filters.centre_id}
                    onChange={onFilterChange('centre_id')}
                >
                    <option value="">Select Centre</option>
                    {centres.map((c) => (
                        <option key={c.centre_id} value={c.centre_id}>
                            {c.centre_name}
                        </option>
                    ))}
                </select>

                <select
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 min-w-[160px]"
                    value={filters.batch_id}
                    onChange={onFilterChange('batch_id')}
                >
                    <option value="">Select Batch</option>
                    {batches.map((b) => (
                        <option key={b.batch_id} value={b.batch_id}>
                            {b.batch_name}
                        </option>
                    ))}
                </select>

                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search By Trainee Name"
                        className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm"
                        value={filters.search}
                        onChange={onFilterChange('search')}
                        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    />
                </div>

                <button
                    onClick={onSearch}
                    style={{ backgroundColor: BRAND }}
                    className="text-white text-sm font-medium px-5 py-2 rounded-md hover:opacity-90 transition-opacity"
                >
                    Search
                </button>
                <button
                    onClick={onReset}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2 rounded-md transition-colors"
                >
                    Reset
                </button>
            </div>

            <div className="border-t border-[#4FC3C3] my-[20px]" />

            {/* Total + Add */}
            <div className="flex items-center justify-between mb-3 px-3">
                <p className="text-sm font-medium text-gray-700">
                    Total Trainees: <span className="font-bold" style={{ color: BRAND }}>{totalCount}</span>
                </p>
                <button
                    onClick={handleAddTrainee}
                    style={{ backgroundColor: BRAND }}
                    className="flex items-center gap-1 text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" /> Add Trainee
                </button>
            </div>
        </div>
    );
}