import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import DistrictForm from "../components/DistrictForm";

import { getDistrict, updateDistrict } from "../services/DistrictService";
import { getAllStates } from "../../state/services/StateService";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "District Masters", path: "/master/districts" },
    { label: "Edit District" },
];

export default function EditDistrict() {
    const { code } = useParams();
    const navigate = useNavigate();

    const [district, setDistrict] = useState(null);
    const [states, setStates] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);

    /* ==============================
       FETCH STATES
    ============================== */

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await getAllStates();
                const payload = response?.data ?? response ?? [];

                setStates(Array.isArray(payload) ? payload : (payload.data ?? []));
            } catch (error) {
                console.error("State API Error:", error?.response?.data ?? error);
                setStates([]);
            }
        };

        fetchStates();
    }, []);

    /* ==============================
       FETCH DISTRICT
    ============================== */

    const fetchDistrict = useCallback(async () => {
        setFetching(true);

        try {
            const response = await getDistrict(code);
            setDistrict(response?.data ?? response);
        } catch (error) {
            console.error("Fetch failed:", error?.response?.data ?? error);
            toast.error("Unable to load district.");
            navigate("/master/districts");
        } finally {
            setFetching(false);
        }
    }, [code, navigate]);

    useEffect(() => {
        fetchDistrict();
    }, [fetchDistrict]);

    /* ==============================
       UPDATE
    ============================== */

    const handleUpdate = useCallback(
        async (data) => {
            setLoading(true);

            try {
                await updateDistrict(code, {
                    district_name: data.district_name.trim(),
                    state_lgd_code: Number(data.state_lgd_code),
                    status: data.status,
                });

                toast.success("District updated successfully.");
                navigate("/master/districts");
            } catch (error) {
                console.error("Update failed:", error?.response?.data);

                const detail = error?.response?.data?.detail;
                toast.error(
                    typeof detail === "string"
                        ? detail
                        : "Unable to update district.",
                );
            } finally {
                setLoading(false);
            }
        },
        [code, navigate],
    );

    const handleCancel = useCallback(
        () => navigate("/master/districts"),
        [navigate],
    );

    return (
        <AppLayout>
            <div className="mb-[16px] flex w-full items-center justify-between px-3">
                <div className="text-[20px] font-medium text-[#344050]">
                    District Masters
                </div>

                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="px-3">
                {fetching ? (
                    <div className="w-full rounded-[8px] border border-[#D8E2EF] bg-white p-[24px] text-[14px] text-[#5E6E82]">
                        Loading...
                    </div>
                ) : (
                    <DistrictForm
                        mode="edit"
                        defaultValues={district}
                        states={states}
                        loading={loading}
                        onSubmit={handleUpdate}
                        onCancel={handleCancel}
                    />
                )}
            </div>
        </AppLayout>
    );
}