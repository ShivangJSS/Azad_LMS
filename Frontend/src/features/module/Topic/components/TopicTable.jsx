import {
    TOPIC_COLUMNS,
    PER_PAGE,
    cellClass,
    headCellClass,
} from "../hook/Topicconstants";
import { getLanguageLabel } from "../../../../shared/constants/languageConstants";

function EmptyRow({ children, colSpan }) {
    return (
        <tr>
            <td
                colSpan={colSpan}
                className={`${cellClass} py-6 text-center text-[#5E6E82]`}
            >
                {children}
            </td>
        </tr>
    );
}

export default function TopicTable({
    topics = [],
    loading = false,
    currentPage = 1,
    onView,
    onEdit,
    onDelete,
    isEnglish = true,
}) {

    // Topics are auto-translated on add, so other languages are read-only:
    // the Action column (View / Edit / Delete) shows in English only.
    const visibleColumns = isEnglish
        ? TOPIC_COLUMNS
        : TOPIC_COLUMNS.filter((column) => column.key !== "action");

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse ">
                <thead>
                    <tr className="bg-[#7b216f]">
                        {visibleColumns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className={`${headCellClass} ${column.width} ${column.align}`}
                            >
                                {column.title}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {loading && (
                        <EmptyRow colSpan={visibleColumns.length}>
                            Loading...
                        </EmptyRow>
                    )}

                    {!loading && topics.length === 0 && (
                        <EmptyRow colSpan={visibleColumns.length}>
                            No topics found
                        </EmptyRow>
                    )}

                    {!loading &&
                        topics.map((topic, index) => (
                            <tr key={topic.topic_id || index} className="hover:bg-[#FAFAFA] ">

                                <td className={`${cellClass} text-center`}>
                                    {(currentPage - 1) * PER_PAGE + index + 1}
                                </td>

                                <td className={cellClass}>
                                    {topic.topic_name || "-"}
                                </td>

                                <td className={cellClass}>
                                    {topic.module_name || "-"}
                                </td>

                                <td className={cellClass}>
                                    {getLanguageLabel(topic.language_id)}
                                </td>

                                <td className={cellClass}>
                                    {String(topic.status) === "1" ? "Active" : "Inactive"}
                                </td>

                                {/* Action column is English-only (other
                                    languages are auto-translated, read-only). */}
                                {isEnglish && (
                                    <td className={cellClass}>
                                        <div className="flex items-center justify-center gap-1">

                                            {/* View */}
                                            <button
                                                type="button"
                                                onClick={() => onView(topic)}
                                                className="h-8 px-3 text-[14px] border-1 border-[#030303] font-semibold rounded
                                                bg-white text-[#732269]
                                                hover:bg-[#732269] hover:text-732269
                                                transition-all duration-200"
                                            >
                                                View
                                            </button>

                                            {/* Edit */}
                                            <button
                                                type="button"
                                                onClick={() => onEdit(topic)}
                                                className="h-8 px-3 text-[14px] font-semibold rounded
                                                bg-[#732269] text-white
                                                border border-[#732269]
                                                hover:bg-[#5f1b59]
                                                transition-all duration-200"
                                            >
                                                Edit
                                            </button>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() => onDelete(topic)}
                                                className="h-8 px-3 text-[14px] font-semibold rounded
                                                bg-[#E74C3C] text-white
                                                border border-[#E74C3C]
                                                hover:bg-[#d63b2d]
                                                transition-all duration-200"
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
