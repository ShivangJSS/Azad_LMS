import { memo } from "react";

import {
    FaBuilding,
    FaCubes,
    FaFileAlt,
    FaLayerGroup,
    FaUsers,
} from "react-icons/fa";

import { CARD_CLASS, INK, SUB, formatNumber } from "../hook/dashboardTheme";

// ============================================================
// Static configuration
//
// Compact white cards: a coloured stripe down the left edge, a filled
// circular icon, then the metric with its label underneath.
// ============================================================

const STATS_CONFIG = [
    { key: "centres", label: "Total Centres", icon: FaBuilding, accent: "#732269" },
    { key: "trainees", label: "Active Trainees", icon: FaUsers, accent: "#2C8FE0" },
    { key: "modules", label: "Modules", icon: FaCubes, accent: "#22A957" },
    { key: "batches", label: "Active Batches", icon: FaLayerGroup, accent: "#A93FBF" },
    { key: "documents", label: "Documents", icon: FaFileAlt, accent: "#E74C3C" },
];

const GRID_CLASS =
    "grid w-full grid-cols-1 items-stretch gap-[14px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";

const CARD_SHELL =
    `${CARD_CLASS} relative flex min-h-[80px] items-center gap-[14px] overflow-hidden py-[14px] pl-[20px] pr-[16px]`;

// ============================================================
// Loading skeleton (same shape, so nothing shifts when data lands)
// ============================================================

function StatsCardsSkeleton() {
    return (
        <section className="w-full">
            <div className={GRID_CLASS}>
                {STATS_CONFIG.map(({ key }) => (
                    <div key={key} className={CARD_SHELL}>
                        <span className="absolute inset-y-0 left-0 w-[4px] bg-[#EFECF3]" />
                        <span className="h-[44px] w-[44px] shrink-0 animate-pulse rounded-full bg-[#F0EDF4]" />
                        <div className="min-w-0 flex-1">
                            <span className="block h-[20px] w-[62px] animate-pulse rounded-[5px] bg-[#EBE7F1]" />
                            <span className="mt-[7px] block h-[10px] w-[86px] animate-pulse rounded-full bg-[#F4F2F7]" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ============================================================
// Component
// ============================================================

function StatsCards({
    centres = 0,
    trainees = 0,
    modules = 0,
    batches = 0,
    documents = 0,
    loading = false,
}) {
    if (loading) {
        return <StatsCardsSkeleton />;
    }

    const values = { centres, trainees, modules, batches, documents };

    return (
        <section className="w-full">
            <div className={GRID_CLASS}>
                {STATS_CONFIG.map(({ key, label, icon: Icon, accent }) => (
                    <div
                        key={key}
                        className={`${CARD_SHELL} transition-shadow duration-200 hover:shadow-[0_2px_4px_rgba(31,27,46,0.05),0_16px_32px_-20px_rgba(31,27,46,0.28)]`}
                    >
                        {/* Accent stripe down the left edge. Painted as a child
                            rather than a border so the global card-hover rule
                            in index.css can't recolour it. */}
                        <span
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 w-[4px]"
                            style={{ backgroundColor: accent }}
                        />

                        <span
                            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: accent }}
                        >
                            <Icon size={19} className="text-white" aria-hidden="true" />
                        </span>

                        <div className="min-w-0">
                            <span
                                className="block font-bold"
                                style={{
                                    color: INK,
                                    fontSize: "22px",
                                    lineHeight: "28px",
                                    fontVariantNumeric: "tabular-nums",
                                }}
                            >
                                {formatNumber(Number(values[key]) || 0)}
                            </span>

                            <span
                                className="block truncate"
                                style={{
                                    color: SUB,
                                    fontSize: "12px",
                                    lineHeight: "17px",
                                }}
                            >
                                {label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// Prevent re-render when dashboard statistics haven't changed.
export default memo(StatsCards);
