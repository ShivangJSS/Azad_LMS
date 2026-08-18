import { useEffect, useState } from "react";
import { FiX, FiInfo } from "react-icons/fi";

import { getParticipantTimeSpent } from "../services/ParticipantService";

const PURPLE = "#732269";

const formatDuration = (seconds) => {
    const s = Number(seconds) || 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    parts.push(`${sec}s`);
    return parts.join(" ");
};

export default function TimeSpentModal({ participantId, participantName, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!participantId) return;
        (async () => {
            setLoading(true);
            try {
                const res = await getParticipantTimeSpent(participantId);
                setData(res?.data ?? res ?? null);
            } catch (error) {
                setData(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [participantId]);

    const name = participantName || data?.participant_name || "";
    const modules = data?.modules || [];
    const hasData = modules.length > 0;

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
            <div className="w-full max-w-6xl overflow-hidden rounded-[10px] bg-white shadow-2xl">
                {/* Header */}
                <div
                    className="relative flex items-center justify-between overflow-hidden px-8 py-8"
                    style={{ backgroundColor: PURPLE }}
                >
                    {/* decorative band */}
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 -skew-x-12 bg-white/10" />

                    <h2 className="relative text-[26px] font-semibold text-white">
                        Module-wise Time Spent
                        {name ? ` — ${name}` : ""}
                    </h2>

                    <div className="relative flex items-center gap-3">
                        <span
                            title="Total time is summed across all modules."
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white"
                        >
                            <FiInfo size={18} />
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20"
                        >
                            <FiX size={22} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    {loading ? (
                        <div className="py-10 text-center text-[14px] text-[#5E6E82]">
                            Loading...
                        </div>
                    ) : !hasData ? (
                        <div className="py-10 text-center text-[16px] text-[#8A94A6]">
                            No time spent data available.
                        </div>
                    ) : (
                        <>
                            <div className="mb-5 inline-block rounded-[6px] border border-[#D8E2EF] bg-[#F7F5F9] px-4 py-2 text-[14px]">
                                Total time:{" "}
                                <span className="font-semibold text-[#732269]">
                                    {formatDuration(data?.total_time_spent_seconds)}
                                </span>
                            </div>

                            <div className="overflow-hidden rounded-[6px] border border-[#E3E6ED]">
                                <div className="overflow-x-auto"><table className="w-full border-collapse">
                                    <thead>
                                        <tr style={{ backgroundColor: PURPLE }}>
                                            <th className="px-5 py-3 text-left text-[14px] font-semibold text-white">
                                                Module
                                            </th>
                                            <th className="px-5 py-3 text-left text-[14px] font-semibold text-white">
                                                Time Spent
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modules.map((m) => (
                                            <tr key={m.module_id} className="hover:bg-[#FAFBFD]">
                                                <td className="border-b border-[#EDF0F5] px-5 py-3 text-[14px] text-[#344050]">
                                                    {m.module_name}
                                                </td>
                                                <td className="border-b border-[#EDF0F5] px-5 py-3 text-[14px] text-[#344050]">
                                                    {formatDuration(m.time_spent_seconds)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table></div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
