import { useEffect, useMemo, useState } from "react";
import { getAllCourses } from "../services/CourseService";
import { getLanguageByKey } from "../../../shared/constants/languageConstants";

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

    // The selected tab (english/hindi/bangla/tamil) drives which language's
    // courses the backend returns.
    const languageId = getLanguageByKey(activeTab)?.id || 1;

    const fetchCourses = async () => {
        try {
            setLoading(true);

            const response = await getAllCourses(languageId);

            setCourses(response.data.items || []);

        } catch (error) {
            console.error("Error fetching courses:", error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    // Refetch whenever the language tab changes.
    useEffect(() => {
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [languageId]);

    const handleSearch = () => {
        setQuery(searchText.trim().toLowerCase());
    };

    const handleReset = () => {
        setSearchText("");
        setQuery("");
    };

    // The backend already returns the correct language set (with English
    // fallback), so only the search query is filtered client-side. Filtering
    // by language_name here previously hid every non-English course.
    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const matchesQuery =
                !query ||
                String(course.course_name || "")
                    .toLowerCase()
                    .includes(query);

            return matchesQuery;
        });
    }, [courses, query]);

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