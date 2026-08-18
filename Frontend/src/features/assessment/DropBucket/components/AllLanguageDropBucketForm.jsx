import { FiPlus, FiTrash2 } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("blob:")) return imageUrl;
    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }
    return `${API_URL}/${imageUrl.replace(/^app\//, "").replace(/^\/+/, "")}`;
};

/* =========================================================
   AllLanguageDropBucketForm

   Flat, single-page editor: the English question fields on top,
   then ONE "Drop Buckets" list holding every language's buckets
   (each card shows its language). Matches the production layout.
========================================================= */

export default function AllLanguageDropBucketForm({
    form,
    loading,
    submitLabel = "Update",
    onChange,
    onImageChange,
    onBucketChange,
    onBucketImageChange,
    onAddBucket,
    onDeleteBucket,
    onSubmit,
    onCancel,
}) {
    const buckets = Array.isArray(form?.buckets) ? form.buckets : [];

    return (
        <form onSubmit={onSubmit}>

            {/* ============== QUESTION (base / English) ============== */}
            <div className="rounded border bg-white">
                <div className="border-b px-4 py-3">
                    <span className="font-semibold text-[#344050]">
                        Edit Drop Bucket Question
                    </span>
                </div>

                <div className="space-y-4 p-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#344050]">
                            Language <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value="English"
                            readOnly
                            className="h-10 w-full rounded border bg-[#EEF4FB] px-3 text-sm"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#344050]">
                            Question Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="drop_bucket_question_title"
                            value={form?.drop_bucket_question_title || ""}
                            onChange={onChange}
                            placeholder="Enter question title"
                            className="h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#732269]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#344050]">
                            Question Description
                        </label>
                        <textarea
                            rows={4}
                            name="drop_bucket_question_description"
                            value={form?.drop_bucket_question_description || ""}
                            onChange={onChange}
                            placeholder="Enter question description"
                            className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-[#732269]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#344050]">
                            Question Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onImageChange}
                            className="block h-[35px] w-full rounded-[3px] border border-[#D8E2EF] bg-white text-[13px] text-[#344050] file:mr-[12px] file:h-full file:border-0 file:bg-[#344050] file:px-[14px] file:text-[13px] file:font-medium file:text-white"
                        />
                        {form?.image_preview && (
                            <>
                                <img
                                    src={getImageUrl(form.image_preview)}
                                    alt="Question preview"
                                    className="mt-3 h-24 rounded border object-contain"
                                />
                                <p className="mt-1 text-xs text-gray-400">
                                    Current image. Leave empty to keep existing.
                                </p>
                            </>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#344050]">
                            Marks <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="marks"
                            min="0"
                            step="0.01"
                            value={form?.marks ?? ""}
                            onChange={onChange}
                            placeholder="Enter marks"
                            className="h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#732269]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#344050]">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="status"
                            value={form?.status ?? 1}
                            onChange={onChange}
                            className="h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#732269]"
                        >
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ============== DROP BUCKETS (all languages, flat) ============== */}
            <div className="mt-4 rounded border bg-white">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <span className="font-semibold text-[#344050]">
                        Drop Buckets <span className="text-red-500">*</span>
                    </span>
                    <button
                        type="button"
                        onClick={onAddBucket}
                        disabled={loading}
                        className="flex items-center gap-2 rounded bg-[#732269] px-3 py-2 text-sm font-medium text-white hover:bg-[#60205a] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FiPlus size={15} />
                        Add Bucket
                    </button>
                </div>

                <div className="space-y-4 p-3">
                    {buckets.map((bucket, index) => (
                        <div
                            key={bucket?.bucket_id ?? `bucket-${index}`}
                            className="rounded border"
                        >
                            <div className="flex items-center justify-between border-b bg-white px-4 py-3">
                                <span className="text-sm font-medium text-[#344050]">
                                    Bucket #{index + 1}
                                    {bucket?.language_name && (
                                        <span className="ml-2 rounded bg-[#f3e9f2] px-2 py-[2px] text-[11px] font-medium text-[#732269]">
                                            {bucket.language_name}
                                        </span>
                                    )}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onDeleteBucket(index)}
                                    disabled={loading}
                                    className="flex items-center gap-1 rounded border border-red-400 px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <FiTrash2 size={13} />
                                    Remove
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-[#344050]">
                                        Bucket Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={bucket?.bucket_name || ""}
                                        onChange={(e) =>
                                            onBucketChange(index, "bucket_name", e.target.value)
                                        }
                                        placeholder="Enter bucket name"
                                        className="h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#732269]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-[#344050]">
                                        Bucket Image
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            onBucketImageChange(
                                                index,
                                                e.target.files?.[0] || null
                                            )
                                        }
                                        className="block h-[35px] w-full rounded-[3px] border border-[#D8E2EF] bg-white text-[13px] text-[#344050] file:mr-[12px] file:h-full file:border-0 file:bg-[#344050] file:px-[14px] file:text-[13px] file:font-medium file:text-white"
                                    />
                                    {bucket?.bucket_image_preview && (
                                        <img
                                            src={getImageUrl(bucket.bucket_image_preview)}
                                            alt={`Bucket ${index + 1}`}
                                            className="mt-3 h-20 w-20 rounded border object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {buckets.length === 0 && (
                        <div className="rounded border border-dashed py-8 text-center">
                            <p className="text-sm text-gray-400">No buckets added.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ============== FOOTER ============== */}
            <div className="mt-4 flex items-center justify-start gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded border px-5 py-2 text-sm disabled:opacity-60"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-[#732269] px-6 py-2 text-sm text-white disabled:opacity-60"
                >
                    {loading ? "Saving..." : submitLabel}
                </button>
            </div>
        </form>
    );
}
