import {
    DOCUMENT_COLUMNS,
    PER_PAGE,
    cellClass,
    headCellClass,
} from "../hook/Documentconstants";

const actionBtn =
    "h-[28px] rounded-[4px] px-[12px] text-[13px] font-semibold !text-white hover:opacity-90";

function EmptyRow({ children }) {
    return (
        <tr>
            <td
                colSpan={DOCUMENT_COLUMNS.length}
                className={`${cellClass} py- text-center text-[#5E6E82]`}
            >
                {children}
            </td>
        </tr>
    );
}

export default function DocumentTable({
    documents = [],
    loading = false,
    currentPage = 1,
    onView,
    onEdit,
    onDelete,
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-[#7b216f]">
                        {DOCUMENT_COLUMNS.map((column) => (
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
                    {loading && <EmptyRow>Loading...</EmptyRow>}

                    {!loading && documents.length === 0 && (
                        <EmptyRow>No documents found</EmptyRow>
                    )}

                    {!loading &&
                        documents.map((doc, index) => (
                            <tr key={doc.doc_id} className="hover:bg-[#FAFAFA]">

                                <td className={`${cellClass} text-center`}>
                                    {(currentPage - 1) * PER_PAGE + index + 1}
                                </td>

                                <td className={cellClass}>{doc.doc_title || "-"}</td>

                                <td className={cellClass}>{doc.doc_type || "-"}</td>

                                <td className={cellClass}>{doc.module_name || "-"}</td>

                                <td className={cellClass}>{doc.language_name || "-"}</td>

                                <td className={cellClass}>
                                    {String(doc.status) === "1" ? "Active" : "Inactive"}
                                </td>
                                <td className={cellClass}>
                                    <div className="flex items-center justify-center gap-2">

                                        {/* View */}
                                        <button
                                            type="button"
                                            onClick={() => onView(doc)}
                                            className="h-8 px-3 text-[14px] border-1 border-[#030303] font-semibold rounded
                                            bg-white text-[#732269]
                                            hover:bg-[#732269] hover:text-[#732269]
                                            transition-all duration-200"
                                        >
                                            View
                                        </button>

                                        {/* Edit */}
                                        <button
                                            type="button"
                                            onClick={() => onEdit(doc)}
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
                                            onClick={() => onDelete(doc)}
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
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
