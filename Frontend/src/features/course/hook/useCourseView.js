import { useEffect, useState } from "react";
import { getCourseById, getCourseImageUrl } from "../services/CourseService";

const useCourseView = (id, languageId) => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [id, languageId]);

    const fetchCourse = async () => {
        try {
            setLoading(true);

            const response = await getCourseById(id, languageId);

            const courseData = response.data;

            setCourse({
                ...courseData,
                imageUrl: getCourseImageUrl(courseData.course_image),
            });

        } catch (error) {
            console.error(error);
            setCourse(null);
        } finally {
            setLoading(false);
        }
    };

    return {
        course,
        loading,
    };
};

export default useCourseView;