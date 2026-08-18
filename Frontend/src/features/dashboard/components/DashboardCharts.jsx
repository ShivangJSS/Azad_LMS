import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText } from "react-icons/fi";
import {
    PieChart,
    Pie,
    Cell,
    Sector,
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
import {
    FaMapMarkerAlt,
    FaChartPie,
    FaInfoCircle,
    FaBars,
} from "react-icons/fa";

import ChartDetailModal from "./ChartDetailModal";
import MonthlyLoginModal from "./MonthlyLoginModal";
import StateWiseCentresMap from "./StateWiseCentresMap";
import {
    getTraineeStatusDetails,
    getStateWiseParticipants,
    getDistrictWiseParticipants,
    getAgeGroupDistribution,
    getMonthlyLoginDetails,
    getStateWiseCentres,
} from "../services/DashboardService";

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

// "2026-06-30T07:55:19" -> "30/6/2026 07:55 am"
const fmtLoginTime = (t) => {
    if (!t) return "-";
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return t;
    let h = d.getHours();
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${String(h).padStart(2, "0")}:${mm} ${ampm}`;
};

/* ------------------------------------------------------------------
   Fallback dummy data — shaped like DashboardResponse (schema.py).
   Pass real values in via the `data` prop once DashboardService
   is wired up; anything omitted falls back to these.
------------------------------------------------------------------- */


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
    justifyContent: "space-between",
    gap: "8px",
};

/* ------------------------------------------------------------------
   Chart export helpers — dependency-free (no chart/export library).
   Work off the panel's rendered <svg> for images/print/pdf, and off the
   passed rows/columns for CSV/XLS/data-table.
------------------------------------------------------------------- */
const slug = (t) => (t || "chart").replace(/\s+/g, "-").toLowerCase();

function getPanelSvg(node) {
    const panel = node && node.closest("[data-chart-panel]");
    return panel ? panel.querySelector("svg") : null;
}

function serializeSvg(svg) {
    const clone = svg.cloneNode(true);
    const rect = svg.getBoundingClientRect();
    clone.setAttribute("width", rect.width);
    clone.setAttribute("height", rect.height);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const xml = new XMLSerializer().serializeToString(clone);
    return {
        xml: '<?xml version="1.0" encoding="UTF-8"?>\n' + xml,
        width: rect.width,
        height: rect.height,
    };
}

function downloadBlob(data, type, filename) {
    const blob = data instanceof Blob ? data : new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function svgToCanvas(svg) {
    return new Promise((resolve, reject) => {
        const { xml, width, height } = serializeSvg(svg);
        const src =
            "data:image/svg+xml;base64," +
            btoa(unescape(encodeURIComponent(xml)));
        const img = new Image();
        img.onload = () => {
            const scale = 2;
            const canvas = document.createElement("canvas");
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas);
        };
        img.onerror = reject;
        img.src = src;
    });
}

async function downloadRaster(svg, title, type) {
    const canvas = await svgToCanvas(svg);
    const mime = type === "jpeg" ? "image/jpeg" : "image/png";
    const ext = type === "jpeg" ? "jpg" : "png";
    canvas.toBlob(
        (blob) => blob && downloadBlob(blob, mime, `${slug(title)}.${ext}`),
        mime,
        0.95
    );
}

function downloadSvgFile(svg, title) {
    const { xml } = serializeSvg(svg);
    downloadBlob(xml, "image/svg+xml;charset=utf-8", `${slug(title)}.svg`);
}

/* Print / PDF both go through the browser print dialog (choose
   "Save as PDF" to get a PDF file) — no external library needed. */
async function printChart(svg, title) {
    const canvas = await svgToCanvas(svg);
    const dataUrl = canvas.toDataURL("image/png");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
        `<html><head><title>${title}</title>` +
            "<style>html,body{margin:0;height:100%}body{display:flex;align-items:center;justify-content:center}img{max-width:100%;max-height:100%}</style>" +
            "</head><body>" +
            `<img src="${dataUrl}" onload="setTimeout(function(){window.focus();window.print();},200)"/>` +
            "</body></html>"
    );
    w.document.close();
}

function toCsv(columns, rows) {
    const esc = (v) => {
        const s = v == null ? "" : String(v);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const head = columns.map((c) => esc(c.label)).join(",");
    const body = rows
        .map((r) => columns.map((c) => esc(r[c.key])).join(","))
        .join("\n");
    return head + "\n" + body;
}

function toXlsHtml(columns, rows) {
    const th = columns.map((c) => `<th>${c.label}</th>`).join("");
    const trs = rows
        .map(
            (r) =>
                "<tr>" +
                columns
                    .map((c) => `<td>${r[c.key] == null ? "" : r[c.key]}</td>`)
                    .join("") +
                "</tr>"
        )
        .join("");
    return (
        '<html><head><meta charset="utf-8"></head><body>' +
        `<table border="1"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>` +
        "</body></html>"
    );
}

function viewFullScreen(node) {
    const panel = node && node.closest("[data-chart-panel]");
    if (panel && panel.requestFullscreen) panel.requestFullscreen();
}

/* Highcharts-style export/context menu opened from the panel's ☰ icon. */
function ChartExportMenu({ title, rows = [], columns = [], onViewTable }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, right: 0 });
    const wrapRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const onScroll = () => setOpen(false);
        document.addEventListener("mousedown", onDoc);
        window.addEventListener("scroll", onScroll, true);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            window.removeEventListener("scroll", onScroll, true);
        };
    }, [open]);

    const toggle = () => {
        const r = wrapRef.current.getBoundingClientRect();
        setPos({
            top: r.bottom + 6,
            right: Math.max(8, window.innerWidth - r.right),
        });
        setOpen((o) => !o);
    };

    const svg = () => getPanelSvg(wrapRef.current);
    const run = (fn) => {
        setOpen(false);
        try {
            fn();
        } catch (e) {
            // no-op: keep the dashboard stable if an export fails
        }
    };

    const Item = ({ children, onClick, divider }) => (
        <>
            {divider && <div className="my-[4px] h-px bg-[#EDE8F0]" />}
            <button
                type="button"
                onClick={onClick}
                className="block w-full whitespace-nowrap !rounded-none px-[14px] !py-[6px] text-left !text-[13px] !font-normal !leading-[1.25] text-[#2D2235] transition-colors hover:bg-[#F3EEF4]"
            >
                {children}
            </button>
        </>
    );

    return (
        <span
            ref={wrapRef}
            className="absolute right-[14px] top-[10px] z-[3]"
        >
            <button
                type="button"
                onClick={toggle}
                title="Chart menu"
                aria-label="Chart menu"
                className="text-[#8A7D8E] transition-colors hover:text-[#2D2235]"
            >
                <FaBars size={14} />
            </button>

            {open && (
                <div
                    style={{
                        position: "fixed",
                        top: pos.top,
                        right: pos.right,
                        zIndex: 1000,
                        width: 236,
                        maxHeight: "82vh",
                        overflowX: "hidden",
                        overflowY: "auto",
                        fontSize: "13px",
                    }}
                    className="rounded-[8px] border border-[#EDE8F0] bg-white py-[4px] shadow-[0_8px_28px_rgba(45,34,53,0.18)]"
                >
                    <Item onClick={() => run(() => viewFullScreen(wrapRef.current))}>
                        View in full screen
                    </Item>
                    <Item
                        onClick={() =>
                            run(() => {
                                const s = svg();
                                if (s) printChart(s, title);
                            })
                        }
                    >
                        Print chart
                    </Item>

                    <Item
                        divider
                        onClick={() =>
                            run(() => {
                                const s = svg();
                                if (s) downloadRaster(s, title, "png");
                            })
                        }
                    >
                        Download PNG image
                    </Item>
                    <Item
                        onClick={() =>
                            run(() => {
                                const s = svg();
                                if (s) downloadRaster(s, title, "jpeg");
                            })
                        }
                    >
                        Download JPEG image
                    </Item>
                    <Item
                        onClick={() =>
                            run(() => {
                                const s = svg();
                                if (s) printChart(s, title);
                            })
                        }
                    >
                        Download PDF document
                    </Item>
                    <Item
                        onClick={() =>
                            run(() => {
                                const s = svg();
                                if (s) downloadSvgFile(s, title);
                            })
                        }
                    >
                        Download SVG vector image
                    </Item>

                    <Item
                        divider
                        onClick={() =>
                            run(() =>
                                downloadBlob(
                                    "﻿" + toCsv(columns, rows),
                                    "text/csv;charset=utf-8",
                                    `${slug(title)}.csv`
                                )
                            )
                        }
                    >
                        Download CSV
                    </Item>
                    <Item
                        onClick={() =>
                            run(() =>
                                downloadBlob(
                                    toXlsHtml(columns, rows),
                                    "application/vnd.ms-excel",
                                    `${slug(title)}.xls`
                                )
                            )
                        }
                    >
                        Download XLS
                    </Item>

                    <Item
                        divider
                        onClick={() => run(() => onViewTable && onViewTable())}
                    >
                        View data table
                    </Item>
                </div>
            )}
        </span>
    );
}

function ChartPanel({
    title,
    icon = <FaChartPie size={13} />,
    onDetail,
    rows = [],
    columns = [],
    children,
}) {
    return (
        <div style={panelStyle} className="h-full" data-chart-panel>
            <div style={panelHeadStyle}>
                <span className="flex items-center gap-[8px]">
                    <span className="flex items-center justify-center w-[26px] h-[26px] rounded-full bg-white/[0.18]">
                        {icon}
                    </span>
                    <span>{title}</span>
                </span>

                <button
                    type="button"
                    onClick={onDetail}
                    title="View full data"
                    aria-label="View full data"
                    className="rounded-full p-1 text-white/90 transition-colors hover:bg-white/15"
                >
                    <FaInfoCircle size={15} />
                </button>
            </div>

            <div className="relative px-[16px] py-[18px]">
                <ChartExportMenu
                    title={title}
                    rows={rows}
                    columns={columns}
                    onViewTable={onDetail}
                />

                {children}
            </div>
        </div>
    );
}

/* On-chart data label with a coloured leader line (Highcharts-style),
   e.g. "Delhi: 57.6%". `colorFn` maps a slice to its colour so the
   connector matches the slice. */
const RAD = Math.PI / 180;

const makeDonutLabel = (total, colorFn) =>
    function DonutLabel({
        cx,
        cy,
        midAngle,
        outerRadius,
        value,
        name,
        index,
        payload,
    }) {
        const cos = Math.cos(-RAD * midAngle);
        const sin = Math.sin(-RAD * midAngle);

        const sx = cx + (outerRadius + 2) * cos;
        const sy = cy + (outerRadius + 2) * sin;
        const mx = cx + (outerRadius + 14) * cos;
        const my = cy + (outerRadius + 14) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 20;
        const ey = my;

        const anchor = cos >= 0 ? "start" : "end";
        const color = colorFn(index, payload);
        const pctValue = total ? (value / total) * 100 : 0;
        const pct = pctValue.toFixed(1);

        // Skip on-chart labels for tiny slices — their leader lines otherwise
        // pile up and overlap into unreadable text. The value is still on the
        // tooltip and in the detail modal.
        if (!value || pctValue < 2) {
            return null;
        }

        return (
            <g>
                <polyline
                    points={`${sx},${sy} ${mx},${my} ${ex},${ey}`}
                    stroke={color}
                    fill="none"
                    strokeWidth={1}
                />
                <text
                    x={ex + (cos >= 0 ? 4 : -4)}
                    y={ey}
                    textAnchor={anchor}
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight={600}
                    fill={INK}
                >
                    {`${name}: ${pct}%`}
                </text>
            </g>
        );
    };

/* Highcharts-style hover: the hovered slice grows slightly outward. */
function renderActiveDonutShape(props) {
    const {
        cx,
        cy,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
    } = props;
    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={outerRadius + 8}
                outerRadius={outerRadius + 10}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                fillOpacity={0.4}
            />
        </g>
    );
}

/* Donut hover tooltip — "Total: N (X.X%)" like the production dashboard. */
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
                    background: "#2D2235",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
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
                        marginBottom: 3,
                    }}
                >
                    {color && (
                        <span
                            style={{
                                width: 9,
                                height: 9,
                                borderRadius: "50%",
                                background: color,
                                display: "inline-block",
                            }}
                        />
                    )}
                    {p.name}
                </div>
                <div style={{ opacity: 0.85 }}>
                    Total: <strong>{value}</strong> ({pct}%)
                </div>
            </div>
        );
    };
}

/* Bottom legend — coloured dot + label + count, matching the production
   donut charts. Hovering a legend item highlights its slice. */
function DonutLegend({ items, colorFn, onEnter, onLeave, activeIndex }) {
    return (
        <div className="mt-[6px] flex flex-wrap items-center justify-center gap-x-[16px] gap-y-[6px] px-[8px]">
            {items.map((it, i) => (
                <button
                    type="button"
                    key={i}
                    onMouseEnter={() => onEnter && onEnter(i)}
                    onMouseLeave={() => onLeave && onLeave()}
                    className="flex items-center gap-[6px] text-[11px] leading-none transition-opacity"
                    style={{
                        color: INK,
                        opacity:
                            activeIndex === -1 || activeIndex === i ? 1 : 0.45,
                    }}
                >
                    <span
                        style={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: colorFn(i, it),
                            display: "inline-block",
                        }}
                    />
                    <span style={{ fontWeight: 500 }}>{it.name}</span>
                    <span style={{ color: SUB }}>({it.value})</span>
                </button>
            ))}
        </div>
    );
}

function NoData({ height = 230 }) {
    return (
        <div
            className="flex items-center justify-center text-[13px] text-[#8A7D8E]"
            style={{ height }}
        >
            No data available
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
                pointerEvents: "none",
                whiteSpace: "nowrap",
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

    // Detail modal opened by a chart's info icon.
    const [detail, setDetail] = useState(null);

    // Monthly Login Trend opens a dedicated modal (with State/District/Duration
    // filters). `monthlyMonth` holds the clicked month string when open.
    const [monthlyMonth, setMonthlyMonth] = useState(null);

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

    // Hovered slice index per donut (-1 = none) — drives the highlight
    // and the legend dimming.
    const [activeState, setActiveState] = useState(-1);
    const [activeStatus, setActiveStatus] = useState(-1);

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

    // State Wise Trainees drills down to the per-state trainee list when a
    // single donut slice is clicked (mirrors production).
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
        } catch (error) {
            setDetail({ title, loading: false, rows: [], columns });
        }
    };

    // State Wise Trainees — click a donut slice → that state's trainee list.
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
                        <span className="font-semibold text-[#2e9d5b]">
                            Active
                        </span>
                    ) : (
                        <span className="font-semibold text-[#e0524a]">
                            Inactive
                        </span>
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

    // Monthly Login Trend — click a point → open the dedicated modal with
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
        } catch (error) {
            setDetail({ title: "Trainee Status", loading: false, rows: [], columns });
        }
    };

    const statusTotalSum = merged.trainee_status.reduce(
        (s, r) => s + (r.total || 0),
        0
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
            {/* Row 1: State wise trainees / Trainee status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[20px]">
                <ChartPanel
                    title="State Wise Trainees"
                    icon={<FaChartPie size={13} />}
                    onDetail={() =>
                        openAggregate(
                            "State Wise Trainees",
                            merged.state_wise_participants,
                            "state_name",
                            "State",
                            "Trainees"
                        )
                    }
                    rows={merged.state_wise_participants}
                    columns={[
                        { key: "state_name", label: "State" },
                        { key: "total", label: "Trainees" },
                    ]}
                >
                    {merged.state_wise_participants.length === 0 ? (
                        <NoData height={280} />
                    ) : (
                    <>
                    <ResponsiveContainer width="100%" height={330}>
                        <PieChart margin={{ top: 26, bottom: 26, left: 0, right: 0 }}>
                            <Pie
                                data={merged.state_wise_participants}
                                dataKey="total"
                                nameKey="state_name"
                                cx="50%"
                                cy="50%"
                                innerRadius={56}
                                outerRadius={92}
                                paddingAngle={2}
                                labelLine={false}
                                isAnimationActive={false}
                                cursor="pointer"
                                onClick={(_, index) =>
                                    openStateDetail(
                                        merged.state_wise_participants[index]
                                    )
                                }
                                label={makeDonutLabel(
                                    stateWiseTotal,
                                    (i) => DONUT_STATE[i % DONUT_STATE.length]
                                )}
                            >
                                {merged.state_wise_participants.map((_, i) => (
                                    <Cell key={i} fill={DONUT_STATE[i % DONUT_STATE.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={makeDonutTooltip(stateWiseTotal)}
                                isAnimationActive={false}
                                allowEscapeViewBox={{ x: true, y: true }}
                                wrapperStyle={{ pointerEvents: "none", zIndex: 60 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <DonutLegend
                        items={merged.state_wise_participants.map((r) => ({
                            name: r.state_name,
                            value: r.total,
                        }))}
                        colorFn={(i) => DONUT_STATE[i % DONUT_STATE.length]}
                        activeIndex={activeState}
                        onEnter={setActiveState}
                        onLeave={() => setActiveState(-1)}
                    />
                    </>
                    )}
                </ChartPanel>

                <ChartPanel
                    title="Trainee Status"
                    icon={<FaChartPie size={13} />}
                    onDetail={openTraineeStatus}
                    rows={merged.trainee_status}
                    columns={[
                        { key: "label", label: "Status" },
                        { key: "total", label: "Total" },
                    ]}
                >
                    {statusTotalSum === 0 ? (
                        <NoData height={280} />
                    ) : (
                    <>
                    <ResponsiveContainer width="100%" height={330}>
                        <PieChart margin={{ top: 26, bottom: 26, left: 0, right: 0 }}>
                            <Pie
                                data={merged.trainee_status}
                                dataKey="total"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                innerRadius={56}
                                outerRadius={92}
                                paddingAngle={2}
                                labelLine={false}
                                isAnimationActive={false}
                                cursor="pointer"
                                onClick={() => openTraineeStatus()}
                                label={makeDonutLabel(
                                    statusTotal,
                                    (i, p) => DONUT_STATUS[p.status] || DONUT_STATE[i]
                                )}
                            >
                                {merged.trainee_status.map((s, i) => (
                                    <Cell key={i} fill={DONUT_STATUS[s.status] || DONUT_STATE[i]} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={makeDonutTooltip(statusTotal)}
                                isAnimationActive={false}
                                allowEscapeViewBox={{ x: true, y: true }}
                                wrapperStyle={{ pointerEvents: "none", zIndex: 60 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <DonutLegend
                        items={merged.trainee_status.map((s) => ({
                            name: s.label,
                            value: s.total,
                            status: s.status,
                        }))}
                        colorFn={(i, it) => DONUT_STATUS[it.status] || DONUT_STATE[i]}
                        activeIndex={activeStatus}
                        onEnter={setActiveStatus}
                        onLeave={() => setActiveStatus(-1)}
                    />
                    </>
                    )}
                </ChartPanel>
            </div>

            {/* Row 2: State wise centres map / Age group distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[20px]">
                <ChartPanel
                    title="State Wise Centres"
                    icon={<FaMapMarkerAlt size={13} />}
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
                        <NoData height={420} />
                    ) : (
                        <StateWiseCentresMap
                            centres={merged.state_wise_centres}
                            height={420}
                            onStateClick={openCentreDetail}
                        />
                    )}
                </ChartPanel>

                <ChartPanel
                    title="Age Group Distribution"
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
                        <NoData height={350} />
                    ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={merged.age_group_distribution} barSize={70}>
                            <CartesianGrid vertical={false} stroke="#eee" />
                            <XAxis dataKey="age_group" tick={{ fontSize: 11, fill: SUB }} axisLine={{ stroke: "#ddd" }} />
                            <YAxis tick={{ fontSize: 11, fill: SUB }} axisLine={false} tickLine={false} />
                            <Tooltip
                                content={<ChartTooltip />}
                                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                                isAnimationActive={false}
                                allowEscapeViewBox={{ x: true, y: true }}
                                wrapperStyle={{ pointerEvents: "none", zIndex: 60 }}
                            />
                            <Bar
                                dataKey="total"
                                radius={[4, 4, 0, 0]}
                                cursor="pointer"
                                onClick={(_, index) =>
                                    openAgeDetail(
                                        merged.age_group_distribution[index]
                                    )
                                }
                            >
                                {merged.age_group_distribution.map((_, i) => (
                                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    )}
                </ChartPanel>
            </div>

            {/* Row 3: District wise trainees / Monthly login trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
                <ChartPanel
                    title="District Wise Trainees (Top 10)"
                    icon={<FaMapMarkerAlt size={13} />}
                    onDetail={() =>
                        openAggregate(
                            "District Wise Trainees",
                            merged.district_wise_participants,
                            "district_name",
                            "District",
                            "Trainees"
                        )
                    }
                    rows={merged.district_wise_participants}
                    columns={[
                        { key: "district_name", label: "District" },
                        { key: "total", label: "Trainees" },
                    ]}
                >
                    {merged.district_wise_participants.length === 0 ? (
                        <NoData height={250} />
                    ) : (
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
                            <Tooltip
                                content={<ChartTooltip />}
                                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                                isAnimationActive={false}
                                allowEscapeViewBox={{ x: true, y: true }}
                                wrapperStyle={{ pointerEvents: "none", zIndex: 60 }}
                            />
                            <Bar
                                dataKey="total"
                                fill="#e8a23d"
                                radius={[4, 4, 0, 0]}
                                cursor="pointer"
                                onClick={(_, index) =>
                                    openDistrictDetail(
                                        merged.district_wise_participants[index]
                                    )
                                }
                            >
                                <LabelList
                                    dataKey="total"
                                    position="top"
                                    style={{ fontSize: 11, fontWeight: 700, fill: INK }}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    )}
                </ChartPanel>

                <ChartPanel
                    title="Monthly Login Trend"
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
                        <NoData height={250} />
                    ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart
                            data={merged.monthly_login_trend}
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                                const p = e?.activePayload?.[0]?.payload;
                                if (p) openMonthlyDetail(p);
                            }}
                        >
                            <defs>
                                <linearGradient id="loginFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
                                    <stop offset="100%" stopColor={BRAND} stopOpacity={0.03} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#eee" />
                            <XAxis dataKey="month" tickFormatter={fmtMonthLabel} tick={{ fontSize: 11, fill: SUB }} axisLine={{ stroke: "#ddd" }} />
                            <YAxis tick={{ fontSize: 11, fill: SUB }} axisLine={false} tickLine={false} />
                            <Tooltip
                                content={<ChartTooltip unit=" logins" />}
                                isAnimationActive={false}
                                allowEscapeViewBox={{ x: true, y: true }}
                                wrapperStyle={{ pointerEvents: "none", zIndex: 60 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                name="Logins"
                                stroke={BRAND}
                                strokeWidth={2}
                                fill="url(#loginFill)"
                                dot={{
                                    r: 4,
                                    fill: BRAND,
                                    stroke: "#fff",
                                    strokeWidth: 2,
                                    cursor: "pointer",
                                }}
                                activeDot={{
                                    r: 6,
                                    fill: BRAND,
                                    stroke: "#fff",
                                    strokeWidth: 2,
                                    cursor: "pointer",
                                    onClick: (_, payload) =>
                                        openMonthlyDetail(payload?.payload),
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    )}
                </ChartPanel>
            </div>

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