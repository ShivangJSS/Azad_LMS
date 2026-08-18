import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../../shared/components/breadcrumbs/Breadcrumbs";
import DataTable from "../../../../../shared/components/table/DataTable";
import EntriesDropdown from "../../../../../shared/components/table/EntriesDropdown";
import Pagination from "../../../../../shared/components/table/Pagination";

import { getLeftItems, deleteLeftItem } from "../../services/MatchingMakingService";

export default function LeftItemList() {
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
    // LOAD LEFT ITEMS
    // =====================================================

    const loadLeftItems = async () => {
        if (!matchMakingId) {
            toast.error("Match Making ID not found.");
            return;
        }

        try {
            setLoading(true);

            const response = await getLeftItems(matchMakingId, 1);


            const data = Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                    ? response.data
                    : [];

            setItems(data);
            setCurrentPage(1);
        } catch (error) {
            console.error("LEFT ITEMS ERROR:", error);
            console.error(
                "LEFT ITEMS ERROR RESPONSE:",
                error?.response?.data
            );

            setItems([]);
            toast.error("Unable to load Left Items.");
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        loadLeftItems();
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
            const text =
                item?.match_left_item_text ??
                item?.left_item_text ??
                item?.match_left_text ??
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
                    a?.match_left_id ??
                    a?.id ??
                    0;

                valueB =
                    b?.match_left_id ??
                    b?.id ??
                    0;

                return sortDirection === "asc"
                    ? Number(valueA) - Number(valueB)
                    : Number(valueB) - Number(valueA);
            }

            if (sortField === "left_item_text") {
                valueA =
                    a?.match_left_item_text ??
                    a?.left_item_text ??
                    a?.match_left_text ??
                    "";

                valueB =
                    b?.match_left_item_text ??
                    b?.left_item_text ??
                    b?.match_left_text ??
                    "";

                return sortDirection === "asc"
                    ? String(valueA).localeCompare(String(valueB))
                    : String(valueB).localeCompare(String(valueA));
            }

            if (sortField === "sort_order") {
                valueA = a?.sort_order ?? 0;
                valueB = b?.sort_order ?? 0;

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
                prev === "asc" ? "desc" : "asc"
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
        Math.ceil(sortedItems.length / entries)
    );

    const startIndex =
        (currentPage - 1) * entries;

    const paginatedItems = sortedItems.slice(
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
    // ADD
    // =====================================================

    const handleAdd = () => {
        navigate(
            `/match-making-master/${matchMakingId}/left-items/add`
        );
    };

    // =====================================================
    // DELETE
    // =====================================================
    const handleDelete = async () => {
        if (!items.length) {
            toast.error("No left item available.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete all left items?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setLoading(true);

            await Promise.all(
                items.map((item) => {
                    const id =
                        item?.match_left_id ??
                        item?.id;

                    if (!id) {
                        return Promise.resolve();
                    }

                    return deleteLeftItem(id);
                })
            );

            toast.success(
                "All left items deleted successfully."
            );

            setItems([]);
            setCurrentPage(1);
            setSearch("");

            await loadLeftItems();

        } catch (error) {
            console.error(
                "DELETE LEFT ITEMS ERROR:",
                error
            );

            console.error(
                "DELETE LEFT ITEMS RESPONSE:",
                error?.response?.data
            );

            toast.error(
                error?.response?.data?.detail ||
                "Unable to delete left items."
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
            className: "w-[70px] text-center",
            sortable: true,
        },
        {
            key: "left_item_text",
            title: "Left Item Text",
            sortable: true,
        },
        {
            key: "sort_order",
            title: "Sort Order",
            className: "text-center w-[120px]",
            sortable: true,
        },
    ];

    // =====================================================
    // TABLE ROW
    // =====================================================

    const renderRow = (item, index) => {
        const text =
            item?.match_left_item_text ??
            item?.left_item_text ??
            item?.match_left_text ??
            "-";

        const sortOrder =
            item?.sort_order ?? "-";

        return (
            <tr
                key={
                    item?.match_left_id ??
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
            label: "Left Items",
            path: `/match-making-master/${matchMakingId}/left-items`,
        },
    ];

    // =====================================================
    // UI
    // =====================================================

    return (
        <AppLayout>

            <div className="mb-4 flex items-center justify-between">
                <span className="text-[22px] font-medium text-[#344050]">
                    Match Left Items
                </span>

                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="rounded-[6px] border border-[#D8E2EF] bg-white p-4">

                {/* BUTTONS */}

                <div className="mb-5 flex items-center justify-between gap-2">
                    <button type="button" onClick={() => navigate(-1)} className="inline-flex h-[32px] items-center gap-[6px] rounded-[4px] border border-[#344050] bg-white px-[14px] text-[13px] font-medium text-[#344050] hover:bg-[#f8f9fa]">← Back</button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={items.length > 0}
                            className={`rounded border px-4 py-1 text-[13px] font-medium ${items.length > 0
                                ? "cursor-not-allowed border-[#D8E2EF] bg-[#F1F3F5] text-[#A0A0A0]"
                                : "border-[#D8E2EF] bg-white text-[#344050] hover:bg-[#F8F9FA]"
                                }`}
                        >
                            + Add Left Items
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading || items.length === 0}
                            className={`rounded px-4 py-1 text-[13px] font-medium text-white ${items.length === 0 || loading
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

                    <div className="flex items-center gap-1 text-[13px] text-[#60758D]">
                        <span>Show</span>

                        <EntriesDropdown
                            value={entries}
                            onChange={handleEntriesChange}
                        />

                        <span>entries</span>
                    </div>

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
                        emptyMessage="No left items found."
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
                            : startIndex + 1}{" "}
                        to{" "}
                        {Math.min(
                            startIndex + entries,
                            sortedItems.length
                        )}{" "}
                        of {sortedItems.length} entries
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </AppLayout>
    );
}