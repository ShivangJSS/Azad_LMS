import { useNavigate } from "react-router-dom";

export default function ListTable({
    columns = [],
    data = [],
    loading = false,
    emptyMessage = "No records found",
    rowKey = "module_id",
    currentPage = 1,
    perPage = 10,
    onDelete,
    language = "english",
}) {
    const navigate = useNavigate();

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse">

                {/* ================= HEADER ================= */}

                <thead>
                    <tr className="bg-[#7B216F]">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`
                                    border border-[#D8E2EF]
                                    px-4
                                    py-1
                                    text-[14px]
                                    font-semibold
                                    !text-white
                                    ${column.width || ""}
                                    ${column.align === "center"
                                        ? "text-center"
                                        : "text-left"
                                    }
                                `}
                            >
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </thead>

                {/* ================= BODY ================= */}

                <tbody>

                    {/* ================= LOADING ================= */}

                    {loading && (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="
                                    border border-[#D8E2EF]
                                    px-[12px]
                                    py-[30px]
                                    text-center
                                    text-[14px]
                                    text-[#5E6E82]
                                "
                            >
                                Loading...
                            </td>
                        </tr>
                    )}

                    {/* ================= EMPTY ================= */}

                    {!loading && data.length === 0 && (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="
                                    border border-[#D8E2EF]
                                    px-[12px]
                                    py-[30px]
                                    text-center
                                    text-[14px]
                                    text-[#5E6E82]
                                "
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    )}

                    {/* ================= DATA ================= */}

                    {!loading &&
                        data.map((row, rowIndex) => (
                            <tr
                                key={
                                    row[rowKey] ??
                                    row.module_id ??
                                    row.id ??
                                    rowIndex
                                }
                                className="bg-white hover:bg-[#FAFAFA]"
                            >
                                {columns.map((column) => {

                                    /* ================= S.NO ================= */

                                    if (column.key === "serial") {
                                        return (
                                            <td
                                                key={column.key}
                                                className="
                                                    border border-[#D8E2EF]
                                                    px-[12px]
                                                    py-[11px]
                                                    text-center
                                                    text-[14px]
                                                    text-[#344050]
                                                "
                                            >
                                                {(currentPage - 1) *
                                                    perPage +
                                                    rowIndex +
                                                    1}
                                            </td>
                                        );
                                    }

                                    /* ================= MODULE NAME ================= */

                                    if (column.key === "module_name") {
                                        return (
                                            <td
                                                key={column.key}
                                                className="
                                                    border border-[#D8E2EF]
                                                    px-[12px]
                                                    py-[11px]
                                                    text-[14px]
                                                    font-medium
                                                    text-[#7B216F]
                                                "
                                            >
                                                {row.module_name || "-"}
                                            </td>
                                        );
                                    }

                                    /* ================= MODULE TYPE ================= */

                                    if (column.key === "module_type") {
                                        return (
                                            <td
                                                key={column.key}
                                                className="
                                                    border border-[#D8E2EF]
                                                    px-[12px]
                                                    py-[11px]
                                                    text-[14px]
                                                    text-[#5E6E82]
                                                "
                                            >
                                                {row.module_type || "-"}
                                            </td>
                                        );
                                    }

                                    /* ================= TOPIC COUNT ================= */

                                    if (column.key === "topic_count") {
                                        return (
                                            <td
                                                key={column.key}
                                                className="
                                                    border border-[#D8E2EF]
                                                    px-[12px]
                                                    py-[11px]
                                                    text-center
                                                    text-[14px]
                                                    text-[#7B216F]
                                                "
                                            >
                                                {row.topic_count ??
                                                    row.total_topics ??
                                                    0}
                                            </td>
                                        );
                                    }

                                    /* ================= LANGUAGE ================= */

                                    if (column.key === "language_name") {
                                        return (
                                            <td
                                                key={column.key}
                                                className="
                                                    border border-[#D8E2EF]
                                                    px-[12px]
                                                    py-[11px]
                                                    text-[14px]
                                                    text-[#5E6E82]
                                                "
                                            >
                                                {row.language_name || "-"}
                                            </td>
                                        );
                                    }

                                    /* ================= STATUS ================= */

                                    if (column.key === "status") {
                                        return (
                                            <td
                                                key={column.key}
                                                className="
                                                    border border-[#D8E2EF]
                                                    px-[12px]
                                                    py-[11px]
                                                    text-[14px]
                                                    text-[#5E6E82]
                                                "
                                            >
                                                {String(row.status) === "1"
                                                    ? "Active"
                                                    : "Inactive"}
                                            </td>
                                        );
                                    }

                                    /* ================= ACTIONS ================= */

                                    if (column.key === "actions") {
                                        return (
                                            <td
                                                key={column.key}
                                                className="
                                                    border border-[#D8E2EF]
                                                    px-[12px]
                                                    py-[10px]
                                                "
                                            >
                                                <div className="flex items-center justify-center gap-[8px] whitespace-nowrap">

                                                    {/* VIEW */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/module-master/${row.module_id}?tab=${language}`
                                                            )
                                                        }
                                                        className="
                                                            h-[32px]
                                                            !rounded-md
                                                            border
                                                            border-[#7B216F]
                                                            bg-white
                                                            px-[14px]
                                                            text-[14px]
                                                            font-medium
                                                            text-[#7B216F]
                                                            transition
                                                            hover:bg-[#FCF7FB]
                                                        "
                                                    >
                                                        View
                                                    </button>

                                                    {/* CONFIGURE MODULE */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/module-master/configure/${row.module_id}`
                                                            )
                                                        }
                                                        className="
                                                            h-[32px]
                                                            !rounded-md
                                                            border
                                                            border-[#7B216F]
                                                            bg-white
                                                            px-[14px]
                                                            text-[14px]
                                                            font-medium
                                                            text-[#7B216F]
                                                            transition
                                                            hover:bg-[#FCF7FB]
                                                        "
                                                    >
                                                        Configure Module
                                                    </button>

                                                    {/* EDIT */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/module-master/edit/${row.module_id}?tab=${language}`
                                                            )
                                                        }
                                                        className="
                                                            h-[32px]
                                                            !rounded-md
                                                            border
                                                            border-[#7B216F]
                                                            bg-[#7B216F]
                                                            px-[14px]
                                                            text-[14px]
                                                            font-medium
                                                            !text-white
                                                            transition
                                                            hover:bg-[#691B60]
                                                        "
                                                    >
                                                        Edit
                                                    </button>

                                                    {/* ADD TOPIC */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/topic-master/add?module_id=${row.module_id}`
                                                            )
                                                        }
                                                        className="
                                                            h-[32px]
                                                            !rounded-md
                                                            border
                                                            border-[#7B216F]
                                                            bg-[#7B216F]
                                                            px-[14px]
                                                            text-[14px]
                                                            font-medium
                                                            !text-white
                                                            transition
                                                            hover:bg-[#691B60]
                                                        "
                                                    >
                                                        Add Topic
                                                    </button>

                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onDelete?.(row)
                                                        }
                                                        className="
                                                            h-[32px]
                                                            !rounded-md
                                                            border
                                                            border-[#E63757]
                                                            bg-[#E63757]
                                                            px-3
                                                            text-[14px]
                                                            font-medium
                                                            !text-white
                                                            transition
                                                            hover:bg-[#D92D4D]
                                                        "
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        );
                                    }

                                    /* ================= DEFAULT ================= */

                                    return (
                                        <td
                                            key={column.key}
                                            className={`
                                                border border-[#D8E2EF]
                                                px-[12px]
                                                py-[11px]
                                                text-[14px]
                                                text-[#5E6E82]
                                                ${column.align ===
                                                    "text-center"
                                                    ? "text-center"
                                                    : "text-left"
                                                }
                                            `}
                                        >
                                            {row[column.key] ?? "-"}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}