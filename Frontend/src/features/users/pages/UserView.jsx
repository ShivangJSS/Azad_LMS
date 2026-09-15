import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import Breadcrumbs from "@/shared/components/breadcrumbs/Breadcrumbs";
import { getUserById } from "@/features/users/services/UserService";
import { canManageRole } from "@/config/permissions";

/* ============ CLASSES ============ */

const cardClass = "w-full bg-white p-[20px] rounded-[8px] border border-[#D8E2EF] shadow-sm";

const gridClass = "grid grid-cols-1 md:grid-cols-2 border border-[#D8E2EF] rounded-[6px]";

const colLeftClass = "p-[10px] md:border-r border-[#D8E2EF]";

const colRightClass = "p-[10px] border-t md:border-t-0 border-[#D8E2EF]";

const rowClass = "text-[15px] last:mb-0";

const labelClass = "font-semibold text-[#344050]";

const valueClass = "text-[#5E6E82]";

const backBtnClass = "h-[38px] px-[30px] rounded-sm text-[15px] font-medium text-[#344050] bg-white border border-[#050505] cursor-pointer hover:bg-gray-50 !no-underline hover:!no-underline";

const editBtnClass = "inline-flex items-center h-[42px] px-[24px] rounded-sm text-[15px] font-medium !text-white bg-[#732269] border border-[#732269] hover:opacity-90 !no-underline hover:!no-underline focus:!no-underline";

const Row = ({ label, value }) => (
    <p className={rowClass}><span className={labelClass}>{label}: </span><span className={valueClass}>{value || "-"}</span></p>
);

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
            setError(err.response?.data?.detail || "Unable to load user details");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    /* ============ LOADING / ERROR ============ */

    if (loading) {
        return (
            <AppLayout>
                <div className={cardClass}>
                    <p className="text-[15px] text-[#5E6E82] m-0">Loading user details...</p>
                </div>
            </AppLayout>
        );
    }

    if (error || !user) {
        return (
            <AppLayout>
                <div className={cardClass}>
                    <p className="text-[15px] text-[#E63757] m-0 mb-[16px]">{error || "User not found"}</p>
                    <button type="button" onClick={() => navigate("/users/userlist")} className={backBtnClass}>Back</button>
                </div>
            </AppLayout>
        );
    }

    const breadcrumbItems = [
        { label: "Home", path: "/dashboard" },
        { label: "Users List", path: "/users/userlist" },
        { label: user.name || "User Details" },
    ];

    const canEdit = canManageRole(currentUserRole, user.role);

    return (
        <AppLayout>

            {/* ============ PAGE HEADER ============ */}
            <div className="w-full flex items-center justify-between mb-[20px] px-3">

                <div className="text-[20px] font-medium text-[#344050] font-[Poppins]">
                    {user.name}
                </div>

                <Breadcrumbs items={breadcrumbItems} />

            </div>

            {/* ============ DETAIL CARD ============ */}

            <div className={cardClass}>

                <div className={gridClass}>

                    <div className={colLeftClass}>
                        <Row label="Name" value={user.name} />
                        <Row label="Username" value={user.username} />
                        <Row label="Email" value={user.email} />
                        <Row label="Role" value={user.role_name} />
                        <Row label="Responsibility" value={user.responsibility} />

                        <p className={rowClass}>
                            <span className={labelClass}>Status: </span>
                            <span className={`inline-block px-[10px] py-[3px] rounded-[4px] text-[12px] font-bold !text-white ${String(user.status) === "1" ? "bg-[#00864E]" : "bg-[#E63757]"}`}>
                                {String(user.status) === "1" ? "Active" : "Not Active"}
                            </span>
                        </p>
                    </div>

                    <div className={colRightClass}>
                        <Row label="State" value={user.state_name} />
                        <Row label="District" value={user.district_name} />
                        <Row label="Block" value={user.block_name} />
                        <Row label="Centre" value={user.centre_name} />
                    </div>

                </div>

            </div>

            {/* ============ BUTTONS ============ */}

            <div className="flex items-center gap-[12px] mt-[20px]">

                <button type="button" onClick={() => navigate("/users/userlist")} className={backBtnClass}>Back</button>

                {canEdit && (
                    <Link to={`/users/edit/${user.id}`} className={editBtnClass}>Edit User</Link>
                )}

            </div>

        </AppLayout>
    );
}
