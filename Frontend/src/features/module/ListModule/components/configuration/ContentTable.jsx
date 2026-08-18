import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

/* =========================================================
   ContentTable

   Document | Content Type | Action table used by
   "Self-Paced Learning" and "Main Content of the Module".

   - rows: array of { id, document, contentType, ...raw }
   - renderAction(row): JSX for the Action cell
   - emptyMessage: shown when there are no rows
========================================================= */

export default function ContentTable({
    rows = [],
    loading = false,
    renderAction,
    emptyMessage = "No data available in table",
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">

                {/* ================= HEAD ================= */}

                <thead>
                    <tr className="bg-[#f6edf5]">
                        <th className="border-b border-[#e6d9e4] px-[14px] py-[12px] text-left text-[13px] font-semibold text-[#344050]">
                            <span className="inline-flex items-center gap-[6px]">
                                Document
                                <span className="flex flex-col leading-[6px] text-[#b9a7b6]">
                                    <IoIosArrowUp size={9} />
                                    <IoIosArrowDown size={9} />
                                </span>
                            </span>
                        </th>

                        <th className="border-b border-[#e6d9e4] px-[14px] py-[12px] text-left text-[13px] font-semibold text-[#344050]">
                            <span className="inline-flex items-center gap-[6px]">
                                Content Type
                                <span className="flex flex-col leading-[6px] text-[#b9a7b6]">
                                    <IoIosArrowUp size={9} />
                                    <IoIosArrowDown size={9} />
                                </span>
                            </span>
                        </th>

                        <th className="border-b border-[#e6d9e4] px-[14px] py-[12px] text-left text-[13px] font-semibold text-[#344050]">
                            Action
                        </th>
                    </tr>
                </thead>

                {/* ================= BODY ================= */}

                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={3}
                                className="py-[26px] text-center text-[13px] text-[#6c757d]"
                            >
                                Loading...
                            </td>
                        </tr>
                    ) : rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={3}
                                className="py-[26px] text-center text-[13px] text-[#6c757d]"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b border-[#eef0f3] last:border-b-0"
                            >
                                <td className="px-[14px] py-[13px] text-[13px] text-[#344050]">
                                    {row.document || "-"}
                                </td>

                                <td className="px-[14px] py-[13px] text-[13px] text-[#344050]">
                                    {row.contentType || "-"}
                                </td>

                                <td className="px-[14px] py-[13px]">
                                    {renderAction ? renderAction(row) : null}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
