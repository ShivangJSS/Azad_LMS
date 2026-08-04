import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../components/layout/AppLayout";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";

import DocumentForm from "../components/DocumentForm";
import {createDocument,getDocumentCategories,getLanguages} from "../services/DocumentServices";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Documents", path: "/documents" },
    { label: "Add Document" },
];

const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const errorMessage = (error, fallback) => {
    const detail = error?.response?.data?.detail;

    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((item) => item?.msg).filter(Boolean).join(", ") || fallback;

    return fallback;
};

export default function CreateDocument() {
    const navigate = useNavigate();

    const [languages, setLanguages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getLanguages()
            .then((items) => setLanguages(toArray(items)))
            .catch((error) => {
                console.error("Language API Error:", error?.response?.data ?? error);
                toast.error(errorMessage(error, "Unable to load languages."));
            });
    }, []);

    const handleLanguageChange = useCallback(async (languageId) => {
        try {
            const items = await getDocumentCategories(languageId);
            setCategories(toArray(items));
        } catch (error) {
            console.error("Category API Error:", error?.response?.data ?? error);
            setCategories([]);
            toast.error(errorMessage(error, "Unable to load categories."));
        }
    }, []);

    const handleSubmit = useCallback(
        async (payload) => {
            setSubmitting(true);

            try {
                await createDocument(payload);

                toast.success("Document created successfully.");
                navigate("/documents");
            } catch (error) {
                console.error("Create failed:", error?.response?.data);

                const detail = error?.response?.data?.detail;
                toast.error(
                    typeof detail === "string"
                        ? detail
                        : "Unable to create document.",
                );
            } finally {
                setSubmitting(false);
            }
        },
        [navigate],
    );

    const handleCancel = useCallback(
        () => navigate("/documents"),
        [navigate],
    );

    return (
        <AppLayout>
            <div className="mb-[16px] flex items-center justify-between px-3">
                <span className="m-0 text-[20px] font-medium text-[#344050]">
                    Add New Document
                </span>

                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="px-3">
                <DocumentForm
                    mode="create"
                    languages={languages}
                    categories={categories}
                    submitting={submitting}
                    onLanguageChange={handleLanguageChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </div>
        </AppLayout>
    );
}
