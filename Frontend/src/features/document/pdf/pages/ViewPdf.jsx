import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";

import { getPdf } from "../services/PdfService";
import { toMediaUrl } from "../hook/pdfConstants";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "PDF List", path: "/pdf-masters" },
    { label: "View PDF" },
];

function Field({ label, children }) {
    return (
        <div className="flex flex-col gap-[2px] py-[9px] sm:flex-row sm:items-start sm:gap-4">
            <span className="w-[150px] shrink-0 text-[13px] font-medium text-[#4d5969]">
                {label}
            </span>
            <span className="text-[13px] text-[#3f9d90]">{children}</span>
        </div>
    );
}

export default function ViewPdf() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [pdf, setPdf] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPdf = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getPdf(id);
            setPdf(data);
        } catch (err) {
            setPdf(null);
            setError(
                err?.response?.data?.detail || "Unable to load PDF."
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadPdf();
    }, [loadPdf]);

    const previewUrl = toMediaUrl(pdf?.pdf_url);

    return (
        <AppLayout>

            <div className="mb-3 flex items-center justify-between">
                <span className="text-[20px] font-medium text-[#344050]">
                    PDF Details
                </span>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="w-full rounded-[8px] border border-[#D8E2EF] bg-white p-[20px]">

                {loading ? (
                    <p className="py-[16px] text-[13px] text-[#5e6e82]">
                        Loading PDF...
                    </p>
                ) : error ? (
                    <div className="rounded-[4px] border border-[#F5C2C7] bg-[#FDECEA] p-3 text-[13px] text-[#D74D43]">
                        {error}
                    </div>
                ) : !pdf ? (
                    <p className="py-[16px] text-[13px] text-[#5e6e82]">
                        PDF not found.
                    </p>
                ) : (
                    <>
                        <div className="mb-[12px] flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(`/pdf-masters/edit/${pdf.pdf_id}`)
                            }
                            className="inline-flex h-[32px] items-center rounded-[4px] bg-[#732269] px-[16px] text-[13px] font-medium text-white"
                        >
                            Edit
                        </button>
                        <button type="button" onClick={() => navigate(-1)} className="inline-flex h-[32px] items-center gap-[6px] rounded-[4px] border border-[#344050] bg-white px-[14px] text-[13px] font-medium text-[#344050] hover:bg-[#f8f9fa]">← Back</button>
                        </div>

                        <Field label="PDF ID">{pdf.pdf_id}</Field>
                        <Field label="PDF Name">{pdf.pdf_name || "-"}</Field>
                        <Field label="Description">
                            {pdf.pdf_description || ""}
                        </Field>
                        <Field label="Pdf Language">
                            {pdf.language_name || "-"}
                        </Field>

                        <div className="flex flex-col gap-[2px] py-[9px] sm:flex-row sm:items-start sm:gap-4">
                            <span className="w-[150px] shrink-0 text-[13px] font-medium text-[#4d5969]">
                                PDF Preview
                            </span>
                            <div className="w-full">
                                {previewUrl ? (
                                    <iframe
                                        title="PDF preview"
                                        src={previewUrl}
                                        className="h-[480px] w-full rounded-[4px] border border-[#D8E2EF]"
                                    />
                                ) : (
                                    <span className="text-[13px] text-[#3f9d90]">
                                        No preview available.
                                    </span>
                                )}
                            </div>
                        </div>

                        <Field label="Cloud URL">
                            {pdf.cloud_url ? (
                                <a
                                    href={pdf.cloud_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#732269] underline"
                                >
                                    {pdf.cloud_url}
                                </a>
                            ) : (
                                "Not provided"
                            )}
                        </Field>

                        <Field label="Status">
                            <span
                                className={`rounded px-2 py-[2px] text-[11px] ${
                                    String(pdf.status) === "1"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {String(pdf.status) === "1"
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        </Field>

                        <Field label="Created At">
                            {pdf.created_at || "-"}
                        </Field>
                        <Field label="Updated At">
                            {pdf.updated_at || "-"}
                        </Field>
                    </>
                )}
            </div>

        </AppLayout>
    );
}
