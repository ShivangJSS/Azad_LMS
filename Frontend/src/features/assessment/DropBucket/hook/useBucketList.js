import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
    getBuckets,
    getQuestionItems,
    deleteBucket,
} from "@/features/assessment/DropBucket/services/DropBucketServices";

// ======================================================
// TABLE COLUMNS
// ======================================================

export const bucketColumns = [
    {
        key: "serial_no",
        title: "S. No.",
    },
    {
        key: "question_title",
        title: "Question Title",
    },
    {
        key: "question_image",
        title: "Question Image",
    },
    {
        key: "bucket_name",
        title: "Bucket Name",
    },
    {
        key: "bucket_image",
        title: "Bucket Image",
    },
    {
        key: "marks",
        title: "Marks",
    },
    {
        key: "language",
        title: "Language",
    },
    {
        key: "status",
        title: "Status",
    },
    {
        key: "action",
        title: "Action",
    },
];

// ======================================================
// LANGUAGE NAME
// ======================================================

export const getLanguageName = (languageId) => {
    const languages = {
        1: "English",
        2: "Hindi",
        3: "Bangla",
        4: "Tamil",
    };

    return languages[languageId] || "-";
};

// ======================================================
// HOOK
// ======================================================

export default function useBucketList() {
    const navigate = useNavigate();

    // ==================================================
    // BUCKET TABLE STATES
    // ==================================================

    const [loading, setLoading] =
        useState(false);

    const [buckets, setBuckets] =
        useState([]);

    const [totalCount, setTotalCount] =
        useState(0);

    const [language, setLanguage] =
        useState("english");

    const [search, setSearch] =
        useState("");

    const [currentPage, setCurrentPage] =
        useState(1);

    const [totalPages, setTotalPages] =
        useState(1);

    // ==================================================
    // ITEM MODAL STATES
    // ==================================================

    const [isItemModalOpen, setIsItemModalOpen] =
        useState(false);

    const [selectedBucketId, setSelectedBucketId] =
        useState(null);

    const [selectedBucketName, setSelectedBucketName] =
        useState("");

    const [bucketItems, setBucketItems] =
        useState([]);

    const [itemsLoading, setItemsLoading] =
        useState(false);

    // ==================================================
    // LANGUAGE MAP
    // ==================================================

    const languageMap = useMemo(
        () => ({
            english: 1,
            hindi: 2,
            bangla: 3,
            tamil: 4,
        }),
        []
    );

    // ==================================================
    // LOAD BUCKETS
    // ==================================================

    const loadBuckets = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);

                const languageId =
                    languageMap[language];

                const params = {
                    page: Number(page),
                    limit: 10,
                    language_id:
                        languageId,
                };

                if (
                    search?.trim()
                ) {
                    params.search =
                        search.trim();
                }



                const response =
                    await getBuckets(
                        params
                    );


                const list =
                    Array.isArray(response)
                        ? response
                        : response?.data ||
                        response?.items ||
                        response?.results ||
                        [];

                setBuckets(list);

                const total =
                    Number(
                        response?.total ??
                        response?.total_count ??
                        list.length
                    );

                setTotalCount(total);

                setTotalPages(
                    Math.ceil(
                        total / 10
                    ) || 1
                );
            } catch (error) {
                console.error(
                    "Failed to load buckets:",
                    error
                );

                setBuckets([]);
                setTotalCount(0);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        },
        [
            language,
            search,
            languageMap,
        ]
    );

    // ==================================================
    // INITIAL / FILTER LOAD
    // ==================================================

    useEffect(() => {
        loadBuckets(
            currentPage
        );
    }, [
        currentPage,
        language,
        loadBuckets,
    ]);

    // ==================================================
    // SHOW BUCKET ITEMS
    // ==================================================

    const handleShowItems = async (bucket) => {
        // Items belong to the question's BUCKETS. Fetch every item across all
        // buckets of this question (drop_bucket_id) so the modal — which shows
        // a Bucket Name column — can display them all.
        const dropBucketId = bucket?.drop_bucket_id ?? bucket?.id;
        const bucketName = bucket?.bucket_name || "";
        const languageId = 1; // English only

        setSelectedBucketId(dropBucketId);
        setSelectedBucketName(bucketName);
        setIsItemModalOpen(true);
        setItemsLoading(true);

        try {
            if (!dropBucketId) {
                setBucketItems([]);
                return;
            }

            const response = await getQuestionItems(dropBucketId, languageId);
            const items = Array.isArray(response?.items) ? response.items : [];

            setBucketItems(items);
        } catch (error) {
            console.error(
                "Failed to fetch bucket items:",
                error?.response?.data || error?.message
            );
            setBucketItems([]);
        } finally {
            setItemsLoading(false);
        }
    };

    // ==================================================
    // CLOSE ITEM MODAL
    // ==================================================

    const closeItemModal = () => {
        setIsItemModalOpen(
            false
        );

        setSelectedBucketId(
            null
        );

        setSelectedBucketName(
            ""
        );

        setBucketItems([]);
    };

    // ==================================================
    // LANGUAGE CHANGE
    // ==================================================

    const handleLanguageChange =
        useCallback((value) => {
            setLanguage(value);
            setCurrentPage(1);
        }, []);

    // ==================================================
    // SEARCH CHANGE
    // ==================================================

    const handleSearchChange =
        useCallback((value) => {
            setSearch(value);
            setCurrentPage(1);
        }, []);

    // ==================================================
    // SEARCH
    // ==================================================

    const handleSearch =
        useCallback(() => {
            setCurrentPage(1);
            loadBuckets(1);
        }, [loadBuckets]);

    // ==================================================
    // RESET SEARCH
    // ==================================================

    const resetSearch =
        useCallback(() => {
            setSearch("");
            setCurrentPage(1);
        }, []);

    // ==================================================
    // PAGINATION
    // ==================================================

    const handlePageChange =
        useCallback((page) => {
            const nextPage =
                Math.max(
                    1,
                    Number(page) || 1
                );

            setCurrentPage(
                nextPage
            );
        }, []);

    // ==================================================
    // CREATE
    // ==================================================

    const handleCreateBucket = () => {
        navigate(
            "/drop-bucket-master/create"
        );
    };

    // ==================================================
    // VIEW
    // ==================================================

    const handleView = (id) => {
        navigate(
            `/drop-bucket-master/view/${id}?tab=${language}`
        );
    };

    // ==================================================
    // EDIT
    // ==================================================

    const handleEdit = (id) => {
        navigate(
            `/drop-bucket-master/edit/${id}?tab=${language}`
        );
    };

    // ==================================================
    // EDIT ITEMS
    // ==================================================

    const handleEditItems = (id) => {
        // `id` is the question's drop_bucket_id; the editor loads every
        // bucket's items for that question.
        navigate(
            `/drop-bucket-master/items/edit/${id}`
        );
    };

    // ==================================================
    // DELETE
    // ==================================================

    const handleDelete = async (
        id
    ) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this bucket?"
            )
        ) {
            return;
        }

        try {
            setLoading(true);

            await deleteBucket(id);

            await loadBuckets(
                currentPage
            );
        } catch (error) {
            console.error(
                "Failed to delete bucket:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // RETURN
    // ==================================================

    return {
        // ----------------------------------------------
        // Bucket data
        // ----------------------------------------------

        loading,
        buckets,
        totalCount,
        currentPage,
        totalPages,

        // ----------------------------------------------
        // Language
        // ----------------------------------------------

        language,

        setLanguage:
            handleLanguageChange,

        // ----------------------------------------------
        // Search
        // ----------------------------------------------

        search,

        setSearch:
            handleSearchChange,

        handleSearch,
        resetSearch,

        // ----------------------------------------------
        // Pagination
        // ----------------------------------------------

        setCurrentPage:
            handlePageChange,

        // ----------------------------------------------
        // Actions
        // ----------------------------------------------

        handleView,
        handleEdit,
        handleDelete,
        handleEditItems,
        handleCreateBucket,

        // ----------------------------------------------
        // Item Modal
        // ----------------------------------------------

        isItemModalOpen,

        selectedBucketId,

        selectedBucketName,

        bucketItems,

        itemsLoading,

        handleShowItems,

        closeItemModal,

        // ----------------------------------------------
        // API
        // ----------------------------------------------

        loadBuckets,
    };
}