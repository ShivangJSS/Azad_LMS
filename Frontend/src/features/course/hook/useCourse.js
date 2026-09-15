import { useEffect, useMemo, useRef, useState } from "react";
import {
    getAllCourses,
} from "@/features/course/services/CourseService";
import { getLanguageByKey } from "@/shared/constants/languageConstants";

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
    const fetchedLanguageId = useRef(null);

    // Selected tab drives the language returned by the backend.
    const languageId = getLanguageByKey(activeTab)?.id || 1;

    const fetchCourses = async () => {
        try {
            setLoading(true);

            const response = await getAllCourses(languageId);

            setCourses(
                (response?.data?.items || []).map((course) => ({
                    ...course,
                    module_count: Number(course.module_count ?? 0),
                }))
            );

        } catch (error) {
            console.error("Error fetching courses:", error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    // Refetch whenever the language tab changes.
    useEffect(() => {
        if (fetchedLanguageId.current === languageId) {
            return;
        }

        fetchedLanguageId.current = languageId;
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

    // Backend returns courses for the selected language.
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
        appliedSearch: query,

        fetchCourses,
        handleSearch,
        handleReset,
    };
};

export default useCourse;