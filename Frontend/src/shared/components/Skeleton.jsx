/* =========================================================================
   Skeleton — reusable shimmering placeholder blocks for loading states.

   Usage:
     {loading ? <SkeletonText lines={4} /> : <RealContent />}
     {loading ? <SkeletonCard /> : <Card />}

   Every block uses the same pulse animation so loading states read as one
   system across the app.
========================================================================= */

export function Skeleton({ className = "" }) {
    return (
        <div
            className={`animate-pulse rounded-[6px] bg-[#e7ebf1] ${className}`}
        />
    );
}

// A stack of text lines (last line shorter, like a paragraph).
export function SkeletonText({ lines = 3, className = "" }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-[12px] ${
                        i === lines - 1 ? "w-2/3" : "w-full"
                    }`}
                />
            ))}
        </div>
    );
}

// A generic card placeholder (title + a few lines).
export function SkeletonCard({ className = "" }) {
    return (
        <div
            className={`rounded-[8px] border border-[#D8E2EF] bg-white p-[18px] ${className}`}
        >
            <Skeleton className="mb-3 h-[16px] w-1/3" />
            <SkeletonText lines={3} />
        </div>
    );
}

// A row of stat cards (matches the report / dashboard stat grid).
export function SkeletonStats({ count = 4, className = "" }) {
    return (
        <div
            className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-${count} ${className}`}
        >
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-[8px] border border-[#D8E2EF] bg-white p-[18px]"
                >
                    <Skeleton className="mb-3 h-[12px] w-1/2" />
                    <Skeleton className="h-[24px] w-1/3" />
                </div>
            ))}
        </div>
    );
}

export default Skeleton;
