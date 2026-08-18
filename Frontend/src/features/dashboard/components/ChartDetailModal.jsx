import { FiX, FiDownload } from "react-icons/fi";

const PURPLE = "#6B2D5B";

/* Generic detail modal for a dashboard chart.
   - title:   modal heading
   - columns: [{ key, label, render?(row, index) }]
   - rows:    array of records
   - loading: shows a loading row
   - onClose: close handler
   Renders the table, a "Showing X of Y records" footer, Export (CSV) and
   Close — matching the production chart drill-down. */
export default function ChartDetailModal({
    title,
    columns = [],
    rows = [],
    loading = false,
    onClose,
    headerControls = null,
}) {
    const handleExport = () => {
        const header = columns.map((c) => `"${c.label}"`).join(",");
        const body = rows
            .map((row, index) =>
                columns
                    .map((c) => {
                        const value = c.render
                            ? c.render(row, index)
                            : row[c.key];
                        const text =
                            value === null || value === undefined ? "" : String(value);
                        return `"${text.replace(/"/g, '""')}"`;
                    })
                    .join(",")
            )
            .join("\n");

        const csv = `${header}\n${body}`;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const th =
        "px-4 py-3 text-left text-[13px] font-semibold text-white whitespace-nowrap";
    const td =
        "px-4 py-3 text-[13px] text-[#344050] border-b border-[#EEF0F3] align-top";

    return (
        <div className="fixed inset-0 z-[1100] overflow-y-auto bg-black/40">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-6xl rounded-[8px] bg-white shadow-xl">
                    {/* Header */}
                    <div
                        className="flex items-center justify-between rounded-t-[8px] px-6 py-3"
                        style={{ backgroundColor: PURPLE }}
                    >
                        <div className="text-[20px] font-semibold text-white">
                            {title}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full p-1 text-white/90 hover:bg-white/15"
                            aria-label="Close"
                        >
                            <FiX size={22} />
                        </button>
                    </div>

                    {/* Table */}
                    <div className="p-4">
                        {headerControls && (
                            <div className="mb-4">{headerControls}</div>
                        )}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-4 py-24">
                                <span className="h-12 w-12 animate-spin rounded-full border-4 border-[#E7D5E3] border-t-[#6B2D5B]" />
                                <span className="text-[15px] font-medium text-[#6B2D5B]">
                                    Loading detailed data…
                                </span>
                            </div>
                        ) : (
                        <div className="overflow-hidden rounded-[6px] border border-[#E3E6ED]">
                            <div className="max-h-[60vh] overflow-auto">
                                <div className="overflow-x-auto"><table className="w-full border-collapse">
                                    <thead className="sticky top-0">
                                        <tr style={{ backgroundColor: PURPLE }}>
                                            <th className={th}>#</th>
                                            {columns.map((c) => (
                                                <th key={c.key} className={th}>
                                                    {c.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading && (
                                            <tr>
                                                <td
                                                    className={`${td} text-center text-[#8A94A6]`}
                                                    colSpan={columns.length + 1}
                                                >
                                                    Loading...
                                                </td>
                                            </tr>
                                        )}

                                        {!loading && rows.length === 0 && (
                                            <tr>
                                                <td
                                                    className={`${td} text-center text-[#8A94A6]`}
                                                    colSpan={columns.length + 1}
                                                >
                                                    No records found.
                                                </td>
                                            </tr>
                                        )}

                                        {!loading &&
                                            rows.map((row, index) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-[#FAFBFD]"
                                                >
                                                    <td className={td}>{index + 1}</td>
                                                    {columns.map((c) => (
                                                        <td key={c.key} className={td}>
                                                            {c.render
                                                                ? c.render(row, index)
                                                                : row[c.key] ?? "-"}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table></div>
                            </div>
                        </div>
                        )}

                        {/* Footer */}
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-[13px] text-[#5E6E82]">
                                {loading
                                    ? "Loading..."
                                    : `Showing ${rows.length} of ${rows.length} records`}
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleExport}
                                    disabled={loading || rows.length === 0}
                                    className="inline-flex items-center gap-2 rounded-[4px] border border-[#6B2D5B] px-4 py-2 text-[13px] font-medium text-[#6B2D5B] hover:bg-[#F7F0F5] disabled:opacity-50"
                                >
                                    <FiDownload size={15} />
                                    Export
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-[4px] border border-[#E3E6ED] px-5 py-2 text-[13px] font-medium text-[#344050] hover:bg-[#F7F8FA]"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
