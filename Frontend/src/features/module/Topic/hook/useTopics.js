import { useCallback, useEffect, useState } from "react";
import { getTopics, deleteTopic } from "../services/TopicService";

import {
    LANGUAGES,
    getLanguageByKey,
} from "../../../../shared/constants/languageConstants";

import { EMPTY_FILTERS, PER_PAGE } from "./Topicconstants";

export default function useTopics() {
    const [language, setLanguage] = useState(LANGUAGES[0].key);

    const [topics, setTopics] = useState([]);
    const [totalEntries, setTotalEntries] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
    const [appliedFilters, setAppliedFilters] = useState({
        ...EMPTY_FILTERS,
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    /* =========================================================
       FETCH TOPICS
    ========================================================= */

    const fetchTopics = useCallback(async () => {
        setLoading(true);

        try {
            const selectedLanguage = getLanguageByKey(language);

            const params = {
                page: currentPage,
                limit: PER_PAGE,
                language_id: selectedLanguage.id,
            };

            // SEARCH BY ANY WORD
            if (appliedFilters.search?.trim()) {
                params.search = appliedFilters.search.trim();
            }


            const response = await getTopics(params);

            setTopics(response.data.topics);
            setTotalEntries(
                response.data.pagination.total_records
            );
            setTotalPages(
                response.data.pagination.total_pages
            );

        } catch (error) {
            console.error(
                "Topics API Error:",
                error?.response?.data ?? error
            );

            setTopics([]);
            setTotalEntries(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [
        language,
        currentPage,
        appliedFilters,
    ]);

    /* =========================================================
       FETCH WHEN LANGUAGE / PAGE / SEARCH CHANGES
    ========================================================= */

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    /* =========================================================
       LANGUAGE
    ========================================================= */

    const changeLanguage = useCallback((languageKey) => {

        setLanguage(languageKey);
        setCurrentPage(1);
    }, []);

    /* =========================================================
       FILTER INPUT
    ========================================================= */

    const changeFilter = useCallback((name, value) => {
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    /* =========================================================
       SEARCH
    ========================================================= */

    const applyFilters = useCallback(() => {
        setCurrentPage(1);

        setAppliedFilters({
            ...filters,
        });
    }, [filters]);

    /* =========================================================
       RESET
    ========================================================= */

    const resetFilters = useCallback(() => {
        setFilters({
            ...EMPTY_FILTERS,
        });

        setAppliedFilters({
            ...EMPTY_FILTERS,
        });

        setCurrentPage(1);
    }, []);

    /* =========================================================
       DELETE
    ========================================================= */

    const removeTopic = useCallback(
        async (topicId) => {
            await deleteTopic(topicId);
            await fetchTopics();
        },
        [fetchTopics]
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

        refetch: fetchTopics,
    };
}