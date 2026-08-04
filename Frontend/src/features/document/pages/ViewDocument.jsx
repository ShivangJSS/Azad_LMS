import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../../components/layout/AppLayout";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";
import { getDocument } from "../services/DocumentServices";

const MEDIA_URL = import.meta.env.VITE_API_URL;

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Documents", path: "/documents" },
    { label: "View" },
];

const MEDIA_FOLDERS = {
    VIDEO: "videos",
    PDF: "pdfs",
    PPT: "ppts",
};

export default function ViewDocument() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDocument = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getDocument(id);

            // The endpoint returns the row directly; the fallbacks cover a
            // wrapped shape in case the response model changes.
            setDoc(response?.document ?? response?.data ?? response);
        } catch (requestError) {
            console.error("View failed:", requestError?.response?.data);

            setError(
                requestError?.response?.data?.detail ||
                "Unable to load document.",
            );
            setDoc(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDocument();
    }, [fetchDocument]);

    /* ==============================
       MEDIA URL
       The API stores a bare filename, so the folder comes from the document
       type and the backend's static mount is prefixed. A <video src> is a
       browser attribute — it does not pass through axios, so it needs the
       absolute URL that axios's baseURL would otherwise supply.
    ============================== */

    const docType = String(doc?.doc_type || "").toUpperCase();
    const folder = MEDIA_FOLDERS[docType];


    const filePath =
        docType === "VIDEO"
            ? doc?.video_url
            : docType === "PDF"
                ? doc?.pdf_url
                : doc?.ppt_url;

    const fileUrl =
        !filePath
            ? null
            : /^https?:\/\//i.test(filePath)
                ? filePath
                : `${MEDIA_URL}/${filePath.replace(/^app\//, "")}`;
    const isActive = String(doc?.status) === "1";

    console.log(doc?.pdf_url);
    console.log(doc?.video_url);

    return (
        <AppLayout>

            {/* ================= HEADER ================= */}

            <div className="mb-[16px] flex items-center justify-between px-3">
                <h1 className="m-0 text-[20px] font-medium text-[#344050]">
                    View Document
                </h1>

                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="px-3">

                {/* ================= LOADING ================= */}

                {loading && (
                    <div className="rounded-[8px] border border-[#D8E2EF] bg-white p-[20px] text-[14px] text-[#5E6E82]">
                        Loading document...
                    </div>
                )}

                {/* ================= ERROR ================= */}

                {!loading && error && (
                    <div className="rounded-[8px] border border-[#F5C2C7] bg-[#FDECEA] p-[16px] text-[14px] text-[#D74D43]">
                        {error}
                    </div>
                )}

                {/* ================= NOT FOUND ================= */}

                {!loading && !error && !doc && (
                    <div className="rounded-[8px] border border-[#D8E2EF] bg-white p-[20px] text-[14px] text-[#5E6E82]">
                        Document not found.
                    </div>
                )}

                {/* ================= CONTENT ================= */}

                {!loading && !error && doc && (
                    <div className="rounded-[8px] border border-[#D8E2EF] bg-white p-[20px]">

                        {/* TITLE + STATUS */}

                        <div className="mb-[20px] flex flex-wrap items-start justify-between gap-[16px] border-b border-[#E3E6ED] pb-[20px]">
                            <div className="flex-1">
                                <h2 className="m-0 text-[18px] font-semibold text-[#344050]">
                                    {doc.doc_title || "Untitled"}
                                </h2>

                                <p className="mt-[8px] mb-0 whitespace-pre-wrap text-[14px] text-[#5E6E82]">
                                    {doc.doc_description ||
                                        "No description provided."}
                                </p>
                            </div>

                            <span
                                className={`rounded-[4px] px-[12px] py-[4px] text-[12px] font-semibold !text-white ${isActive ? "bg-[#00864E]" : "bg-[#E63757]"
                                    }`}
                            >
                                {isActive ? "Active" : "Inactive"}
                            </span>
                        </div>

                        {/* META */}

                        <div className="mb-[24px] grid grid-cols-1 gap-[20px] md:grid-cols-3">
                            <div>
                                <p className="m-0 mb-[6px] text-[13px] text-[#5E6E82]">
                                    Document Type
                                </p>

                                <p className="m-0 text-[14px] font-medium text-[#344050]">
                                    {doc.doc_type || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="m-0 mb-[6px] text-[13px] text-[#5E6E82]">
                                    Language
                                </p>

                                <p className="m-0 text-[14px] font-medium text-[#344050]">
                                    {doc.language_name || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="m-0 mb-[6px] text-[13px] text-[#5E6E82]">
                                    Module
                                </p>

                                <p className="m-0 text-[14px] font-medium text-[#344050]">
                                    {doc.module_name || "-"}
                                </p>
                            </div>
                        </div>

                        {/* MEDIA */}

                        <div>
                            <p className="mb-[10px] text-[13px] text-[#5E6E82]">
                                Document {doc.doc_type || "File"}
                            </p>

                            {!fileUrl && (
                                <p className="m-0 text-[14px] text-[#9DA9BB]">
                                    No media file is attached.
                                </p>
                            )}

                            {fileUrl && docType === "VIDEO" && (
                                <video
                                    controls
                                    preload="metadata"
                                    src={fileUrl}
                                    className="w-full max-w-[640px] rounded-[6px] border border-[#D8E2EF] bg-black"
                                >
                                    Your browser does not support video playback.
                                </video>
                            )}

                            {fileUrl && docType === "PDF" && (
                                <iframe
                                    src={fileUrl}
                                    title={doc.doc_title || "Document PDF"}
                                    className="h-[600px] w-full max-w-[860px] rounded-[6px] border border-[#D8E2EF]"
                                />
                            )}

                            {/* PDFs get a fallback link; PPTs cannot render
                                inline at all, so a download is the only option. */}
                            {fileUrl && docType !== "VIDEO" && (
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-[12px] inline-flex h-[36px] items-center rounded-[6px] bg-[#7b216f] px-[20px] text-[14px] font-medium !text-white no-underline hover:opacity-90"
                                >
                                    {docType === "PDF"
                                        ? "Open in new tab"
                                        : `Download ${docType}`}
                                </a>
                            )}
                        </div>

                        {/* ACTIONS */}

                        <div className="mt-[26px] flex justify-end gap-[12px] border-t border-[#E3E6ED] pt-[20px]">
                            <button
                                type="button"
                                onClick={() => navigate("/documents")}
                                className="h-[38px] rounded-[6px] border border-[#D8E2EF] bg-white px-[24px] text-[14px] text-[#344050] hover:bg-gray-50"
                            >
                                Back to Documents
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(`/documents/edit/${id}`)}
                                className="h-[38px] rounded-[6px] bg-[#7b216f] px-[24px] text-[14px] font-medium !text-white hover:opacity-90"
                            >
                                Edit Document
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}