import { useLoading } from "./LoadingContext";

/* =========================================================================
   GlobalLoader — a thin, non-blocking progress bar pinned to the very top of
   the app plus a small corner spinner. It turns on automatically whenever ANY
   API request is in flight (driven by the axios interceptors -> loadingBus ->
   LoadingContext), so tab switches, saves, deletes, list loads — every network
   process — show feedback without blocking the whole screen.
========================================================================= */

export default function GlobalLoader() {
    const { loading } = useLoading();

    if (!loading) {
        return null;
    }

    return (
        <>
            {/* top progress bar (indeterminate) */}
            <div className="fixed inset-x-0 top-0 z-[9999] h-[3px] overflow-hidden bg-[#7b216f]/15">
                <div className="gl-bar h-full w-2/5 rounded-r-full bg-[#7b216f]" />
            </div>

            {/* small corner spinner */}
            <div className="fixed right-[18px] top-[10px] z-[9999] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 shadow-md">
                <span className="h-[14px] w-[14px] animate-spin rounded-full border-2 border-[#e7d5e3] border-t-[#7b216f]" />
                <span className="text-[11px] font-medium text-[#7b216f]">
                    Loading…
                </span>
            </div>

            <style>{`
                @keyframes gl-slide {
                    0%   { transform: translateX(-120%); }
                    100% { transform: translateX(360%); }
                }
                .gl-bar { animation: gl-slide 1s ease-in-out infinite; }
            `}</style>
        </>
    );
}
