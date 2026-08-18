import { useCallback, useEffect, useState } from "react";

import {
    getModules,
    deleteModule,
} from "../services/ListService";

import {
    LANGUAGES,
    getLanguageByKey,
} from "../../../../shared/constants/languageConstants";

import {
    EMPTY_FILTERS,
    PER_PAGE,
} from "./Listconstants";

export default function useList() {
    /* =========================
       STATE
    ========================= */

    const [language, setLanguage] = useState(
        LANGUAGES[0].key
    );

    const [modules, setModules] = useState([]);

    const [totalEntries, setTotalEntries] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [filters, setFilters] = useState(
        EMPTY_FILTERS
    );

    const [appliedFilters, setAppliedFilters] =
        useState(EMPTY_FILTERS);

    const [currentPage, setCurrentPage] = useState(1);

    const [loading, setLoading] = useState(false);

    /* =========================
       FETCH MODULES
    ========================= */

    const fetchModules = useCallback(async () => {
        setLoading(true);

        try {
            const selectedLanguage = getLanguageByKey(language);

            const params = {
                language_id: selectedLanguage.id,
                page: currentPage,
                limit: PER_PAGE,
            };

            // Search tabhi bhejna jab user ne kuch search kiya ho
            if (appliedFilters.search?.trim()) {
                params.search = appliedFilters.search.trim();
            }


            const response = await getModules(params);


            // YOUR API RESPONSE:
            // {
            //    data: [...],
            //    pagination: {...}
            // }

            setModules(
                Array.isArray(response?.data)
                    ? response.data
                    : []
            );

            setTotalEntries(
                response?.pagination?.total ?? 0
            );

            setTotalPages(
                response?.pagination?.pages ?? 1
            );

        } catch (error) {
            console.error(
                "Module API Error:",
                error?.response?.data ?? error
            );

            setModules([]);
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

    /* =========================
       LOAD
    ========================= */

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    /* =========================
       LANGUAGE
    ========================= */

    const changeLanguage = useCallback(
        (nextLanguageKey) => {
            setLanguage(nextLanguageKey);
            setCurrentPage(1);
        },
        []
    );

    /* =========================
       FILTER CHANGE
    ========================= */

    const changeFilter = useCallback(
        (name, value) => {
            setFilters((prev) => ({
                ...prev,
                [name]: value,
            }));
        },
        []
    );

    /* =========================
       SEARCH
    ========================= */

    const applyFilters = useCallback(() => {
        setCurrentPage(1);

        setAppliedFilters({
            ...filters,
        });
    }, [filters]);

    /* =========================
       RESET
    ========================= */

    const resetFilters = useCallback(() => {
        setFilters({
            ...EMPTY_FILTERS,
        });

        setAppliedFilters({
            ...EMPTY_FILTERS,
        });

        setCurrentPage(1);
    }, []);

    /* =========================
       DELETE MODULE
    ========================= */

    const removeModule = useCallback(
        async (moduleId) => {
            await deleteModule(moduleId);

            await fetchModules();
        },
        [fetchModules]
    );

    /* =========================
       RETURN
    ========================= */

    return {
        // Data
        language,
        modules,
        totalEntries,
        totalPages,

        // UI
        filters,
        currentPage,
        loading,

        // Actions
        changeLanguage,
        changeFilter,
        applyFilters,
        resetFilters,
        setCurrentPage,
        removeModule,

        // Refresh
        refetch: fetchModules,
    };
}