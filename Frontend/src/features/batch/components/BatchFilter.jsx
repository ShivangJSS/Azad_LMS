import { Plus, RotateCcw } from 'lucide-react';
import { BRAND } from '../pages/BatchList';

export default function BatchFilter({
    filters,
    states,
    districts,
    onFilterChange,
    onReset,
    onAddBatch,
}) {
    return (
        <div className="bg-white  p-4 mb-4 flex flex-wrap items-end gap-3 ">
            <div className="min-w-[220px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600"
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
            </div>

            <div className="min-w-[220px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600"
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
            </div>

            <button
                onClick={onReset}
                className="flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
            </button>

            <div className="flex-1" />

            <button
                onClick={onAddBatch}
                style={{ backgroundColor: BRAND }}
                className="flex items-center gap-1 text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
                <Plus className="w-4 h-4" /> Add Batch
            </button>
        </div>
    );
}