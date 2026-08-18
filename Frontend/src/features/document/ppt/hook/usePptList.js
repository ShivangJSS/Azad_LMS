import { useCallback, useEffect, useState } from "react";

import {
    getPpts,
    deletePpt,
    getArchivedVersions,
} from "../services/PptService";
import { PER_PAGE } from "./pptConstants";

/** Normalise the paginated `{ data, total }` envelope into an array. */
const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

export default function usePptList() {
    const [ppts, setPpts] = useState([]);
    const [totalEntries, setTotalEntries] = useState(0);

    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    const [perPage, setPerPage] = useState(PER_PAGE);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    /* archived versions (per-ppt, toggled from the row) */
    const [archivedForId, setArchivedForId] = useState(null);
    const [archivedRows, setArchivedRows] = useState([]);
    const [archivedLoading, setArchivedLoading] = useState(false);

    /* ================= FETCH ================= */

    const fetchPpts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPpts({
                page: currentPage,
                limit: perPage,
                ...(appliedSearch.trim() ? { search: appliedSearch.trim() } : {}),
            });

            setPpts(toArray(response));
            setTotalEntries(response?.total ?? 0);
        } catch (error) {
            setPpts([]);
            setTotalEntries(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, appliedSearch]);

    useEffect(() => {
        fetchPpts();
    }, [fetchPpts]);

    /* ================= ACTIONS ================= */

    const applySearch = useCallback(() => {
        setCurrentPage(1);
        setAppliedSearch(search);
    }, [search]);

    const resetSearch = useCallback(() => {
        setSearch("");
        setAppliedSearch("");
        setCurrentPage(1);
    }, []);

    const changePerPage = useCallback((next) => {
        setPerPage(next);
        setCurrentPage(1);
    }, []);

    const removePpt = useCallback(
        async (pptId) => {
            await deletePpt(pptId);
            await fetchPpts();
        },
        [fetchPpts]
    );

    const toggleArchived = useCallback(
        async (pptId) => {
            // Second click on the same row hides the archived section.
            if (archivedForId === pptId) {
                setArchivedForId(null);
                setArchivedRows([]);
                return;
            }

            setArchivedForId(pptId);
            setArchivedLoading(true);
            try {
                const rows = await getArchivedVersions(pptId);
                setArchivedRows(Array.isArray(rows) ? rows : []);
            } catch (error) {
                setArchivedRows([]);
            } finally {
                setArchivedLoading(false);
            }
        },
        [archivedForId]
    );

    return {
        ppts,
        totalEntries,
        totalPages: Math.ceil(totalEntries / perPage) || 1,

        search,
        setSearch,
        applySearch,
        resetSearch,
        appliedSearch,

        perPage,
        changePerPage,
        currentPage,
        setCurrentPage,
        loading,

        removePpt,
        refetch: fetchPpts,

        archivedForId,
        archivedRows,
        archivedLoading,
        toggleArchived,
    };
}
