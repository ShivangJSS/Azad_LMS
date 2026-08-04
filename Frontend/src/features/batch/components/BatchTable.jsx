// // import { ArrowUpDown } from 'lucide-react';
// import DataTable from "../../../shared/components/table/DataTable";
// const BRAND = '#732269';

// // function SortableHeader({ label, sortKey, sortConfig, onSort }) {
// //     return (
// //         <th
// //             style={{ backgroundColor: BRAND }}
// //             className="px-6 py-3 font-medium whitespace-nowrap text-white"
// //         >
// //             <button
// //                 type="button"
// //                 onClick={() => onSort(sortKey)}
// //                 className="flex items-center gap-1.5 hover:opacity-80"
// //             >
// //                 {label}
// //                 <ArrowUpDown className="w-3.5 h-3.5" />
// //             </button>
// //         </th>
// //     );
// // }

// function getCreatedByName(b) {
//     if (b.created_by_name) return b.created_by_name;
//     if (typeof b.created_by === 'string') return b.created_by;
//     if (b.created_by && typeof b.created_by === 'object') {
//         return b.created_by.name || b.created_by.full_name || '—';
//     }
//     if (b.creator_name) return b.creator_name;
//     return '—';
// }

// const columns = [
//     {
//         key: "sr_no",
//         title: "Sr No",
//     },
//     {
//         key: "batch_name",
//         title: "Batch Name",
//         sortable: true,
//     },
//     {
//         key: "fy_year",
//         title: "FY",
//         sortable: true,
//     },
//     {
//         key: "created_by",
//         title: "Created By",
//         sortable: true,
//     },
//     {
//         key: "centre_name",
//         title: "Centre",
//         sortable: true,
//     },
//     {
//         key: "status",
//         title: "Status",
//         sortable: true,
//     },
//     {
//         key: "action",
//         title: "Action",
//         className: "text-center",
//     },
// ];
// // const th = "border border-white/20 px-3 py-[8px] text-[15px] font-semibold whitespace-nowrap text-white";
// const td = "border border-[#dee2e6] px-3 py-[8px] text-[15px]";
// export default function BatchTable({
//     rows,
//     loading,
//     error,
//     startIndex,
//     sortConfig,
//     onSort,
//     onEdit,
//     onAddParticipants,
//     onShowParticipants,
// }) {
//     return (
//         // <div className="overflow-x-auto">

//         //     <table className="w-full border-collapse">
//         //         <thead>
//         //             <tr className="text-left">
//         //                 <th className={th} style={{ backgroundColor: BRAND }}>
//         //                     Sr No
//         //                 </th>

//         //                 <th className={th} style={{ backgroundColor: BRAND }}>
//         //                     Batch Name
//         //                 </th>

//         //                 <th className={th} style={{ backgroundColor: BRAND }}>
//         //                     FY
//         //                 </th>

//         //                 <th className={th} style={{ backgroundColor: BRAND }}>
//         //                     Created By
//         //                 </th>

//         //                 <th className={th} style={{ backgroundColor: BRAND }}>
//         //                     Centre
//         //                 </th>

//         //                 <th className={th} style={{ backgroundColor: BRAND }}>
//         //                     Status
//         //                 </th>

//         //                 <th className={th} style={{ backgroundColor: BRAND }}>
//         //                     Action
//         //                 </th>
//         //             </tr>
//         //         </thead>
//         //         <tbody>

//         //             {loading && (
//         //                 <tr>
//         //                     <td
//         //                         colSpan={7}
//         //                         className={`${td} text-center text-[#8492a6]`}
//         //                     >
//         //                         Loading...
//         //                     </td>
//         //                 </tr>
//         //             )}

//         //             {!loading && !error && rows.length === 0 && (
//         //                 <tr>
//         //                     <td
//         //                         colSpan={7}
//         //                         className={`${td} text-center text-[#8492a6]`}
//         //                     >
//         //                         No Batches Found
//         //                     </td>
//         //                 </tr>
//         //             )}

//         //             {!loading &&
//         //                 !error &&
//         //                 rows.map((b, index) => (

//         //                     <tr
//         //                         key={b.batch_id}
//         //                         className="hover:bg-[#fafafa]"
//         //                     >
//         //                         <td className={`${td} text-[#4d5969]`}>
//         //                             {startIndex + index + 1}
//         //                         </td>

//         //                         <td className={`${td} text-[#732269] font-medium`}>
//         //                             {b.batch_name}
//         //                         </td>

//         //                         <td className={`${td} text-[#4d5969]`}>
//         //                             {b.fy_year}
//         //                         </td>

//         //                         <td className={`${td} text-[#4d5969]`}>
//         //                             {getCreatedByName(b)}
//         //                         </td>

//         //                         <td className={`${td} text-[#4d5969]`}>
//         //                             {b.centre_name}
//         //                         </td>

//         //                         <td className={`${td} text-[#4d5969]`}>
//         //                             {b.status === 1 || b.status === "Active"
//         //                                 ? "Active"
//         //                                 : "Inactive"}
//         //                         </td>

//         //                         <td className={td}>
//         //                             <div className="flex items-center justify-center gap-2">

//         //                                 <button
//         //                                     type="button"
//         //                                     onClick={() => onEdit?.(b)}
//         //                                     className="px-4 py-1 text-[12px] font-medium text-white bg-[#732269] rounded-sm hover:bg-[#67205e]"
//         //                                 >
//         //                                     Edit
//         //                                 </button>

//         //                                 <button
//         //                                     type="button"
//         //                                     onClick={() => onAddParticipants?.(b)}
//         //                                     className="px-4 py-1 text-[12px] font-medium text-[#67205e] bg-white border-2 border-[#67205e] rounded-sm hover:bg-[#f7f8fa]"
//         //                                 >
//         //                                     Add Participants
//         //                                 </button>

//         //                                 <button
//         //                                     type="button"
//         //                                     onClick={() => onShowParticipants?.(b)}
//         //                                     className="flex items-center gap-2 px-4 py-1 text-[12px] font-medium text-[#4d5969] bg-white border-2 border-[#bfc7d1] rounded-sm hover:bg-[#f7f8fa]"
//         //                                 >
//         //                                     Show Participants

//         //                                     <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eef1f5] text-[11px] font-semibold">
//         //                                         {b.participant_count ?? 0}
//         //                                     </span>
//         //                                 </button>

//         //                             </div>
//         //                         </td>
//         //                     </tr>

//         //                 ))}

//         //         </tbody>
//         //     </table>
//         // </div>




//         <DataTable
//             columns={columns}
//             data={rows}
//             loading={loading}
//             emptyMessage="No Batches Found"
//             sortField={sortConfig?.key}
//             sortDirection={sortConfig?.direction}
//             onSort={onSort}
//             renderRow={(b, index) => (
//                 <tr key={b.batch_id} className="hover:bg-[#fafafa]">

//                     <td className={`${td} text-[#4d5969]`}>
//                         {startIndex + index + 1}
//                     </td>

//                     <td className={`${td} text-[#732269] font-medium`}>
//                         {b.batch_name}
//                     </td>

//                     <td className={`${td}`}>{b.fy_year}</td>

//                     <td className={`${td}`}>
//                         {getCreatedByName(b)}
//                     </td>

//                     <td className={`${td}`}>
//                         {b.centre_name}
//                     </td>

//                     <td className={`${td}`}>
//                         {b.status === 1 ? "Active" : "Inactive"}
//                     </td>

//                     {/* 👇 SAME ACTIONS */}
//                     <td className={td}>
//                         <div className="flex items-center justify-center gap-2">

//                             <button
//                                 type="button"
//                                 onClick={() => onEdit?.(b)}
//                                 className="px-4 py-1 text-[12px] font-medium text-white bg-[#732269] rounded-sm hover:bg-[#67205e]"
//                             >
//                                 Edit
//                             </button>

//                             <button
//                                 type="button"
//                                 onClick={() => onAddParticipants?.(b)}
//                                 className="px-4 py-1 text-[12px] font-medium text-[#67205e] bg-white border-2 border-[#67205e] rounded-sm hover:bg-[#f7f8fa]"
//                             >
//                                 Add Participants
//                             </button>

//                             <button
//                                 type="button"
//                                 onClick={() => onShowParticipants?.(b)}
//                                 className="flex items-center gap-2 px-4 py-1 text-[12px] font-medium text-[#4d5969] bg-white border-2 border-[#bfc7d1] rounded-sm hover:bg-[#f7f8fa]"
//                             >
//                                 Show Participants

//                                 <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eef1f5] text-[11px] font-semibold">
//                                     {b.participant_count ?? 0}
//                                 </span>
//                             </button>

//                         </div>
//                     </td>

//                 </tr>
//             )}
//         />
//     )
// }

// export { BRAND };