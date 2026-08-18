import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../../shared/components/breadcrumbs/Breadcrumbs";
import DataTable from "../../../../../shared/components/table/DataTable";
import EntriesDropdown from "../../../../../shared/components/table/EntriesDropdown";
import Pagination from "../../../../../shared/components/table/Pagination";

import { getRightItems, deleteRightItem } from "../../services/MatchingMakingService";

export default function RightItemList() {
    const { matchMakingId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);

    const [search, setSearch] = useState("");
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [sortField, setSortField] = useState("");
    const [sortDirection, setSortDirection] = useState("asc");

    // =====================================================
    // LOAD RIGHT ITEMS
    // =====================================================

    const loadRightItems = async () => {
        if (!matchMakingId) {
            toast.error("Match Making ID not found.");
            return;
        }

        try {
            setLoading(true);

            const response = await getRightItems(
                matchMakingId,
                1
            );


            const data = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                    ? response.data
                    : [];

            setItems(data);
            setCurrentPage(1);
        } catch (error) {
            console.error(
                "RIGHT ITEMS ERROR:",
                error
            );

            console.error(
                "RIGHT ITEMS ERROR RESPONSE:",
                error?.response?.data
            );

            setItems([]);

            toast.error(
                "Unable to load Right Items."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        loadRightItems();
    }, [matchMakingId]);

    // =====================================================
    // SEARCH
    // =====================================================

    const filteredItems = useMemo(() => {
        const value = search
            .trim()
            .toLowerCase();

        if (!value) {
            return items;
        }

        return items.filter((item) => {
            const text =
                item?.match_right_item_text ??
                item?.right_item_text ??
                item?.match_right_text ??
                "";

            return String(text)
                .toLowerCase()
                .includes(value);
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

            if (sortField === "sr") {
                valueA =
                    a?.match_right_id ??
                    a?.id ??
                    0;

                valueB =
                    b?.match_right_id ??
                    b?.id ??
                    0;

                return sortDirection === "asc"
                    ? Number(valueA) - Number(valueB)
                    : Number(valueB) - Number(valueA);
            }

            if (
                sortField ===
                "right_item_text"
            ) {
                valueA =
                    a?.match_right_item_text ??
                    a?.right_item_text ??
                    a?.match_right_text ??
                    "";

                valueB =
                    b?.match_right_item_text ??
                    b?.right_item_text ??
                    b?.match_right_text ??
                    "";

                return sortDirection === "asc"
                    ? String(valueA).localeCompare(
                        String(valueB)
                    )
                    : String(valueB).localeCompare(
                        String(valueA)
                    );
            }

            if (sortField === "sort_order") {
                valueA =
                    a?.sort_order ?? 0;

                valueB =
                    b?.sort_order ?? 0;

                return sortDirection === "asc"
                    ? Number(valueA) - Number(valueB)
                    : Number(valueB) - Number(valueA);
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
    // SEARCH HANDLER
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
    // ADD RIGHT ITEM
    // =====================================================

    const handleAdd = () => {
        if (items.length > 0) {
            toast.error("Right item already exists.");
            return;
        }

        navigate(
            `/match-making-master/${matchMakingId}/right-items/add`
        );
    };

    // =====================================================
    // DELETE RIGHT ITEM
    // =====================================================
    const handleDelete = async () => {
        if (!items.length) {
            toast.error("No right item available.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete all right items?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setLoading(true);

            await Promise.all(
                items.map((item) => {
                    const id =
                        item?.match_right_id ??
                        item?.id;

                    if (!id) {
                        return Promise.resolve();
                    }

                    return deleteRightItem(id);
                })
            );

            toast.success(
                "All right items deleted successfully."
            );

            setItems([]);
            setCurrentPage(1);
            setSearch("");

            await loadRightItems();

        } catch (error) {
            console.error(
                "DELETE RIGHT ITEMS ERROR:",
                error
            );

            console.error(
                "DELETE RIGHT ITEMS RESPONSE:",
                error?.response?.data
            );

            toast.error(
                error?.response?.data?.detail ||
                "Unable to delete right items."
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // TABLE COLUMNS
    // =====================================================

    const columns = [
        {
            key: "sr",
            title: "#",
            className:
                "w-[70px] text-center",
            sortable: true,
        },
        {
            key: "right_item_text",
            title: "Right Item Text",
            sortable: true,
        },
        {
            key: "sort_order",
            title: "Sort Order",
            className:
                "w-[120px] text-center",
            sortable: true,
        },
    ];

    // =====================================================
    // TABLE ROW
    // =====================================================

    const renderRow = (item, index) => {
        const text =
            item?.match_right_item_text ??
            item?.right_item_text ??
            item?.match_right_text ??
            "-";

        const sortOrder =
            item?.sort_order ?? "-";

        return (
            <tr
                key={
                    item?.match_right_id ??
                    item?.id ??
                    index
                }
                className="bg-white hover:bg-[#F8FAFC]"
            >
                <td className="border border-[#D8E2EF] px-4 py-3 text-center text-[13px] text-[#60758D]">
                    {startIndex + index + 1}
                </td>

                <td className="border border-[#D8E2EF] px-4 py-3 text-[13px] text-[#60758D]">
                    {text}
                </td>

                <td className="border border-[#D8E2EF] px-4 py-3 text-center text-[13px] text-[#60758D]">
                    {sortOrder}
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
            label: "Right Items",
            path: `/match-making-master/${matchMakingId}/right-items`,
        },
    ];

    // =====================================================
    // UI
    // =====================================================

    return (
        <AppLayout>

            {/* PAGE HEADER */}

            <div className="mb-4 flex items-center justify-between">

                <span className="text-[22px] font-medium text-[#344050]">
                    Match Right Items
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
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={loading || items.length > 0}
                            className={`rounded border border-[#D8E2EF] px-4 py-2 text-[13px] font-medium ${items.length > 0
                                ? "cursor-not-allowed bg-[#F1F3F5] text-[#9AA5B1]"
                                : "bg-white text-[#344050] hover:bg-[#F8F9FA]"
                                }`}
                        >
                            + Add Right Items
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading || items.length === 0}
                            className={`rounded px-4 py-2 text-[13px] font-medium text-white ${items.length === 0 || loading
                                ? "cursor-not-allowed bg-[#CED4DA]"
                                : "bg-[#EF4B55] hover:bg-[#D93D47]"
                                }`}
                        >
                            {loading ? "Deleting..." : "Delete"}
                        </button>
                    </div>

                </div>

                {/* TABLE CONTROLS */}

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
                            onChange={
                                handleSearch
                            }
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
                        emptyMessage="No right items found."
                        renderRow={renderRow}
                        sortField={sortField}
                        sortDirection={
                            sortDirection
                        }
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
                        currentPage={
                            currentPage
                        }
                        totalPages={
                            totalPages
                        }
                        onPageChange={
                            setCurrentPage
                        }
                    />

                </div>

            </div>

        </AppLayout>
    );
}