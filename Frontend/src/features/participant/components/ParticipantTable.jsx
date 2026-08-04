import { KeyRound, Clock } from 'lucide-react';

const BRAND = '#732269';
const BRAND_DARK = '#571a4e';

const STATUS_STYLES = {
    Active: 'bg-emerald-100 text-emerald-700',
    Inactive: 'bg-gray-200 text-gray-600',
};

const th = "border border-white/20 px-3 py-[8px] text-[15px] font-semibold whitespace-nowrap text-white";
const td = "border border-[#dee2e6] px-3 py-[8px] text-[15px]";

export default function ParticipantTable({
    rows,
    loading,
    error,
    startIndex,
    onEdit,
    onViewReport,
    onManageModules,
    onTimeSpent,
    onResetPassword,
}) {
    return (
        <div className="overflow-x-auto px-3">
            <table className="w-full border-collapse">
                <thead>
                    <tr style={{ backgroundColor: BRAND }} className="text-left">
                        <th className={th}>S. No.</th>
                        <th className={th}>Trainee Name</th>
                        <th className={th}>Enrollment Id</th>
                        <th className={th}>Course Progress</th>
                        <th className={th}>Performance</th>
                        <th className={th}>Status</th>
                        <th className={th}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={7} className={`${td} text-center text-gray-400`}>
                                Loading trainees…
                            </td>
                        </tr>
                    )}

                    {!loading && error && (
                        <tr>
                            <td colSpan={7} className={`${td} text-center text-red-500`}>
                                {error}
                            </td>
                        </tr>
                    )}

                    {!loading && !error && rows.length === 0 && (
                        <tr>
                            <td colSpan={7} className={`${td} text-center text-gray-400`}>
                                No trainees match these filters.
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        !error &&
                        rows.map((p, i) => (
                            <tr key={p.participant_id} className="hover:bg-gray-50">
                                <td className={`${td} text-gray-500`}>{startIndex + i + 1}</td>
                                <td className={`${td} font-medium`} style={{ color: BRAND }}>
                                    {p.participant_name}
                                </td>
                                <td className={`${td} text-gray-600`}>{p.enrollment_no}</td>
                                <td className={td}>
                                    <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${p.course_progress ?? 0}%`,
                                                backgroundColor: BRAND,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-400">{p.course_progress ?? 0}%</span>
                                </td>
                                <td className={td}>
                                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                        {p.performance_status ?? 'Yet to Start'}
                                    </span>
                                </td>
                                <td className={td}>
                                    <span
                                        className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_STYLES[p.status] ?? 'bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {p.status}
                                    </span>
                                </td>
                                <td className={td}>
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <button
                                            onClick={() => onEdit?.(p)}
                                            className="border border-gray-300 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onViewReport?.(p)}
                                            className="border border-gray-300 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-gray-50"
                                        >
                                            View Report
                                        </button>
                                        <button
                                            onClick={() => onManageModules?.(p)}
                                            className="border border-gray-300 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-gray-50"
                                        >
                                            Manage Modules
                                        </button>
                                        <button
                                            onClick={() => onTimeSpent?.(p)}
                                            style={{ backgroundColor: BRAND }}
                                            className="flex items-center gap-1 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:opacity-90"
                                        >
                                            <Clock className="w-3.5 h-3.5" />
                                            Time Spent
                                        </button>
                                        <button
                                            onClick={() => onResetPassword?.(p)}
                                            className="bg-gray-900 hover:bg-black text-white p-1.5 rounded-md"
                                        >
                                            <KeyRound className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

export { BRAND, BRAND_DARK };