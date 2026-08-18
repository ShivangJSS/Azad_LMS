import { useEffect, useState } from "react";

import AppLayout from "../../components/layout/AppLayout";

import DashboardFilter from "./components/DashboardFilter";
import StatsCards from "./components/DashboardStats";
import DashboardCharts from "./components/DashboardCharts";

import { getDashboardSummary } from "./services/DashboardService";

export default function Dashboard() {
    // Start in the loading state so the spinner shows immediately on mount
    // until the first dashboard payload arrives.
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [dashboardSummary, setDashboardSummary] = useState(null);

    const fetchDashboard = async (filterData = {}) => {
        try {
            setLoading(true);

            const response = await getDashboardSummary(filterData);

            setDashboardSummary(response);
        } catch (error) {
            console.error("Dashboard load error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard(filters);
    }, [filters]);

    return (
        <AppLayout>
            <main className="relative min-h-screen bg-[#EDF2F9]  ">

                {(loading || !dashboardSummary) && (
                    <div className="absolute inset-0 z-[1000] flex min-h-screen flex-col items-center justify-center gap-4 bg-[#EDF2F9]">
                        <span className="h-14 w-14 animate-spin rounded-full border-4 border-[#DBD3E2] border-t-[#6B2D5B]" />
                        <span className="text-[14px] font-semibold tracking-wide text-[#6B2D5B]">
                            Loading dashboard...
                        </span>
                    </div>
                )}

                {/* Filter */}
                <DashboardFilter
                    filters={filters}
                    setFilters={setFilters}
                />


                <div className="mt-4 ">
                    {/* Stats */}
                    <StatsCards
                        centres={
                            dashboardSummary?.summary?.total_centres ?? 0
                        }
                        trainees={
                            dashboardSummary?.summary?.total_participants ?? 0
                        }
                        modules={
                            dashboardSummary?.summary?.total_modules ?? 0
                        }
                        batches={
                            dashboardSummary?.summary?.total_batches ?? 0
                        }
                        documents={
                            dashboardSummary?.summary?.total_documents ?? 0
                        }
                    />
                </div>


                {/* Charts */}
                <DashboardCharts
                    data={dashboardSummary || {}}
                    loading={loading}
                    filters={filters}
                />

            </main>
        </AppLayout>
    );
}