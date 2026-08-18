import { useCallback, useEffect, useState } from "react";

import {
    getPdfs,
    deletePdf,
    getArchivedVersions,
} from "../services/PdfService";
import { PER_PAGE } from "./pdfConstants";

/** Normalise the paginated `{ data, total }` envelope into an array. */
const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

export default function usePdfList() {
    const [pdfs, setPdfs] = useState([]);
    const [totalEntries, setTotalEntries] = useState(0);

    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    const [perPage, setPerPage] = useState(PER_PAGE);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    /* archived versions (per-pdf, toggled from the row) */
    const [archivedForId, setArchivedForId] = useState(null);
    const [archivedRows, setArchivedRows] = useState([]);
    const [archivedLoading, setArchivedLoading] = useState(false);

    /* ================= FETCH ================= */

    const fetchPdfs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getPdfs({
                page: currentPage,
                limit: perPage,
                ...(appliedSearch.trim() ? { search: appliedSearch.trim() } : {}),
            });

            setPdfs(toArray(response));
            setTotalEntries(response?.total ?? 0);
        } catch (error) {
            setPdfs([]);
            setTotalEntries(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, appliedSearch]);

    useEffect(() => {
        fetchPdfs();
    }, [fetchPdfs]);

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

    const removePdf = useCallback(
        async (pdfId) => {
            await deletePdf(pdfId);
            await fetchPdfs();
        },
        [fetchPdfs]
    );

    const toggleArchived = useCallback(
        async (pdfId) => {
            // Second click on the same row hides the archived section.
            if (archivedForId === pdfId) {
                setArchivedForId(null);
                setArchivedRows([]);
                return;
            }

            setArchivedForId(pdfId);
            setArchivedLoading(true);
            try {
                const rows = await getArchivedVersions(pdfId);
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
        pdfs,
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

        removePdf,
        refetch: fetchPdfs,

        archivedForId,
        archivedRows,
        archivedLoading,
        toggleArchived,
    };
}
