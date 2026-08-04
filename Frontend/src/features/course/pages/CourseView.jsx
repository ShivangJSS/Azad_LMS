import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import AppLayout from "../../../components/layout/AppLayout";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";

import useCourseView from "../hook/useCourseView";

import { LANGUAGES } from "../../../shared/constants/languageConstants";


/* Tabs come straight from the shared constant - add a language
   there and it shows up here automatically. */
const LANGUAGE_TABS = LANGUAGES;


const PURPLE = "#732269";


export default function CourseView() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = (
        searchParams.get("tab") || LANGUAGE_TABS[0]?.key || "english"
    ).toLowerCase();

    const activeLanguage =
        LANGUAGE_TABS.find((tab) => tab.key === activeTab) || LANGUAGE_TABS[0];

    const { course, loading } = useCourseView(id, activeLanguage.id);


    const handleTabChange = (key) => {
        setSearchParams({ tab: key });
    };


    /* read-only field */
    const field = (label, value) => (

        <div className="mb-4">

            <p className="mb-2 text-[14px] font-semibold text-[#344050]">
                {label}
            </p>

            <div
                className="w-full min-h-[38px] px-3 py-[9px] text-[14px] text-[#4d5969] bg-[#eef2f7] rounded-[4px]"
                style={{ border: "1px solid #dee2e6" }}
            >
                {value || <span className="text-[#9aa5b1]">-</span>}
            </div>

        </div>
    );


    return (

        <AppLayout>

            <div className="min-h-screen w-full bg-[#eef3f9]">


                {/* ================= PAGE HEADING ================= */}

                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">

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


                {/* ================= CARD ================= */}

                <div className="bg-white rounded-[4px] border border-[#dee2e6] shadow-sm p-4">


                    {/* ---------- LANGUAGE TABS ---------- */}

                    <div
                        className="flex flex-wrap items-end"
                        style={{ borderBottom: "1px solid #dee2e6" }}
                    >

                        {LANGUAGE_TABS.map((tab, index) => {

                            const isActive = tab.key === activeTab;

                            return (

                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`relative px-[22px] py-[9px] text-[14px] font-medium transition-colors ${index === 0 ? "rounded-tl-[4px]" : ""
                                        } ${isActive
                                            ? "bg-[#732269] text-white"
                                            : "bg-white text-[#4d5969] hover:bg-[#f7f8fa]"
                                        }`}
                                >
                                    {tab.label}
                                </button>

                            );

                        })}

                    </div>


                    {/* ---------- BODY ---------- */}

                    <div className="pt-4">

                        {loading && (
                            <p className="py-6 text-center text-[14px] text-[#8492a6]">
                                Loading...
                            </p>
                        )}


                        {!loading && !course && (
                            <p className="py-6 text-center text-[14px] text-[#8492a6]">
                                No translation available for {activeLanguage.label}.
                            </p>
                        )}


                        {!loading && course && (

                            <>

                                {field("Course Name", course.course_name)}

                                {field("Course Description", course.course_description)}


                                {/* IMAGE */}

                                <div>

                                    <p className="mb-2 text-[14px] font-semibold text-[#344050]">
                                        Image
                                    </p>

                                    {course.imageUrl ? (

                                        <div
                                            className="inline-block p-3 rounded-sm bg-white"
                                            style={{ border: "1px solid #dee2e6" }}
                                        >
                                            <img
                                                src={course.imageUrl}
                                                alt={course.course_name || "Course"}
                                                className="block w-[200px] h-auto object-contain"
                                            />
                                        </div>

                                    ) : (

                                        <p className="text-[14px] text-[#9aa5b1]">
                                            No image uploaded
                                        </p>

                                    )}

                                </div>

                            </>

                        )}

                    </div>

                </div>


                {/* ================= BACK ================= */}

                <button
                    type="button"
                    onClick={() => navigate("/courses")}
                    className="mt-3 px-4 py-[7px] text-[14px] font-medium bg-white rounded-sm hover:bg-[#f7f8fa] transition-colors"
                    style={{ border: "1px solid #dee2e6", color: PURPLE }}
                >
                    Back to List
                </button>

            </div>

        </AppLayout>
    );
}