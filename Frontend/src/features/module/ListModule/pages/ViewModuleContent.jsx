import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import LanguageTabs from "../../../../shared/components/language/LanguageTabs";
import DataTable from "../../../../shared/components/table/DataTable";
import { getLanguageByKey } from "../../../../shared/constants/languageConstants";

import { getDocument } from "../../../document/services/DocumentServices";
import {
    getMainContentList,
    deactivateMainContent,
    activateMainContent,
} from "../services/ConfigurationService";

const MEDIA_URL = import.meta.env.VITE_API_URL;

/* Prefix a stored relative media path with the API host. */
const toMediaUrl = (path) => {
    if (!path || typeof path !== "string") return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${MEDIA_URL}/${path.replace(/^app\//, "").replace(/^\/+/, "")}`;
};

const CONTENT_COLUMNS = [
    { key: "sr", title: "Sr No", className: "text-center" },
    { key: "document", title: "Document" },
    { key: "content_type", title: "Content Type" },
    { key: "language", title: "Language", className: "text-center" },
    { key: "status", title: "Status", className: "text-center" },
    { key: "action", title: "Action", className: "text-center" },
];

export default function ViewModuleContent() {
    const { moduleId, docId } = useParams();
    const navigate = useNavigate();

    /* ================= LANGUAGE ================= */

    const [languageKey, setLanguageKey] = useState("english");
    const language = getLanguageByKey(languageKey);
    const languageId = language?.id;

    /* ================= DOCUMENT DETAILS ================= */

    const [doc, setDoc] = useState(null);
    const [docLoading, setDocLoading] = useState(true);
    const [docError, setDocError] = useState("");

    const loadDocument = useCallback(async () => {
        if (!docId) return;

        setDocLoading(true);
        setDocError("");

        try {
            const res = await getDocument(docId);
            setDoc(res?.document ?? res?.data ?? res ?? null);
        } catch (error) {
            setDoc(null);
            setDocError(
                error?.response?.data?.detail ||
                "Unable to load content."
            );
        } finally {
            setDocLoading(false);
        }
    }, [docId]);

    useEffect(() => {
        loadDocument();
    }, [loadDocument]);

    /* ================= MODULE CONTENT LIST ================= */

    const [rows, setRows] = useState([]);
    const [listLoading, setListLoading] = useState(false);

    const loadList = useCallback(async () => {
        if (!moduleId) return;

        try {
            setListLoading(true);
            const data = await getMainContentList(moduleId, languageId);
            setRows(Array.isArray(data) ? data : []);
        } catch (error) {
            setRows([]);
        } finally {
            setListLoading(false);
        }
    }, [moduleId, languageId]);

    useEffect(() => {
        loadList();
    }, [loadList]);

    const handleToggle = async (row) => {
        const isActive = String(row.is_active) === "1";

        const confirmed = window.confirm(
            `${isActive ? "Deactivate" : "Activate"} "${row.doc_title}"?`
        );
        if (!confirmed) return;

        try {
            if (isActive) {
                await deactivateMainContent(row.self_paced_learning_id);
                toast.success("Content deactivated.");
            } else {
                await activateMainContent(row.self_paced_learning_id);
                toast.success("Content activated.");
            }
            loadList();
        } catch (error) {
            toast.error(
                error?.response?.data?.detail ||
                "Unable to update content."
            );
        }
    };

    /* ================= DERIVED ================= */

    const docType = String(doc?.doc_type || "").toUpperCase();

    const pdfUrl = toMediaUrl(doc?.pdf_url || doc?.pdf_cloud_url);
    const videoUrl = toMediaUrl(doc?.video_url);
    const youtubeUrl = doc?.youtube_url || "";
    const pptUrl = toMediaUrl(doc?.ppt_url || doc?.ppt_cloud_url);

    const breadcrumbItems = [
        { label: "Home", path: "/dashboard" },
        { label: "Modules", path: "/modules" },
        {
            label: "Configuration",
            path: `/module-master/configure/${moduleId}`,
        },
        { label: "View Content" },
    ];

    const DetailRow = ({ label, value }) => (
        <div className="flex flex-col gap-[2px] border-b border-[#eef0f3] py-[10px] sm:flex-row sm:gap-4">
            <span className="w-[160px] shrink-0 text-[13px] font-medium text-[#5e6e82]">
                {label}
            </span>
            <span className="text-[13px] text-[#344050]">{value || "-"}</span>
        </div>
    );

    return (
        <AppLayout>

            {/* ================= HEADER ================= */}

            <div className="mb-3 flex items-center justify-between">
                <span className="text-[20px] font-medium text-[#344050]">
                    View Content
                </span>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            {/* ================= LANGUAGE TABS ================= */}

            <LanguageTabs activeTab={languageKey} onChange={setLanguageKey} />

            {/* ================= DETAILS CARD ================= */}

            <div className="mb-[24px] rounded-b-[6px] border border-t-0 border-[#D8E2EF] bg-white p-[18px]">

                {docLoading ? (
                    <p className="py-[16px] text-[13px] text-[#5e6e82]">
                        Loading content...
                    </p>
                ) : docError ? (
                    <div className="rounded-[4px] border border-[#F5C2C7] bg-[#FDECEA] p-3 text-[13px] text-[#D74D43]">
                        {docError}
                    </div>
                ) : !doc ? (
                    <p className="py-[16px] text-[13px] text-[#5e6e82]">
                        Content not found.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-2">

                        {/* DETAILS */}
                        <div>
                            <DetailRow label="Title" value={doc.doc_title} />
                            <DetailRow label="Description" value={doc.doc_description} />
                            <DetailRow label="Content Type" value={doc.doc_type} />
                            <DetailRow label="Language" value={doc.language_name} />
                            <DetailRow
                                label="Status"
                                value={
                                    <span
                                        className={`rounded px-2 py-[2px] text-[11px] ${
                                            String(doc.status) === "1"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {String(doc.status) === "1" ? "Active" : "Inactive"}
                                    </span>
                                }
                            />
                            <DetailRow label="Created At" value={doc.created_at} />
                            <DetailRow label="Updated At" value={doc.updated_at} />
                        </div>

                        {/* PREVIEW */}
                        <div>
                            <p className="mb-[8px] text-[13px] font-medium text-[#5e6e82]">
                                Preview
                            </p>

                            {docType === "PDF" && pdfUrl ? (
                                <iframe
                                    title="PDF preview"
                                    src={pdfUrl}
                                    className="h-[420px] w-full rounded-[4px] border border-[#D8E2EF]"
                                />
                            ) : docType === "VIDEO" && (youtubeUrl || videoUrl) ? (
                                youtubeUrl ? (
                                    <iframe
                                        title="Video preview"
                                        src={youtubeUrl.replace("watch?v=", "embed/")}
                                        className="h-[320px] w-full rounded-[4px] border border-[#D8E2EF]"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video
                                        src={videoUrl}
                                        controls
                                        className="h-[320px] w-full rounded-[4px] border border-[#D8E2EF]"
                                    />
                                )
                            ) : pptUrl ? (
                                <a
                                    href={pptUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex h-[36px] items-center rounded-[4px] bg-[#732269] px-[16px] text-[13px] font-medium text-white"
                                >
                                    Open Presentation
                                </a>
                            ) : (
                                <p className="text-[13px] text-[#5e6e82]">
                                    Preview not available for this content type.
                                </p>
                            )}
                        </div>

                    </div>
                )}
            </div>

            {/* ================= MODULE CONTENT LIST ================= */}

            <div className="rounded-t-[4px] bg-[#732269] px-[16px] py-[10px]">
                <span className="text-[14px] font-semibold text-white">
                    Content in this Module
                </span>
            </div>

            <div className="rounded-b-[4px] border border-t-0 border-[#e3d3e0] bg-white p-[14px]">
                <DataTable
                    columns={CONTENT_COLUMNS}
                    data={rows}
                    loading={listLoading}
                    emptyMessage="No data available in table"
                    renderRow={(row, index) => {
                        const isCurrent =
                            String(row.doc_id) === String(docId);

                        return (
                            <tr
                                key={row.self_paced_learning_id}
                                className={isCurrent ? "bg-[#f7edf5]" : ""}
                            >
                                <td className="border px-2 py-3 text-center">
                                    {index + 1}
                                </td>
                                <td className="border px-2 py-3">
                                    {row.doc_title || "-"}
                                </td>
                                <td className="border px-2 py-3">
                                    {row.doc_type || "-"}
                                </td>
                                <td className="border px-2 py-3 text-center">
                                    {row.language_name || "-"}
                                </td>
                                <td className="border px-2 py-3 text-center">
                                    <span
                                        className={`rounded px-2 py-1 text-xs ${
                                            String(row.is_active) === "1"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {String(row.is_active) === "1"
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </td>
                                <td className="border px-2 py-3">
                                    <div className="flex items-center justify-center gap-[8px]">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/module-master/configure/${moduleId}/content/${row.doc_id}`
                                                )
                                            }
                                            className="h-[30px] rounded-[4px] border border-[#732269] bg-white px-[12px] text-[12px] font-medium text-[#732269] hover:bg-[#f7edf5]"
                                        >
                                            View
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(row)}
                                            className={`h-[30px] rounded-[4px] px-[14px] text-[12px] font-medium text-white ${
                                                String(row.is_active) === "1"
                                                    ? "bg-[#732269] hover:bg-[#611c58]"
                                                    : "bg-[#2E7D32] hover:bg-[#256628]"
                                            }`}
                                        >
                                            {String(row.is_active) === "1"
                                                ? "Deactivate"
                                                : "Activate"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    }}
                />
            </div>

            {/* ================= BACK ================= */}

            <div className="mt-[16px]">
                <button
                    type="button"
                    onClick={() =>
                        navigate(`/module-master/configure/${moduleId}`)
                    }
                    className="inline-flex h-[38px] items-center gap-[8px] rounded-[4px] border border-[#344050] bg-white px-[16px] text-[14px] font-medium text-[#344050] hover:bg-[#f8f9fa]"
                >
                    <FiArrowLeft size={16} />
                    Back to Configuration
                </button>
            </div>

        </AppLayout>
    );
}
