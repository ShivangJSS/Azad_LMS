import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "@/components/layout/AppLayout";
import Breadcrumbs from "@/shared/components/breadcrumbs/Breadcrumbs";
import LanguageTabs from "@/shared/components/language/LanguageTabs";
import Pagination from "@/shared/components/table/Pagination";

import TopicFilters from "@/features/module/Topic/components/TopicFilters";
import TopicTable from "@/features/module/Topic/components/TopicTable";


import useTopics from "@/features/module/Topic/hook/useTopics";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Topics", path: "/topic-master" },
    { label: "List" },
];

export default function TopicList() {
    const navigate = useNavigate();

    const {
        language,
        topics,
        loading,
        filters,
        currentPage,
        totalEntries,
        totalPages,
        changeLanguage,
        changeFilter,
        applyFilters,
        resetFilters,
        setCurrentPage,
        removeTopic,
    } = useTopics();

    const handleDelete = async (topic) => {
        const confirmed = window.confirm(
            `Delete "${topic.topic_name}"? This cannot be undone.`,
        );

        if (!confirmed) return;

        try {
            await removeTopic(topic.topic_id);
            toast.success("Topic deleted successfully.");
        } catch (error) {
            console.error("Delete Error:", error?.response?.data ?? error);

            const detail = error?.response?.data?.detail;
            toast.error(
                typeof detail === "string" ? detail : "Unable to delete topic.",
            );
        }
    };

    return (
        <AppLayout>
            <div className="mb-3 flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-[20px] font-medium text-[#344050]">
                    Topic List
                </div>

                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <LanguageTabs
                activeTab={language}
                onChange={changeLanguage}
            />

            <div className="w-full bg-white p-3">

                <TopicFilters
                    filters={filters}
                    onChange={changeFilter}
                    onSearch={applyFilters}
                    onReset={resetFilters}
                />


                <div className="border-t border-[#4FC3C3] my-[20px]" />
                <div className="mt-[20px] mb-[14px] flex flex-wrap items-center justify-between gap-[12px]">
                    <p className="m-0 text-[14px] font-semibold text-[#344050]">
                        Total Topic (s):{" "}
                        <span className="text-[#7b216f]">{totalEntries}</span>
                    </p>

                    {/* Add Topic — English only; HI/BN/TA topics are added
                        via translation, not created fresh. */}
                    {language === "english" && (
                        <Link
                            to="/topic-master/add"
                            className="inline-flex h-[36px] items-center rounded-[4px] border-1 border-black bg-white px-[16px] text-[14px] !text-[#344050] text-decoration-none font-medium hover:bg-gray-50"
                        >
                            +Add Topic
                        </Link>
                    )}
                </div>

                <TopicTable
                    topics={topics}
                    loading={loading}
                    currentPage={currentPage}
                    canManage={language === "english"}
                    onView={(topic) =>
                        navigate(`/topic-master/${topic.topic_id}?tab=${language}`)
                    }
                    onEdit={(topic) =>
                        navigate(
                            // The base-topic editor (module reassignment,
                            // etc.) only makes sense for the English record.
                            // Every other language edits its own translation
                            // on the same screen as View, which is already
                            // scoped to save ONLY that language.
                            language === "english"
                                ? `/topic-master/edit/${topic.topic_id}?tab=${language}`
                                : `/topic-master/${topic.topic_id}?tab=${language}`
                        )
                    }
                    onDelete={handleDelete}
                />

                <div className="mt-[20px] flex flex-wrap items-center justify-end gap-[12px]">
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