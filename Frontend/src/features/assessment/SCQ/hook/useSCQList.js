import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
    getSCQs,
    deleteSCQ,
} from "../services/SCQServices";


/* =========================================================
   TABLE COLUMNS
========================================================= */

export const scqColumns = [
    {
        key: "srNo",
        title: "S.No.",
        className: "text-center w-16",
    },
    {
        key: "scq_question_title",
        title: "Question Title",
    },
    {
        key: "scq_question_description",
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


/* =========================================================
   LANGUAGE MAP
========================================================= */

export const languageMap = {
    english: 1,
    hindi: 2,
    bangla: 3,
    tamil: 4,
};


export const getLanguageName = (languageId) => {

    switch (Number(languageId)) {

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


/* =========================================================
   SCQ LIST HOOK
========================================================= */

export default function useSCQList() {

    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;


    /* =====================================================
       STATE
    ===================================================== */

    const [loading, setLoading] =
        useState(false);

    const [allSCQs, setAllSCQs] =
        useState([]);

    const [scqs, setSCQs] =
        useState([]);

    const [language, setLanguage] =
        useState("english");

    const [search, setSearch] =
        useState("");

    const [currentPage, setCurrentPage] =
        useState(1);

    const [totalPages, setTotalPages] =
        useState(1);


    /* =====================================================
       LOAD SCQs
    ===================================================== */

    const loadSCQs = async (
        searchValue = search
    ) => {

        try {

            setLoading(true);


            const languageId =
                languageMap[language];




            const response =
                await getSCQs({

                    language_id:
                        languageId,

                    search:
                        searchValue || undefined,

                });




            /*
             * API currently returns array.
             */

            const data =
                Array.isArray(response)
                    ? response
                    : (
                        Array.isArray(response?.items)
                            ? response.items
                            : []
                    );


            setAllSCQs(data);


            setTotalPages(
                Math.max(
                    1,
                    Math.ceil(
                        data.length /
                        ITEMS_PER_PAGE
                    )
                )
            );


            setCurrentPage(1);


        } catch (error) {

            console.error(
                "SCQ LIST ERROR:",
                error
            );


            const detail =
                error?.response?.data?.detail;


            if (Array.isArray(detail)) {

                toast.error(
                    detail[0]?.msg ||
                    "Unable to load SCQs."
                );

            } else {

                toast.error(
                    detail ||
                    "Unable to load SCQs."
                );

            }


        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       LOAD WHEN LANGUAGE CHANGES
    ===================================================== */

    useEffect(() => {

        loadSCQs("");

    }, [language]);


    /* =====================================================
       PAGINATION
    ===================================================== */

    useEffect(() => {

        const start =
            (currentPage - 1) *
            ITEMS_PER_PAGE;


        const end =
            start +
            ITEMS_PER_PAGE;


        setSCQs(
            allSCQs.slice(
                start,
                end
            )
        );

    }, [
        allSCQs,
        currentPage,
    ]);


    /* =====================================================
       SEARCH
    ===================================================== */

    const handleSearch = () => {

        setCurrentPage(1);

        loadSCQs(
            search.trim()
        );

    };


    /* =====================================================
       RESET
    ===================================================== */

    const resetSearch = async () => {

        setSearch("");

        setCurrentPage(1);

        await loadSCQs("");

    };


    /* =====================================================
       VIEW
    ===================================================== */

    const handleView = (item) => {

        /*
         * Important:
         *
         * API list gives parent_id for translated rows.
         * English row can use scq_id.
         */

        const parentId =
            item?.parent_id ??
            item?.scq_id ??
            item?.id;




        if (!parentId) {

            toast.error(
                "SCQ parent ID not found."
            );

            return;

        }


        navigate(
            `/scq-master/${parentId}?tab=${language}`
        );

    };


    /* =====================================================
       EDIT
    ===================================================== */

    const handleEdit = (
        scqId
    ) => {

        if (!scqId) {

            toast.error(
                "SCQ ID not found."
            );

            return;

        }


        navigate(
            `/scq-master/edit/${scqId}?tab=${language}`
        );

    };


    /* =====================================================
       DELETE
    ===================================================== */

    const removeSCQ = async (
        scqId
    ) => {

        try {

            await deleteSCQ(
                scqId
            );


            toast.success(
                "SCQ deleted successfully."
            );


            await loadSCQs(
                search.trim()
            );


        } catch (error) {

            console.error(
                "DELETE SCQ ERROR:",
                error
            );


            const detail =
                error?.response?.data?.detail;


            toast.error(
                detail ||
                "Unable to delete SCQ."
            );

        }

    };


    const handleDelete = (
        scqId
    ) => {

        if (
            !window.confirm(
                "Are you sure you want to delete this SCQ?"
            )
        ) {

            return;

        }


        removeSCQ(
            scqId
        );

    };


    /* =====================================================
       RETURN
    ===================================================== */

    return {

        loading,

        scqs,

        language,
        setLanguage,

        search,
        setSearch,

        currentPage,
        setCurrentPage,

        totalPages,

        loadSCQs,

        handleSearch,

        resetSearch,

        removeSCQ,

        handleView,

        handleEdit,

        handleDelete,

    };

}