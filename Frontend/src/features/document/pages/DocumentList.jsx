import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../components/layout/AppLayout";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";
import Pagination from "../../../shared/components/table/Pagination";

import DocumentFilters from "../components/DocumentFilters";
import DocumentTable from "../components/DocumentTable";
import ExportButton from "../components/ExportButton";
import LanguageTabs from "../components/LanguageTabs";

import useDocuments from "../hook/useDocuments";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Documents", path: "/documents" },
    { label: "List" },
];

export default function DocumentList() {
    const navigate = useNavigate();

    const {
        language,
        languages,
        docTypes,
        documents,
        totalEntries,
        totalPages,
        filters,
        appliedFilters,
        currentPage,
        loading,
        changeLanguage,
        changeFilter,
        applyFilters,
        resetFilters,
        setCurrentPage,
        removeDocument,
    } = useDocuments();

    const handleDelete = async (doc) => {
        const confirmed = window.confirm(
            `Delete "${doc.doc_title}"? This cannot be undone.`,
        );

        if (!confirmed) return;

        try {
            await removeDocument(doc.doc_id);
            toast.success("Document deleted successfully.");
        } catch (error) {
            console.error("Delete Error:", error?.response?.data ?? error);

            const detail = error?.response?.data?.detail;
            toast.error(
                typeof detail === "string" ? detail : "Unable to delete document.",
            );
        }
    };

    return (
        <AppLayout>
            <div className="mb-3 flex w-full items-center justify-between ">
                <div className="text-[20px] font-medium text-[#344050]">
                    Document Details
                </div>

                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <LanguageTabs
                languages={languages}
                active={language}
                onChange={changeLanguage}
            />

            <div className="w-full rounded-b-[8px] border border-t-0 border-[#D8E2EF] bg-white p-[20px]">

                <DocumentFilters
                    filters={filters}
                    docTypes={docTypes}
                    onChange={changeFilter}
                    onSearch={applyFilters}
                    onReset={resetFilters}
                />

                <div className="mt-[20px] mb-[14px] flex flex-wrap items-center justify-between gap-[12px]">
                    <p className="m-0 text-[14px] font-semibold text-[#344050]">
                        Total Document Type (s):{" "}
                        <span className="text-[#7b216f]">{totalEntries}</span>
                    </p>

                    <Link
                        to="/documents/create"
                        className="inline-flex h-[36px] items-center rounded-[4px] border-1 border-black bg-white px-[16px] text-[14px] !text-[#344050] text-decoration-none font-medium hover:bg-gray-50"
                    >
                        +Add Document
                    </Link>
                </div>

                <DocumentTable
                    documents={documents}
                    loading={loading}
                    currentPage={currentPage}
                    onView={(doc) =>
                        navigate(`/documents/${doc.doc_id}`)
                    }
                    onEdit={(doc) =>
                        navigate(`/documents/edit/${doc.doc_id}`)
                    }
                    onDelete={handleDelete}
                />

                <div className="mt-[20px] flex flex-wrap items-center justify-between gap-[12px]">
                    <ExportButton params={{ language, ...appliedFilters }} />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
