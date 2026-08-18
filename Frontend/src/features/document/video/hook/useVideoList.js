import { useCallback, useEffect, useState } from "react";

import {
    getVideos,
    deleteVideo,
    getArchivedVersions,
} from "../services/VideoService";
import { PER_PAGE } from "./videoConstants";

/** Normalise the paginated `{ data, total }` envelope into an array. */
const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

export default function useVideoList() {
    const [videos, setVideos] = useState([]);
    const [totalEntries, setTotalEntries] = useState(0);

    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    const [perPage, setPerPage] = useState(PER_PAGE);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    /* archived versions (per-video, toggled from the row) */
    const [archivedForId, setArchivedForId] = useState(null);
    const [archivedRows, setArchivedRows] = useState([]);
    const [archivedLoading, setArchivedLoading] = useState(false);

    /* ================= FETCH ================= */

    const fetchVideos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getVideos({
                page: currentPage,
                limit: perPage,
                ...(appliedSearch.trim() ? { search: appliedSearch.trim() } : {}),
            });

            setVideos(toArray(response));
            setTotalEntries(response?.total ?? 0);
        } catch (error) {
            setVideos([]);
            setTotalEntries(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, appliedSearch]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

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

    const removeVideo = useCallback(
        async (videoId) => {
            await deleteVideo(videoId);
            await fetchVideos();
        },
        [fetchVideos]
    );

    const toggleArchived = useCallback(
        async (videoId) => {
            // Second click on the same row hides the archived section.
            if (archivedForId === videoId) {
                setArchivedForId(null);
                setArchivedRows([]);
                return;
            }

            setArchivedForId(videoId);
            setArchivedLoading(true);
            try {
                const rows = await getArchivedVersions(videoId);
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
        videos,
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

        removeVideo,
        refetch: fetchVideos,

        archivedForId,
        archivedRows,
        archivedLoading,
        toggleArchived,
    };
}
