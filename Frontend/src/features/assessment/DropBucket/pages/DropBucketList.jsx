// import { FiPlus } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";

// import AppLayout from "../../../../components/layout/AppLayout";
// import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
// import LanguageTabs from "../../../../shared/components/language/LanguageTabs";
// import DataTable from "../../../../shared/components/table/DataTable";
// import Pagination from "../../../../shared/components/table/Pagination";
// import TableActions from "../../../../shared/components/table/TableActions";

// import useBucketList, {
//     bucketColumns,
//     getLanguageName,
// } from "../hook/useBucketList";

// export default function DropBucketList() {
//     const navigate = useNavigate();

//     const {
//         loading,
//         buckets,

//         // IMPORTANT
//         totalCount,

//         language,
//         setLanguage,

//         search,
//         setSearch,

//         currentPage,
//         totalPages,
//         setCurrentPage,

//         handleSearch,
//         resetSearch,

//         handleView,
//         handleEdit,
//         handleDelete,
//         handleEditItems,
//         handleShowItems,
//     } = useBucketList();

//     return (
//         <AppLayout>
//             {/* Page Header */}
//             <div className="mb-3 flex items-center justify-between">
//                 <span className="text-[22px] font-medium">
//                     Drop Bucket List
//                 </span>

//                 <Breadcrumbs
//                     items={[
//                         {
//                             label: "Home",
//                             path: "/dashboard",
//                         },
//                         {
//                             label: "Drop Buckets",
//                             path: "/drop-bucket-master",
//                         },
//                         {
//                             label: "List",
//                         },
//                     ]}
//                 />
//             </div>

//             {/* Main Card */}
//             <div className="overflow-hidden rounded-md border border-[#D8E2EF] bg-white">

//                 {/* Language Tabs */}
//                 <LanguageTabs
//                     activeTab={language}
//                     onChange={setLanguage}
//                 />

//                 {/* Search */}
//                 <div className="border-b p-4">
//                     <div className="flex gap-3">
//                         <input
//                             value={search}
//                             onChange={(e) =>
//                                 setSearch(e.target.value)
//                             }
//                             placeholder="Search By Question Title"
//                             className="h-8 flex-1 rounded border border-[#D8E2EF] px-3 text-sm outline-none focus:border-[#732269]"
//                         />

//                         <button
//                             onClick={handleSearch}
//                             className="h-8 rounded bg-[#732269] px-7 text-sm text-white"
//                         >
//                             Search
//                         </button>

//                         <button
//                             onClick={resetSearch}
//                             className="h-8 rounded border border-[#D8E2EF] px-7 text-sm"
//                         >
//                             Reset
//                         </button>
//                     </div>
//                 </div>

//                 {/* Table Header */}
//                 <div className="flex items-center justify-between p-3">
//                     <span className="text-[13px]">
//                         Total Drop Bucket(s):{" "}
//                         <span className="font-semibold text-[#732269]">
//                             {totalCount}
//                         </span>
//                     </span>

//                     <button
//                         onClick={() =>
//                             navigate(
//                                 "/drop-bucket-masters/create"
//                             )
//                         }
//                         className="flex h-8 items-center gap-2 rounded border border-[#D8E2EF] px-2 text-[13px]"
//                     >
//                         <FiPlus />

//                         Add Drop Bucket
//                     </button>
//                 </div>

//                 {/* Data Table */}
//                 <div className="px-3 pb-3">
//                     <DataTable
//                         columns={bucketColumns}
//                         data={buckets}
//                         loading={loading}
//                         emptyMessage="No Drop Bucket Found"
//                         renderRow={(bucket, index) => (
//                             <tr
//                                 key={`${bucket.drop_bucket_id}-${index}`}
//                             >
//                                 {/* S. No. */}
//                                 <td className="border px-2 py-2 text-center">
//                                     {(
//                                         (currentPage - 1) *
//                                         10
//                                     ) +
//                                         index +
//                                         1}
//                                 </td>

//                                 {/* Question Title */}
//                                 <td className="border px-2 py-2">
//                                     {bucket.drop_bucket_question_title ||
//                                         "-"}
//                                 </td>

//                                 {/* Question Image */}
//                                 {/* Question Image */}
//                                 <td className="border px-2 py-2 text-center">
//                                     {bucket.image_url ? (
//                                         <img
//                                             src={bucket.image_url}
//                                             alt=""
//                                             className="mx-auto h-12 w-12 rounded object-cover"
//                                         />
//                                     ) : (
//                                         "-"
//                                     )}
//                                 </td>

//                                 {/* Bucket Name */}
//                                 <td className="border px-2 py-2">
//                                     {bucket.bucket_name || "-"}
//                                 </td>

//                                 {/* Bucket Image */}
//                                 <td className="border px-2 py-2 text-center">
//                                     {bucket.bucket_image ? (
//                                         <img
//                                             src={bucket.bucket_image}
//                                             alt=""
//                                             className="mx-auto h-12 w-12 rounded object-cover"
//                                         />
//                                     ) : (
//                                         "-"
//                                     )}
//                                 </td>

//                                 {/* Marks */}
//                                 <td className="border px-2 py-2 text-center">
//                                     {bucket.marks ?? "0.00"}
//                                 </td>

//                                 {/* Language */}
//                                 <td className="border px-2 py-2 text-center">
//                                     {getLanguageName(
//                                         bucket.language_id
//                                     )}
//                                 </td>

//                                 {/* Status */}
//                                 <td className="border px-2 py-2 text-center">
//                                     <span
//                                         className={`rounded px-2 py-1 text-xs ${bucket.status === 1
//                                             ? "bg-green-100 text-green-700"
//                                             : "bg-red-100 text-red-700"
//                                             }`}
//                                     >
//                                         {bucket.status === 1
//                                             ? "Active"
//                                             : "Inactive"}
//                                     </span>
//                                 </td>

//                                 {/* Actions */}
//                                 <td className="border px-2 py-2">
//                                     <div className="flex items-center gap-2 whitespace-nowrap">
//                                         <TableActions
//                                             onView={() =>
//                                                 handleView(
//                                                     bucket.drop_bucket_id
//                                                 )
//                                             }
//                                             onEdit={() =>
//                                                 handleEdit(
//                                                     bucket.drop_bucket_id
//                                                 )
//                                             }
//                                             onDelete={() =>
//                                                 handleDelete(
//                                                     bucket.drop_bucket_id
//                                                 )
//                                             }
//                                         />

//                                         <button
//                                             onClick={() =>
//                                                 handleEditItems(
//                                                     bucket.drop_bucket_id
//                                                 )
//                                             }
//                                             className="rounded border border-[#732269] px-3 py-1 text-xs text-[#732269]"
//                                         >
//                                             Edit Items
//                                         </button>

//                                         <button
//                                             onClick={() =>
//                                                 handleShowItems(
//                                                     bucket.drop_bucket_id
//                                                 )
//                                             }
//                                             className="rounded border border-[#732269] px-3 py-1 text-xs text-[#732269]"
//                                         >
//                                             Show Items
//                                         </button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         )}
//                     />
//                 </div>

//                 {/* Footer */}
//                 <div className="flex items-center justify-end p-5">
//                     <Pagination
//                         currentPage={currentPage}
//                         totalPages={totalPages}
//                         onPageChange={setCurrentPage}
//                     />
//                 </div>
//             </div>
//         </AppLayout>
//     );
// }
import React from "react";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import LanguageTabs from "../../../../shared/components/language/LanguageTabs";
import DataTable from "../../../../shared/components/table/DataTable";
import Pagination from "../../../../shared/components/table/Pagination";
import TableActions from "../../../../shared/components/table/TableActions";
import { getMediaUrl } from "../../../../shared/utils/mediaUrl";

import ViewBucketItemsModal from "./ViewBucketItems";

import useBucketList, {
    bucketColumns,
    getLanguageName,
} from "../hook/useBucketList";

export default function DropBucketList() {
    const navigate = useNavigate();

    const {
        loading,
        buckets,

        // Pagination & Search
        totalCount,
        currentPage,
        totalPages,
        setCurrentPage,
        language,
        setLanguage,
        search,
        setSearch,
        handleSearch,
        resetSearch,

        // Navigation & Table Actions
        handleView,
        handleEdit,
        handleDelete,
        handleEditItems,
        handleCreateBucket,


        // Modal & Items state (API-wired)
        isItemModalOpen,
        selectedBucketName,
        bucketItems,
        itemsLoading,
        handleShowItems,
        closeItemModal,
    } = useBucketList();

    const onSearchSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    return (
        <AppLayout>
            {/* Page Header */}
            <div className="mb-3 flex items-center justify-between">
                <span className="text-[22px] font-medium">
                    Drop Bucket List
                </span>

                <Breadcrumbs
                    items={[
                        {
                            label: "Home",
                            path: "/dashboard",
                        },
                        {
                            label: "Drop Buckets",
                            path: "/drop-bucket-master",
                        },
                        {
                            label: "List",
                        },
                    ]}
                />
            </div>

            {/* Main Card */}
            <div className="overflow-hidden rounded-md border border-[#D8E2EF] bg-white">

                {/* Language Tabs */}
                <LanguageTabs
                    activeTab={language}
                    onChange={setLanguage}
                />

                {/* Search Bar */}
                <form onSubmit={onSearchSubmit} className="border-b p-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search By Question Title"
                            className="h-8 flex-1 rounded border border-[#D8E2EF] px-3 text-sm outline-none focus:border-[#732269]"
                        />

                        <button
                            type="submit"
                            className="h-8 rounded bg-[#732269] px-7 text-sm text-white hover:bg-[#5c1b54] transition-colors"
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={resetSearch}
                            className="h-8 rounded border border-[#D8E2EF] px-7 text-sm hover:bg-gray-50 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </form>

                {/* Table Header */}
                <div className="flex items-center justify-between p-3">
                    <span className="text-[13px]">
                        Total Drop Bucket(s):{" "}
                        <span className="font-semibold text-[#732269]">
                            {totalCount || 0}
                        </span>
                    </span>

                    <button
                        type="button"
                        onClick={() => handleCreateBucket()}
                        className="flex h-8 items-center gap-2 rounded border border-[#D8E2EF] px-2 text-[13px] hover:bg-gray-50 transition-colors"
                    >
                        <FiPlus />
                        Add Drop Bucket
                    </button>
                </div>

                {/* Data Table */}
                <div className="px-3 pb-3">
                    <DataTable
                        columns={bucketColumns}
                        data={buckets}
                        loading={loading}
                        emptyMessage="No Drop Bucket Found"
                        renderRow={(bucket, index) => {
                            // Use the parent question ID for actions like view, edit, delete.
                            const questionId = bucket.drop_bucket_id ?? bucket.id;
                            // Use the unique bucket_id for the row key to prevent React warnings.
                            const rowKey = bucket.bucket_id ? `bucket-row-${bucket.bucket_id}` : `row-${index}`;
                            const isActive = bucket.status === 1 || bucket.status === "Active";

                            return (
                                // Use the unique row key
                                <tr key={rowKey}>
                                    {/* S. No. */}
                                    <td className="border px-2 py-2 text-center">
                                        {(currentPage - 1) * 10 + index + 1}
                                    </td>

                                    {/* Question Title */}
                                    <td className="border px-2 py-2">
                                        {bucket.drop_bucket_question_title || "-"}
                                    </td>

                                    {/* Question Image */}
                                    <td className="border px-2 py-2 text-center">
                                        {bucket.image_url ? (
                                            <img
                                                src={getMediaUrl(bucket.image_url)}
                                                alt={bucket.drop_bucket_question_title || "Question image"}
                                                className="mx-auto h-12 w-12 rounded object-cover border border-gray-100"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            "-"
                                        )}
                                    </td>

                                    {/* Bucket Name */}
                                    <td className="border px-2 py-2">
                                        {bucket.bucket_name || "-"}
                                    </td>

                                    {/* Bucket Image */}
                                    <td className="border px-2 py-2 text-center">
                                        {bucket.bucket_image ? (
                                            <img
                                                src={getMediaUrl(bucket.bucket_image)}
                                                alt={bucket.bucket_name || "Bucket image"}
                                                className="mx-auto h-12 w-12 rounded object-cover border border-gray-100"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            "-"
                                        )}
                                    </td>

                                    {/* Marks */}
                                    <td className="border px-2 py-2 text-center">
                                        {typeof bucket.marks === "number"
                                            ? bucket.marks.toFixed(2)
                                            : bucket.marks ?? "0.00"}
                                    </td>

                                    {/* Language */}
                                    <td className="border px-2 py-2 text-center">
                                        {getLanguageName(bucket.language_id)}
                                    </td>

                                    {/* Status */}
                                    <td className="border px-2 py-2 text-center">
                                        <span
                                            className={`rounded px-2 py-1 text-xs font-medium ${isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="border px-2 py-2">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <TableActions                                                onView={() => handleView(questionId)}
                                                onEdit={() => handleEdit(questionId)}
                                                onDelete={() => handleDelete(questionId)}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => handleEditItems(questionId)}
                                                className="rounded border border-[#732269] px-3 py-1 text-xs text-[#732269] hover:bg-[#732269] hover:text-white transition-colors"
                                            >
                                                Edit Items
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleShowItems(bucket)}
                                                className="rounded border border-[#732269] px-3 py-1 text-xs text-[#732269] hover:bg-[#732269] hover:text-white transition-colors"
                                            >
                                                Show Items
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }}
                    />
                </div>

                {/* Footer / Pagination */}
                <div className="flex items-center justify-end p-5">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Bucket Items Modal */}
            <ViewBucketItemsModal
                isOpen={isItemModalOpen}
                onClose={closeItemModal}
                bucketName={selectedBucketName}
                items={bucketItems}
                loading={itemsLoading}
            />
        </AppLayout>
    );
}