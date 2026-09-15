import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getTopics, deleteTopic } from "@/features/module/Topic/services/TopicService";
import { getModules } from "@/features/module/ListModule/services/ListService";
import { LANGUAGES, getLanguageByKey } from "@/shared/constants/languageConstants";
import { EMPTY_FILTERS, PER_PAGE } from "./Topicconstants";

export default function useTopics() {
    const [searchParams] = useSearchParams();
    const [language, setLanguage] = useState(
        (searchParams.get("tab") || LANGUAGES[0].key).toLowerCase()
    );
    const [topics, setTopics] = useState([]);
    const [totalEntries, setTotalEntries] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
    const [appliedFilters, setAppliedFilters] = useState({ ...EMPTY_FILTERS });
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const requestVersion = useRef(0);

    const fetchTopicsAndModules = useCallback(async () => {
        const version = ++requestVersion.current;
        setLoading(true);

        try {
            const selectedLanguage = getLanguageByKey(language);
            console.log("useTopics: Selected language:", selectedLanguage?.key, "ID:", selectedLanguage?.id);
            if (!selectedLanguage?.id) {
                console.error("Invalid language:", language);
                setTopics([]);
                setTotalEntries(0);
                setTotalPages(1);
                return;
            }

            console.log("Fetching topics with language_id:", selectedLanguage.id); console.log("useTopics: Fetching topics for language:", language, "with ID:", selectedLanguage.id); const params = {
                page: currentPage,
                limit: PER_PAGE,
                language_id: selectedLanguage.id,
            };

            if (appliedFilters.search?.trim()) {
                params.search = appliedFilters.search.trim();
            }

            // Fetch topics and modules independently
            const [topicsResult, modulesResult] = await Promise.allSettled([
                getTopics(params),
                getModules({
                    language_id: selectedLanguage.id,
                    page: 1,
                    limit: 100, // We only need the module list for mapping, not pagination
                }),
            ]);

            if (version !== requestVersion.current) return;

            // Process topics result
            let topicList = [];
            let pagination = {};
            if (topicsResult.status === "fulfilled") {
                const responseData = topicsResult.value.data || {};
                topicList = Array.isArray(responseData.topics) ? responseData.topics : [];
                pagination = responseData.pagination || {};
                setTopics(topicList);
                setTotalEntries(Number(pagination.total_records || 0));
                setTotalPages(Number(pagination.total_pages || 1));
            } else {
                console.error("Topics API Error:", topicsResult.reason?.response?.data ?? topicsResult.reason);
                setTopics([]);
                setTotalEntries(0);
                setTotalPages(1);
            }

            // Process modules result to build module name map (if successful)
            if (modulesResult.status === "fulfilled") {
                const modulesResponse = modulesResult.value.data || {};
                const modulesList = Array.isArray(modulesResponse.data) ? modulesResponse.data : [];
                const moduleById = new Map();
                modulesList.forEach((module) => {
                    [
                        module.module_id,
                        module.parent_module_id,
                        module.base_module_id,
                        module.fk_module_id,
                    ]
                        .filter((id) => id != null)
                        .forEach((id) => moduleById.set(String(id), module.module_name));
                });

                // If we have a module map, we can use it to enhance the module_name
                // (e.g., fallback to English if the topic's language-specific module name is missing)
                // But note: the topics data already includes a module_name from the inner join.
                // We'll leave the topics as is for now, but we have the map available if needed.
                // For now, we do nothing with the map to avoid changing the display.
                // If we want to use the map to override the module_name, we would do:
                // const enhancedTopics = topicList.map(topic => ({
                //   ...topic,
                //   module_name: moduleById.get(String(topic.module_id)) || topic.module_name
                // }));
                // setTopics(enhancedTopics);
                // However, we will not do that to avoid changing the behavior without need.
            } else {
                console.warn("Modules API Error (non-blocking):", modulesResult.reason?.response?.data ?? modulesResult.reason);
                // Continue with topics as fetched
            }
        } catch (error) {
            // This catch block is for synchronous errors, but our awaited promises are handled above.
            console.error("Unexpected error in fetchTopicsAndModules:", error);
            if (version !== requestVersion.current) return;
            setTopics([]);
            setTotalEntries(0);
            setTotalPages(1);
        } finally {
            if (version === requestVersion.current) setLoading(false);
        }
    }, [
        language,
        currentPage,
        appliedFilters,
    ]);

    useEffect(() => {
        fetchTopicsAndModules();
    }, [fetchTopicsAndModules]);

    const changeLanguage = useCallback((languageKey) => {
        const normalizedLanguage = String(languageKey || "").trim().toLowerCase();
        const selectedLanguage = getLanguageByKey(normalizedLanguage);
        if (!selectedLanguage?.id) {
            console.error("Invalid language selected:", languageKey);
            return;
        }
        requestVersion.current += 1;
        setTopics([]);
        setLanguage(normalizedLanguage);
        setCurrentPage(1);
    }, []);

    const changeFilter = useCallback((name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    }, []);

    const applyFilters = useCallback(() => {
        setCurrentPage(1);
        setAppliedFilters({ ...filters });
    }, [filters]);

    const resetFilters = useCallback(() => {
        setFilters({ ...EMPTY_FILTERS });
        setAppliedFilters({ ...EMPTY_FILTERS });
        setCurrentPage(1);
    }, []);

    const removeTopic = useCallback(
        async (topicId) => {
            try {
                await deleteTopic(topicId);
                await fetchTopicsAndModules();
            } catch (error) {
                console.error("Delete Topic Error:", error?.response?.data ?? error);
                throw error;
            }
        },
        [fetchTopicsAndModules]
    );

    return {
        language,
        topics,
        totalEntries,
        totalPages,
        filters,
        currentPage,
        loading,
        changeLanguage,
        changeFilter,
        applyFilters,
        resetFilters,
        setCurrentPage,
        removeTopic,
        refetch: fetchTopicsAndModules,
    };
}
