import { useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

import { exportDocuments } from "@/features/document/services/DocumentServices";

const PAGINATION_KEYS = new Set([
    "page",
    "page_size",
    "per_page",
    "limit",
    "offset",
]);

const cleanExportParams = (params) =>
    Object.fromEntries(
        Object.entries(params || {}).filter(([key, value]) => {
            if (PAGINATION_KEYS.has(key)) return false;
            if (value === undefined || value === null) return false;
            if (typeof value === "string" && value.trim() === "") return false;
            if (Array.isArray(value) && value.length === 0) return false;
            return true;
        })
    );

const normaliseCell = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === "null" ||
        value === "undefined"
    ) {
        return "";
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return value;
};

const getExportFilename = (filename) => {
    const baseName = String(filename || "export")
        .trim()
        .replace(/\.(csv|xls|xlsx)$/i, "");

    return `${baseName || "export"}.xlsx`;
};

const isXlsxBlob = (blob) =>
    blob.type.includes("spreadsheet") || blob.type.includes("excel");

export default function ExportButton({
    exportFunction,
    params = {},
    filename = "documents.xlsx",
    sheetName = "Data",
}) {
    const [busy, setBusy] = useState(false);

    const handleExport = async () => {
        setBusy(true);

        try {
            const runExport = exportFunction || exportDocuments;

            // API se CSV Blob
            const blob = await runExport(cleanExportParams(params));

            if (!(blob instanceof Blob)) {
                throw new Error("Export API did not return a Blob.");
            }

            let workbook;

            if (isXlsxBlob(blob)) {
                const buffer = await blob.arrayBuffer();
                if (!buffer.byteLength) {
                    throw new Error("Export returned empty data.");
                }

                workbook = XLSX.read(buffer, {
                    type: "array",
                    cellDates: true,
                });
            } else {
                const csvText = await blob.text();

                if (!csvText.trim()) {
                    throw new Error("Export returned empty data.");
                }

                workbook = XLSX.read(csvText.replace(/^\uFEFF/, ""), {
                    type: "string",
                    raw: false,
                    cellDates: true,
                });
            }

            if (!workbook.SheetNames.length) {
                throw new Error("No worksheet found.");
            }

            const sourceSheet = workbook.Sheets[workbook.SheetNames[0]];

            // CSV ko rows mein convert karo
            const rows = XLSX.utils.sheet_to_json(sourceSheet, {
                header: 1,
                defval: "",
                raw: false,
            });

            if (rows.length < 2) {
                throw new Error("No data found in export.");
            }

            // Header
            const headers = rows[0].map((header) =>
                String(header ?? "").trim()
            );

            // Data
            const data = rows.slice(1).map((row) =>
                headers.map((_, index) => {
                    const value = row[index];

                    return normaliseCell(value);
                })
            );

            // New clean worksheet
            const worksheet = XLSX.utils.aoa_to_sheet([
                headers,
                ...data,
            ]);

            /*
             * Auto column width
             *
             * Har table ke columns automatically calculate honge.
             */
            worksheet["!cols"] = headers.map((header, columnIndex) => {
                let maxLength = String(header).length;

                data.forEach((row) => {
                    const value = row[columnIndex];

                    maxLength = Math.max(
                        maxLength,
                        String(normaliseCell(value)).length
                    );
                });

                return {
                    wch: Math.min(
                        Math.max(maxLength + 2, 10),
                        50
                    ),
                };
            });

            /*
             * Freeze first row
             */
            worksheet["!freeze"] = {
                xSplit: 0,
                ySplit: 1,
            };

            /*
             * Enable Excel filter
             */
            if (headers.length && data.length) {
                const lastColumn = XLSX.utils.encode_col(
                    headers.length - 1
                );

                const lastRow = data.length + 1;

                worksheet["!autofilter"] = {
                    ref: `A1:${lastColumn}${lastRow}`,
                };
            }

            /*
             * Header styling
             */
            headers.forEach((_, index) => {
                const cell = XLSX.utils.encode_cell({
                    r: 0,
                    c: index,
                });

                if (worksheet[cell]) {
                    worksheet[cell].s = {
                        font: {
                            bold: true,
                        },
                        alignment: {
                            horizontal: "center",
                            vertical: "center",
                        },
                    };
                }
            });

            /*
             * Workbook create
             */
            const outputWorkbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                outputWorkbook,
                worksheet,
                sheetName.substring(0, 31)
            );

            /*
             * Filename always .xlsx
             */
            const finalFilename = getExportFilename(filename);

            /*
             * Download
             */
            XLSX.writeFile(
                outputWorkbook,
                finalFilename,
                {
                    bookType: "xlsx",
                    compression: true,
                }
            );
        } catch (error) {
            console.error("Export Error:", error);
            toast.error(
                error?.response?.data?.detail ||
                    error?.message ||
                    "Unable to export data."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleExport}
            disabled={busy}
            className="inline-flex h-[36px] items-center gap-[8px] rounded-[8px] border border-[#732269] bg-white px-[16px] text-[14px] font-medium text-[#732269] hover:bg-[#F7F0F5] disabled:cursor-not-allowed disabled:opacity-50"
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
