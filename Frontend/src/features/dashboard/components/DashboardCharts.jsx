import React, { useMemo } from "react";
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
} from "recharts";
import { FaMapMarkerAlt } from "react-icons/fa";

/* ------------------------------------------------------------------
   Palette — matches DashboardFilter.jsx / DashboardStats.jsx
------------------------------------------------------------------- */
const BRAND = "#6B2D5B";
const PANEL_BG = "#F9F7FB";
const PANEL_BORDER = "#EDE8F0";
const INK = "#2D2235";
const SUB = "#8A7D8E";

const DONUT_STATE = ["#4d2f66", "#e8b23d", "#3d7fd6", "#2fb8a3", "#c77fd6"];
const DONUT_STATUS = {
    YetToStart: "#9a95a8",
    Poor: "#e05a4e",
    Average: "#e8a23d",
    Good: "#4caf6e",
};
const BAR_COLORS = ["#2fb8a3", "#3d7fd6", "#6B2D5B", "#e8a23d"];

/* ------------------------------------------------------------------
   Fallback dummy data — shaped like DashboardResponse (schema.py).
   Pass real values in via the `data` prop once DashboardService
   is wired up; anything omitted falls back to these.
------------------------------------------------------------------- */
const dummyData = {
    state_wise_participants: [
        { state_id: 1, state_name: "Delhi", total: 71 },
        { state_id: 2, state_name: "West Bengal", total: 23 },
        { state_id: 3, state_name: "Rajasthan", total: 21 },
    ],
    trainee_status: [
        { status: "YetToStart", label: "Yet to Start", total: 83 },
        { status: "Poor", label: "Poor", total: 10 },
        { status: "Average", label: "Average", total: 15 },
        { status: "Good", label: "Good", total: 7 },
    ],
    age_group_distribution: [
        { age_group: "18-25", total: 71 },
        { age_group: "26-35", total: 35 },
        { age_group: "36-45", total: 9 },
    ],
    district_wise_participants: [
        { district_name: "North Delhi", total: 28 },
        { district_name: "East Delhi", total: 21 },
        { district_name: "South Delhi", total: 21 },
        { district_name: "West Delhi", total: 21 },
        { district_name: "North 24 Parganas", total: 20 },
        { district_name: "South 24 Parganas", total: 3 },
        { district_name: "Jodhpur", total: 1 },
    ],
    monthly_login_trend: [
        { month: "May 25", total: 32 },
        { month: "Jun 25", total: 38 },
        { month: "Jul 25", total: 58 },
    ],
    state_wise_centres: [
        { state_id: 1, state_name: "Delhi", total: 4 },
        { state_id: 2, state_name: "West Bengal", total: 2 },
        { state_id: 3, state_name: "Rajasthan", total: 2 },
    ],
};

const panelStyle = {
    backgroundColor: "#fff",
    border: `0.8px solid ${PANEL_BORDER}`,
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 1px 3px 0 rgba(107,45,91,0.06), 0 1px 2px 0 rgba(107,45,91,0.04)",
};

const panelHeadStyle = {
    background: BRAND,
    color: "#fff",
    padding: "10px 18px",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.02em",
    display: "flex",
    alignItems: "center",
    gap: "8px",
};

function ChartPanel({ title, icon, children }) {
    return (
        <div style={panelStyle} className="h-full">
            <div style={panelHeadStyle}>
                {icon}
                <span>{title}</span>
            </div>
            <div className="px-[16px] py-[18px]">{children}</div>
        </div>
    );
}

function DonutLegend({ items }) {
    return (
        <div className="flex flex-wrap justify-center gap-[14px] mt-[10px]" style={{ fontSize: "12px", color: INK }}>
            {items.map((it) => (
                <span key={it.name} className="flex items-center gap-[6px]">
                    <span
                        style={{
                            width: 9,
                            height: 9,
                            borderRadius: 9,
                            background: it.color,
                            display: "inline-block",
                        }}
                    />
                    {it.name}
                </span>
            ))}
        </div>
    );
}

function ChartTooltip({ active, payload, label, unit }) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div
            style={{
                background: "#2D2235",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "12px",
            }}
        >
            {label && <div style={{ opacity: 0.7, marginBottom: 2 }}>{label}</div>}
            {payload.map((p, i) => (
                <div key={i}>
                    {p.name}: <strong>{p.value}{unit || ""}</strong>
                </div>
            ))}
        </div>
    );
}

/* Lightweight illustrative India map — dot size = centre count.
   Approximate screen coordinates, not a true geo-projection. */
function IndiaMiniMap({ centres }) {
    const positions = {
        Delhi: { x: 150, y: 90 },
        "West Bengal": { x: 240, y: 150 },
        Rajasthan: { x: 100, y: 140 },
        "Tamil Nadu": { x: 150, y: 210 },
    };
    const max = Math.max(...centres.map((c) => c.total), 1);
    return (
        <div className="relative flex items-center justify-center" style={{ height: 230 }}>
            <svg viewBox="0 0 320 230" width="100%" height="100%">
                <path
                    d="M120 20 L180 15 L210 40 L230 70 L250 110 L245 150 L220 175 L200 210 L170 200 L150 220 L130 195 L100 190 L80 160 L70 120 L60 90 L80 50 Z"
                    fill="#f1eef4"
                    stroke="#ddd0e0"
                    strokeWidth="1.5"
                />
                {centres.map((c) => {
                    const pos = positions[c.state_name] || { x: 160, y: 115 };
                    const r = 8 + (c.total / max) * 14;
                    return (
                        <g key={c.state_name}>
                            <circle cx={pos.x} cy={pos.y} r={r} fill={BRAND} fillOpacity={0.75} />
                            <circle cx={pos.x} cy={pos.y} r={2.5} fill="#fff" />
                            <text
                                x={pos.x}
                                y={pos.y + r + 12}
                                textAnchor="middle"
                                fontSize="9"
                                fill={BRAND}
                                fontWeight="600"
                            >
                                {c.state_name} ({c.total})
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

export default function DashboardCharts({ data = {} }) {
    // Only override a dummy dataset when the incoming value is actually
    // present — Dashboard.jsx may pass explicit `undefined` keys while
    // the initial fetch is still in flight.
    const merged = Object.keys(dummyData).reduce(
        (acc, key) => ({
            ...acc,
            [key]: data[key] != null ? data[key] : dummyData[key],
        }),
        {}
    );

    const stateWiseTotal = useMemo(
        () => merged.state_wise_participants.reduce((s, r) => s + r.total, 0),
        [merged.state_wise_participants]
    );
    const statusTotal = useMemo(
        () => merged.trainee_status.reduce((s, r) => s + r.total, 0),
        [merged.trainee_status]
    );

    return (
        <div className="w-full bg-white px-[20px] pb-[20px]">
            {/* Row 1: State wise trainees / Trainee status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[20px]">
                <ChartPanel title="State Wise Trainees" icon={<FaMapMarkerAlt size={13} />}>
                    <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                            <Pie
                                data={merged.state_wise_participants}
                                dataKey="total"
                                nameKey="state_name"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={2}
                            >
                                {merged.state_wise_participants.map((_, i) => (
                                    <Cell key={i} fill={DONUT_STATE[i % DONUT_STATE.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <DonutLegend
                        items={merged.state_wise_participants.map((s, i) => ({
                            name: `${s.state_name}: ${((s.total / stateWiseTotal) * 100).toFixed(1)}%`,
                            color: DONUT_STATE[i % DONUT_STATE.length],
                        }))}
                    />
                </ChartPanel>

                <ChartPanel title="Trainee Status">
                    <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                            <Pie
                                data={merged.trainee_status}
                                dataKey="total"
                                nameKey="label"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={2}
                            >
                                {merged.trainee_status.map((s, i) => (
                                    <Cell key={i} fill={DONUT_STATUS[s.status] || DONUT_STATE[i]} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <DonutLegend
                        items={merged.trainee_status.map((s) => ({
                            name: `${s.label}: ${((s.total / statusTotal) * 100).toFixed(1)}%`,
                            color: DONUT_STATUS[s.status],
                        }))}
                    />
                </ChartPanel>
            </div>

            {/* Row 2: State wise centres map / Age group distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[20px]">
                <ChartPanel title="State Wise Centres" icon={<FaMapMarkerAlt size={13} />}>
                    <IndiaMiniMap centres={merged.state_wise_centres} />
                </ChartPanel>

                <ChartPanel title="Age Group Distribution">
                    <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={merged.age_group_distribution} barSize={70}>
                            <CartesianGrid vertical={false} stroke="#eee" />
                            <XAxis dataKey="age_group" tick={{ fontSize: 11, fill: SUB }} axisLine={{ stroke: "#ddd" }} />
                            <YAxis tick={{ fontSize: 11, fill: SUB }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                {merged.age_group_distribution.map((_, i) => (
                                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartPanel>
            </div>

            {/* Row 3: District wise trainees / Monthly login trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
                <ChartPanel title="District Wise Trainees (Top 10)" icon={<FaMapMarkerAlt size={13} />}>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={merged.district_wise_participants} barSize={26}>
                            <CartesianGrid vertical={false} stroke="#eee" />
                            <XAxis
                                dataKey="district_name"
                                tick={{ fontSize: 10, fill: SUB }}
                                interval={0}
                                angle={-25}
                                textAnchor="end"
                                height={60}
                                axisLine={{ stroke: "#ddd" }}
                            />
                            <YAxis tick={{ fontSize: 11, fill: SUB }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                            <Bar dataKey="total" fill="#e8a23d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="Monthly Login Trend">
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={merged.monthly_login_trend}>
                            <defs>
                                <linearGradient id="loginFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
                                    <stop offset="100%" stopColor={BRAND} stopOpacity={0.03} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#eee" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: SUB }} axisLine={{ stroke: "#ddd" }} />
                            <YAxis tick={{ fontSize: 11, fill: SUB }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip unit=" logins" />} />
                            <Area
                                type="monotone"
                                dataKey="total"
                                name="Logins"
                                stroke={BRAND}
                                strokeWidth={2}
                                fill="url(#loginFill)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartPanel>
            </div>
        </div>
    );
}