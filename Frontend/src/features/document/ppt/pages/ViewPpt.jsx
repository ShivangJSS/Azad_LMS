import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiDownload } from "react-icons/fi";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";

import { getPpt } from "../services/PptService";
import { toMediaUrl } from "../hook/pptConstants";
import PptViewer from "../../../../shared/components/PptViewer";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "PPT List", path: "/ppt-masters" },
    { label: "View PPT" },
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

export default function ViewPpt() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ppt, setPpt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPpt = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getPpt(id);
            setPpt(data);
        } catch (err) {
            setPpt(null);
            setError(err?.response?.data?.detail || "Unable to load PPT.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadPpt();
    }, [loadPpt]);

    const fileUrl = toMediaUrl(ppt?.ppt_url);

    return (
        <AppLayout>

            <div className="mb-3 flex items-center justify-between">
                <span className="text-[20px] font-medium text-[#344050]">
                    PPT Details
                </span>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="w-full rounded-[8px] border border-[#D8E2EF] bg-white p-[20px]">

                {loading ? (
                    <p className="py-[16px] text-[13px] text-[#5e6e82]">
                        Loading PPT...
                    </p>
                ) : error ? (
                    <div className="rounded-[4px] border border-[#F5C2C7] bg-[#FDECEA] p-3 text-[13px] text-[#D74D43]">
                        {error}
                    </div>
                ) : !ppt ? (
                    <p className="py-[16px] text-[13px] text-[#5e6e82]">
                        PPT not found.
                    </p>
                ) : (
                    <>
                        <div className="mb-[12px] flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(`/ppt-masters/edit/${ppt.ppt_id}`)
                            }
                            className="inline-flex h-[32px] items-center rounded-[4px] bg-[#732269] px-[16px] text-[13px] font-medium text-white"
                        >
                            Edit
                        </button>
                        <button type="button" onClick={() => navigate(-1)} className="inline-flex h-[32px] items-center gap-[6px] rounded-[4px] border border-[#344050] bg-white px-[14px] text-[13px] font-medium text-[#344050] hover:bg-[#f8f9fa]">← Back</button>
                        </div>

                        <Field label="PPT ID">{ppt.ppt_id}</Field>
                        <Field label="PPT Name">{ppt.ppt_name || "-"}</Field>
                        <Field label="Description">
                            {ppt.ppt_description || ""}
                        </Field>
                        <Field label="Ppt Language">
                            {ppt.language_name || "-"}
                        </Field>

                        <div className="flex flex-col gap-[2px] py-[9px] sm:flex-row sm:items-start sm:gap-4">
                            <span className="w-[300px] shrink-0 text-[13px] font-medium text-[#4d5969]">
                                PPT Preview
                            </span>
                            <div className="w-full">
                                {fileUrl ? (
                                    <>
                                        <PptViewer fileUrl={fileUrl} />
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            download
                                            className="mt-[10px] inline-flex h-[34px] items-center gap-[8px] rounded-[4px] bg-[#732269] px-[16px] text-[13px] font-medium !text-white no-underline"
                                        >
                                            <FiDownload size={14} />
                                            Download File
                                        </a>
                                    </>
                                ) : (
                                    <span className="text-[13px] text-[#3f9d90]">
                                        No file available.
                                    </span>
                                )}
                            </div>
                        </div>

                        <Field label="Cloud URL">
                            {ppt.cloud_url ? (
                                <a
                                    href={ppt.cloud_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#732269] underline"
                                >
                                    {ppt.cloud_url}
                                </a>
                            ) : (
                                "Not provided"
                            )}
                        </Field>

                        <Field label="Status">
                            <span
                                className={`rounded px-2 py-[2px] text-[11px] ${
                                    String(ppt.status) === "1"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {String(ppt.status) === "1"
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        </Field>

                        <Field label="Created At">{ppt.created_at || "-"}</Field>
                        <Field label="Updated At">{ppt.updated_at || "-"}</Field>
                    </>
                )}
            </div>

        </AppLayout>
    );
}
