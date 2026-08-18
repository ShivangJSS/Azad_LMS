import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import StateForm from "../components/StateForm";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import { createState } from "../services/StateService";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "State Masters", path: "/master/states" },
    { label: "Add State" },
];

export default function CreateState() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleCreate = useCallback(
        async (data, setError) => {
            setLoading(true);

            try {
                await createState({
                    state_lgd_code: Number(data.state_lgd_code),
                    state_name: data.state_name.trim(),
                    status: data.status,
                });

                navigate("/statesList");
                toast.success("State created successfully!");
            } catch (error) {
                const responseData = error?.response?.data;

                // Check for field-specific validation errors from the API
                if (error.response?.status === 400 && typeof responseData === 'object' && setError) {
                    Object.keys(responseData).forEach((fieldName) => {
                        setError(fieldName, {
                            type: "server",
                            // API might return an array of errors, so we join them.
                            message: Array.isArray(responseData[fieldName])
                                ? responseData[fieldName].join(" ")
                                : responseData[fieldName],
                        });
                    });
                    toast.error("Please correct the errors in the form.");
                } else {
                    // Fallback for generic errors (e.g., server down)
                    const detail = responseData?.detail;
                    toast.error(
                        typeof detail === "string" ? detail : "Unable to create state."
                    );
                }
            } finally {
                setLoading(false);
            }
        },
        [navigate]
    );

    const handleCancel = useCallback(() => navigate("/master/states"), [navigate]);

    return (
        <AppLayout>
            <div className="bg-[#EEF3F9] min-h-screen">

                <div className="px-2">

                    <div className="flex items-center justify-between ">

                        <span className="text-[20px] font-medium text-[#344050]">
                            State Masters
                        </span>

                        <Breadcrumbs items={breadcrumbItems} />

                    </div>

                    <StateForm
                        mode="create"
                        loading={loading}
                        onSubmit={handleCreate}
                        onCancel={handleCancel}
                    />

                </div>

            </div>
        </AppLayout>
    );
}