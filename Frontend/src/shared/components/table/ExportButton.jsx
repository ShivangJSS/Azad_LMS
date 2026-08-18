import { useState } from "react";

import { exportDocuments } from "../../../features/document/services/DocumentServices";

export default function ExportButton({
    exportFunction,
    params = {},
    filename = "documents.xlsx",
}) {
    const [busy, setBusy] = useState(false);

    const handleExport = async () => {
        setBusy(true);

        try {
            // Use the caller-provided export function when given, otherwise
            // fall back to the document export (preserves existing usage).
            const runExport = exportFunction || exportDocuments;
            const blob = await runExport(params);

            // Create a temporary object URL, click it, then release it —
            // leaving the URL alive holds the whole blob in memory.
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export Error:", error?.response?.data ?? error);
            alert("Unable to export data.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleExport}
            disabled={busy}
            className="inline-flex h-[34px] items-center gap-[6px] rounded-sm border border-[#D8E2EF] bg-white px-[14px] text-[14px] text-[#344050] hover:bg-gray-50 disabled:opacity-50"
        >
            <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M8 1.5v8m0 0L5 6.5m3 3 3-3" />
                <path d="M2 11v2.5h12V11" />
            </svg>

            {busy ? "Exporting..." : "Export"}
        </button>
    );
}