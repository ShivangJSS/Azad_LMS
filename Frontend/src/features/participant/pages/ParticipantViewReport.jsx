import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";


import AppLayout from "@/components/layout/AppLayout";
import ParticipantInfoCard from "@/features/participant/components/ParticipantInfoCard";
import AssessmentSummary from "@/features/participant/components/AssessmentSummary";
import ModuleAccordion from "@/features/participant/components/ModuleAccordion";
import { getParticipantReport } from "@/features/participant/services/ParticipantService";
import { deriveOverallStats } from "@/features/participant/utils/assessmentStats";
import Breadcrumbs from "@/shared/components/breadcrumbs/Breadcrumbs";

export default function ParticipantViewReport() {
    const { id } = useParams();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {   
        if (!id) return;

        let isMounted = true; // Cleanup flag to prevent state updates on unmounted component

        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getParticipantReport(id);
                if (isMounted) {
                    setReport(data);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Report load error:", err?.response?.data ?? err);
                    setError(
                        err?.response?.data?.detail ||
                        "Unable to load the trainee report."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            isMounted = false; // Cleanup
        };
    }, [id]);

    const participant = useMemo(() => {
        return (
            report?.participant ||
            report?.participant_profile ||
            report?.data?.participant ||
            null
        );
    }, [report]);

    const summary = report?.assessment_summary;
    const modules = useMemo(() => summary?.module_results || [], [summary]);

    // Recount attempted/correct/wrong straight from per-question lists
    const overallStats = useMemo(() => deriveOverallStats(modules), [modules]);

    const reportSummary = useMemo(() => {
        if (!summary) return null;
        return {
            ...summary,
            completed_questions: overallStats.completed,
            correct: overallStats.correct,
            wrong: overallStats.wrong,
        };
    }, [summary, overallStats]);

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

                    <AssessmentSummary summary={reportSummary} />

                    {modules.length === 0 && (
                        <div className="rounded-md border border-[#D8E2EF] bg-white p-6 text-sm text-[#5E6E82]">
                            No assessment attempted for this module yet.
                        </div>
                    )}

                    {modules.map((module, i) => (
                        <ModuleAccordion
                            key={module.module_id ?? i}
                            module={module}
                        />
                    ))}
                </div>
            )}  
        </AppLayout>
    );
}