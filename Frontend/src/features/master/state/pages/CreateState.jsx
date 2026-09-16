import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import AppLayout from "@/components/layout/AppLayout";
import StateForm from "@/features/master/state/components/Stateform";
import Breadcrumbs from "@/shared/components/breadcrumbs/Breadcrumbs";
import { createState } from "@/features/master/state/services/StateService";

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
                const payload = {
                    state_lgd_code: Number(data.state_lgd_code),
                    state_name: data.state_name.trim(),
                    status: data.status,
                };

                await createState(payload);

                toast.success("State created successfully!");
                navigate("/master/states");
            } catch (error) {
                const statusCode = error?.response?.status;
                const responseData = error?.response?.data;

                if (
                    (statusCode === 400 || statusCode === 422) &&
                    setError
                ) {
                    let hasFieldError = false;

                    if (
                        responseData &&
                        typeof responseData === "object" &&
                        !Array.isArray(responseData) &&
                        !Array.isArray(responseData.detail)
                    ) {
                        Object.entries(responseData).forEach(
                            ([fieldName, fieldError]) => {
                                if (fieldName === "detail") return;

                                const message = Array.isArray(fieldError)
                                    ? fieldError.join(" ")
                                    : String(fieldError);

                                setError(fieldName, {
                                    type: "server",
                                    message,
                                });

                                hasFieldError = true;
                            }
                        );
                    }

                    if (
                        Array.isArray(responseData?.detail)
                    ) {
                        responseData.detail.forEach((item) => {
                            const location = item?.loc;

                            if (!Array.isArray(location)) return;

                            const fieldName =
                                location[location.length - 1];

                            if (!fieldName) return;

                            setError(fieldName, {
                                type: "server",
                                message:
                                    item?.msg ||
                                    "Invalid value.",
                            });

                            hasFieldError = true;
                        });
                    }

                    if (hasFieldError) {
                        toast.error(
                            "Please correct the errors in the form."
                        );
                        return;
                    }

                    // Simple backend detail
                    const detail = responseData?.detail;

                    if (typeof detail === "string") {
                        toast.error(detail);
                        return;
                    }

                    toast.error(
                        "Please correct the errors in the form."
                    );
                    return;
                }

                // Generic error - check for likely duplicate LGD code error
                const errorMessage = (responseData?.detail ||
                                   error?.response?.data?.detail ||
                                   error?.message ||
                                   '').toString().toLowerCase();

                // Common indicators of duplicate/unique constraint errors
                const isLikelyDuplicate = errorMessage.includes('duplicate') ||
                                        errorMessage.includes('already exists') ||
                                        errorMessage.includes('unique') ||
                                        errorMessage.includes('lgd code') ||
                                        errorMessage.includes('state_lgd_code');

                if (isLikelyDuplicate) {
                    toast.error("State LGD Code already exists. Please use a different LGD Code.");
                } else {
                    toast.error("Unable to create state.");
                }
            } finally {
                setLoading(false);
            }
        },
        [navigate]
    );

    const handleCancel = useCallback(() => {
        navigate("/master/states");
    }, [navigate]);

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#EEF3F9]">
                <div className="px-2">
                    <div className="flex items-center justify-between">
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