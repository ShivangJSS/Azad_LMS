import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";

import { LANGUAGES } from "../../../shared/constants/languageConstants";
import {
    getParticipantModules,
    assignModule,
    unassignModule,
} from "../services/ParticipantService";

const PURPLE = "#732269";

export default function ManageModuleModal({
    participantId,
    participantName,
    onClose,
}) {
    const [languageKey, setLanguageKey] = useState("english");
    const [modules, setModules] = useState([]);
    // Per-language cache so re-visiting a tab is instant and switching never
    // blanks the table.
    const [cache, setCache] = useState({});
    const [selected, setSelected] = useState(() => new Set());
    const [loading, setLoading] = useState(true);
    const [busyIds, setBusyIds] = useState(() => new Set());
    const [savingAll, setSavingAll] = useState(false);

    const languageId =
        LANGUAGES.find((l) => l.key === languageKey)?.id || 1;

    // Fetch modules for the current language. `showSpinner` is only used for
    // the very first load — tab switches and refreshes keep the current rows
    // visible and swap them in place, so there's no reload flash.
    const fetchModules = useCallback(
        async ({ showSpinner = false } = {}) => {
            if (!participantId) return;
            if (showSpinner) setLoading(true);
            try {
                const data = await getParticipantModules(participantId, languageId);
                const list = Array.isArray(data) ? data : [];
                setModules(list);
                setCache((prev) => ({ ...prev, [languageId]: list }));
            } catch (error) {
                toast.error("Unable to load modules.");
                if (showSpinner) setModules([]);
            } finally {
                if (showSpinner) setLoading(false);
            }
        },
        [participantId, languageId]
    );

    useEffect(() => {
        if (!participantId) return;

        const cached = cache[languageId];
        if (cached) {
            // Already loaded this language — show instantly, refresh quietly.
            setModules(cached);
            setLoading(false);
            fetchModules({ showSpinner: false });
        } else {
            // First time for this language: only show the spinner if there are
            // no rows to keep on screen, otherwise swap in place.
            fetchModules({ showSpinner: modules.length === 0 });
        }
        setSelected(new Set());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [participantId, languageId]);

    const setBusy = (id, on) =>
        setBusyIds((prev) => {
            const next = new Set(prev);
            if (on) next.add(id);
            else next.delete(id);
            return next;
        });

    const toggleSelect = (id) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const handleToggleAssign = async (module) => {
        setBusy(module.module_id, true);
        try {
            if (module.assigned) {
                await unassignModule(participantId, module.module_id);
                toast.success("Module unassigned.");
            } else {
                await assignModule(participantId, module.module_id);
                toast.success("Module assigned.");
            }
            await fetchModules({ showSpinner: false });
        } catch (error) {
            toast.error(
                error?.response?.data?.detail || "Action failed."
            );
        } finally {
            setBusy(module.module_id, false);
        }
    };

    const handleAssignSelected = async () => {
        const toAssign = modules.filter(
            (m) => selected.has(m.module_id) && !m.assigned
        );
        if (toAssign.length === 0) {
            toast.error("Select at least one unassigned module.");
            return;
        }
        setSavingAll(true);
        try {
            for (const m of toAssign) {
                // Sequential so the backend commits each cleanly.
                // eslint-disable-next-line no-await-in-loop
                await assignModule(participantId, m.module_id);
            }
            toast.success(`${toAssign.length} module(s) assigned.`);
            await fetchModules({ showSpinner: false });
        } catch (error) {
            toast.error(
                error?.response?.data?.detail || "Bulk assign failed."
            );
        } finally {
            setSavingAll(false);
        }
    };

    const th =
        "px-4 py-3 text-left text-[13px] font-semibold text-white whitespace-nowrap border border-white/25";
    const td = "px-4 py-3 text-[13px] text-[#344050] border border-[#E3E6ED]";

    return (
        <div className="fixed inset-0 z-[1100] overflow-y-auto bg-black/40">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-5xl rounded-[8px] bg-white shadow-xl">
                    {/* Header */}
                    <div
                        className="flex items-center justify-between rounded-t-[8px] px-6 py-2"
                        style={{ backgroundColor: PURPLE }}
                    >
                        <div>
                            <h2 className="text-[20px] font-semibold text-white">
                                Assign Modules
                            </h2>
                            {participantName && (
                                <p className="text-[12px] text-white/70">
                                    {participantName}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full p-1 text-white/90 hover:bg-white/15"
                            aria-label="Close"
                        >
                            <FiX size={22} />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Language tabs */}
                        <div className="mb-4 flex flex-wrap gap-6 border-b border-[#E3E6ED]">
                            {LANGUAGES.map((lang) => {
                                const active = lang.key === languageKey;
                                return (
                                    <button
                                        key={lang.id}
                                        type="button"
                                        onClick={() => setLanguageKey(lang.key)}
                                        className={`-mb-px border-b-2 px-1 pb-3 text-[15px] font-medium transition-colors ${active
                                                ? "border-[#732269] text-[#732269]"
                                                : "border-transparent text-[#5E6E82] hover:text-[#732269]"
                                            }`}
                                    >
                                        {lang.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Table */}
                        <div className="overflow-hidden rounded-[6px] border border-[#E3E6ED]">
                            <div className="max-h-[52vh] overflow-y-auto">
                                <div className="overflow-x-auto"><table className="w-full border-collapse">
                                    <thead className="sticky top-0">
                                        <tr style={{ backgroundColor: PURPLE }}>
                                            <th className={th}>S.No</th>
                                            <th className={th}>Select</th>
                                            <th className={th}>Module Name</th>
                                            <th className={th}>Module Type</th>
                                            <th className={th}>Assigned</th>
                                            <th className={th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading && (
                                            <tr>
                                                <td
                                                    className={`${td} text-center text-[#8A94A6]`}
                                                    colSpan={6}
                                                >
                                                    Loading modules...
                                                </td>
                                            </tr>
                                        )}

                                        {!loading && modules.length === 0 && (
                                            <tr>
                                                <td
                                                    className={`${td} text-center text-[#8A94A6]`}
                                                    colSpan={6}
                                                >
                                                    No modules found for this language.
                                                </td>
                                            </tr>
                                        )}

                                        {!loading &&
                                            modules.map((m, index) => (
                                                <tr key={m.module_id} className="hover:bg-[#FAFBFD]">
                                                    <td className={td}>{index + 1}</td>
                                                    <td className={td}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selected.has(m.module_id)}
                                                            disabled={m.assigned}
                                                            onChange={() => toggleSelect(m.module_id)}
                                                        />
                                                    </td>
                                                    <td className={`${td} font-medium`}>
                                                        {m.module_name}
                                                    </td>
                                                    <td className={td}>
                                                        {m.module_type || "-"}
                                                    </td>
                                                    <td className={td}>
                                                        {m.assigned ? (
                                                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-medium text-emerald-700">
                                                                Assigned
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-[#FDECEA] px-3 py-1 text-[12px] font-medium text-[#D97706]">
                                                                Not Assigned
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className={td}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleAssign(m)}
                                                            disabled={busyIds.has(m.module_id)}
                                                            className={`rounded-[4px] border px-4 py-1.5 text-[13px] font-medium disabled:opacity-60 ${m.assigned
                                                                    ? "border-red-300 text-red-500 hover:bg-red-50"
                                                                    : "border-[#2DD4BF] text-[#0F766E] hover:bg-[#ECFDF5]"
                                                                }`}
                                                        >
                                                            {busyIds.has(m.module_id)
                                                                ? "..."
                                                                : m.assigned
                                                                    ? "Unassign"
                                                                    : "Assign"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table></div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleAssignSelected}
                                disabled={savingAll}
                                className="rounded-[4px] px-5 py-2.5 text-[14px] font-medium text-white disabled:opacity-60"
                                style={{ backgroundColor: PURPLE }}
                            >
                                {savingAll ? "Assigning..." : "Assign Selected Modules"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
