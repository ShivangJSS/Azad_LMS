import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import AppLayout from "../../../components/layout/AppLayout";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";
import AddTraineeForm from "../components/AddTraineeForm";
import { getParticipantEdit } from "../services/ParticipantService";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Trainees", path: "/participants/list" },
    { label: "Edit Trainee" },
];

export default function ParticipantEdit() {
    const { id } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        (async () => {
            setLoading(true);
            setError("");
            try {
                const res = await getParticipantEdit(id);
                setData(res);
            } catch (err) {
                setError(
                    err?.response?.data?.detail || "Unable to load trainee details."
                );
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#eef3f9]">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-lg font-semibold text-[#1a1e22]">
                        Edit Trainee
                    </span>
                    <Breadcrumbs items={breadcrumbItems} />
                </div>

                <div className="rounded-md border bg-white shadow-sm">
                    {loading && (
                        <div className="p-6 text-sm text-[#5E6E82]">Loading...</div>
                    )}
                    {!loading && error && (
                        <div className="p-6 text-sm text-red-500">{error}</div>
                    )}
                    {!loading && !error && data && (
                        <AddTraineeForm
                            mode="edit"
                            initialData={data}
                            participantId={id}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
