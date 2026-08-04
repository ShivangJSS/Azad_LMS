import TableLoader from "./TableLoader";
// import { BiChevronUp, BiChevronDown } from "react-icons/bi";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

export default function DataTable({
    columns,
    data,
    renderRow,
    loading = false,
    emptyMessage = "No Data Found",

    sortField,
    sortDirection,
    onSort,
}) {
    return (
        <div className="overflow-x-auto ">

            <table className="w-full border border-gray-200">

                <thead>
                    <tr className="bg-[#732269] text-white rounded-sm">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`border border-gray-300 px-4 py-2 text-sm font-semibold ${column.className || "text-left"
                                    }`}
                            >

                                <div
                                    className={`flex items-center gap-2 ${column.sortable
                                        ? "cursor-pointer select-none"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        column.sortable &&
                                        onSort(column.key)
                                    }
                                >
                                    {column.title}

                                    {column.sortable && (
                                        sortField === column.key ? (
                                            sortDirection === "asc" ? (
                                                <IoIosArrowUp size={18} />
                                            ) : (
                                                <IoIosArrowDown size={18} />
                                            )
                                        ) : (
                                            <IoIosArrowUp size={18} className="text-gray-400" />
                                        )
                                    )}

                                </div>

                            </th>
                        ))}

                    </tr>
                </thead>

                {loading ? (
                    <TableLoader
                        rows={10}
                        columns={columns.length}
                    />
                ) : (
                    <tbody>

                        {data.length > 0 ? (
                            data.map((row, index) => renderRow(row, index))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-10"
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