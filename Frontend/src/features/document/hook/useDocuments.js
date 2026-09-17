import { useCallback, useEffect, useMemo, useState } from "react";

import {
    deleteDocument,
    getAllDocuments,
    getDocumentTypes,
    getLanguages,
} from "@/features/document/services/DocumentServices";

import {
    EMPTY_FILTERS,
    FALLBACK_LANGUAGES,
    PER_PAGE,
} from "./Documentconstants";

import {
    getLanguageById,
    getLanguageByKey,
    LANGUAGES,
} from "@/shared/constants/languageConstants";

/**
 * Normalise API response into an array.
 */
const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    return [];
};

export default function useDocuments() {
    const [language, setLanguage] = useState("");
    const [languages, setLanguages] = useState(FALLBACK_LANGUAGES);
    const [docTypes, setDocTypes] = useState([]);

    const [documents, setDocuments] = useState([]);
    const [totalEntries, setTotalEntries] = useState(0);

    // Current UI filter values
    const [filters, setFilters] = useState(EMPTY_FILTERS);

    // Filters actually applied to the table
    const [appliedFilters, setAppliedFilters] =
        useState(EMPTY_FILTERS);

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    /* ============================================================
       LOOKUPS
    ============================================================ */

    useEffect(() => {
        const loadLookups = async () => {
            /*
             * Languages
             */
            try {
                const response = await getLanguages();
                const list = toArray(response);

                if (list.length > 0) {
                    setLanguages(list);

                    setLanguage((prev) => {
                        return prev || String(list[0].id);
                    });
                }
            } catch (error) {
                console.error(
                    "Language API Error:",
                    error?.response?.data ?? error
                );

                setLanguage(
                    (prev) =>
                        prev || FALLBACK_LANGUAGES[0].id
                );
            }

            /*
             * Document Types
             */
            try {
                const response = await getDocumentTypes();

                setDocTypes(toArray(response));
            } catch (error) {
                console.error(
                    "Doc type API Error:",
                    error?.response?.data ?? error
                );

                setDocTypes([]);
            }
        };

        loadLookups();
    }, []);

    /* ============================================================
       COMMON FILTER PARAMS
       
       IMPORTANT:
       This function is shared by:
       - Table API
       - Export API

       So both always use the same filters.
    ============================================================ */

    const buildDocumentParams = useCallback(() => {
        const params = {};

        /*
         * Language
         */
        const languageId = Number(language);

        if (
            Number.isInteger(languageId) &&
            languageId > 0
        ) {
            params.language_id = languageId;
        }

        /*
         * Search / Title
         */
        if (appliedFilters.title?.trim()) {
            params.search =
                appliedFilters.title.trim();
        }

        /*
         * Document Type
         */
        if (appliedFilters.doc_type) {
            params.doc_type =
                appliedFilters.doc_type;
        }

        return params;
    }, [language, appliedFilters]);

    /* ============================================================
       DOCUMENTS
    ============================================================ */

    const fetchDocuments = useCallback(async () => {
        if (!language) return;

        setLoading(true);

        try {
            /*
             * Use the SAME filter params as export.
             *
             * Pagination is added ONLY for table listing.
             */
            const params = {
                ...buildDocumentParams(),

                page: currentPage,
                per_page: PER_PAGE,
            };

            const response =
                await getAllDocuments(params);

            setDocuments(toArray(response));

            setTotalEntries(
                response?.total ?? 0
            );
        } catch (error) {
            console.error(
                "Document API Error:",
                error?.response?.data ?? error
            );

            setDocuments([]);
            setTotalEntries(0);
        } finally {
            setLoading(false);
        }
    }, [
        language,
        currentPage,
        buildDocumentParams,
    ]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    /* ============================================================
       LANGUAGE
    ============================================================ */

    const changeLanguage = useCallback(
        (nextLanguage) => {
            setLanguage(String(nextLanguage));

            // Clear search and other filters when language tab changes
            setFilters({
                ...EMPTY_FILTERS,
            });

            setAppliedFilters({
                ...EMPTY_FILTERS,
            });

            setCurrentPage(1);
        },
        []
    );

    /**
     * Convert language key ("english")
     * to numeric ID.
     */
    const changeLanguageByKey = useCallback(
        (key) => {
            const lang = getLanguageByKey(key);

            if (lang) {
                changeLanguage(lang.id);
            }
        },
        [changeLanguage]
    );

    /**
     * Derived language key for LanguageTabs.
     */
    const languageKey = useMemo(() => {
        const lang = getLanguageById(language);

        return (
            lang?.key ||
            LANGUAGES[0].key
        );
    }, [language]);

    /* ============================================================
       FILTERS
    ============================================================ */

    /**
     * Change filter input.
     *
     * This only changes the UI filter.
     * It does NOT immediately change the table.
     */
    const changeFilter = useCallback(
        (name, value) => {
            setFilters((prev) => ({
                ...prev,
                [name]: value,
            }));
        },
        []
    );

    /**
     * Apply current filters to the table.
     */
    const applyFilters = useCallback(() => {
        setCurrentPage(1);

        setAppliedFilters({
            ...filters,
        });
    }, [filters]);

    /**
     * Reset all filters.
     */
    const resetFilters = useCallback(() => {
        setFilters({
            ...EMPTY_FILTERS,
        });

        setAppliedFilters({
            ...EMPTY_FILTERS,
        });

        setCurrentPage(1);
    }, []);

    /* ============================================================
       DELETE
    ============================================================ */

    const removeDocument = useCallback(
        async (documentId) => {
            await deleteDocument(documentId);

            /*
             * Refetch current filtered page.
             */
            await fetchDocuments();
        },
        [fetchDocuments]
    );

    /* ============================================================
       RETURN
    ============================================================ */

    return {
        /* -------------------------
           DATA
        ------------------------- */

        language,
        languageKey,
        languages,
        docTypes,

        documents,

        totalEntries,

        totalPages:
            Math.ceil(
                totalEntries / PER_PAGE
            ) || 1,

        /* -------------------------
           FILTER STATE
        ------------------------- */

        filters,
        appliedFilters,

        /* -------------------------
           PAGINATION
        ------------------------- */

        currentPage,

        /* -------------------------
           LOADING
        ------------------------- */

        loading,

        /* -------------------------
           ACTIONS
        ------------------------- */

        changeLanguage,
        changeLanguageByKey,

        changeFilter,
        applyFilters,
        resetFilters,

        setCurrentPage,

        removeDocument,

        /*
         * IMPORTANT:
         * Use this for ExportButton.
         *
         * It contains filters but NOT pagination.
         */
        buildDocumentParams,

        refetch: fetchDocuments,
    };
}