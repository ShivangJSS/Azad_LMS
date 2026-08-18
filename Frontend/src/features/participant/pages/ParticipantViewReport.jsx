import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import AppLayout from "../../../components/layout/AppLayout";
import ParticipantInfoCard from "../components/ParticipantInfoCard";
import AssessmentSummary from "../components/AssessmentSummary";
import ModuleAccordion from "../components/ModuleAccordion";
import { getParticipantReport } from "../services/ParticipantService";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";


export default function ParticipantViewReport() {
    const { id } = useParams();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getParticipantReport(id);
                setReport(data);
            } catch (err) {
                console.error("Report load error:", err?.response?.data ?? err);
                setError(
                    err?.response?.data?.detail ||
                    "Unable to load the trainee report."
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const participant =
        report?.participant ||
        report?.participant_profile ||
        report?.data?.participant ||
        null;
    const summary = report?.assessment_summary;
    const modules = summary?.module_results || [];

    return (
        <AppLayout>
            {/* Header + breadcrumb */}
            <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-semibold text-[#1a1e22]">
                    Trainees Report View
                </span>
                <Breadcrumbs
                    items={[
                        { label: "Home", path: "/dashboard" },
                        { label: "Trainees List", path: "/participants/list" },
                        { label: "Trainees Report View" },
                    ]}
                />
            </div>

            {loading && (
                <div className="rounded-md border border-[#D8E2EF] bg-white p-6 text-sm text-[#5E6E82]">
                    Loading report...
                </div>
            )}

            {!loading && error && (
                <div className="rounded-md border border-[#F5C2C7] bg-[#FDECEA] p-4 text-sm text-[#D74D43]">
                    {error}
                </div>
            )}

            {!loading && !error && report && (
                <div className="flex flex-col gap-4">
                    <ParticipantInfoCard participant={participant} />

                    <AssessmentSummary summary={summary} />

                    {modules.length === 0 && (
                        <div className="rounded-md border border-[#D8E2EF] bg-white p-6 text-sm text-[#5E6E82]">
                            No assessment data available for this trainee yet.
                        </div>
                    )}

                    {modules.map((module) => (
                        <ModuleAccordion key={module.module_id} module={module} />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
