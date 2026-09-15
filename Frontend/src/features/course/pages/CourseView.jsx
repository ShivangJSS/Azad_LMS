import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import Breadcrumbs from "@/shared/components/breadcrumbs/Breadcrumbs";
import LanguageTabs from "@/shared/components/language/LanguageTabs";

import useCourseView from "@/features/course/hook/useCourseView";

import { getLanguageByKey } from "@/shared/constants/languageConstants";

const PURPLE = "#732269";

export default function CourseView() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = (searchParams.get("tab") || "english").toLowerCase();

    const activeLanguage = getLanguageByKey(activeTab);

    const { course, loading } = useCourseView(id, activeLanguage?.id);

    const handleTabChange = (key) => {
        setSearchParams({
            tab: key,
        });
    };

    const field = (label, value) => (
        <div className="mb-4">
            <p className="mb-2 text-[14px] font-semibold text-[#344050]">
                {label}
            </p>

            <div className="w-full min-h-[38px] px-3 py-[9px] text-[14px] text-[#4d5969] bg-[#eef2f7] rounded-none border border-[#dee2e6]">
                {value || <span className="text-[#9aa5b1]">-</span>}
            </div>
        </div>
    );

    return (
        <AppLayout>
            <div className="course-page min-h-screen w-full bg-[#eef3f9]">

                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-[21px] leading-none font-normal text-[#344050]">
                        Course Translation
                    </span>

                    <Breadcrumbs
                        items={[
                            { label: "Home", path: "/dashboard" },
                            { label: "Courses", path: "/courses" },
                            { label: "Translation" },
                        ]}
                    />
                </div>

                <div className="course-page-card bg-white border border-[#dee2e6] rounded-none shadow-none">

                    <div className="flex items-stretch justify-between border-b border-[#dee2e6]">
                        <LanguageTabs
                            activeTab={activeTab}
                            onChange={handleTabChange}
                        />
                    </div>

                    <div className="px-4 py-4">

                        {loading && (
                            <p className="py-8 text-center text-[14px] text-[#8492a6]">
                                Loading...
                            </p>
                        )}

                        {!loading && !course && (
                            <p className="py-8 text-center text-[14px] text-[#8492a6]">
                                No translation available for{" "}
                                {activeLanguage?.label || activeTab}.
                            </p>
                        )}

                        {!loading && course && (
                            <div>
                                {field("Course Name", course.course_name)}

                                {field(
                                    "Course Description",
                                    course.course_description
                                )}

                                <div className="mb-1">
                                    <p className="mb-2 text-[14px] font-semibold text-[#344050]">
                                        Image
                                    </p>

                                    {course.imageUrl ? (
                                        <div className="inline-block p-3 bg-white rounded-none border border-[#dee2e6]">
                                            <img
                                                src={course.imageUrl}
                                                alt={course.course_name || "Course"}
                                                className="block w-[160px] h-auto object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-[14px] text-[#9aa5b1]">
                                            No image uploaded
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}