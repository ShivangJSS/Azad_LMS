/*
 * "Export Report" — builds a CSV from the dashboard payload that is already
 * loaded in the browser. No extra API call, no library, and no invented
 * values: every row comes from the /dashboard response currently on screen.
 */

const esc = (value) => {
    const s = value == null ? "" : String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const section = (lines, title, columns, rows, pick) => {
    if (!Array.isArray(rows) || rows.length === 0) return;
    lines.push("");
    lines.push(esc(title));
    lines.push(columns.map(esc).join(","));
    rows.forEach((row) => lines.push(pick(row).map(esc).join(",")));
};

function buildDashboardReportCsv(data = {}, filters = {}) {
    const summary = data.summary || {};
    const lines = [];

    lines.push("Azad LMS — Dashboard Report");
    lines.push(`Generated,${esc(new Date().toLocaleString())}`);

    const applied = Object.entries(filters).filter(([, v]) => v);
    lines.push(
        `Filters,${esc(
            applied.length
                ? applied.map(([k, v]) => `${k}=${v}`).join(" | ")
                : "None (all data)"
        )}`
    );

    lines.push("");
    lines.push("Summary");
    lines.push("Metric,Value");
    [
        ["Centres", summary.total_centres],
        ["Trainees", summary.total_participants],
        ["Modules", summary.total_modules],
        ["Batches", summary.total_batches],
        ["Documents", summary.total_documents],
    ].forEach(([label, value]) => lines.push(`${esc(label)},${esc(value ?? 0)}`));

    section(lines, "State Wise Trainees", ["State", "Trainees"],
        data.state_wise_participants, (r) => [r.state_name, r.total]);

    section(lines, "Trainee Status", ["Status", "Trainees"],
        data.trainee_status, (r) => [r.label, r.total]);

    section(lines, "State Wise Centres", ["State", "Centres"],
        data.state_wise_centres, (r) => [r.state_name, r.total]);

    section(lines, "District Wise Trainees", ["District", "Trainees"],
        data.district_wise_participants, (r) => [r.district_name, r.total]);

    section(lines, "Age Group Distribution", ["Age Group", "Trainees"],
        data.age_group_distribution, (r) => [r.age_group, r.total]);

    section(lines, "Monthly Login Trend", ["Month", "Logins"],
        data.monthly_login_trend, (r) => [r.month, r.total]);

    return lines.join("\n");
}

export function downloadDashboardReport(data, filters) {
    const csv = "﻿" + buildDashboardReportCsv(data, filters);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
