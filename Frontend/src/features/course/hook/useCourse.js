import { useEffect, useMemo, useState } from "react";
import { getAllCourses } from "../services/CourseService";

export const STATUS = {
    ACTIVE: "1",
    INACTIVE: "0",
};
 
 
export const STATUS_LABELS = {
    [STATUS.ACTIVE]: "Active",
    [STATUS.INACTIVE]: "Inactive",
};
 
 
/** Options for a <select>. */
export const STATUS_OPTIONS = [
    { value: STATUS.ACTIVE, label: STATUS_LABELS[STATUS.ACTIVE] },
    { value: STATUS.INACTIVE, label: STATUS_LABELS[STATUS.INACTIVE] },
];
 
 
/** "Active" for "1". Returns "-" when unknown. */
export function getStatusLabel(value) {
    return STATUS_LABELS[String(value).trim()] || "-";
}


const useCourse = (activeTab) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    const [searchText, setSearchText] = useState("");
    const [query, setQuery] = useState("");

    const fetchCourses = async () => {
        try {
            setLoading(true);

            const response = await getAllCourses();
            console.log(response);

            setCourses(response.data.items || []);

            console.log(response.data.items);
        } catch (error) {
            console.error("Error fetching courses:", error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleSearch = () => {
        setQuery(searchText.trim().toLowerCase());
    };

    const handleReset = () => {
        setSearchText("");
        setQuery("");
    };

    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {

            const matchesLanguage =
                activeTab === "all" ||
                String(course.language_name || "")
                    .toLowerCase()
                    .trim() === activeTab.toLowerCase();

            const matchesQuery =
                !query ||
                String(course.course_name || "")
                    .toLowerCase()
                    .includes(query);

            return matchesLanguage && matchesQuery;
        });
    }, [courses, activeTab, query]);

    return {
        loading,
        courses,
        filteredCourses,

        searchText,
        setSearchText,

        fetchCourses,
        handleSearch,
        handleReset,
    };
};

export default useCourse;