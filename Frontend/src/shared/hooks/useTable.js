import { useEffect, useMemo, useState } from "react";

export default function useTable({
    data = [],
    searchableFields = [],
    initialEntries = 10,
}) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(initialEntries);
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

    // Search
    const filteredData = useMemo(() => {
        if (!search.trim()) return data;

        const keyword = search.toLowerCase();

        return data.filter((item) =>
            searchableFields.some((field) =>
                String(item[field] ?? "")
                    .toLowerCase()
                    .includes(keyword)
            )
        );
    }, [data, search, searchableFields]);


    const sortedData = useMemo(() => {
        if (!sortField) return filteredData;

        const result = [...filteredData].sort((a, b) => {
            const valueA = String(a[sortField] ?? "").toLowerCase();
            const valueB = String(b[sortField] ?? "").toLowerCase();

            if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
            if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;

            return 0;
        });


        return result;
    }, [filteredData, sortField, sortDirection]);

    // Total Pages
    const totalPages = Math.max(
        1,
        Math.ceil(filteredData.length / entriesPerPage)
    );

    // Reset Page
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    // Current Data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * entriesPerPage;
        const end = start + entriesPerPage;

        return sortedData.slice(start, end);
    }, [sortedData, currentPage, entriesPerPage]);

    // Showing Entries
    const startEntry =
        filteredData.length === 0
            ? 0
            : (currentPage - 1) * entriesPerPage + 1;

    const endEntry = Math.min(
        currentPage * entriesPerPage,
        filteredData.length
    );

    const handleSort = (field) => {

        if (sortField === field) {

            setSortDirection((prev) =>
                prev === "asc" ? "desc" : "asc"
            );

        } else {

            setSortField(field);
            setSortDirection("asc");

        }

    };
    return {
        search,
        setSearch,

        currentPage,
        setCurrentPage,

        entriesPerPage,
        setEntriesPerPage,

        totalPages,

        filteredData,
        paginatedData,

        startEntry,
        endEntry,

        totalEntries: filteredData.length,

        sortField,
        sortDirection,
        handleSort,
    };
}