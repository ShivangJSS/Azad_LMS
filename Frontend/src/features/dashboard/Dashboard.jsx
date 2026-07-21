import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import DashboardFilter from "./components/DashboardFilter";
import StatsCards from "./components/StatsCards";
import DashboardCharts from "./components/DashboardCharts";
import RecentActivityTable from "./components/RecentActivityTable";

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"));
    return (
        <AppLayout>
            <div className="space-y-2 mb-4">
                <h3 className="text-2xl font-bold">Welcome {user?.name}</h3>
                <p className="text-gray-600">Email: {user?.email}</p>
                <p className="text-gray-600">Role: {user?.role}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div><DashboardFilter /></div>
                <div><StatsCards /></div>
                <div><DashboardCharts /></div>
                <div><RecentActivityTable /></div>
            </div>
        </AppLayout>
    );
}