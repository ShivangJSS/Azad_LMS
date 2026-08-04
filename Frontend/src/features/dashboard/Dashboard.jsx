import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import DashboardFilter from "./components/DashboardFilter";
import StatsCards from "./components/DashboardStats";
import DashboardCharts from "./components/DashboardCharts";
import RecentActivityTable from "./components/RecentActivityTable";
import { useEffect, useState } from "react";
import { getDashboardSummary } from "./services/DashboardService";

export default function Dashboard() {
    const [dashboardSummary, setDashboardSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});

    const fetchDashboard = async (filters = {}) => {
        try {
            setLoading(true);

            console.log("Fetching dashboard...");

            const response = await getDashboardSummary(filters);

            console.log(response);

            setDashboardSummary(response);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchDashboard();
    }, [filters]);


    const user = JSON.parse(localStorage.getItem("user"));
    return (
        <AppLayout>
            <main className="container-container-container-fluid min-h-screen bg-[#edf2f9] ">
                <div className="w-full bg-white rounded-md">
                    <DashboardFilter />
                    {/* <DashboardCharts /> */}
                    <StatsCards
                        centres={dashboardSummary?.summary?.total_centres}
                        trainees={dashboardSummary?.summary?.total_participants}
                        modules={dashboardSummary?.summary?.total_modules}
                        batches={dashboardSummary?.summary?.total_batches}
                        documents={dashboardSummary?.summary?.total_documents} />
                    {/* <RecentActivityTable /> */}
                </div>
            </main>
        </AppLayout>
    );
}



