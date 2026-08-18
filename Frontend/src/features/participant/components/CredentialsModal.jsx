import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiX, FiCopy, FiRefreshCw } from "react-icons/fi";

import { getParticipantKeyDetails } from "../services/ParticipantService";

const PURPLE = "#732269";

export default function CredentialsModal({ participantId, participantName, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!participantId) return;
        (async () => {
            setLoading(true);
            try {
                const res = await getParticipantKeyDetails(participantId);
                setData(res?.data ?? res ?? null);
            } catch (error) {
                setData(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [participantId]);

    const name = participantName || "";
    const username = data?.username || "";
    const password = data?.password ?? "-";

    const copy = async (value, label) => {
        try {
            await navigator.clipboard.writeText(value ?? "");
            toast.success(`${label} copied.`);
        } catch (error) {
            toast.error("Could not copy.");
        }
    };

    const field = (label, value, canCopy) => (
        <div className="mb-4">
            <label className="mb-1 block text-[14px] font-medium text-[#344050]">
                {label}
            </label>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={value}
                    readOnly
                    className="h-10 w-full rounded-[4px] border border-[#D8E2EF] bg-[#F8F9FB] px-3 text-[14px] text-[#344050] outline-none"
                />
                <button
                    type="button"
                    disabled={!canCopy}
                    onClick={() => copy(value, label)}
                    aria-label={`Copy ${label}`}
                    className="flex h-10 w-11 flex-shrink-0 items-center justify-center rounded-[4px] border border-[#D8E2EF] text-[#5E6E82] hover:bg-[#F4F6FA] disabled:opacity-50"
                >
                    <FiCopy size={16} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
            <div className="w-full max-w-lg overflow-hidden rounded-[10px] bg-white shadow-2xl">
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ backgroundColor: PURPLE }}
                >
                    <h2 className="text-[20px] font-semibold text-white">
                        Credentials{name ? ` — ${name}` : ""}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/20"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {loading ? (
                        <div className="py-6 text-[14px] text-[#5E6E82]">Loading...</div>
                    ) : (
                        <>
                            {field("Username", username, true)}
                            {field("Password", password, false)}

                            <div className="mt-1 flex items-start justify-between gap-3">
                                <p className="text-[12px] text-[#8A94A6]">
                                    Password is encrypted and cannot be shown. Click
                                    Reset to generate a new one.
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        toast("Password reset is not available yet.")
                                    }
                                    className="flex flex-shrink-0 items-center gap-2 rounded-[4px] border border-[#732269] px-3 py-2 text-[13px] font-medium text-[#732269] hover:bg-[#F7F0F6]"
                                >
                                    <FiRefreshCw size={14} />
                                    Reset Password
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-[#EDF0F5] px-6 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-[4px] border border-[#732269] px-5 py-2 text-[13px] font-medium text-[#732269] hover:bg-[#F7F0F6]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
