import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../components/layout/AppLayout";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";

import DocumentForm from "../components/Documentform";
import { getMediaUrl } from "../../../shared/utils/mediaUrl";
import {
    getDocument,
    getDocumentCategories,
    getLanguages,
    updateDocument,
} from "../services/DocumentServices";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Documents", path: "/documents" },
    { label: "Edit Document" },
];

const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const errorMessage = (error, fallback) => {
    const detail = error?.response?.data?.detail;

    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
        return (
            detail
                .map((item) => item?.msg)
                .filter(Boolean)
                .join(", ") || fallback
        );

    return fallback;
};

/* The stored doc_type may arrive in any casing (e.g. "Video", "VIDEO").
   Normalise it to exactly match the <DocumentForm> option values so the
   Document Type dropdown pre-selects correctly. */
const normalizeDocType = (value) => {
    const upper = String(value || "").toUpperCase();
    if (upper === "VIDEO") return "Video";
    if (upper === "PDF") return "PDF";
    if (upper === "PPT") return "PPT";
    return value || "";
};

export default function EditDocuments() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [languages, setLanguages] = useState([]);
    const [categories, setCategories] = useState([]);

    const [doc, setDoc] = useState(null);
    const [defaultValues, setDefaultValues] = useState(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    /* ---------------- Languages ---------------- */

    useEffect(() => {
        getLanguages()
            .then((items) => setLanguages(toArray(items)))
            .catch((requestError) => {
                console.error(
                    "Language API Error:",
                    requestError?.response?.data ?? requestError,
                );
                toast.error(
                    errorMessage(requestError, "Unable to load languages."),
                );
            });
    }, []);

    /* ---------------- Existing document ----------------
       Pre-fills the form straight from live data (real category id,
       language id and doc type) so every field is populated on open. */

    useEffect(() => {
        let active = true;

        (async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getDocument(id);
                const data =
                    response?.document ?? response?.data ?? response ?? null;

                if (!active) return;

                setDoc(data);
                setDefaultValues({
                    doc_title: data?.doc_title ?? "",
                    doc_description: data?.doc_description ?? "",
                    doc_category_id: data?.doc_category_id ?? "",
                    doc_type: normalizeDocType(data?.doc_type),
                    status: data?.status ?? "",
                    language_id: data?.language_id ?? "",
                });
            } catch (requestError) {
                if (!active) return;
                console.error(
                    "Fetch document failed:",
                    requestError?.response?.data ?? requestError,
                );
                setError(
                    errorMessage(requestError, "Unable to load document."),
                );
                setDoc(null);
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [id]);

    /* ---------------- Categories (per language) ---------------- */

    const handleLanguageChange = useCallback(async (languageId) => {
        try {
            const items = await getDocumentCategories(languageId);
            setCategories(toArray(items));
        } catch (requestError) {
            console.error(
                "Category API Error:",
                requestError?.response?.data ?? requestError,
            );
            setCategories([]);
        }
    }, []);

    /* ---------------- Update ---------------- */

    const handleSubmit = useCallback(
        async (payload) => {
            setSubmitting(true);

            try {
                await updateDocument(id, payload);
                toast.success("Document updated successfully.");
                navigate("/documents");
            } catch (requestError) {
                console.error(
                    "Update failed:",
                    requestError?.response?.data ?? requestError,
                );
                toast.error(
                    errorMessage(requestError, "Unable to update document."),
                );
            } finally {
                setSubmitting(false);
            }
        },
        [id, navigate],
    );

    /* ---------------- Current file (for inline preview) ---------------- */

    const docType = String(doc?.doc_type || "").toUpperCase();

    const existingFilePath =
        docType === "VIDEO"
            ? doc?.video_url
            : docType === "PDF"
              ? doc?.pdf_url
              : doc?.ppt_url;

    const existingFileUrl = getMediaUrl(existingFilePath);

    return (
        <AppLayout>
            <div className="mb-[16px] flex items-center justify-between px-3">
                <span className="m-0 text-[20px] font-medium text-[#344050]">
                    Edit Document
                </span>

                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="px-3">
                {loading && (
                    <div className="rounded-[8px] border border-[#D8E2EF] bg-white p-[20px] text-[14px] text-[#5E6E82]">
                        Loading document...
                    </div>
                )}

                {!loading && error && !doc && (
                    <div className="rounded-[8px] border border-[#F5C2C7] bg-[#FDECEA] p-[16px] text-[14px] text-[#D74D43]">
                        {error}
                    </div>
                )}

                {!loading && doc && defaultValues && (
                    <DocumentForm
                        mode="edit"
                        defaultValues={defaultValues}
                        languages={languages}
                        categories={categories}
                        submitting={submitting}
                        existingFileUrl={existingFileUrl}
                        existingDocType={docType}
                        onLanguageChange={handleLanguageChange}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate("/documents")}
                    />
                )}
            </div>
        </AppLayout>
    );
}
