import { useCallback, useEffect, useState } from "react";
import { getCourseById, updateCourse } from "../services/CourseService";


/**
 * Loads one course for editing and submits the update.
 *
 * `languageId` is the translation being edited - the edit screen
 * always edits one language at a time.
 */
const useCourseEdit = (id, languageId = 1) => {

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);


    const fetchCourse = useCallback(async () => {

        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const response = await getCourseById(id, languageId);

            setCourse(response?.data ?? null);

        } catch (err) {
            console.error("Error fetching course:", err);
            setCourse(null);
            setError(err);
        } finally {
            setLoading(false);
        }

    }, [id, languageId]);


    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);


    /**
     * `values` = { course_name, description, status, image (File | null) }
     * Sent as multipart/form-data because of the image.
     */
    const saveCourse = async (values) => {
        setSaving(true);

        try {

            const formData = new FormData();

            formData.append("course_name", values.course_name || "");
            formData.append(
                "course_description",
                values.description || ""
            );
            formData.append("status", values.status || "");

            if (values.image instanceof File) {
                formData.append("course_image", values.image);
            }
            console.log("===== FormData =====");

            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }

            console.log("====================");
            const response = await updateCourse(
                id,
                languageId,
                formData
            );

            return {
                success: true,
                data: response,
            };

        } catch (err) {

            console.error(err);

            return {
                success: false,
                message: Array.isArray(err.response?.data?.detail)
                    ? err.response.data.detail
                        .map((e) => e.msg)
                        .join(", ")
                    : err.response?.data?.detail ||
                    "Failed to update course.",
            };

        } finally {
            setSaving(false);
        }
    };


    return {
        course,
        loading,
        saving,
        error,
        fetchCourse,
        saveCourse,
    };
};

export default useCourseEdit;