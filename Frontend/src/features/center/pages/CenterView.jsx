import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../../components/layout/AppLayout";
import { getCentreById } from "../services/centerService";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";


/* ============ CLASSES ============ */

const cardClass = "w-full bg-white p-[20px] rounded-[8px] border border-[#D8E2EF] shadow-sm";

const gridClass = "grid grid-cols-1 md:grid-cols-2 border border-[#D8E2EF] rounded-[6px]";

const colLeftClass = "p-[10px] md:border-r border-[#D8E2EF]";

const colRightClass = "p-[10px] border-t md:border-t-0 border-[#D8E2EF]";

const rowClass = "text-[15px]  last:mb-0";

const labelClass = "font-semibold text-[#344050]";

const valueClass = "text-[#5E6E82]";
const backBtnClass = "h-[38px] px-[30px] rounded-sm text-[15px] font-medium text-[#344050] bg-white border border-[#050505]  cursor-pointer hover:bg-gray-50 !no-underline hover:!no-underline";

const editBtnClass = "inline-flex items-center h-[42px] px-[24px] rounded-sm text-[15px] font-medium !text-white bg-[#732269] border border-[#732269] hover:opacity-90 !no-underline hover:!no-underline focus:!no-underline";

const crumbClass = "text-[15px] text-[#7b216f] no-underline hover:underline";


/* ============ HELPERS ============ */

const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d)) return "-";
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const Row = ({ label, value }) => (
    <p className={rowClass}><span className={labelClass}>{label}: </span><span className={valueClass}>{value || "-"}</span></p>
);


export default function CenterView() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [centre, setCentre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => { fetchCentre(); }, [id]);

    const fetchCentre = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await getCentreById(id);
            setCentre(res.data);
        } catch (err) {
            console.error("Centre Detail Error:", err);
            setError(err.response?.data?.detail || "Unable to load centre details");
            setCentre(null);
        } finally {
            setLoading(false);
        }
    };
    

    /* ============ LOADING / ERROR ============ */

    if (loading) {
        return (
            <AppLayout>
                <div className={cardClass}>
                    <p className="text-[15px] text-[#5E6E82] m-0">Loading centre details...</p>
                </div>
            </AppLayout>
        );
    }

    if (error || !centre) {
        return (
            <AppLayout>
                <div className={cardClass}>
                    <p className="text-[15px] text-[#E63757] m-0 mb-[16px]">{error || "Centre not found"}</p>
                    <button type="button" onClick={() => navigate("/centres")} className={backBtnClass}>Back</button>
                </div>
            </AppLayout>
        );
    }

    const breadcrumbItems = [
        { label: "Home", path: "/dashboard" },
        { label: "Centre Masters", path: "/centres/list" },
        { label: centre.centre_name || "Centre Details" },
    ];

    return (

        <AppLayout>

            {/* ============ PAGE HEADER ============ */}
            <div className="w-full flex items-center justify-between mb-[20px] px-3">

                <div className="text-[20px]  font-medium text-[#344050] font-[Poppins]">
                    <div className="center.centre_name">{centre.centre_name}</div>
                </div>

                <Breadcrumbs items={breadcrumbItems} />

            </div>


            {/* ============ DETAIL CARD ============ */}

            <div className={cardClass}>

                <div className={gridClass}>

                    <div className={colLeftClass}>
                        <Row label="Centre Name" value={centre.centre_name} />
                        <Row label="Phone Number" value={centre.phone_number} />
                        <Row label="Email" value={centre.email} />
                        <Row label="PIN Code" value={centre.pin} />

                        <p className={rowClass}>
                            <span className={labelClass}>Status: </span>
                            <span className={`inline-block px-[10px] py-[3px] rounded-[4px] text-[12px] font-bold !text-white ${Number(centre.status) === 1 ? "bg-[#00864E]" : "bg-[#E63757]"}`}>
                                {Number(centre.status) === 1 ? "Active" : "Not Active"}
                            </span>
                        </p>

                        <Row label="Created At" value={formatDate(centre.created_at)} />
                    </div>

                    <div className={colRightClass}>
                        <Row label="State" value={centre.state_name} />
                        <Row label="District" value={centre.district_name} />
                        <Row label="Block" value={centre.block_name} />
                        <Row label="Location" value={centre.location} />
                        <Row label="Latitude" value={centre.latitude} />
                        <Row label="Longitude" value={centre.longitude} />
                        <Row label="Address" value={centre.address} />
                    </div>

                </div>

            </div>


            {/* ============ BUTTONS ============ */}

            <div className="flex items-center gap-[12px] mt-[20px]">

                <button type="button" onClick={() => navigate("/centres/list")} className={backBtnClass}>Back</button>

                <Link to={`/centres/edit/${centre.centre_id}`} className={editBtnClass}>Edit Centre</Link>

            </div>

        </AppLayout>

    );
}