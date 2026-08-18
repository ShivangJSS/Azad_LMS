import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
    getMatchMakings,
    deleteMatchMaking,
} from "../services/MatchingMakingService";

// =====================================================
// TABLE COLUMNS
// =====================================================

export const matchMakingColumns = [
    {
        key: "sr",
        title: "S. No.",
        className: "text-center w-[70px]",
    },
    {
        key: "question_title",
        title: "Question Title",
    },
    {
        key: "description",
        title: "Description",
    },
    {
        key: "image",
        title: "Image",
        className: "text-center",
    },
    {
        key: "marks",
        title: "Marks",
        className: "text-center",
    },
    {
        key: "language",
        title: "Language",
        className: "text-center",
    },
    {
        key: "status",
        title: "Status",
        className: "text-center",
    },
    {
        key: "action",
        title: "Action",
        className: "text-center",
    },
];

// =====================================================
// LANGUAGE MAP
// =====================================================

export const languageMap = {
    english: 1,
    hindi: 2,
    bangla: 3,
    tamil: 4,
};

// =====================================================
// LANGUAGE NAME
// =====================================================

export const getLanguageName = (id) => {
    switch (Number(id)) {
        case 1:
            return "English";

        case 2:
            return "Hindi";

        case 3:
            return "Bangla";

        case 4:
            return "Tamil";

        default:
            return "-";
    }
};

// =====================================================
// HOOK
// =====================================================

export default function useMatchMakingList() {
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;

    // =================================================
    // STATE
    // =================================================

    const [loading, setLoading] = useState(false);

    const [allMatchMakings, setAllMatchMakings] = useState([]);

    const [matchMakings, setMatchMakings] = useState([]);

    const [search, setSearch] = useState("");

    const [language, setLanguage] = useState("english");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);

    // =================================================
    // LOAD MATCH MAKINGS
    // =================================================

    const loadMatchMakings = async (searchValue = search) => {
        try {
            setLoading(true);

            const response = await getMatchMakings({
                language_id: languageMap[language],
                search: searchValue,
            });


            const data = Array.isArray(response)
                ? response
                : [];

            setAllMatchMakings(data);

            setCurrentPage(1);

            setTotalPages(
                Math.max(
                    1,
                    Math.ceil(
                        data.length / ITEMS_PER_PAGE
                    )
                )
            );
        } catch (error) {
            console.error(
                "MATCH MAKING LIST ERROR:",
                error
            );

            console.error(
                "MATCH MAKING ERROR RESPONSE:",
                error?.response?.data
            );

            toast.error(
                "Unable to load Match Making."
            );

            setAllMatchMakings([]);

            setMatchMakings([]);

            setTotalPages(1);

            setCurrentPage(1);
        } finally {
            setLoading(false);
        }
    };

    // =================================================
    // LOAD DATA WHEN LANGUAGE CHANGES
    // =================================================

    useEffect(() => {
        loadMatchMakings("");
    }, [language]);

    // =================================================
    // PAGINATION
    // =================================================

    useEffect(() => {
        const start =
            (currentPage - 1) * ITEMS_PER_PAGE;

        const end =
            start + ITEMS_PER_PAGE;

        setMatchMakings(
            allMatchMakings.slice(start, end)
        );
    }, [
        allMatchMakings,
        currentPage,
    ]);

    // =================================================
    // SEARCH
    // =================================================

    const handleSearch = () => {
        setCurrentPage(1);

        loadMatchMakings(search);
    };

    // =================================================
    // RESET
    // =================================================

    const handleReset = () => {
        setSearch("");

        setCurrentPage(1);

        loadMatchMakings("");
    };

    // =================================================
    // DELETE
    // =================================================

    const handleDelete = async (matchMakingId) => {
        if (
            !window.confirm(
                "Delete this Match Making?"
            )
        ) {
            return;
        }

        try {
            setLoading(true);

            await deleteMatchMaking(
                matchMakingId
            );

            toast.success(
                "Match Making deleted successfully."
            );

            await loadMatchMakings(search);
        } catch (error) {
            console.error(
                "DELETE MATCH MAKING ERROR:",
                error
            );

            console.error(
                "DELETE ERROR RESPONSE:",
                error?.response?.data
            );

            toast.error(
                "Unable to delete Match Making."
            );
        } finally {
            setLoading(false);
        }
    };

    // =================================================
    // VIEW
    // =================================================

    const handleView = (item) => {
        // Use `||` (not `??`) so a legacy parent_id of 0 falls back to the
        // real match_making_id instead of navigating to /.../0 (which 404s).
        const id =
            item?.parent_id ||
            item?.match_making_id;

        if (!id) {
            toast.error(
                "Match Making ID not found."
            );

            return;
        }

        navigate(
            `/match-making-master/${id}?tab=${language}`
        );
    };

    // =================================================
    // EDIT
    // =================================================

    const handleEdit = (matchMakingId) => {
        if (!matchMakingId) {
            toast.error(
                "Match Making ID not found."
            );

            return;
        }

        navigate(
            `/match-making-master/edit/${matchMakingId}?tab=${language}`
        );
    };

    // =================================================
    // LEFT ITEMS
    // =================================================

    const handleLeftItems = (matchMakingId) => {
        if (!matchMakingId) {
            toast.error(
                "Match Making ID not found."
            );

            return;
        }

        navigate(`/match-making-master/${matchMakingId}/left-items`);
    };

    // =================================================
    // RIGHT ITEMS
    // =================================================

    const handleRightItems = (matchMakingId) => {
        if (!matchMakingId) {
            toast.error(
                "Match Making ID not found."
            );

            return;
        }

        navigate(
            `/match-making-master/${matchMakingId}/right-items`
        );
    };

    // =================================================
    // CORRECT ANSWERS
    // =================================================

    const handleCorrectAnswers = (
        matchMakingId
    ) => {
        if (!matchMakingId) {
            toast.error(
                "Match Making ID not found."
            );

            return;
        }

        navigate(
            `/match-making-master/${matchMakingId}/correct-answers`
        );
    };

    // =================================================
    // RETURN
    // =================================================

    return {
        loading,

        matchMakings,

        search,
        setSearch,

        language,
        setLanguage,

        currentPage,
        setCurrentPage,

        totalPages,

        loadMatchMakings,

        handleSearch,

        handleReset,
        resetSearch: handleReset,

        handleDelete,

        handleView,

        handleEdit,

        handleLeftItems,

        handleRightItems,

        handleCorrectAnswers,
    };
}