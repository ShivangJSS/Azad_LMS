// import { Plus, RotateCcw } from 'lucide-react';
// import { BRAND } from '../pages/BatchList';

// export default function BatchFilter({
//     filters,
//     states,
//     districts,
//     onFilterChange,
//     onReset,
//     onAddBatch,
// }) {
//     return (
//         <div className="bg-white  p-4 mb-4 flex flex-wrap items-end gap-3  ">
//             <div className="min-w-1/3 !shadow-inner">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
//                 <select
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600"
//                     value={filters.state_id}
//                     onChange={onFilterChange('state_id')}
//                 >
//                     <option value="">Select State</option>
//                     {states.map((s) => (
//                         <option key={s.state_lgd_code} value={s.state_lgd_code}>
//                             {s.state_name}
//                         </option>
//                     ))}
//                 </select>
//             </div>

//             <div className="min-w-1/3 !shadow-inner">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
//                 <select
//                     className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600"
//                     value={filters.district_id}
//                     onChange={onFilterChange('district_id')}
//                     disabled={!filters.state_id}
//                 >
//                     <option value="">Select District</option>
//                     {districts.map((d) => (
//                         <option key={d.district_lgd_code} value={d.district_lgd_code}>
//                             {d.district_name}
//                         </option>
//                     ))}
//                 </select>
//             </div>

//             <button
//                 onClick={onReset}
//                 className="flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-md transition-colors"
//             >
//                 <RotateCcw className="w-3.5 h-3.5" />
//                 Reset
//             </button>

//             <div className="flex-1" />

//             <button
//                 onClick={onAddBatch}
//                 style={{ backgroundColor: BRAND }}
//                 className="flex items-center gap-1 text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
//             >
//                 <Plus className="w-4 h-4" /> Add Batch
//             </button>
//         </div>
//     );
// }


import { Plus, RotateCcw } from "lucide-react";
import { BRAND } from "../pages/BatchList";

export default function BatchFilter({
    filters,
    states,
    districts,
    onFilterChange,
    onReset,
    onAddBatch,
}) {
    return (
        <div className="bg-white mb-4 flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-[28%]">
                <label className="block text-sm font-medium text-[#4d5969] mb-1">
                    State
                </label>

                <select
                    className="w-full h-[39px] !shadow-inner border border-[#d9e1ec] rounded-md px-3 text-sm text-[#253858] bg-white focus:outline-none focus:border-[#732269]"
                    value={filters.state_id}
                    onChange={onFilterChange("state_id")}
                >
                    <option value="">Select State</option>

                    {states.map((s) => (
                        <option
                            key={s.state_lgd_code}
                            value={s.state_lgd_code}
                        >
                            {s.state_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="w-full sm:w-[28%]">
                <label className="block text-sm font-medium text-[#4d5969] mb-1">
                    District
                </label>

                <select
                    className="w-full h-[39px] !shadow-inner border border-[#d9e1ec] rounded-md px-3 text-sm text-[#253858] bg-[#edf2f8] focus:outline-none focus:border-[#732269] disabled:cursor-not-allowed"
                    value={filters.district_id}
                    onChange={onFilterChange("district_id")}
                    disabled={!filters.state_id}
                >
                    <option value="">Select District</option>

                    {districts.map((d) => (
                        <option
                            key={d.district_lgd_code}
                            value={d.district_lgd_code}
                        >
                            {d.district_name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="button"
                onClick={onReset}
                className="h-[39px] flex items-center gap-1.5 !shadow-inner border border-[#718096] hover:bg-[#f7f8fa] text-[#5b6b82] text-sm font-medium px-5 !rounded-md transition-colors"
            >
                <RotateCcw className="w-4.5 h-4.5" />
                Reset
            </button>

            <div className="flex-1" />

            <button
                type="button"
                onClick={onAddBatch}
                style={{ backgroundColor: BRAND }}
                className="h-[39px] flex items-center  !shadow-inner text-white text-sm font-medium px-3 !rounded-md hover:opacity-90 transition-opacity"
            >
                <Plus className="w-4.5 h-4.5" />
                Add Batch
            </button>
        </div>
    );
}