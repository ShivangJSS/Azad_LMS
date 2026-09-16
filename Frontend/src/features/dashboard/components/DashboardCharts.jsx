import { lazy, Suspense, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText } from "react-icons/fi";
import {
    FaAlignLeft,
    FaChartBar,
    FaChartLine,
    FaChartPie,
    FaMapMarkerAlt,
    FaUsers,
} from "react-icons/fa";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    AreaChart,
    Area,
    LabelList,
} from "recharts";

import ChartPanel from "./ChartPanel";
import ChartDetailModal from "./ChartDetailModal";
import MonthlyLoginModal from "./MonthlyLoginModal";
import {
    BRAND,
    DONUT_FALLBACK,
    GREEN,
    INK,
    LINE,
    STATUS_COLORS,
    SUB,
    formatNumber,
    rampColors,
} from "../hook/dashboardTheme";
import {
    getTraineeStatusDetails,
    getStateWiseParticipants,
    getDistrictWiseParticipants,
    getAgeGroupDistribution,
    getStateWiseCentres,
} from "@/features/dashboard/services/DashboardService";

const loadStateWiseCentresMap = () => import("./StateWiseCentresMap");
const StateWiseCentresMap = lazy(loadStateWiseCentresMap);
// Warm the map chunk as soon as the charts module loads (parallel, not after).
loadStateWiseCentresMap();

/* Chart body heights per row — cards in the same row share one height, so
   the grid reads as an even band (no CSS min-height hack needed). */
const H_WIDE = 300;
const H_DONUT = 250;
const H_TILE = 274;
const H_FULL = 260;

// "2026-06" -> "Jun 26"
const MONTHS_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const fmtMonthLabel = (m) => {
    if (!m) return "";
    const parts = String(m).split("-");
    if (parts.length >= 2) {
        const idx = Number(parts[1]) - 1;
        if (idx >= 0 && idx < 12) {
            return `${MONTHS_SHORT[idx]} ${parts[0].slice(-2)}`;
        }
    }
    return m;
};

/* ------------------------------------------------------------------
   Shared chart chrome
------------------------------------------------------------------- */

const AXIS_TICK = { fontSize: 11, fill: SUB };

/* A full-width card with only a handful of categories would stretch the bars
   far apart, so the plot is capped to a sensible band width and centred. */
const plotWidthFor = (count) => ({
    width: "100%",
    maxWidth: `${Math.max(420, count * 165)}px`,
    margin: "0 auto",
});

/* Category labels can be long ("Uttar Pradesh"); shorten them on the axis so
   they never collide. Tooltips and the data table keep the full name. */
const shortLabel = (value) => {
    const s = String(value ?? "");
    return s.length > 11 ? `${s.slice(0, 10)}…` : s;
};

function NoData({ height = 230, message = "No data available" }) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-[8px] text-center"
            style={{ height }}
        >
            <span
                aria-hidden="true"
                className="flex h-[38px] w-[38px] items-center justify-center rounded-full"
                style={{ background: "#F5F2F7" }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={SUB} strokeWidth="1.6" strokeLinecap="round">
                    <path d="M4 19V5M4 19h16" />
                    <path d="M8 15v-3M13 15V9M18 15v-6" />
                </svg>
            </span>
            <span className="text-[12.5px]" style={{ color: SUB }}>
                {message}
            </span>
        </div>
    );
}

function ChartTooltip({ active, payload, label, unit }) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div
            style={{
                background: "#fff",
                color: INK,
                padding: "8px 12px",
                borderRadius: "10px",
                fontSize: "12.5px",
                border: `1px solid ${LINE}`,
                boxShadow: "0 12px 28px -12px rgba(31,27,46,0.28)",
                pointerEvents: "none",
                whiteSpace: "nowrap",
            }}
        >
            {label != null && label !== "" && (
                <div style={{ color: SUB, marginBottom: 2 }}>{label}</div>
            )}
            {payload.map((p, i) => (
                <div key={i} style={{ fontWeight: 600 }}>
                    {formatNumber(Number(p.value) || 0)}
                    {unit || ""}
                </div>
            ))}
        </div>
    );
}

/* Donut hover tooltip — "Name / N (X.X%)". */
function makeDonutTooltip(total) {
    return function DonutTooltip({ active, payload }) {
        if (!active || !payload || !payload.length) return null;
        const p = payload[0];
        const value = p.value || 0;
        const pct = total ? ((value / total) * 100).toFixed(1) : "0.0";
        const color = p.payload && p.payload.fill;
        return (
            <div
                style={{
                    background: "#fff",
                    color: INK,
                    padding: "9px 13px",
                    borderRadius: "10px",
                    fontSize: "12.5px",
                    border: `1px solid ${LINE}`,
                    boxShadow: "0 12px 28px -12px rgba(31,27,46,0.28)",
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontWeight: 600,
                        marginBottom: 2,
                    }}
                >
                    {color && (
                        <span
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: color,
                                display: "inline-block",
                            }}
                        />
                    )}
                    {p.name}
                </div>
                <div style={{ color: SUB }}>
                    {formatNumber(value)} ({pct}%)
                </div>
            </div>
        );
    };
}

/* Legend under the donut: centred row of square swatches reading
   "Label: N (X.X%)". Hovering a chip dims the other slices. */
function DonutLegend({ items, total, colorFn, onEnter, onLeave, activeIndex, onSelect }) {
    return (
        <div className="glass-legend mt-[12px] flex flex-wrap items-center justify-center gap-x-[18px] gap-y-[8px] px-[10px] pb-[2px]">
            {items.map((it, i) => {
                const pct = total ? ((it.value / total) * 100).toFixed(1) : "0.0";
                return (
                    <button
                        type="button"
                        key={i}
                        onMouseEnter={() => onEnter && onEnter(i)}
                        onMouseLeave={() => onLeave && onLeave()}
                        onClick={() => onSelect && onSelect(it, i)}
                        className="glass-legend-item flex items-center gap-[7px] transition-opacity"
                        style={{
                            opacity:
                                activeIndex === -1 || activeIndex === i ? 1 : 0.45,
                        }}
                    >
                        <span
                            style={{
                                width: 11,
                                height: 11,
                                borderRadius: 2,
                                background: colorFn(i, it),
                                display: "inline-block",
                                flexShrink: 0,
                            }}
                        />
                        <span
                            className="whitespace-nowrap text-[12.5px]"
                            style={{ color: INK }}
                        >
                            {`${it.name}: ${formatNumber(it.value)} (${pct}%)`}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

/* Donut with the total printed in the hole. Fades out while a slice is
   hovered so the cursor-following tooltip never overlaps it. */
function DonutCentre({ total, caption = "Total", height, dimmed = false }) {
    return (
        <div
            className="pointer-events-none absolute inset-x-0 flex flex-col items-center justify-center transition-opacity duration-150"
            style={{ top: 0, height, opacity: dimmed ? 0 : 1 }}
        >
            <span
                className="text-[24px] font-semibold leading-[30px] tracking-[-0.01em]"
                style={{ color: INK, fontVariantNumeric: "tabular-nums" }}
            >
                {formatNumber(total)}
            </span>
            <span className="text-[11.5px] leading-[16px]" style={{ color: SUB }}>
                {caption}
            </span>
        </div>
    );
}

/* ------------------------------------------------------------------
   Charts
------------------------------------------------------------------- */

export default function DashboardCharts({ data = {}, filters = {} }) {
    // Real data only — everything comes from the /dashboard API. Missing
    // sections render as empty (no dummy/placeholder values).
    const merged = {
        state_wise_participants: data.state_wise_participants || [],
        trainee_status: data.trainee_status || [],
        age_group_distribution: data.age_group_distribution || [],
        district_wise_participants: data.district_wise_participants || [],
        monthly_login_trend: data.monthly_login_trend || [],
        state_wise_centres: data.state_wise_centres || [],
    };

    const navigate = useNavigate();

    // Detail modal opened from a chart (click a series, or "View data table").
    const [detail, setDetail] = useState(null);
    const [monthlyMonth, setMonthlyMonth] = useState(null);

    // Hovered slice index per donut (-1 = none) — drives legend dimming.
    const [activeStatus, setActiveStatus] = useState(-1);
    // The tooltip follows the cursor over the ring and would otherwise sit on
    // top of the centre total, so the centre fades out while a slice is hovered.
    const [donutHover, setDonutHover] = useState(false);

    /* Sorted copies (largest first) so the colour ramp reads as a scale —
       presentation only, the underlying data is untouched. */
    const statesSorted = useMemo(
        () =>
            [...merged.state_wise_participants].sort(
                (a, b) => (b.total || 0) - (a.total || 0)
            ),
        [merged.state_wise_participants]
    );

    const districtsSorted = useMemo(
        () =>
            [...merged.district_wise_participants].sort(
                (a, b) => (b.total || 0) - (a.total || 0)
            ),
        [merged.district_wise_participants]
    );

    const stateColors = useMemo(
        () => rampColors(statesSorted.length),
        [statesSorted.length]
    );
    const districtColors = useMemo(
        () => rampColors(districtsSorted.length),
        [districtsSorted.length]
    );

    const statusTotal = useMemo(
        () => merged.trainee_status.reduce((s, r) => s + (r.total || 0), 0),
        [merged.trainee_status]
    );

    const statusColorOf = (i, row) =>
        STATUS_COLORS[row?.status] || DONUT_FALLBACK[i % DONUT_FALLBACK.length];

    // "Action" column for trainee-level detail lists — opens that trainee's
    // View Report page by participant id (closes the modal first).
    const reportActionColumn = {
        key: "action",
        label: "Action",
        render: (row) => {
            const pid = row.participant_id ?? row.id;
            if (!pid) return "-";
            return (
                <button
                    type="button"
                    title="View Report"
                    onClick={() => {
                        setDetail(null);
                        navigate(`/participants/view/${pid}`);
                    }}
                    className="inline-flex items-center justify-center rounded-md border border-[#732269] p-[6px] text-[#732269] hover:bg-[#F7F0F5]"
                >
                    <FiFileText size={15} />
                </button>
            );
        },
    };

    // Aggregate charts already have their rows loaded — show them directly.
    const openAggregate = (title, rows, labelKey, labelHeader, valueHeader) =>
        setDetail({
            title,
            loading: false,
            rows,
            columns: [
                { key: labelKey, label: labelHeader },
                { key: "total", label: valueHeader },
            ],
        });

    // Shared column set for any per-trainee drill-down list.
    const traineeColumns = [
        { key: "participant_name", label: "Name" },
        { key: "mobile_no", label: "Mobile" },
        { key: "email", label: "Email" },
        { key: "gender", label: "Gender" },
        { key: "age", label: "Age" },
        { key: "state_name", label: "State" },
        { key: "district_name", label: "District" },
        reportActionColumn,
    ];

    // Generic drill-down runner: opens the modal with a spinner, fetches, fills.
    const openDrilldown = async (title, columns, fetcher) => {
        setDetail({ title, loading: true, rows: [], columns });
        try {
            const rows = await fetcher();
            setDetail({
                title,
                loading: false,
                rows: Array.isArray(rows) ? rows : [],
                columns,
            });
        } catch {
            setDetail({ title, loading: false, rows: [], columns });
        }
    };

    // State Wise Trainees — click a bar → that state's trainee list.
    const openStateDetail = (row) => {
        if (!row) return;
        openDrilldown(
            `State Wise Trainees — ${row.state_name || ""}`,
            traineeColumns,
            () =>
                getStateWiseParticipants({
                    ...filters,
                    clicked_value: row.state_id,
                })
        );
    };

    // Age Group Distribution — click a bar → that age bucket's trainee list.
    const openAgeDetail = (row) => {
        if (!row) return;
        openDrilldown(
            `Age Group Distribution — ${row.age_group || ""}`,
            traineeColumns,
            () =>
                getAgeGroupDistribution({
                    ...filters,
                    clicked_value: row.age_group,
                })
        );
    };

    // District Wise Trainees — click a bar → that district's trainee list.
    const openDistrictDetail = (row) => {
        if (!row) return;
        openDrilldown(
            `District Wise Trainees — ${row.district_name || ""}`,
            traineeColumns,
            () =>
                getDistrictWiseParticipants({
                    ...filters,
                    clicked_value: row.district_name,
                })
        );
    };

    // State Wise Centres — click a state on the map → that state's centre list.
    const openCentreDetail = (stateName) => {
        if (!stateName) return;
        const columns = [
            { key: "centre_name", label: "Centre Name" },
            { key: "address", label: "Address" },
            { key: "state_name", label: "State" },
            { key: "district_name", label: "District" },
            {
                key: "status",
                label: "Status",
                render: (r) =>
                    Number(r.status) === 1 ? (
                        <span className="font-semibold text-[#2e9d5b]">Active</span>
                    ) : (
                        <span className="font-semibold text-[#e0524a]">Inactive</span>
                    ),
            },
        ];
        openDrilldown(
            `State Wise Centres — ${stateName}`,
            columns,
            () =>
                getStateWiseCentres({
                    ...filters,
                    clicked_value: stateName,
                })
        );
    };

    // Monthly Login Trend — click a point → the dedicated modal with its own
    // State / District / Duration filters.
    const openMonthlyDetail = (row) => {
        if (!row) return;
        setMonthlyMonth(row.month);
    };

    // Trainee Status drills down to the per-trainee list from the API.
    const openTraineeStatus = async () => {
        const columns = [
            { key: "participant_name", label: "Name" },
            { key: "mobile_no", label: "Mobile" },
            { key: "enrollment_no", label: "Trainee Enrollment No" },
            { key: "age", label: "Age" },
            {
                key: "performance_status",
                label: "Status",
                render: (r) => r.performance_status || "Yet to Start",
            },
            reportActionColumn,
        ];
        setDetail({ title: "Trainee Status", loading: true, rows: [], columns });
        try {
            const rows = await getTraineeStatusDetails(filters);
            setDetail({
                title: "Trainee Status",
                loading: false,
                rows: Array.isArray(rows) ? rows : [],
                columns,
            });
        } catch {
            setDetail({
                title: "Trainee Status",
                loading: false,
                rows: [],
                columns,
            });
        }
    };

    return (
        <div className="w-full">
            {/* No focus outline "box" when a chart element is clicked. */}
            <style>{`
                .recharts-wrapper,
                .recharts-wrapper:focus,
                .recharts-wrapper svg,
                .recharts-surface,
                .recharts-surface:focus,
                .recharts-bar-rectangle,
                .recharts-bar-rectangle *,
                .recharts-rectangle,
                .recharts-sector,
                .recharts-dot,
                .recharts-area-dot {
                    outline: none !important;
                }
            `}</style>

            {/* ---- Row 1: state bars / centres map / district bars ---- */}
            <div className="mb-[16px] grid grid-cols-1 gap-[16px] md:grid-cols-2 xl:grid-cols-3">
                <ChartPanel
                    title="State Wise Trainees"
                    icon={<FaChartBar size={14} />}
                    accent="purple"
                    onDetail={() =>
                        openAggregate(
                            "State Wise Trainees",
                            statesSorted,
                            "state_name",
                            "State",
                            "Trainees"
                        )
                    }
                    rows={statesSorted}
                    columns={[
                        { key: "state_name", label: "State" },
                        { key: "total", label: "Trainees" },
                    ]}
                >
                    {statesSorted.length === 0 ? (
                        <NoData height={H_TILE} />
                    ) : (
                        <ResponsiveContainer width="100%" height={H_TILE}>
                            <BarChart
                                data={statesSorted}
                                margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
                                barCategoryGap="16%"
                            >
                                <CartesianGrid stroke={LINE} />
                                <XAxis
                                    dataKey="state_name"
                                    tickFormatter={shortLabel}
                                    tick={{ ...AXIS_TICK, fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={{ stroke: LINE }}
                                    interval={0}
                                    angle={-22}
                                    textAnchor="end"
                                    height={58}
                                    dy={2}
                                />
                                <YAxis
                                    tick={AXIS_TICK}
                                    axisLine={false}
                                    tickLine={false}
                                    width={40}
                                />
                                <Tooltip
                                    content={<ChartTooltip unit=" trainees" />}
                                    cursor={{ fill: "rgba(115,34,105,0.04)" }}
                                    isAnimationActive
                                    animationDuration={200}
                                    allowEscapeViewBox={{ x: true, y: true }}
                                    wrapperStyle={{ pointerEvents: "none", zIndex: 60 }}
                                />
                                <Bar
                                    dataKey="total"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={56}
                                    isAnimationActive
                                    animationDuration={650}
                                    animationEasing="ease-out"
                                    cursor="pointer"
                                    onClick={(_, index) => openStateDetail(statesSorted[index])}
                                >
                                    {statesSorted.map((_, i) => (
                                        <Cell key={i} fill={stateColors[i]} />
                                    ))}
                                    <LabelList
                                        dataKey="total"
                                        position="top"
                                        offset={8}
                                        style={{ fontSize: 10.5, fontWeight: 600, fill: SUB }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartPanel>

                <ChartPanel
                    title="State Wise Centres"
                    icon={<FaMapMarkerAlt size={14} />}
                    accent="blue"
                    onDetail={() =>
                        openAggregate(
                            "State Wise Centres",
                            merged.state_wise_centres,
                            "state_name",
                            "State",
                            "Centres"
                        )
                    }
                    rows={merged.state_wise_centres}
                    columns={[
                        { key: "state_name", label: "State" },
                        { key: "total", label: "Centres" },
                    ]}
                >
                    {merged.state_wise_centres.length === 0 ? (
                        <NoData height={H_TILE} />
                    ) : (
                        <Suspense
                            fallback={
                                <div
                                    className="animate-pulse rounded-[10px] bg-[#F6F4F9]"
                                    style={{ height: H_TILE }}
                                />
                            }
                        >
                            <StateWiseCentresMap
                                centres={merged.state_wise_centres}
                                height={H_TILE}
                                onStateClick={openCentreDetail}
                            />
                        </Suspense>
                    )}
                </ChartPanel>

                <ChartPanel
                    title="District Wise Trainees"
                    icon={<FaAlignLeft size={14} />}
                    accent="orchid"
                    onDetail={() =>
                        openAggregate(
                            "District Wise Trainees",
                            districtsSorted,
                            "district_name",
                            "District",
                            "Trainees"
                        )
                    }
                    rows={districtsSorted}
                    columns={[
                        { key: "district_name", label: "District" },
                        { key: "total", label: "Trainees" },
                    ]}
                >
                    {districtsSorted.length === 0 ? (
                        <NoData height={H_TILE} />
                    ) : (
                        <ResponsiveContainer width="100%" height={H_TILE}>
                            <BarChart
                                layout="vertical"
                                data={districtsSorted}
                                margin={{ top: 4, right: 34, left: 4, bottom: 4 }}
                                barCategoryGap="16%"
                            >
                                <CartesianGrid horizontal={false} stroke={LINE} strokeDasharray="4 4" />
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="district_name"
                                    tickFormatter={shortLabel}
                                    tick={{ ...AXIS_TICK, fontSize: 10.5 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={78}
                                    interval={0}
                                />
                                <Tooltip
                                    content={<ChartTooltip unit=" trainees" />}
                                    cursor={{ fill: "rgba(115,34,105,0.04)" }}
                                    isAnimationActive
                                    animationDuration={200}
                                    allowEscapeViewBox={{ x: true, y: true }}
                                    wrapperStyle={{ pointerEvents: "none", zIndex: 60 }}
                                />
                                <Bar
                                    dataKey="total"
                                    radius={[0, 5, 5, 0]}
                                    maxBarSize={18}
                                    isAnimationActive
                                    animationDuration={650}
                                    animationEasing="ease-out"
                                    cursor="pointer"
                                    onClick={(_, index) =>
                                        openDistrictDetail(districtsSorted[index])
                                    }
                                >
                                    {districtsSorted.map((_, i) => (
                                        <Cell key={i} fill={districtColors[i]} />
                                    ))}
                                    <LabelList
                                        dataKey="total"
                                        position="right"
                                        offset={7}
                                        style={{ fontSize: 10.5, fontWeight: 600, fill: SUB }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartPanel>
            </div>

            {/* ---- Row 2: age distribution (wide) + trainee status donut ---- */}
            <div className="mb-[16px] grid grid-cols-1 gap-[16px] lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ChartPanel
                        title="Age Group Distribution"
                        icon={<FaUsers size={14} />}
                        accent="emerald"
                        onDetail={() =>
                            openAggregate(
                                "Age Group Distribution",
                                merged.age_group_distribution,
                                "age_group",
                                "Age Group",
                                "Trainees"
                            )
                        }
                        rows={merged.age_group_distribution}
                        columns={[
                            { key: "age_group", label: "Age Group" },
                            { key: "total", label: "Trainees" },
                        ]}
                    >
                        {merged.age_group_distribution.length === 0 ? (
                            <NoData height={H_WIDE} />
                        ) : (
                            <div style={plotWidthFor(merged.age_group_distribution.length)}>
                            <ResponsiveContainer width="100%" height={H_WIDE}>
                                <BarChart
                                    data={merged.age_group_distribution}
                                    margin={{ top: 22, right: 16, left: 0, bottom: 0 }}
                                    barCategoryGap="14%"
                                >
                                    <CartesianGrid stroke={LINE} />
                                    <XAxis
                                        dataKey="age_group"
                                        tick={AXIS_TICK}
                                        tickLine={false}
                                        axisLine={{ stroke: LINE }}
                                        dy={6}
                                    />
                                    <YAxis
                                        tick={AXIS_TICK}
                                        axisLine={false}
                                        tickLine={false}
                                        width={44}
                                    />
                                    <Tooltip
                                        content={<ChartTooltip unit=" trainees" />}
                                        cursor={{ fill: "rgba(16,185,129,0.05)" }}
                                        isAnimationActive
                                        animationDuration={200}
                                        allowEscapeViewBox={{ x: true, y: true }}
                                        wrapperStyle={{ pointerEvents: "none", zIndex: 60 }}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill={GREEN}
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={92}
                                        isAnimationActive
                                        animationDuration={650}
                                        animationEasing="ease-out"
                                        cursor="pointer"
                                        onClick={(_, index) =>
                                            openAgeDetail(merged.age_group_distribution[index])
                                        }
                                    >
                                        <LabelList
                                            dataKey="total"
                                            position="top"
                                            offset={8}
                                            style={{ fontSize: 11, fontWeight: 600, fill: SUB }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            </div>
                        )}
                    </ChartPanel>
                </div>

                <ChartPanel
                    title="Trainee Status"
                    icon={<FaChartPie size={14} />}
                    accent="amber"
                    onDetail={openTraineeStatus}
                    rows={merged.trainee_status}
                    columns={[
                        { key: "label", label: "Status" },
                        { key: "total", label: "Total" },
                    ]}
                >
                    {statusTotal === 0 ? (
                        <NoData height={H_DONUT} />
                    ) : (
                        <>
                            <div className="relative">
                                <ResponsiveContainer width="100%" height={H_DONUT}>
                                    <PieChart>
                                        <Pie
                                            data={merged.trainee_status}
                                            dataKey="total"
                                            nameKey="label"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={72}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            cornerRadius={4}
                                            labelLine={false}
                                            stroke="none"
                                            isAnimationActive
                                            animationBegin={0}
                                            animationDuration={650}
                                            animationEasing="ease-out"
                                            cursor="pointer"
                                            onClick={() => openTraineeStatus()}
                                            onMouseEnter={() => setDonutHover(true)}
                                            onMouseLeave={() => setDonutHover(false)}
                                        >
                                            {merged.trainee_status.map((s, i) => (
                                                <Cell key={i} fill={statusColorOf(i, s)} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={makeDonutTooltip(statusTotal)}
                                            isAnimationActive
                                            animationDuration={200}
                                            allowEscapeViewBox={{ x: true, y: true }}
                                            wrapperStyle={{ pointerEvents: "none", zIndex: 60 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>

                                <DonutCentre
                                    total={statusTotal}
                                    caption="Trainees"
                                    height={H_DONUT}
                                    dimmed={donutHover}
                                />
                            </div>

                            <DonutLegend
                                items={merged.trainee_status.map((s) => ({
                                    name: s.label,
                                    value: s.total,
                                    status: s.status,
                                }))}
                                total={statusTotal}
                                colorFn={statusColorOf}
                                activeIndex={activeStatus}
                                onEnter={setActiveStatus}
                                onLeave={() => setActiveStatus(-1)}
                                onSelect={() => openTraineeStatus()}
                            />
                        </>
                    )}
                </ChartPanel>
            </div>

            {/* ---- Row 3: monthly login trend (full width) ---- */}
            <ChartPanel
                title="Monthly Login Trend"
                icon={<FaChartLine size={14} />}
                accent="teal"
                onDetail={() =>
                    openAggregate(
                        "Monthly Login Trend",
                        merged.monthly_login_trend,
                        "month",
                        "Month",
                        "Logins"
                    )
                }
                rows={merged.monthly_login_trend}
                columns={[
                    { key: "month", label: "Month" },
                    { key: "total", label: "Logins" },
                ]}
            >
                {merged.monthly_login_trend.length === 0 ? (
                    <NoData height={H_FULL} />
                ) : (
                    <ResponsiveContainer width="100%" height={H_FULL}>
                        <AreaChart
                            data={merged.monthly_login_trend}
                            margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                                const p = e?.activePayload?.[0]?.payload;
                                if (p) openMonthlyDetail(p);
                            }}
                        >
                            <defs>
                                <linearGradient id="loginFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.18} />
                                    <stop offset="100%" stopColor={BRAND} stopOpacity={0.01} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                vertical={false}
                                stroke={LINE}
                                strokeDasharray="4 4"
                            />
                            <XAxis
                                dataKey="month"
                                tickFormatter={fmtMonthLabel}
                                tick={AXIS_TICK}
                                tickLine={false}
                                axisLine={{ stroke: LINE }}
                                dy={6}
                            />
                            <YAxis
                                tick={AXIS_TICK}
                                axisLine={false}
                                tickLine={false}
                                width={44}
                            />
                            <Tooltip
                                content={<ChartTooltip unit=" logins" />}
                                cursor={{ stroke: LINE }}
                                isAnimationActive
                                animationDuration={200}
                                allowEscapeViewBox={{ x: true, y: true }}
                                wrapperStyle={{ pointerEvents: "none", zIndex: 60 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                name="Logins"
                                stroke={BRAND}
                                strokeWidth={2.2}
                                fill="url(#loginFill)"
                                isAnimationActive
                                animationDuration={800}
                                animationEasing="ease-out"
                                dot={{
                                    r: 3.5,
                                    fill: "#fff",
                                    stroke: BRAND,
                                    strokeWidth: 2,
                                    cursor: "pointer",
                                }}
                                activeDot={{
                                    r: 5.5,
                                    fill: "#fff",
                                    stroke: BRAND,
                                    strokeWidth: 2.5,
                                    cursor: "pointer",
                                    onClick: (_, payload) =>
                                        openMonthlyDetail(payload?.payload),
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </ChartPanel>

            {detail && (
                <ChartDetailModal
                    title={detail.title}
                    columns={detail.columns}
                    rows={detail.rows}
                    loading={detail.loading}
                    onClose={() => setDetail(null)}
                />
            )}

            {monthlyMonth && (
                <MonthlyLoginModal
                    month={monthlyMonth}
                    baseFilters={filters}
                    onClose={() => setMonthlyMonth(null)}
                />
            )}
        </div>
    );
}
