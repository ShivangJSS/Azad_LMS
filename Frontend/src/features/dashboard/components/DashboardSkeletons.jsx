/*
 * Loading placeholders for the dashboard.
 *
 * Deliberately NOT part of the lazy DashboardCharts chunk: the skeleton has
 * to paint on the very first frame, before that chunk has finished
 * downloading. Keeping it here means there is never a blank gap where the
 * charts will be.
 */

/* Same heights the real chart grid uses, so nothing jumps when data lands. */
const H_WIDE = 300;
const H_DONUT = 250;
const H_TILE = 274;
const H_FULL = 260;

const SHELL =
    "rounded-[16px] border border-[rgba(255,255,255,0.85)] bg-[rgba(255,255,255,0.78)] p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_34px_-20px_rgba(45,34,53,0.34)]";

function PanelSkeleton({ height }) {
    return (
        <div className={SHELL}>
            <span className="block h-[14px] w-[160px] animate-pulse rounded-full bg-[#EDE8F2]" />
            <div className="mt-[12px] h-px w-full bg-[#F0EBF3]" />
            <div
                className="mt-[16px] animate-pulse rounded-[10px] bg-[#F6F4F9]"
                style={{ height }}
            />
        </div>
    );
}

export function ChartsGridSkeleton() {
    return (
        <div className="w-full">
            <div className="mb-[16px] grid grid-cols-1 gap-[16px] md:grid-cols-2 xl:grid-cols-3">
                <PanelSkeleton height={H_TILE} />
                <PanelSkeleton height={H_TILE} />
                <PanelSkeleton height={H_TILE} />
            </div>
            <div className="mb-[16px] grid grid-cols-1 gap-[16px] lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <PanelSkeleton height={H_WIDE} />
                </div>
                <PanelSkeleton height={H_DONUT} />
            </div>
            <PanelSkeleton height={H_FULL} />
        </div>
    );
}

/* Spinner + caption shown over the page while the first payload is on its
   way, so an empty-looking dashboard is never mistaken for "no data". */
export function DashboardLoader({ label = "Loading dashboard…" }) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="pointer-events-none absolute inset-x-0 top-[38%] z-[900] flex justify-center"
        >
            <span className="pointer-events-auto flex items-center gap-[12px] rounded-[12px] border border-[#EDEAF2] bg-white px-[20px] py-[13px] shadow-[0_18px_42px_-16px_rgba(31,27,46,0.30)]">
                <span className="h-[18px] w-[18px] animate-spin rounded-full border-[2.5px] border-[#E7DCE6] border-t-[#732269]" />
                <span className="text-[13px] font-medium text-[#1F1B2E]">
                    {label}
                </span>
            </span>
        </div>
    );
}

/* Small pill shown while a filter refetch is in flight (the page stays
   readable underneath). */
export function UpdatingPill({ label = "Updating…" }) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 top-[128px] z-[900] flex justify-center"
        >
            <span className="flex items-center gap-[9px] rounded-full border border-[#EDEAF2] bg-white px-[16px] py-[8px] shadow-[0_12px_30px_-14px_rgba(31,27,46,0.32)]">
                <span className="h-[14px] w-[14px] animate-spin rounded-full border-[2px] border-[#E7DCE6] border-t-[#732269]" />
                <span className="text-[12.5px] font-medium text-[#1F1B2E]">
                    {label}
                </span>
            </span>
        </div>
    );
}
