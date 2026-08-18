import { KeyRound, Clock } from 'lucide-react';

import { getParticipantImageUrl } from '../../../shared/utils/mediaUrl';

const BRAND = '#732269';

// Build the initials shown when a trainee has no photo (or it fails to load).
const initialsOf = (name) => {
    if (!name) return '?';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
};
const BRAND_DARK = '#571a4e';

const STATUS_STYLES = {
    Active: 'bg-emerald-100 text-emerald-700',
    Inactive: 'bg-gray-200 text-gray-600',
};


const PERFORMANCE_STYLES = {
    Good: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    Average: { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    Poor: { badge: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
    'Yet to Start': { badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
};

const th = "border border-white/40 px-3 py-[8px] text-[15px] font-semibold whitespace-nowrap text-white";
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
                                    <div className="flex items-center gap-2">
                                        {p.image ? (
                                            <img
                                                src={getParticipantImageUrl(p.image)}
                                                alt={p.participant_name || 'Trainee'}
                                                className="h-8 w-8 flex-shrink-0 rounded-full border border-gray-200 object-cover"
                                                onError={(e) => {
                                                    // Fall back to the initials avatar if the
                                                    // image path is missing/broken.
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextSibling?.style.removeProperty(
                                                        'display'
                                                    );
                                                }}
                                            />
                                        ) : null}
                                        <span
                                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                                            style={{
                                                backgroundColor: BRAND,
                                                display: p.image ? 'none' : 'flex',
                                            }}
                                        >
                                            {initialsOf(p.participant_name)}
                                        </span>
                                        <span>{p.participant_name}</span>
                                    </div>
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
                                    {(() => {
                                        const label =
                                            p.performance_status ?? 'Yet to Start';
                                        const s =
                                            PERFORMANCE_STYLES[label] ??
                                            PERFORMANCE_STYLES['Yet to Start'];
                                        return (
                                            <span
                                                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${s.badge}`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                                                />
                                                {label}
                                            </span>
                                        );
                                    })()}
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