import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Breadcrumbs from "@/shared/components/breadcrumbs/Breadcrumbs";

import CourseTable from "@/features/course/components/CourseTable";
import useCourse from "@/features/course/hook/useCourse";
import LanguageTabs from "@/shared/components/language/LanguageTabs";
import Pagination from "@/shared/components/table/Pagination";
import SearchResetActions from "@/shared/components/table/SearchResetActions";

export default function CourseList() {

    const perPage = 10;

    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = (
        searchParams.get("tab") || "english"
    ).toLowerCase();
    const [currentPage, setCurrentPage] = useState(1);

    const {
        loading,
        filteredCourses,
        searchText,
        setSearchText,
        appliedSearch,
        handleSearch,
        handleReset,
    } = useCourse(activeTab);

    const totalPages = Math.max(1, Math.ceil(filteredCourses.length / perPage));
    const paginatedCourses = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredCourses.slice(start, start + perPage);
    }, [currentPage, filteredCourses]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, appliedSearch]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleTabChange = (key) => {
        setSearchParams({ tab: key });
        handleReset();
    };

    return (
        <AppLayout>

            <div className="course-list-page min-h-screen w-full bg-[#eef3f9]">

                {/* PAGE HEADER */}

                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-[21px] font-normal text-[#344050]">
                        Course List
                    </span>

                    <Breadcrumbs
                        items={[
                            { label: "Home", path: "/dashboard" },
                            { label: "Courses", path: "/courses" },
                            { label: "List" },
                        ]}
                    />

                </div>

                {/* CARD */}

                <div className="course-list-card bg-white">

                    {/* LANGUAGE TABS */}

                    <LanguageTabs
                        activeTab={activeTab}
                        onChange={handleTabChange}
                    />

                    {/* SEARCH */}
                    <div className="course-list-panel border bg-white !rounded-none">
                        <div
                            className="flex flex-col md:flex-row items-center gap-3 px-4 py-4"
                        >

                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) =>
                                    setSearchText(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                        handleSearch(); 
                                }}
                                placeholder="Search By Course Name"
                                className="flex-1 h-[30px] px-3 border border-[#e3e6ed] rounded-[4px] outline-none focus:border-[#732269]  shadow-inner-[#dee2e6]"
                            />

                            <SearchResetActions
                                onSearch={handleSearch}
                                onReset={handleReset}
                            />

                        </div>

                        {/* BODY */}

                        <div className="px-4 py-3">

                            <p className="mb-2 text-[15px] font-bold text-[#344050]">
                                Total Course(s): {filteredCourses.length}
                            </p>

                            <CourseTable
                                loading={loading}
                                courses={paginatedCourses}
                                activeTab={activeTab}
                                startIndex={(currentPage - 1) * perPage}
                            />
                            <div className="mt-[20px] flex flex-wrap items-center justify-between gap-[12px]">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </AppLayout>
    );
}

