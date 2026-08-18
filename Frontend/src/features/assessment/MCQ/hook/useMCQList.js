import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
    getMCQs,
    deleteMCQ,
} from "../services/MCQServices";

export const mcqColumns = [
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

export const languageMap = {
    english: 1,
    hindi: 2,
    bangla: 3,
    tamil: 4,
};

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

export default function useMCQList() {

    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 10;

    const [loading, setLoading] = useState(false);

    const [allMcqs, setAllMcqs] = useState([]);
    const [mcqs, setMcqs] = useState([]);

    const [search, setSearch] = useState("");

    const [language, setLanguage] = useState("english");

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadMCQs();
    }, [language]);

    useEffect(() => {

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;

        setMcqs(allMcqs.slice(start, end));

    }, [allMcqs, currentPage]);

    const loadMCQs = async () => {

        try {

            setLoading(true);

            const response = await getMCQs({
                language_id: languageMap[language],
                search,
            });

            const data = Array.isArray(response) ? response : [];

            setAllMcqs(data);

            setTotalPages(
                Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE))
            );

            setCurrentPage(1);

        } catch (error) {


            toast.error("Unable to load MCQs.");

        } finally {

            setLoading(false);

        }

    };

    const handleSearch = () => {

        setCurrentPage(1);

        loadMCQs();

    };

    const handleReset = () => {

        setSearch("");

        setCurrentPage(1);

        setTimeout(() => {
            loadMCQs();
        }, 0);

    };

    const handleDelete = async (mcqId) => {

        if (!window.confirm("Delete this MCQ?")) return;

        try {

            await deleteMCQ(mcqId);

            toast.success("MCQ deleted successfully.");

            loadMCQs();

        } catch (error) {


            toast.error("Unable to delete MCQ.");

        }

    };

    const handleView = (item) => {
        navigate(`/mcq-master/${item.parent_id ?? item.mcq_id}?tab=${language}`);
    };

    const handleEdit = (mcqId) => {

        navigate(`/mcq-master/edit/${mcqId}?tab=${language}`);

    };

    return {

        loading,

        mcqs,

        search,
        setSearch,

        language,
        setLanguage,

        currentPage,
        setCurrentPage,

        totalPages,

        loadMCQs,

        handleSearch,

        handleReset,

        handleDelete,

        handleView,

        handleEdit,

    };

}