import { useCallback, useEffect, useMemo, useState } from "react";

import {
    deleteDocument,
    getAllDocuments,
    getDocumentCategories,
    getDocumentTypes,
    getLanguages,
} from "../services/DocumentServices";
import {
    EMPTY_FILTERS,
    FALLBACK_LANGUAGES,
    PER_PAGE,   
} from "./Documentconstants";
import {
    getLanguageById,
    getLanguageByKey,
    LANGUAGES,
} from "../../../shared/constants/languageConstants";

/**
 * Normalises whatever the API returns into a plain array.
 * Endpoints in this project return either a bare array or a paginated
 * `{ data, total }` envelope, so callers should not have to care which.
 */
const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

export default function useDocuments() {
    const [language, setLanguage] = useState("");
    const [languages, setLanguages] = useState(FALLBACK_LANGUAGES);
    const [docTypes, setDocTypes] = useState([]);

    const [documents, setDocuments] = useState([]);
    const [totalEntries, setTotalEntries] = useState(0);

    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    /* ==============================
       LOOKUPS
    ============================== */

    useEffect(() => {
        const loadLookups = async () => {
            try {
                const response = await getLanguages();
                const list = toArray(response);

                if (list.length > 0) {
                    setLanguages(list);
                    setLanguage((prev) => prev || String(list[0].id));
                }
            } catch (error) {
                console.error("Language API Error:", error?.response?.data ?? error);
                setLanguage((prev) => prev || FALLBACK_LANGUAGES[0].id);
            }

            try {
                const response = await getDocumentTypes();
                setDocTypes(toArray(response));
            } catch (error) {
                console.error("Doc type API Error:", error?.response?.data ?? error);
                setDocTypes([]);
            }
        };

        loadLookups();
    }, []);

    /* ==============================
       DOCUMENTS
    ============================== */

    const fetchDocuments = useCallback(async () => {
        if (!language) return;

        setLoading(true);

        try {
            const params = {
                page: currentPage,
                per_page: PER_PAGE,
            };

            const languageId = Number(language);
            if (Number.isInteger(languageId) && languageId > 0) {
                params.language_id = languageId;
            }

            if (appliedFilters.title.trim()) {
                params.search = appliedFilters.title.trim();
            }

            if (appliedFilters.doc_type) {
                params.doc_type = appliedFilters.doc_type;
            }

            const response = await getAllDocuments(params);

            setDocuments(toArray(response));
            setTotalEntries(response?.total ?? 0);
        } catch (error) {
            console.error("Document API Error:", error?.response?.data ?? error);
            setDocuments([]);
            setTotalEntries(0);
        } finally {
            setLoading(false);
        }
    }, [language, currentPage, appliedFilters]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    /* ==============================
       ACTIONS
    ============================== */

    const changeLanguage = useCallback((nextLanguage) => {
        setLanguage(String(nextLanguage));
        setCurrentPage(1);
    }, []);

    /** Convert a language key ("english") → numeric ID and call changeLanguage. */
    const changeLanguageByKey = useCallback((key) => {
        const lang = getLanguageByKey(key);
        if (lang) changeLanguage(lang.id);
    }, [changeLanguage]);

    /** Derived key for LanguageTabs (e.g. "english"). */
    const languageKey = useMemo(() => {
        const lang = getLanguageById(language);
        return lang?.key || LANGUAGES[0].key;
    }, [language]);

    const changeFilter = useCallback((name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    }, []);

    const applyFilters = useCallback(() => {
        setCurrentPage(1);
        setAppliedFilters(filters);
    }, [filters]);

    const resetFilters = useCallback(() => {
        setFilters(EMPTY_FILTERS);
        setAppliedFilters(EMPTY_FILTERS);
        setCurrentPage(1);
    }, []);

    const removeDocument = useCallback(
        async (documentId) => {
            await deleteDocument(documentId);

            // Refetch instead of splicing: with server-side pagination the
            // current page and the total both change.
            await fetchDocuments();
        },
        [fetchDocuments],
    );

    return {
        // data
        language,
        languageKey,
        languages,
        docTypes,
        documents,
        totalEntries,
        totalPages: Math.ceil(totalEntries / PER_PAGE) || 1,

        // ui state
        filters,
        appliedFilters,
        currentPage,
        loading,

        // actions
        changeLanguage,
        changeLanguageByKey,
        changeFilter,
        applyFilters,
        resetFilters,
        setCurrentPage,
        removeDocument,
        refetch: fetchDocuments,
    };
}
