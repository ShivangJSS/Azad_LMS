import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    FiX,
    FiCopy,
    FiRefreshCw,
    FiEye,
    FiEyeOff,
} from "react-icons/fi";

import {
    getParticipantKeyDetails,
    changeParticipantPassword,
} from "@/features/participant/services/ParticipantService";

const PURPLE = "#732269";

export default function CredentialsModal({
    participantId,
    participantName,
    onClose,
}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "";
        };
    }, []);

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

    const validatePasswords = () => {
        let valid = true;

        setPasswordError("");
        setConfirmPasswordError("");

        if (!newPassword) {
            setPasswordError("New password is required.");
            valid = false;
        } else if (newPassword !== newPassword.trim()) {
            setPasswordError(
                "Leading or trailing white space is not allowed."
            );
            valid = false;
        } else if (newPassword.length < 8) {
            setPasswordError(
                "Password must be at least 8 characters long."
            );
            valid = false;
        }

        if (!confirmPassword) {
            setConfirmPasswordError("Confirm password is required.");
            valid = false;
        } else if (newPassword !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match.");
            valid = false;
        }

        return valid;
    };

    const handleNewPasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);

        if (passwordError) {
            if (!value) {
                setPasswordError("New password is required.");
            } else if (value !== value.trim()) {
                setPasswordError(
                    "Leading or trailing white space is not allowed."
                );
            } else if (value.length < 8) {
                setPasswordError(
                    "Password must be at least 8 characters long."
                );
            } else {
                setPasswordError("");
            }
        }

        if (confirmPassword && confirmPasswordError) {
            setConfirmPasswordError(
                value !== confirmPassword ? "Passwords do not match." : ""
            );
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);

        if (!value) {
            setConfirmPasswordError("Confirm password is required.");
        } else if (newPassword !== value) {
            setConfirmPasswordError("Passwords do not match.");
        } else {
            setConfirmPasswordError("");
        }
    };

    const handleChangePassword = async () => {
        if (!validatePasswords()) {
            return;
        }

        try {
            setChangingPassword(true);

            const response = await changeParticipantPassword(
                participantId,
                newPassword,
                confirmPassword
            );

            toast.success(
                response?.message ||
                "Participant password changed successfully."
            );

            setNewPassword("");
            setConfirmPassword("");
            setPasswordError("");
            setConfirmPasswordError("");
            setShowNewPassword(false);
            setShowConfirmPassword(false);
            setShowChangePassword(false);
        } catch (error) {
            const message =
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                "Failed to change password.";

            toast.error(message);
        } finally {
            setChangingPassword(false);
        }
    };

    const field = (label, value, canCopy) => (
        <div className="mb-3">
            <label className="mb-1.5 block text-[14px] font-medium text-[#344050]">
                {label}
            </label>

            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={value}
                    readOnly
                    className="h-10 w-full rounded-[5px] border border-[#D8E2EF] bg-[#F8F9FB] px-3 text-[14px] text-[#344050] outline-none"
                />

                <button
                    type="button"
                    disabled={!canCopy}
                    onClick={() => copy(value, label)}
                    aria-label={`Copy ${label}`}
                    className="flex h-10 w-11 flex-shrink-0 items-center justify-center rounded-[5px] border border-[#D8E2EF] text-[#65758B] transition hover:bg-[#F4F6FA] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <FiCopy size={16} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
            <div className="w-full max-w-[585px] overflow-hidden rounded-[10px] bg-white shadow-2xl">

                {/* Header */}
                <div
                    className="flex items-center justify-between px-7 py-3"
                    style={{ backgroundColor: PURPLE }}
                >
                    <span className="text-[21px] font-semibold text-white">
                        Credentials{name ? ` — ${name}` : ""}
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/15"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-4 py-4">
                    {loading ? (
                        <div className="py-6 text-[14px] text-[#5E6E82]">
                            Loading...
                        </div>
                    ) : (
                        <>
                            {field("Username", username, true)}
                            {field("Password", password, false)}

                            {!showChangePassword ? (
                                <div className="mt-2 flex items-center justify-between gap-5">
                                    <p className="max-w-[300px] text-[12px] leading-5 text-[#8A94A6]">
                                        Password is encrypted and cannot be
                                        shown. Click Reset to generate a new
                                        one.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowChangePassword(true);
                                            setPasswordError("");
                                            setConfirmPasswordError("");
                                        }}
                                        className="flex flex-shrink-0 items-center gap-2 rounded-[5px] border border-[#732269] px-4 py-2.5 text-[13px] font-medium text-[#732269] transition hover:bg-[#F7F0F6]"
                                    >
                                        <FiRefreshCw size={18} />
                                        Reset Password
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-6 rounded-[7px] border border-[#E7DCE6] bg-[#FCFAFC] p-5">

                                    {/* Change Password Header */}
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-[15px] font-semibold text-[#344050]">
                                            Change Password
                                        </h3>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowChangePassword(false);
                                                setNewPassword("");
                                                setConfirmPassword("");
                                                setPasswordError("");
                                                setConfirmPasswordError("");
                                            }}
                                            aria-label="Cancel"
                                            title="Cancel"
                                            className="flex h-7 w-7 items-center justify-center rounded-full text-[#8A94A6] transition hover:bg-[#F7F0F6] hover:text-[#732269]"
                                        >
                                            <FiX size={17} />
                                        </button>
                                    </div>

                                    {/* New Password */}
                                    <div className="mb-3">
                                        <label className="mb-1.5 block text-[14px] font-medium text-[#344050]">
                                            New Password
                                        </label>

                                        <div className="relative">
                                            <input
                                                type={
                                                    showNewPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={newPassword}
                                                onChange={
                                                    handleNewPasswordChange
                                                }
                                                placeholder="Enter new password"
                                                autoComplete="new-password"
                                                className={`h-10 w-full rounded-[5px] border bg-white px-3 pr-10 text-[14px] text-[#344050] outline-none transition ${passwordError
                                                        ? "border-red-400 focus:border-red-500"
                                                        : "border-[#D8E2EF] focus:border-[#732269]"
                                                    }`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        (prev) => !prev
                                                    )
                                                }
                                                aria-label={
                                                    showNewPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65758B] hover:text-[#732269]"
                                            >
                                                {showNewPassword ? (
                                                    <FiEyeOff size={17} />
                                                ) : (
                                                    <FiEye size={17} />
                                                )}
                                            </button>
                                        </div>

                                        {passwordError && (
                                            <p className="mt-1.5 text-[12px] text-red-500">
                                                {passwordError}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="mb-3">
                                        <label className="mb-1.5 block text-[14px] font-medium text-[#344050]">
                                            Confirm Password
                                        </label>

                                        <div className="relative">
                                            <input
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={confirmPassword}
                                                onChange={
                                                    handleConfirmPasswordChange
                                                }
                                                placeholder="Confirm new password"
                                                autoComplete="new-password"
                                                className={`h-10 w-full rounded-[5px] border bg-white px-3 pr-10 text-[14px] text-[#344050] outline-none transition ${confirmPasswordError
                                                        ? "border-red-400 focus:border-red-500"
                                                        : "border-[#D8E2EF] focus:border-[#732269]"
                                                    }`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (prev) => !prev
                                                    )
                                                }
                                                aria-label={
                                                    showConfirmPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65758B] hover:text-[#732269]"
                                            >
                                                {showConfirmPassword ? (
                                                    <FiEyeOff size={17} />
                                                ) : (
                                                    <FiEye size={17} />
                                                )}
                                            </button>
                                        </div>

                                        {confirmPasswordError && (
                                            <p className="mt-1.5 text-[12px] text-red-500">
                                                {confirmPasswordError}
                                            </p>
                                        )}
                                    </div>

                                    <p className="mb-3 text-[12px] text-[#8A94A6] ">
                                        Password must be at least 8 characters
                                        long.
                                    </p>

                                    <button
                                        type="button"
                                        disabled={changingPassword}
                                        onClick={handleChangePassword}
                                        className="w-full rounded-[5px] bg-[#732269] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#641D5B] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {changingPassword
                                            ? "Changing Password..."
                                            : "Change Password"}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}