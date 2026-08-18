import React from "react";
import DataTable from "../../../../shared/components/table/DataTable";

// =====================================================
// TABLE COLUMNS
// =====================================================

const itemColumns = [
    {
        key: "item_no",
        title: "Item No",
    },
    {
        key: "bucket_name",
        title: "Bucket Name",
    },
    {
        key: "item_name",
        title: "Item Name",
    },
    {
        key: "item_image",
        title: "Item Image",
        className: "text-center",
    },
    {
        key: "status",
        title: "Status",
        className: "text-center",
    },
    {
        key: "created_date",
        title: "Created Date",
    },
];

// =====================================================
// IMAGE URL
// =====================================================

const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return "";
    }

    // Blob URL
    if (imageUrl.startsWith("blob:")) {
        return imageUrl;
    }

    // Complete URL
    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    // Backend relative path
    const baseUrl = import.meta.env.VITE_API_URL || "";

    return `${baseUrl}/${imageUrl.replace(/^app\//, "").replace(/^\/+/, "")}`;
};

// =====================================================
// DATE FORMAT
// =====================================================

const formatDate = (dateStr) => {
    if (!dateStr) {
        return "-";
    }

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
        return dateStr;
    }

    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

// =====================================================
// COMPONENT
// =====================================================

export default function ViewBucketItems({
    isOpen,
    onClose,
    bucketId,
    bucketName,
    items = [],
    loading = false,
}) {
    if (!isOpen) {
        return null;
    }

    const displayItems = items;

    return (
        <div
            className="
                fixed inset-0 z-[9999]
                flex items-center justify-center
                bg-black/50
                px-4 py-6
            "
            onMouseDown={(event) => {
                // Close only when clicking directly on backdrop
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            {/* =================================================
                MODAL
            ================================================= */}

            <div
                className="
                    relative
                    flex
                    w-full
                    max-w-[900px]
                    max-h-[80vh]
                    flex-col
                    overflow-hidden
                    rounded-lg
                    bg-white
                    shadow-2xl
                "
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        relative
                        flex
                        h-[64px]
                        shrink-0
                        items-center
                        justify-between
                        overflow-hidden
                        bg-[#732269]
                        px-7
                        text-white
                    "
                >
                    {/* Decorative curved shape */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            right-[-30px]
                            top-[-45px]
                            h-[100px]
                            w-[230px]
                            rounded-[50%]
                            bg-white/10
                        "   
                    />

                    <div className="relative z-10 mt-2" >
                        <span className="text-[21px] font-semibold leading-tight ">
                            View Bucket Items
                        </span>

                        {bucketName && (
                            <p className="mt-0.5 text-[12px] text-white/80">
                                {bucketName}
                            </p>
                        )}
                    </div>

                    {/* Close */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            relative
                            z-10
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            text-[30px]
                            font-light
                            leading-none
                            text-white/70
                            transition
                            hover:bg-white/10
                            hover:text-white
                        "
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="min-h-0 flex-1 bg-white p-[18px]">
                    <div
                        className="
                            overflow-hidden
                            rounded
                            border
                            border-[#dfe4ea]
                            bg-white
                        "
                    >
                        <div className="max-h-[calc(80vh-105px)] overflow-auto">
                            <DataTable
                                columns={itemColumns}
                                data={displayItems}
                                loading={loading}
                                emptyMessage={
                                    loading
                                        ? "Loading English Bucket Items..."
                                        : "No English Bucket Items Found"
                                }
                                renderRow={(item, index) => {
                                    // =====================================
                                    // ROW KEY
                                    // =====================================

                                    const rowKey =
                                        item?.drop_bucket_item_id ??
                                        item?.bucket_item_id ??
                                        item?.item_id ??
                                        item?.id ??
                                        `item-${index}`;

                                    // =====================================
                                    // BUCKET NAME
                                    // =====================================

                                    const currentBucketName =
                                        item?.bucket_name ??
                                        bucketName ??
                                        "-";

                                    // =====================================
                                    // ITEM NAME
                                    // =====================================

                                    const itemName =
                                        item?.item_name ?? "-";

                                    // =====================================
                                    // IMAGE
                                    // =====================================

                                    const itemImg =
                                        item?.item_image ??
                                        item?.image_url ??
                                        item?.image ??
                                        null;

                                    // =====================================
                                    // STATUS
                                    // =====================================

                                    const statusValue = item?.status;

                                    const isActive =
                                        statusValue === 1 ||
                                        String(statusValue).toLowerCase() ===
                                            "active";

                                    // =====================================
                                    // DATE
                                    // =====================================

                                    const createdDate = formatDate(
                                        item?.created_at ??
                                            item?.created_date
                                    );

                                    return (
                                        <tr
                                            key={rowKey}
                                            className="
                                                text-[13px]
                                                text-[#64748b]
                                                transition-colors
                                                hover:bg-gray-50
                                            "
                                        >
                                            {/* =================================
                                                ITEM NO
                                            ================================= */}

                                            <td
                                                className="
                                                    whitespace-nowrap
                                                    border
                                                    border-[#dfe4ea]
                                                    px-5
                                                    py-4
                                                    text-[#64748b]
                                                "
                                            >
                                                {index + 1}
                                            </td>

                                            {/* =================================
                                                BUCKET NAME
                                            ================================= */}

                                            <td
                                                className="
                                                    min-w-[180px]
                                                    border
                                                    border-[#dfe4ea]
                                                    px-5
                                                    py-4
                                                    text-[#64748b]
                                                "
                                            >
                                                {currentBucketName}
                                            </td>

                                            {/* =================================
                                                ITEM NAME
                                            ================================= */}

                                            <td
                                                className="
                                                    min-w-[210px]
                                                    border
                                                    border-[#dfe4ea]
                                                    px-5
                                                    py-4
                                                    text-[#64748b]
                                                "
                                            >
                                                {itemName}
                                            </td>

                                            {/* =================================
                                                ITEM IMAGE
                                            ================================= */}

                                            <td
                                                className="
                                                    w-[110px]
                                                    border
                                                    border-[#dfe4ea]
                                                    px-4
                                                    py-3
                                                    text-center
                                                "
                                            >
                                                {itemImg ? (
                                                    <img
                                                        src={getImageUrl(
                                                            itemImg
                                                        )}
                                                        alt={itemName}
                                                        className="
                                                            mx-auto
                                                            h-[68px]
                                                            w-[68px]
                                                            rounded
                                                            border
                                                            border-[#e5e7eb]
                                                            bg-gray-50
                                                            object-contain
                                                            p-1
                                                        "
                                                        onError={(event) => {
                                                            console.error(
                                                                "Item image failed:",
                                                                itemImg
                                                            );

                                                            event.currentTarget.style.display =
                                                                "none";
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-[#94a3b8]">
                                                        -
                                                    </span>
                                                )}
                                            </td>

                                            {/* =================================
                                                STATUS
                                            ================================= */}

                                            <td
                                                className="
                                                    w-[90px]
                                                    border
                                                    border-[#dfe4ea]
                                                    px-3
                                                    py-4
                                                    text-center
                                                "
                                            >
                                                <span
                                                    className={`
                                                        inline-flex
                                                        min-w-[70px]
                                                        items-center
                                                        justify-center
                                                        rounded-[6px]
                                                        px-3
                                                        py-1.5
                                                        text-[12px]
                                                        font-medium
                                                        ${
                                                            isActive
                                                                ? "bg-[#d1fae5] text-[#16a34a]"
                                                                : "bg-[#fee2e2] text-[#dc2626]"
                                                        }
                                                    `}
                                                >
                                                    {isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            {/* =================================
                                                CREATED DATE
                                            ================================= */}

                                            <td
                                                className="
                                                    whitespace-nowrap
                                                    border
                                                    border-[#dfe4ea]
                                                    px-5
                                                    py-4
                                                    text-[#64748b]
                                                "
                                            >
                                                {createdDate}
                                            </td>
                                        </tr>
                                    );
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}