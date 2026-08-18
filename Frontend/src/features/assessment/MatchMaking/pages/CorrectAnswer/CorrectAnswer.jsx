import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../../shared/components/breadcrumbs/Breadcrumbs";
import DataTable from "../../../../../shared/components/table/DataTable";
import EntriesDropdown from "../../../../../shared/components/table/EntriesDropdown";
import Pagination from "../../../../../shared/components/table/Pagination";

import {
    getCorrectAnswers,
    getLeftItems,
    getRightItems,
    deleteCorrectAnswer,
} from "../../services/MatchingMakingService";

export default function CorrectAnswer() {
    const { matchMakingId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [items, setItems] = useState([]);
    const [leftItems, setLeftItems] = useState([]);
    const [rightItems, setRightItems] = useState([]);

    const [search, setSearch] = useState("");
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [sortField, setSortField] = useState("");
    const [sortDirection, setSortDirection] = useState("asc");

    // =====================================================
    // LOAD DATA
    // =====================================================

    const loadCorrectAnswers = async () => {
        if (!matchMakingId) {
            toast.error("Match Making ID not found.");
            return;
        }

        try {
            setLoading(true);

            const [
                correctResponse,
                leftResponse,
                rightResponse,
            ] = await Promise.all([
                getCorrectAnswers(matchMakingId),
                getLeftItems(matchMakingId, 1),
                getRightItems(matchMakingId, 1),
            ]);




            const correctData = Array.isArray(correctResponse)
                ? correctResponse
                : [];

            const leftData = Array.isArray(leftResponse)
                ? leftResponse
                : [];

            const rightData = Array.isArray(rightResponse)
                ? rightResponse
                : [];

            setLeftItems(leftData);
            setRightItems(rightData);

            // =================================================
            // MAP LEFT / RIGHT TEXT
            // =================================================

            const mappedData = correctData.map((item) => {
                const leftItem = leftData.find(
                    (left) =>
                        Number(left?.match_left_id) ===
                        Number(item?.match_left_id)
                );

                const rightItem = rightData.find(
                    (right) =>
                        Number(right?.match_right_id) ===
                        Number(item?.match_right_id)
                );

                return {
                    ...item,

                    match_left_text:
                        leftItem?.match_left_text || "-",

                    match_right_text:
                        rightItem?.match_right_text || "-",
                };
            });


            setItems(mappedData);
            setCurrentPage(1);

        } catch (error) {
            console.error(
                "CORRECT ANSWERS ERROR:",
                error
            );

            console.error(
                "CORRECT ANSWERS ERROR RESPONSE:",
                error?.response?.data
            );

            setItems([]);
            setLeftItems([]);
            setRightItems([]);

            toast.error(
                error?.response?.data?.detail ||
                "Unable to load Correct Answers."
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        loadCorrectAnswers();
    }, [matchMakingId]);

    // =====================================================
    // SEARCH
    // =====================================================

    const filteredItems = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return items;
        }

        return items.filter((item) => {
            const leftText =
                item?.match_left_text || "";

            const rightText =
                item?.match_right_text || "";

            return (
                String(leftText)
                    .toLowerCase()
                    .includes(value) ||
                String(rightText)
                    .toLowerCase()
                    .includes(value)
            );
        });
    }, [items, search]);

    // =====================================================
    // SORT
    // =====================================================

    const sortedItems = useMemo(() => {
        const data = [...filteredItems];

        if (!sortField) {
            return data;
        }

        data.sort((a, b) => {
            let valueA = "";
            let valueB = "";

            // ---------------------------------------------
            // ID
            // ---------------------------------------------

            if (sortField === "sr") {
                valueA =
                    a?.match_correct_answers_id ?? 0;

                valueB =
                    b?.match_correct_answers_id ?? 0;

                return sortDirection === "asc"
                    ? Number(valueA) - Number(valueB)
                    : Number(valueB) - Number(valueA);
            }

            // ---------------------------------------------
            // LEFT ITEM
            // ---------------------------------------------

            if (sortField === "left_item") {
                valueA =
                    a?.match_left_text || "";

                valueB =
                    b?.match_left_text || "";

                return sortDirection === "asc"
                    ? String(valueA).localeCompare(
                        String(valueB)
                    )
                    : String(valueB).localeCompare(
                        String(valueA)
                    );
            }

            // ---------------------------------------------
            // RIGHT ITEM
            // ---------------------------------------------

            if (sortField === "right_item") {
                valueA =
                    a?.match_right_text || "";

                valueB =
                    b?.match_right_text || "";

                return sortDirection === "asc"
                    ? String(valueA).localeCompare(
                        String(valueB)
                    )
                    : String(valueB).localeCompare(
                        String(valueA)
                    );
            }

            return 0;
        });

        return data;
    }, [
        filteredItems,
        sortField,
        sortDirection,
    ]);

    // =====================================================
    // SORT HANDLER
    // =====================================================

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection((prev) =>
                prev === "asc"
                    ? "desc"
                    : "asc"
            );
        } else {
            setSortField(field);
            setSortDirection("asc");
        }

        setCurrentPage(1);
    };

    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages = Math.max(
        1,
        Math.ceil(
            sortedItems.length / entries
        )
    );

    const startIndex =
        (currentPage - 1) * entries;

    const paginatedItems =
        sortedItems.slice(
            startIndex,
            startIndex + entries
        );

    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    // =====================================================
    // ENTRIES
    // =====================================================

    const handleEntriesChange = (value) => {
        setEntries(Number(value));
        setCurrentPage(1);
    };

    // =====================================================
    // ADD
    // =====================================================

    const handleAdd = () => {
        if (items.length > 0) {
            toast.error(
                "Correct answers already exist."
            );
            return;
        }

        navigate(
            `/match-making-master/${matchMakingId}/correct-answers/add`
        );
    };

    // =====================================================
    // EDIT
    // =====================================================

    const handleEdit = () => {
        if (!items.length) {
            toast.error(
                "Correct answers not found."
            );
            return;
        }

        navigate(
            `/match-making-master/${matchMakingId}/correct-answers/edit`
        );
    };

    // =====================================================
    // DELETE ALL
    // =====================================================

    const handleDelete = async () => {
        if (!items.length) {
            toast.error(
                "No correct answers available."
            );
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete all correct answers?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setLoading(true);

            await Promise.all(
                items.map((item) => {
                    const id =
                        item?.match_correct_answers_id;

                    if (!id) {
                        return Promise.resolve();
                    }

                    return deleteCorrectAnswer(id);
                })
            );

            toast.success(
                "Correct answers deleted successfully."
            );

            setItems([]);
            setCurrentPage(1);
            setSearch("");

            await loadCorrectAnswers();

        } catch (error) {
            console.error(
                "DELETE CORRECT ANSWERS ERROR:",
                error
            );

            console.error(
                "DELETE CORRECT ANSWERS RESPONSE:",
                error?.response?.data
            );

            toast.error(
                error?.response?.data?.detail ||
                "Unable to delete correct answers."
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // COLUMNS
    // =====================================================

    const columns = [
        {
            key: "sr",
            title: "#",
            className: "w-[70px] text-center",
            sortable: true,
        },
        {
            key: "left_item",
            title: "Left Item",
            sortable: true,
        },
        {
            key: "right_item",
            title: "Right Item",
            sortable: true,
        },
    ];

    // =====================================================
    // TABLE ROW
    // =====================================================

    const renderRow = (item, index) => {
        return (
            <tr
                key={
                    item?.match_correct_answers_id ??
                    index
                }
                className="bg-white hover:bg-[#F8FAFC]"
            >
                <td className="border border-[#D8E2EF] px-4 py-3 text-center text-[13px] text-[#60758D]">
                    {startIndex + index + 1}
                </td>

                <td className="border border-[#D8E2EF] px-4 py-3 text-[13px] text-[#60758D]">
                    {item?.match_left_text || "-"}
                </td>

                <td className="border border-[#D8E2EF] px-4 py-3 text-[13px] text-[#60758D]">
                    {item?.match_right_text || "-"}
                </td>
            </tr>
        );
    };

    // =====================================================
    // BREADCRUMB
    // =====================================================

    const breadcrumbItems = [
        {
            label: "Home",
            path: "/",
        },
        {
            label: "Match Making Questions",
            path: "/match-making-master",
        },
        {
            label: "Correct Answers",
            path: `/match-making-master/${matchMakingId}/correct-answers`,
        },
    ];

    // =====================================================
    // UI
    // =====================================================

    return (
        <AppLayout>

            {/* HEADER */}

            <div className="mb-4 flex items-center justify-between">

                <span className="text-[22px] font-medium text-[#344050]">
                    Match Correct Answers
                </span>

                <Breadcrumbs
                    items={breadcrumbItems}
                />

            </div>

            {/* CARD */}

            <div className="rounded-[6px] border border-[#D8E2EF] bg-white p-4">

                {/* ACTION BUTTONS */}

                <div className="mb-5 flex items-center justify-between gap-2">
                    <button type="button" onClick={() => navigate(-1)} className="inline-flex h-[32px] items-center gap-[6px] rounded-[4px] border border-[#344050] bg-white px-[14px] text-[13px] font-medium text-[#344050] hover:bg-[#f8f9fa]">← Back</button>

                    <div className="flex items-center gap-2">
                    {items.length > 0 ? (
                        <button
                            type="button"
                            onClick={handleEdit}
                            disabled={loading}
                            className="rounded bg-[#732269] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#5D1B57] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Edit Correct Answers
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={loading}
                            className="rounded border border-[#D8E2EF] bg-white px-4 py-2 text-[13px] font-medium text-[#344050] hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            + Add Correct Answer
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={
                            loading ||
                            items.length === 0
                        }
                        className={`rounded px-4 py-2 text-[13px] font-medium text-white ${items.length === 0 ||
                                loading
                                ? "cursor-not-allowed bg-[#CED4DA]"
                                : "bg-[#EF4B55] hover:bg-[#D93D47]"
                            }`}
                    >
                        {loading
                            ? "Deleting..."
                            : "Delete"}
                    </button>
                    </div>

                </div>

                {/* CONTROLS */}

                <div className="mb-2 flex items-center justify-between">

                    {/* ENTRIES */}

                    <div className="flex items-center gap-2 text-[13px] text-[#60758D]">

                        <span>
                            Show
                        </span>

                        <EntriesDropdown
                            value={entries}
                            onChange={
                                handleEntriesChange
                            }
                        />

                        <span>
                            entries
                        </span>

                    </div>

                    {/* SEARCH */}

                    <div className="flex items-center gap-2">

                        <label className="text-[13px] text-[#60758D]">
                            Search:
                        </label>

                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            className="h-[34px] w-[210px] rounded border border-[#D8E2EF] bg-white px-3 text-[13px] text-[#344050] outline-none focus:border-[#732269]"
                        />

                    </div>

                </div>

                {/* TABLE */}

                <div className="w-full overflow-hidden rounded border border-[#D8E2EF]">

                    <DataTable
                        columns={columns}
                        data={paginatedItems}
                        loading={loading}
                        emptyMessage="No correct answers found."
                        renderRow={renderRow}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                    />

                </div>

                {/* FOOTER */}

                <div className="mt-2 flex items-center justify-between">

                    <div className="text-[13px] text-[#60758D]">

                        Showing{" "}

                        {sortedItems.length === 0
                            ? 0
                            : startIndex + 1}

                        {" "}to{" "}

                        {Math.min(
                            startIndex + entries,
                            sortedItems.length
                        )}

                        {" "}of{" "}

                        {sortedItems.length}

                        {" "}entries

                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={
                            setCurrentPage
                        }
                    />

                </div>

            </div>

        </AppLayout>
    );
}