import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import Breadcrumbs from "@/shared/components/breadcrumbs/Breadcrumbs";
import { getUserById } from "@/features/users/services/UserService";
import { canManageRole } from "@/config/permissions";

/* ==================== STYLES ==================== */
const cardClass =
    "w-full overflow-hidden rounded-[10px] border border-[#D8E2EF] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:!shadow-[0_2px_10px_rgba(0,0,0,0.03)]";

const isValidValue = (value) => {
    const text = String(value ?? "").trim();

    return (
        text &&
        text.toLowerCase() !== "n/a" &&
        text !== "-"
    );
};

/* ==================== DETAIL ITEM ==================== */

const DetailItem = ({ label, value }) => {
    if (!isValidValue(value)) return null;

    return (
        <div className="min-w-0">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929BAA]">
                {label}
            </p>

            <p className="m-0 mt-[5px] break-words text-[14px] font-medium leading-[20px] text-[#344050]">
                {String(value).trim()}
            </p>
        </div>
    );
};

/* ==================== ASSIGNMENT ITEM ==================== */

const AssignmentItem = ({ label, value }) => {
    if (!isValidValue(value)) return null;

    return (
        <div className="flex min-h-[68px] items-center gap-[11px] rounded-[7px] border border-[#E8DDE7] bg-white px-[13px] py-[10px]">
            <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[6px] bg-[#F4EBF3] text-[12px] font-bold text-[#732269]">
                {label.charAt(0)}
            </span>

            <div className="min-w-0">
                <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#929BAA]">
                    {label}
                </p>

                <p className="m-0 mt-[3px] break-words text-[13px] font-semibold leading-[18px] text-[#344050]">
                    {String(value).trim()}
                </p>
            </div>
        </div>
    );
};

export default function UserView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const currentUserRole = localStorage.getItem("userRole");

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getUserById(id);
            setUser(response);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load user details"
            );

            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    /* ==================== LOADING ==================== */

    if (loading) {
        return (
            <AppLayout>
                <div className="px-[12px]">
                    <div className={`${cardClass} p-[24px]`}>
                        <div className="flex items-center gap-[12px]">
                            <span className="h-[42px] w-[42px] animate-pulse rounded-full bg-[#EEF1F5]" />

                            <div>
                                <span className="block h-[13px] w-[140px] animate-pulse rounded bg-[#EEF1F5]" />
                                <span className="mt-[8px] block h-[10px] w-[90px] animate-pulse rounded bg-[#F3F5F8]" />
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    /* ==================== ERROR ==================== */

    if (error || !user) {
        return (
            <AppLayout>
                <div className="px-[12px]">
                    <div className={`${cardClass} p-[24px]`}>
                        <div className="mb-[16px] rounded-[6px] border border-red-200 bg-red-50 px-[14px] py-[11px]">
                            <p className="m-0 text-[13px] text-[#E63757]">
                                {error || "User not found"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/users/userlist")
                            }
                            className={backBtnClass}
                        >
                            Back
                        </button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const breadcrumbItems = [
        { label: "Home", path: "/dashboard" },
        { label: "Users List", path: "/users/userlist" },
        { label: user.name || "User Details" },
    ];

    const canEdit = canManageRole(
        currentUserRole,
        user.role
    );

    const hasAssignment =
        isValidValue(user.state_name) ||
        isValidValue(user.district_name) ||
        isValidValue(user.block_name) ||
        isValidValue(user.centre_name);

    return (
        <AppLayout>
            <div className="px-[12px]">
                {/* ==================== HEADER ==================== */}

                <div className="mb-[18px] flex flex-col gap-[8px] md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="m-0 text-[20px] font-semibold leading-[26px] text-[#344050]">
                            User Details
                        </p>
                    </div>

                    <div className="flex-shrink-0">
                        <Breadcrumbs items={breadcrumbItems} />
                    </div>
                </div>

                {/* ==================== USER CARD ==================== */}

                <div className={cardClass}>
                    {/* PROFILE TOP */}

                    <div className="flex flex-col gap-[14px] border-b border-[#E8ECF2] px-[20px] py-[18px] sm:flex-row sm:items-center sm:justify-between md:px-[22px]">
                        <div className="flex min-w-0 items-center gap-[12px]">
                            <span className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full bg-[#F2E7F0] text-[17px] font-semibold text-[#732269]">
                                {(user.name || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                            </span>

                            <div className="min-w-0">
                                <p className="m-0 truncate text-[16px] font-semibold leading-[22px] text-[#344050]">
                                    {user.name || "User"}
                                </p>

                                <p className="m-0 mt-[2px] truncate text-[12px] leading-[17px] text-[#929BAA]">
                                    {user.email || "No username"}
                                </p>
                            </div>
                        </div>

                        <span className="inline-flex w-fit items-center rounded-full bg-[#F4EBF3] px-[11px] py-[5px] text-[11px] font-semibold text-[#732269]">
                            {user.role_name || user.role || "User"}
                        </span>
                    </div>

                    {/* ==================== INFORMATION ==================== */}

                    <div className="px-[20px] py-[20px] md:px-[22px]">
                        <div className="mb-[15px] flex items-center gap-[8px]">
                            <span className="h-[18px] w-[3px] rounded-full bg-[#732269]" />

                            <span className="text-[14px] font-semibold text-[#344050]">
                                Personal Information
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-x-[40px] gap-y-[18px] sm:grid-cols-2 lg:grid-cols-3">
                            <DetailItem
                                label="Name"
                                value={user.name}
                            />

                            <DetailItem
                                label="Username"
                                value={user.username}
                            />

                            <DetailItem
                                label="Email"
                                value={user.email}
                            />

                            <DetailItem
                                label="Role"
                                value={user.role_name}
                            />

                            <DetailItem
                                label="Responsibility"
                                value={user.responsibility}
                            />

                            {/* STATUS */}

                            <div>
                                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929BAA]">
                                    Status
                                </p>

                                <div className="mt-[6px]">
                                    <span
                                        className={`inline-flex items-center gap-[6px] rounded-full px-[10px] py-[5px] text-[11px] font-semibold ${String(user.status) === "1"
                                            ? "bg-[#E8F7F0] text-[#00864E]"
                                            : "bg-[#FDEBEC] text-[#E63757]"
                                            }`}
                                    >
                                        <span
                                            className={`h-[6px] w-[6px] rounded-full ${String(user.status) === "1"
                                                ? "bg-[#00864E]"
                                                : "bg-[#E63757]"
                                                }`}
                                        />

                                        {String(user.status) === "1"
                                            ? "Active"
                                            : "Not Active"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ==================== ASSIGNMENT ==================== */}

                    {hasAssignment && (
                        <div className="border-t border-[#E8ECF2] bg-[#FCFBFD] px-[20px] py-[20px] md:px-[22px]">
                            <div className="mb-[14px] flex items-center justify-between gap-[12px]">
                                <div className="flex items-center gap-[8px]">
                                    <span className="h-[18px] w-[3px] rounded-full bg-[#732269]" />

                                    <div>
                                        <p className="m-0 text-[14px] font-semibold text-[#344050]">
                                            Assigned Location
                                        </p>

                                        <p className="m-0 mt-[2px] text-[11px] text-[#929BAA]">
                                            User's assigned area
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-4">
                                <AssignmentItem
                                    label="State"
                                    value={user.state_name}
                                />

                                <AssignmentItem
                                    label="District"
                                    value={user.district_name}
                                />

                                <AssignmentItem
                                    label="Block"
                                    value={user.block_name}
                                />

                                <AssignmentItem
                                    label="Centre"
                                    value={user.centre_name}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}