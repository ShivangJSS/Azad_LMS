import React, { useMemo, useState } from "react";
import TableLoader from "@/shared/components/table/TableLoader";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";


export default function DataTable({
    columns = [],
    data = [],
    renderRow,
    loading = false,
    emptyMessage = "No Data Found",
    sortField,
    sortDirection,
    onSort,
}) {
    const controlled = typeof onSort === "function";
    const [internalSort, setInternalSort] = useState({ field: null, dir: "asc" });

    const activeField = controlled ? sortField : internalSort.field;
    const activeDir = controlled ? sortDirection : internalSort.dir;

    const fieldFor = (col) => col.sortKey || col.field || col.key;

    const handleSort = (col) => {
        const field = fieldFor(col);
        if (controlled) {
            onSort(field);
            return;
        }
        setInternalSort((prev) =>
            prev.field === field
                ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
                : { field, dir: "asc" },
        );
    };

    const rows = useMemo(() => {
        if (controlled || !internalSort.field) return data;

        const f = internalSort.field;
        const copy = [...data];

        copy.sort((a, b) => {
            const av = a?.[f];
            const bv = b?.[f];

            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;

            const an = Number(av);
            const bn = Number(bv);
            const bothNumeric =
                !Number.isNaN(an) &&
                !Number.isNaN(bn) &&
                String(av).trim() !== "" &&
                String(bv).trim() !== "";

            const cmp = bothNumeric
                ? an - bn
                : String(av).localeCompare(String(bv), undefined, {
                      numeric: true,
                      sensitivity: "base",
                  });

            return internalSort.dir === "asc" ? cmp : -cmp;
        });

        return copy;
    }, [controlled, data, internalSort]);

    return (
        <div className="overflow-x-auto bg-white">
            <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                    <tr className="bg-[#7B216F] text-white">
                        {columns.map((column, index) => {
                            const headerKey =
                                column.key ||
                                column.id ||
                                column.field ||
                                column.title ||
                                index;
                            const field = fieldFor(column);
                            const isActive = activeField === field;
                            const centered = (column.className || "").includes(
                                "text-center",
                            );

                            return (
                                <th
                                    key={headerKey}
                                        className={`whitespace-nowrap border border-[#6D1F5F] px-4 py-3 text-[13px] font-semibold ${
                                        column.className || "text-left"
                                    }`}
                                >
                                    <div
                                        className={`flex items-center gap-[14px] ${
                                            centered
                                                ? "justify-center"
                                                : column.sortable
                                                ? "w-full justify-between"
                                                : ""
                                        } ${
                                            column.sortable
                                                ? "cursor-pointer select-none"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            column.sortable && handleSort(column)
                                        }
                                    >
                                        <span>
                                            {column.title ||
                                                column.label ||
                                                column.headerName}
                                        </span>

                                        {column.sortable && (
                                            <span className="flex flex-col leading-[7px]">
                                                <IoIosArrowUp
                                                    size={11}
                                                    className={
                                                        isActive &&
                                                        activeDir === "asc"
                                                            ? "text-white"
                                                            : "text-white/45"
                                                    }
                                                />
                                                <IoIosArrowDown
                                                    size={11}
                                                    className={
                                                        isActive &&
                                                        activeDir === "desc"
                                                            ? "text-white"
                                                            : "text-white/45"
                                                    }
                                                />
                                            </span>
                                        )}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>

                {loading ? (
                    <TableLoader rows={10} columns={columns.length || 6} />
                ) : (
                    <tbody>
                        {rows.length > 0 ? (
                            rows.map((row, index) => renderRow(row, index))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length || 1}
                                    className="border border-[#E3E6ED] px-4 py-10 text-center text-[13px] text-[#5E6E82]"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                )}
            </table>
        </div>
    );
}
