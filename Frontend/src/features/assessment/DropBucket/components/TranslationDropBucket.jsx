import React from "react";

import { getMediaUrl } from "../../../../shared/utils/mediaUrl";

export default function TranslationDropBucket({
    form,
    readOnly,
    loading,
    languageName,
    onChange,
    onBucketChange,
    onSubmit,
    onCancel,
    isValidImageUrl,
}) {
    const buckets = form?.buckets || [];

    return (
        <form onSubmit={onSubmit}>

            {/* =====================================================
                MAIN FORM
            ===================================================== */}

            <div className="p-3">

                {/* =================================================
                    QUESTION TITLE
                ================================================= */}

                <div className="mb-4">

                    <label className="mb-1.5 block text-[11px] font-medium text-[#344050]">
                        Question Title

                        {!readOnly && (
                            <span className="ml-1 text-red-500">
                                *
                            </span>
                        )}
                    </label>

                    <input
                        type="text"
                        name="drop_bucket_question_title"
                        value={
                            form?.drop_bucket_question_title || ""
                        }
                        onChange={onChange}
                        readOnly={readOnly}
                        placeholder={
                            !readOnly
                                ? "Enter question title"
                                : ""
                        }
                        className={`
                            h-[34px]
                            w-full
                            rounded-[4px]
                            border
                            border-[#D8D8E8]
                            px-2.5
                            text-[12px]
                            outline-none
                            ${readOnly
                                ? "bg-[#EEF4FB] text-[#5E6E82]"
                                : "bg-white text-[#344050]"
                            }
                        `}
                    />

                </div>


                {/* =================================================
                    QUESTION DESCRIPTION
                ================================================= */}

                <div className="mb-4">

                    <label className="mb-1.5 block text-[11px] font-medium text-[#344050]">
                        Question Description
                    </label>

                    <textarea
                        rows={3}
                        name="drop_bucket_question_description"
                        value={
                            form?.drop_bucket_question_description ||
                            ""
                        }
                        onChange={onChange}
                        readOnly={readOnly}
                        placeholder={
                            !readOnly
                                ? "Enter question description"
                                : ""
                        }
                        className={`
                            min-h-[70px]
                            w-full
                            resize-none
                            rounded-[4px]
                            border
                            border-[#D8D8E8]
                            px-2.5
                            py-2
                            text-[12px]
                            outline-none
                            ${readOnly
                                ? "bg-[#EEF4FB] text-[#5E6E82]"
                                : "bg-white text-[#344050]"
                            }
                        `}
                    />

                </div>


                {/* =================================================
                    MARKS
                ================================================= */}

                <div className="mb-4">

                    <label className="mb-1.5 block text-[11px] font-medium text-[#344050]">
                        Marks
                    </label>

                    <input
                        type="text"
                        value={form?.marks ?? ""}
                        readOnly
                        className="
                            h-[34px]
                            w-full
                            rounded-[4px]
                            border
                            border-[#D8D8E8]
                            bg-[#EEF4FB]
                            px-2.5
                            text-[12px]
                            text-[#5E6E82]
                            outline-none
                        "
                    />

                </div>


                {/* =================================================
                    IMAGE
                ================================================= */}

                <div className="mb-4">

                    <label className="mb-2 block text-[11px] font-medium text-[#344050]">
                        Image
                    </label>

                    {isValidImageUrl &&
                        isValidImageUrl(form?.image_url) ? (

                        <img
                            src={getMediaUrl(form.image_url)}
                            alt="Drop Bucket"
                            className="
                                h-[60px]
                                w-[100px]
                                rounded-[3px]
                                border
                                border-[#D8D8E8]
                                bg-white
                                object-contain
                            "
                            onError={(event) => {
                                event.currentTarget.style.display =
                                    "none";
                            }}
                        />

                    ) : (

                        <div
                            className="
                                flex
                                h-[60px]
                                w-[100px]
                                items-center
                                justify-center
                                rounded-[3px]
                                border
                                border-[#D8D8E8]
                                bg-[#F8F9FA]
                                text-[10px]
                                text-gray-400
                            "
                        >
                            No Image
                        </div>

                    )}

                </div>


                {/* =================================================
                    BUCKET SECTION
                ================================================= */}

                <div
                    className="
                        overflow-hidden
                        rounded-[4px]
                        border
                        border-[#D8D8E8]
                        bg-white
                    "
                >

                    {/* SECTION HEADER */}

                    <div
                        className="
                            border-b
                            border-[#D8D8E8]
                            px-3
                            py-2.5
                        "
                    >

                        <span
                            className="
                                text-[11px]
                                font-medium
                                text-[#344050]
                            "
                        >
                            {readOnly
                                ? "Drop Buckets"
                                : `Add Bucket (${languageName} Translation)`
                            }
                        </span>

                    </div>


                    {/* =================================================
                        BUCKETS
                    ================================================= */}

                    {buckets.length === 0 ? (

                        <div className="py-8 text-center text-[11px] text-gray-500">
                            No data available for{" "}
                            {languageName || "this language"}.
                        </div>

                    ) : (

                        <div className="space-y-2 p-2">

                            {buckets.map(
                                (bucket, index) => {

                                    const bucketId =
                                        bucket?.drop_bucket_id ??
                                        bucket?.bucket_id ??
                                        bucket?.id ??
                                        index;


                                    return (
                                        <div
                                            key={`${bucketId}-${index}`}
                                            className="
                                                rounded-[5px]
                                                border
                                                border-[#D8CDE0]
                                                bg-[#FCF9FC]
                                                px-3
                                                py-2.5
                                            "
                                        >

                                            {/* =================================
                                                BUCKET MASTER LABEL
                                            ================================= */}

                                            <div className="mb-2">

                                                <span
                                                    className="
                                                        text-[10px]
                                                        font-medium
                                                        text-[#732269]
                                                    "
                                                >
                                                    {languageName}:{" "}
                                                    {
                                                        bucket?.bucket_name ||
                                                        `Bucket ${index + 1}`
                                                    }
                                                </span>

                                            </div>


                                            {/* =================================
                                                BUCKET CONTENT
                                            ================================= */}

                                            <div
                                                className="
                                                    grid
                                                    grid-cols-[minmax(0,1fr)_170px]
                                                    items-center
                                                    gap-5
                                                "
                                            >

                                                {/* BUCKET NAME */}

                                                <div>

                                                    <label
                                                        className="
                                                            mb-1.5
                                                            block
                                                            text-[10px]
                                                            font-medium
                                                            text-[#344050]
                                                        "
                                                    >
                                                        Bucket Name (
                                                        {languageName}
                                                        )

                                                        {!readOnly && (
                                                            <span className="ml-1 text-red-500">
                                                                *
                                                            </span>
                                                        )}
                                                    </label>


                                                    <input
                                                        type="text"
                                                        value={
                                                            bucket?.bucket_name ||
                                                            ""
                                                        }
                                                        onChange={(event) =>
                                                            onBucketChange(
                                                                index,
                                                                event.target.value
                                                            )
                                                        }
                                                        readOnly={
                                                            readOnly
                                                        }
                                                        placeholder={
                                                            !readOnly
                                                                ? `Enter bucket name in ${languageName}`
                                                                : ""
                                                        }
                                                        className={`
                                                            h-[34px]
                                                            w-full
                                                            rounded-[4px]
                                                            border
                                                            border-[#D8D8E8]
                                                            px-2.5
                                                            text-[11px]
                                                            outline-none
                                                            ${readOnly
                                                                ? "bg-[#EEF4FB] text-[#5E6E82]"
                                                                : "bg-white text-[#344050]"
                                                            }
                                                        `}
                                                    />

                                                </div>


                                                {/* BUCKET IMAGE */}

                                                <div>

                                                    <label
                                                        className="
                                                            mb-1.5
                                                            block
                                                            text-[10px]
                                                            font-medium
                                                            text-[#344050]
                                                        "
                                                    >
                                                        {languageName} Image
                                                    </label>


                                                    {isValidImageUrl &&
                                                        isValidImageUrl(
                                                            bucket?.image_url
                                                        ) ? (

                                                        <img
                                                            src={getMediaUrl(
                                                                bucket.image_url
                                                            )}
                                                            alt={
                                                                bucket?.bucket_name ||
                                                                "Bucket"
                                                            }
                                                            className="
                                                                h-[44px]
                                                                w-[55px]
                                                                rounded-[3px]
                                                                border
                                                                border-[#D8D8E8]
                                                                bg-white
                                                                object-contain
                                                            "
                                                            onError={(
                                                                event
                                                            ) => {
                                                                event.currentTarget.style.display =
                                                                    "none";
                                                            }}
                                                        />

                                                    ) : (

                                                        <div
                                                            className="
                                                                flex
                                                                h-[44px]
                                                                w-[55px]
                                                                items-center
                                                                justify-center
                                                                rounded-[3px]
                                                                border
                                                                border-[#D8D8E8]
                                                                bg-white
                                                                text-[9px]
                                                                text-gray-400
                                                            "
                                                        >
                                                            No Image
                                                        </div>

                                                    )}

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    )}

                </div>


                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

                <div className="mt-3 flex items-center justify-between">

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="
                            rounded-[4px]
                            border
                            border-[#CED4DA]
                            bg-white
                            px-4
                            py-1.5
                            text-[11px]
                            font-medium
                            text-[#344050]
                            hover:bg-[#F5F6F8]
                            disabled:opacity-60
                        "
                    >
                        Back to List
                    </button>


                    {!readOnly && (

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                buckets.length === 0
                            }
                            className="
                                rounded-[4px]
                                bg-[#732269]
                                px-5
                                py-1.5
                                text-[11px]
                                font-medium
                                text-white
                                hover:bg-[#5D1B57]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {loading
                                ? "Saving..."
                                : `Save ${languageName} Translation`
                            }
                        </button>

                    )}

                </div>

            </div>

        </form>
    );
}