import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
    getModules,
    deleteModule,
} from "@/features/module/ListModule/services/ListService";
import { getTopicCountsByModule } from "@/features/module/Topic/services/TopicService";

import {
    LANGUAGES,
    getLanguageByKey,
} from "@/shared/constants/languageConstants";

import {
    EMPTY_FILTERS,
    PER_PAGE,
} from "./Listconstants";

export default function useList() {
    /* =========================
       STATE
    ========================= */

    // Start on whatever tab the URL asks for (e.g. after "+ Add Module"
    // from the Hindi tab redirects to /modules?tab=hindi), else English.
    const [searchParams] = useSearchParams();

    const [language, setLanguage] = useState(
        (searchParams.get("tab") || LANGUAGES[0].key).toLowerCase()
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
            if (appliedFilters.search?.trim()) {
                params.search = appliedFilters.search.trim();
            }


            const response = await getModules(params);


            // YOUR API RESPONSE:
            // {
            //    data: [...],
            //    pagination: {...}
            // }

            const moduleRows = Array.isArray(response?.data)
                ? response.data
                : [];

            const baseResponse = await getModules({
                language_id: 1,
                page: 1,
                limit: 1000,
            });

            const baseModuleRows = Array.isArray(baseResponse?.data)
                ? baseResponse.data
                : [];

            const baseModuleMap = Object.fromEntries(
                baseModuleRows.map((baseModule) => [
                    String(baseModule.module_id),
                    baseModule.module_name,
                ])
            );

            // Defend against an incorrectly scoped API response. A row
            // without a language_id cannot safely belong to this tab.
            const languageScopedRows = moduleRows.filter((module) =>
                Number(module.language_id) === Number(selectedLanguage.id)
            );

            let topicCounts = null;
            try {
                // Scope topic counts to the selected language so other
                // languages' topics never inflate this tab's counts.
                topicCounts = await getTopicCountsByModule(selectedLanguage.id);
            } catch {
                topicCounts = null;
            }
        
            const modulesWithTopicCounts = languageScopedRows.map((module) => {
                const baseModuleId =
                    module.parent_id ?? module.module_id;

                const baseModuleName =
                    baseModuleMap[String(baseModuleId)]
                        ?.trim()
                        .toLowerCase();

                const topicCount =
                    baseModuleName
                        ? topicCounts?.[`name:${baseModuleName}`] ?? 0
                        : 0;

                return {
                    ...module,
                    topic_count: topicCount,
                };
            });
            setModules(modulesWithTopicCounts);

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
        appliedFilters,
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
