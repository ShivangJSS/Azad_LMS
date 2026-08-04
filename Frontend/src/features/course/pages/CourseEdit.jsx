import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import AppLayout from "../../../components/layout/AppLayout";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";

import useCourseEdit from "../hook/useCourseEdit";
import { getCourseImageUrl } from "../services/CourseService";
import {LANGUAGES,getLanguageById} from "../../../shared/constants/languageConstants";

/* STATUS_OPTIONS currently lives in useCourse.js - see the note below,
   it belongs in shared/constants/statusConstants.js */
import { STATUS_OPTIONS } from "../hook/useCourse";


/* shared field styles */
const LABEL =
    "block mb-[6px] text-[14px] font-medium text-[#5E6E82]  ";

const CONTROL =
    "w-full h-[38px] px-3 text-[14px] text-[#5E6E82] bg-white rounded-sm shadow-inner outline-none focus:border-[#732269] border-2 border-[#000000B0]";

const CONTROL_BORDER = { border: "1px solid #dee2e6" };


export default function CourseEdit() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [searchParams] = useSearchParams();

    const activeTab = (
        searchParams.get("tab") || LANGUAGES[0]?.key || "english"
    ).toLowerCase();

    const activeLanguage =
        LANGUAGES.find((lang) => lang.key === activeTab) || LANGUAGES[0];

    const { course, loading, saving, saveCourse } = useCourseEdit(
        id,
        activeLanguage.id
    );

    const [preview, setPreview] = useState(null);
    const [message, setMessage] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            course_name: "",
            description: "",
            status: "",
        },
    });


    /* fill the form once the course arrives */
    useEffect(() => {

        if (!course) return;

        reset({
            course_name: course.course_name || "",
            description: course.description || "",
            status: String(course.status ?? ""),
        });

    }, [course, reset]);


    const handleFileChange = (event) => {

        const file = event.target.files?.[0] || null;

        setValue("image", file);

        setPreview(file ? URL.createObjectURL(file) : null);
    };


    const onSubmit = async (values) => {

        setMessage("");

        const result = await saveCourse(values);

        if (result.success) {
            navigate("/courses");
        } else {
            setMessage(result.message);
        }
    };


    /* language of this translation - read only */
    const languageLabel =
        getLanguageById(course?.language_id)?.label || activeLanguage.label;


    return (

        <AppLayout>

            <div className="min-h-screen w-full bg-[#eef3f9]">


                {/* ================= PAGE HEADING ================= */}

                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">

                    <span className="text-[21px] leading-none font-normal text-[#344050]">
                        Editing a course
                    </span>

                    <Breadcrumbs
                        items={[
                            { label: "Home", path: "/dashboard" },
                            { label: "Courses", path: "/courses" },
                            { label: "Edit Course" },
                        ]}
                    />

                </div>


                {/* ================= CARD ================= */}

                <div className="bg-white rounded-[4px] border border-[#dee2e6] shadow-sm p-4">

                    {loading ? (

                        <p className="py-8 text-center text-[14px] text-[#8492a6]">
                            Loading...
                        </p>

                    ) : !course ? (

                        <p className="py-8 text-center text-[14px] text-[#8492a6]">
                            Course not found.
                        </p>

                    ) : (

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>


                            {message && (
                                <div className="mb-4 rounded-[4px] border border-red-200 bg-red-50 px-4 py-2 text-[14px] text-red-700">
                                    {message}
                                </div>
                            )}


                            {/* LANGUAGE (read only) */}

                            <div className="mb-4">

                                <label className={LABEL}>
                                    Language <span className="text-red-500">*</span>
                                </label>

                                <div
                                    className="w-full h-[38px] px-3 flex items-center text-[14px] text-[#4d5969] bg-[#eef2f7] rounded-[4px] border-2
                                        border-[#000000d1] shadow-inner"
                                    style={CONTROL_BORDER} 
                                >
                                    {languageLabel}
                                </div>

                            </div>


                            {/* COURSE NAME */}

                            <div className="mb-4">

                                <label htmlFor="course_name" className={LABEL}>
                                    Course Name <span className="text-red-500">*</span>
                                </label>

                                <input
                                    id="course_name"
                                    type="text"
                                    className={CONTROL}
                                    style={
                                        errors.course_name
                                            ? { border: "1px solid #ef4444" }
                                            : CONTROL_BORDER
                                    }
                                    {...register("course_name", {
                                        required: "Course name is required",
                                    })}
                                />

                                {errors.course_name && (
                                    <p className="mt-1 text-[13px] text-red-500">
                                        {errors.course_name.message}
                                    </p>
                                )}

                            </div>


                            {/* COURSE DESCRIPTION */}

                            <div className="mb-4">

                                <label htmlFor="description" className={LABEL}>
                                    Course Description{" "}
                                    <span className="text-red-500">*</span>
                                </label>

                                <input
                                    id="description"
                                    type="text"
                                    className={CONTROL}
                                    style={
                                        errors.description
                                            ? { border: "1px solid #ef4444" }
                                            : CONTROL_BORDER
                                    }
                                    {...register("description", {
                                        required: "Course description is required",
                                    })}
                                />

                                {errors.description && (
                                    <p className="mt-1 text-[13px] text-red-500">
                                        {errors.description.message}
                                    </p>
                                )}

                            </div>


                            {/* STATUS */}

                            <div className="mb-4">

                                <label htmlFor="status" className={LABEL}>
                                    Status <span className="text-red-500">*</span>
                                </label>

                                <select
                                    id="status"
                                    className={CONTROL}
                                    style={
                                        errors.status
                                            ? { border: "1px solid #ef4444" }
                                            : CONTROL_BORDER
                                    }
                                    {...register("status", {
                                        required: "Status is required",
                                    })}
                                >
                                    <option value="">Select status</option>

                                    {STATUS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}

                                </select>

                                {errors.status && (
                                    <p className="mt-1 text-[13px] text-red-500">
                                        {errors.status.message}
                                    </p>
                                )}

                            </div>


                            {/* COURSE IMAGE */}

                            <div className="mb-4">

                                <label htmlFor="image" className={LABEL}>
                                    Course Image
                                </label>

                                <input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange} 
                                    className="w-full h-[38px] text-[14px] text-[#4d5969] bg-white rounded-[4px] file:h-[36px] file:mr-3 file:px-4 file:border-0 file:bg-[#344050] file:text-white file:text-[14px] file:cursor-pointer border-2
                                        border-[#000000d1] shadow-inner"
                                    style={CONTROL_BORDER}
                                />

                            </div>


                            {/* EXISTING / NEW IMAGE */}

                            <div>

                                <p className={LABEL}>
                                    {preview ? "New Image" : "Existing Image"}
                                </p>

                                {preview || course.course_image ? (

                                    <div
                                        className="inline-block p-3 rounded-sm border-2 
                                        border-[#000000d1] bg-white"
                                        style={CONTROL_BORDER}
                                    >
                                        <img
                                            src={
                                                preview ||
                                                getCourseImageUrl(course.course_image)
                                            }
                                            alt={course.course_name || "Course"}
                                            className="block w-[180px] h-auto object-contain"
                                        />
                                    </div>

                                ) : (

                                    <p className="text-[14px] text-[#9aa5b1]">
                                        No image uploaded
                                    </p>

                                )}

                            </div>


                            {/* ACTIONS */}

                            <div className="flex items-center gap-2 mt-5">

                                <button
                                    type="button"
                                    onClick={() => navigate("/courses")}
                                    className="px-4 py-1 text-[12px] font-medium text-[#5E6E82] bg-white rounded-sm border-2 border-black hover:bg-[#f7f8fa]"
                                    style={CONTROL_BORDER}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit" 
                                    disabled={saving}
                                    className="px-3 py-1 text-[12px] font-semibold text-white bg-[#732269] rounded-sm hover:bg-[#6e1b6e] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? "Updating..." : "Update Course"}
                                </button>

                            </div>

                        </form>

                    )}

                </div>

            </div>

        </AppLayout>
    );
}