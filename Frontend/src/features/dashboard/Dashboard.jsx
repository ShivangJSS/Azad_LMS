import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

import AppLayout from "@/components/layout/AppLayout";

import DashboardFilter from "./components/DashboardFilter";
import DashboardPageHeader from "./components/DashboardPageHeader";
import StatsCards from "./components/DashboardStats";
import {
    ChartsGridSkeleton,
    DashboardLoader,
    UpdatingPill,
} from "./components/DashboardSkeletons";
import { PAGE_BG } from "./hook/dashboardTheme";
import { downloadDashboardReport } from "./services/dashboardReportExport";

const loadDashboardCharts = () => import("./components/DashboardCharts");
const DashboardCharts = lazy(loadDashboardCharts);
// Start fetching the charts chunk while the summary API call is in flight.
loadDashboardCharts();

import { getDashboardSummary } from "./services/DashboardService";

export default function Dashboard() {
    // Start in the loading state so the skeleton shows immediately on mount
    // until the first dashboard payload arrives.
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [dashboardSummary, setDashboardSummary] = useState(null);
    const [error, setError] = useState(null);
    // Bumped by "Try again" to re-run the same request.
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        let isCurrentRequest = true;

        const fetchDashboard = async () => {
            try {
                setLoading(true);

                const response = await getDashboardSummary(filters);

                if (isCurrentRequest) {
                    setDashboardSummary(response);
                    setError(null);
                }
            } catch (err) {
                console.error("Dashboard load error:", err);

                if (isCurrentRequest) {
                    setError(
                        err?.response?.data?.detail ||
                        err?.message ||
                        "We couldn't load the dashboard data."
                    );
                }
            } finally {
                if (isCurrentRequest) {
                    setLoading(false);
                }
            }
        };

        fetchDashboard();

        return () => {
            isCurrentRequest = false;
        };
    }, [filters, reloadToken]);

    const retry = useCallback(() => setReloadToken((n) => n + 1), []);

    const handleExport = useCallback(() => {
        if (!dashboardSummary) return;
        downloadDashboardReport(dashboardSummary, filters);
    }, [dashboardSummary, filters]);

    const firstLoad = !dashboardSummary && loading;
    const failedWithNoData = !dashboardSummary && !loading && error;

    return (
        <AppLayout>
            <main
                className="relative min-h-screen overflow-hidden"
                style={{ backgroundColor: PAGE_BG }}
            >
                {/* Soft brand-tinted wash. Purely decorative — it gives the
                    frosted chart panels something to refract instead of a
                    flat fill. */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                    <span className="absolute -left-[180px] top-[40px] h-[520px] w-[520px] rounded-full bg-[rgba(115,34,105,0.07)] blur-3xl" />
                    <span className="absolute -right-[200px] top-[220px] h-[560px] w-[560px] rounded-full bg-[rgba(0,184,173,0.07)] blur-3xl" />
                    <span className="absolute bottom-[6%] left-[30%] h-[560px] w-[560px] rounded-full bg-[rgba(115,34,105,0.05)] blur-3xl" />
                </div>
                {/* First load: spinner over the skeleton, so an empty-looking
                    dashboard is never mistaken for "no data". */}
                {firstLoad && <DashboardLoader />}

                {/* Refetch: the page stays readable, with a progress bar and a
                    small "Updating…" pill. */}
                {loading && dashboardSummary && <UpdatingPill />}

                {loading && dashboardSummary && (
                    <div className="glass-progress pointer-events-none absolute inset-x-0 top-0 z-[1000] h-[3px] overflow-hidden">
                        <span className="glass-progress-bar block h-full w-1/3 rounded-full bg-[#732269]" />
                    </div>
                )}

                <div
                    className={`relative px-[20px] pb-[28px] pt-[4px] transition-opacity duration-300 ${
                        loading && dashboardSummary ? "opacity-60" : "opacity-100"
                    }`}
                >
                    <DashboardPageHeader
                        filters={filters}
                        onExport={handleExport}
                        exportDisabled={!dashboardSummary}
                    />

                    {/* Filters — State → District → Centre + date range */}
                    <DashboardFilter setFilters={setFilters} loading={loading} />

                    {/* An error that still left usable data on screen: warn, keep the page. */}
                    {error && dashboardSummary && (
                        <div className="mt-[16px] flex flex-wrap items-center gap-[10px] rounded-[12px] border border-[#F3D9D6] bg-[#FDF3F2] px-[16px] py-[12px]">
                            <FiAlertCircle size={16} className="text-[#C0392B]" />
                            <span className="text-[13px] text-[#8C3A32]">
                                Couldn&apos;t refresh the dashboard — showing the last
                                loaded data. {error}
                            </span>
                            <button
                                type="button"
                                onClick={retry}
                                className="glass-plain ml-auto inline-flex items-center gap-[6px] rounded-[8px] border border-[#C0392B] px-[12px] py-[6px] text-[12.5px] font-medium text-[#C0392B] transition-colors hover:bg-[#FBE9E7]"
                            >
                                <FiRefreshCw size={13} />
                                Try again
                            </button>
                        </div>
                    )}

                    {failedWithNoData ? (
                        /* Hard failure on first load — one clean state, no fake data. */
                        <div className="mt-[16px] flex flex-col items-center justify-center gap-[12px] rounded-[14px] border border-[#EDEAF2] bg-white px-[24px] py-[64px] text-center shadow-[0_1px_2px_rgba(31,27,46,0.04),0_10px_28px_-20px_rgba(31,27,46,0.20)]">
                            <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#FDF3F2]">
                                <FiAlertCircle size={22} className="text-[#C0392B]" />
                            </span>
                            <h2
                                className="m-0 font-semibold text-[#1F1B2E]"
                                style={{ fontSize: "16px", lineHeight: "24px" }}
                            >
                                Dashboard data unavailable
                            </h2>
                            <p
                                className="m-0 max-w-[440px] text-[#6B6478]"
                                style={{ fontSize: "13px", lineHeight: "20px" }}
                            >
                                {error}
                            </p>
                            <button
                                type="button"
                                onClick={retry}
                                className="glass-plain mt-[4px] inline-flex items-center gap-[7px] rounded-[10px] bg-[#732269] px-[18px] py-[10px] text-[13px] font-medium text-white"
                            >
                                <FiRefreshCw size={14} />
                                Try again
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mt-[16px]">
                                <StatsCards
                                    loading={firstLoad}
                                    centres={dashboardSummary?.summary?.total_centres ?? 0}
                                    trainees={dashboardSummary?.summary?.total_participants ?? 0}
                                    modules={dashboardSummary?.summary?.total_modules ?? 0}
                                    batches={dashboardSummary?.summary?.total_batches ?? 0}
                                    documents={dashboardSummary?.summary?.total_documents ?? 0}
                                />
                            </div>

                            <div className="mt-[16px]">
                                {firstLoad ? (
                                    <ChartsGridSkeleton />
                                ) : (
                                    /* The skeleton also covers the moment the
                                       lazy charts chunk is still arriving. */
                                    <Suspense fallback={<ChartsGridSkeleton />}>
                                        <DashboardCharts
                                            data={dashboardSummary || {}}
                                            loading={loading}
                                            filters={filters}
                                        />
                                    </Suspense>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </AppLayout>
    );
}
