import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import StateForm from "../components/StateForm";

import {
    getStateById,
    updateState,
} from "../services/StateService";

export default function EditState() {
    const { state_lgd_code } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState(null);

    const STATE_LIST_URL = "/master/states";

    const breadcrumbItems = [
        { label: "Home", path: "/dashboard" },
        { label: "State Masters", path: STATE_LIST_URL },
        { label: "Edit State" },
    ];

    useEffect(() => {
        const fetchState = async () => {
            if (!state_lgd_code) return;
            try {
                setLoading(true);

                const response = await getStateById(state_lgd_code);

                setInitialData({
                    state_lgd_code: response.state_lgd_code,
                    state_name: response.state_name,
                    status: String(response.status),
                });
            } catch (error) {
                toast.error("Failed to load state.");
                navigate(STATE_LIST_URL);
            } finally {
                setLoading(false);
            }
        };

        fetchState();
    }, [state_lgd_code, navigate]);

    const handleUpdate = useCallback(
        async (data, setError) => {
            try {
                setLoading(true);

                const payload = {
                    state_name: data.state_name.trim(),
                    status: data.status,
                };

                await updateState(state_lgd_code, payload);

                toast.success("State updated successfully.");

                navigate(STATE_LIST_URL);
            } catch (error) {
                const responseData = error?.response?.data;

                if (error.response?.status === 400 && typeof responseData === 'object' && setError) {
                    Object.keys(responseData).forEach((fieldName) => {
                        setError(fieldName, {
                            type: "server",
                            message: Array.isArray(responseData[fieldName])
                                ? responseData[fieldName].join(" ")
                                : responseData[fieldName],
                        });
                    });
                    toast.error("Please correct the errors in the form.");
                } else {
                    const detail = responseData?.detail;
                    toast.error(typeof detail === "string" ? detail : "Update failed.");
                }
            } finally {
                setLoading(false);
            }
        },
        [state_lgd_code, navigate]
    );

    const handleCancel = useCallback(() => navigate(STATE_LIST_URL), [navigate]);

    if (loading && !initialData) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#EEF3F9]">
                <div className="px-2 py-2">

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[24px] font-semibold text-[#43324a]">
                            Edit State
                        </span>

                        <Breadcrumbs items={breadcrumbItems} />
                    </div>

                    <StateForm
                        mode="edit"
                        defaultValues={initialData}
                        loading={loading}
                        onSubmit={handleUpdate}
                        onCancel={handleCancel}
                    />
                </div>
            </div>
        </AppLayout>
    );
}