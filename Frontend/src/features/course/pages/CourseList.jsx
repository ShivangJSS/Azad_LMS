import { useSearchParams } from "react-router-dom";
import { FiDownload } from "react-icons/fi";

import AppLayout from "../../../components/layout/AppLayout";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";

import CourseTable from "../components/CourseTable";
import useCourse from "../hook/useCourse";

import { LANGUAGES, DEFAULT_LANGUAGE } from "../../../shared/constants/languageConstants";

const PURPLE = "#732269";

export default function CourseList() {

    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = (
        searchParams.get("tab") || "english"
    ).toLowerCase();

    const {
        loading,
        filteredCourses,
        searchText,
        setSearchText,
        handleSearch,
        handleReset,
        handleExport,
    } = useCourse(activeTab);

    const handleTabChange = (key) => {
        setSearchParams({ tab: key });
        handleReset();
    };

    return (
        <AppLayout>

            <div className="min-h-screen w-full bg-[#eef3f9]">

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

                <div className="bg-white rounded-sm border border-[#dee2e6] shadow-sm">

                    {/* LANGUAGE TABS */}

                    <div
                        className="flex flex-wrap items-end"
                        style={{ borderBottom: "1px solid #dee2e6" }}
                    >

                        {LANGUAGES.map((language, index) => {
                            const isActive = language.key === activeTab;

                            return (
                                <button
                                    key={language.id}
                                    type="button"
                                    onClick={() => handleTabChange(language.key)}
                                    className={`relative px-[15px] py-[5px] text-[14px] font-medium transition-colors ${index === 0 ? "rounded-tl-[4px]" : ""
                                        } ${isActive
                                            ? "bg-[#732269] text-white"
                                            : "bg-white text-[#4d5969] border-r border-[#e3e6ed] hover:bg-[#f7f8fa]"
                                        }`}
                                >
                                    {language.label}

                                    {isActive && (
                                        <span
                                            className="absolute left-1/2 -bottom-[4px] h-[8px] w-[8px] -translate-x-1/2 rotate-45"
                                            style={{ backgroundColor: PURPLE }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* SEARCH */}

                    <div
                        className="flex flex-col md:flex-row items-center gap-3 px-4 py-4"
                        style={{ borderBottom: "1px solid #dee2e6" }}
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
                            className="flex-1 h-[30px] px-3 border border-[#e3e6ed] rounded-[4px] outline-none focus:border-[#732269] shadow-inner shadow-inner-[#dee2e6]"
                        />

                        <button
                            onClick={handleSearch}
                            className="h-7.5 px-7.5 rounded-sm! bg-[#732269] text-white"
                        >
                            Search
                        </button>

                        <button
                            onClick={handleReset}
                            className="h-7.5 px-7.5 rounded-sm! border-2 border-[#241f1fd4]"
                        >
                            Reset
                        </button>

                    </div>

                    {/* BODY */}

                    <div className="px-4 py-3">

                        <p className="mb-2 text-[15px] font-bold text-[#344050]">
                            Total Course(s): {filteredCourses.length}
                        </p>

                        <CourseTable
                            loading={loading}
                            courses={filteredCourses}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                handleExport(filteredCourses, activeTab)
                            }
                            disabled={!filteredCourses.length}
                            className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-[#732269] bg-white border border-[#dee2e6] rounded-[4px]"
                        >
                            <FiDownload
                                size={14}
                                color={PURPLE}
                            />
                            <span>Export</span>
                        </button>

                    </div>

                </div>

            </div>

        </AppLayout>
    );
}

