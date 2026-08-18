import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiDownload } from "react-icons/fi";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import LanguageTabs from "../../../../shared/components/language/LanguageTabs";
import Pagination from "../../../../shared/components/table/Pagination";

import ListTable from "../components/ListTable";
import ListFilters from "../components/ListFilters";
import useList from "../hook/useList";

import { MODULE_COLUMNS, PER_PAGE, } from "../hook/Listconstants";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Modules", path: "/module-master" },
    { label: "List" },
];

export default function ModuleList() {
    const navigate = useNavigate();

    const {
        language,
        modules,
        totalEntries,
        filters,
        loading,
        currentPage,
        totalPages,

        changeLanguage,
        changeFilter,
        applyFilters,
        resetFilters,
        setCurrentPage,
        removeModule,
    } = useList();

    /* ================= DELETE ================= */

    const handleDelete = async (module) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${module.module_name}"?`
        );

        if (!confirmed) return;

        try {
            await removeModule(module.module_id);
        } catch (error) {
            console.error(
                "Delete Module Error:",
                error?.response?.data ?? error
            );
        }
    };

    /* ================= TABLE COLUMNS ================= */

    const columns = MODULE_COLUMNS.map((column) => {
        if (column.key === "serial") {
            return {
                ...column,
                render: (_, index) =>
                    (currentPage - 1) * 10 + index + 1,
            };
        }

        if (column.key === "topic_count") {
            return {
                ...column,
                render: (module) =>
                    module.topic_count ??
                    module.total_topics ??
                    0,
            };
        }

        if (column.key === "status") {
            return {
                ...column,
                render: (module) =>
                    String(module.status) === "1"
                        ? "Active"
                        : "Inactive",
            };
        }

        if (column.key === "actions") {
            return {
                ...column,

                render: (module) => (
                    <div className="flex items-center justify-center gap-[8px] whitespace-nowrap">

                        {/* VIEW */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/module-master/${module.module_id}?tab=${language}`
                                )
                            }
                            className="h-[32px] rounded-[4px] border border-[#732269] bg-white px-[14px] text-[14px] font-medium text-[#732269]"
                        >
                            View
                        </button>

                        {/* CONFIGURE */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/module-master/configure/${module.module_id}`
                                )
                            }
                            className="h-[32px] rounded-[4px] border border-[#732269] bg-white px-[14px] text-[14px] font-medium text-[#732269]"
                        >
                            Configure Module
                        </button>

                        {/* EDIT */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/module-master/edit/${module.module_id}?tab=${language}`
                                )
                            }
                            className="h-[32px] rounded-[4px] border border-[#732269] bg-[#732269] px-[14px] text-[14px] font-medium !text-white"
                        >
                            Edit
                        </button>

                        {/* ADD TOPIC */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/topic-master/add?module_id=${module.module_id}`
                                )
                            }
                            className="h-[32px] rounded-[4px] border border-[#732269] bg-[#732269] px-[14px] text-[14px] font-medium !text-white"
                        >
                            Add Topic
                        </button>

                        {/* DELETE */}
                        <button
                            type="button"
                            onClick={() =>
                                handleDelete(module)
                            }
                            className="h-[32px] rounded-[4px] border border-[#E63757] bg-[#E63757] px-[14px] text-[14px] font-medium !text-white"
                        >
                            Delete
                        </button>

                    </div>
                ),
            };
        }

        return column;
    });

    return (
        <AppLayout>

            {/* ================= HEADER ================= */}

            <div className="mb-3 flex items-center justify-between">
                <span className="text-[20px] font-medium text-[#344050]">
                    Module(s) List
                </span>

                <Breadcrumbs items={breadcrumbItems} />
            </div>

            {/* ================= LANGUAGE ================= */}

            <LanguageTabs
                activeTab={language}
                onChange={changeLanguage}
            />

            {/* ================= CARD ================= */}

            <div className="rounded-b-[6px] border border-t-0 border-[#D8E2EF] bg-white">

                {/* ================= SEARCH ================= */}

                <div className="border-b border-[#2DD4BF] px-[20px] py-[38px]">

                    <ListFilters
                        filters={filters}
                        onChange={changeFilter}
                        onSearch={applyFilters}
                        onReset={resetFilters}
                    />

                </div>

                {/* ================= BODY ================= */}

                <div className="px-[20px] py-[20px]">

                    {/* TOTAL + ADD */}

                    <div className="mb-[16px] flex items-center justify-between">

                        <p className="m-0 text-[14px] font-semibold text-[#344050]">
                            Total Module (s):{" "}
                            <span className="text-[#732269]">
                                {totalEntries}
                            </span>
                        </p>

                        <Link
                            to="/module-master/add"
                            className="inline-flex h-[35px] items-center justify-center rounded-[4px] border-1 border-[#344050] bg-white px-[16px] text-[14px] font-medium !text-[#344050] !no-underline hover:bg-[#F8F9FA]"
                        >
                            + Add Module
                        </Link>

                    </div>

                    {/* TABLE */}

                    <ListTable
                        columns={MODULE_COLUMNS}
                        data={modules}
                        loading={loading}
                        rowKey="module_id"
                        currentPage={currentPage}
                        perPage={PER_PAGE}
                        onDelete={handleDelete}
                        language={language}
                    />

                    {/* BOTTOM */}

                    <div className="mt-[16px] flex items-center justify-between">

                        <button
                            type="button"
                            className="inline-flex h-[32px] items-center gap-[8px] rounded-[4px] border border-[#732269] bg-white px-[14px] text-[14px] font-medium text-[#732269]"
                        >
                            <FiDownload size={14} />
                            Export
                        </button>

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}

                    </div>

                </div>

            </div>

        </AppLayout>
    );
}