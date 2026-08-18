import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";

import {
    getQuestionItems,
    updateBucketItems,
    uploadImage,
} from "../services/DropBucketServices";

const MEDIA_URL = import.meta.env.VITE_API_URL || "";

const toMediaUrl = (path) => {
    if (!path || typeof path !== "string") return "";
    if (/^(blob:|https?:\/\/)/i.test(path)) return path;
    return `${MEDIA_URL}/${path.replace(/^app\//, "").replace(/^\/+/, "")}`;
};

// Pull a readable message out of an Axios error, handling FastAPI's
// string / validation-array / object `detail` shapes.
const extractErrorDetail = (error) => {
    const detail = error?.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
        return detail
            .map((d) => (typeof d === "string" ? d : d?.msg || JSON.stringify(d)))
            .join("; ");
    }
    if (detail && typeof detail === "object") {
        return detail.msg || JSON.stringify(detail);
    }
    return error?.message || "";
};

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Drop Bucket Masters", path: "/drop-bucket-master" },
    { label: "Edit Items" },
];

export default function EditBucketItems() {
    const { dropBucketId } = useParams();
    const navigate = useNavigate();

    const [buckets, setBuckets] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getQuestionItems(dropBucketId, 1);
                const b = Array.isArray(data?.buckets) ? data.buckets : [];
                setBuckets(b);
                setItems(
                    (Array.isArray(data?.items) ? data.items : []).map((it) => ({
                        drop_bucket_item_id: it.drop_bucket_item_id,
                        bucket_id: it.bucket_id,
                        item_name: it.item_name || "",
                        item_image: it.item_image || "",
                        item_image_preview: it.item_image || "",
                        item_image_file: null,
                        status: it.status ?? 1,
                    }))
                );
            } catch (error) {
                toast.error("Unable to load bucket items.");
            } finally {
                setLoading(false);
            }
        };
        if (dropBucketId) load();
    }, [dropBucketId]);

    const updateItem = (index, field, value) => {
        setItems((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const handleImage = (index, file) => {
        if (!file) return;
        setItems((prev) => {
            const next = [...prev];
            if (next[index]?.item_image_preview?.startsWith("blob:")) {
                URL.revokeObjectURL(next[index].item_image_preview);
            }
            next[index] = {
                ...next[index],
                item_image_file: file,
                item_image_preview: URL.createObjectURL(file),
            };
            return next;
        });
    };

    const handleAddItem = () => {
        setItems((prev) => [
            ...prev,
            {
                item_name: "",
                item_image: "",
                item_image_preview: "",
                item_image_file: null,
                status: 1,
                bucket_id: buckets[0]?.bucket_id ?? "",
            },
        ]);
    };

    const handleDeleteItem = (index) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        for (const it of items) {
            if (!it.item_name.trim()) {
                toast.error("Every item needs a name.");
                return;
            }
            if (!it.bucket_id) {
                toast.error("Every item must be assigned to a bucket.");
                return;
            }
        }

        // No duplicate item names within the same bucket.
        const seenPerBucket = new Set();
        for (const it of items) {
            const key = `${it.bucket_id}::${it.item_name.trim().toLowerCase()}`;
            if (seenPerBucket.has(key)) {
                toast.error(
                    `Duplicate item "${it.item_name.trim()}" in the same bucket — item names must be unique within a bucket.`
                );
                return;
            }
            seenPerBucket.add(key);
        }

        try {
            setSaving(true);

            // Upload any newly-selected item images first, so we send
            // permanent backend URLs (never blobs). A failed upload is
            // reported on its own so it isn't mistaken for a save failure.
            const resolvedItems = [];
            for (const it of items) {
                let itemImage = it.item_image || null;
                if (it.item_image_file instanceof File) {
                    try {
                        itemImage = await uploadImage(it.item_image_file);
                    } catch (uploadErr) {
                        toast.error(
                            `Image upload failed for "${it.item_name.trim()}". ${extractErrorDetail(uploadErr)}`.trim()
                        );
                        setSaving(false);
                        return;
                    }
                }
                resolvedItems.push({ ...it, item_image: itemImage });
            }

            // Save per bucket (backend upserts + soft-deletes missing items).
            // Every bucket is written — including ones that now have no items —
            // so removed items are deleted.
            await Promise.all(
                buckets.map((b) => {
                    const bucketItems = resolvedItems
                        .filter((it) => Number(it.bucket_id) === Number(b.bucket_id))
                        .map((it) => ({
                            ...(it.drop_bucket_item_id
                                ? { drop_bucket_item_id: it.drop_bucket_item_id }
                                : {}),
                            item_name: it.item_name,
                            item_image: it.item_image || null,
                            status: Number(it.status),
                            language_id: 1,
                        }));

                    return updateBucketItems(b.bucket_id, { items: bucketItems });
                })
            );

            toast.success("Bucket items updated successfully.");
            navigate("/drop-bucket-master");
        } catch (error) {
            // Surface the real backend reason instead of a generic message.
            toast.error(
                extractErrorDetail(error) || "Unable to update bucket items."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout>
            <div className="mb-3 flex items-center justify-between">
                <span className="text-[20px] font-medium text-[#344050]">
                    Edit Drop Bucket Items
                </span>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            {loading ? (
                <div className="rounded border bg-white p-6 text-sm text-[#5e6e82]">
                    Loading...
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="rounded border bg-white">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <span className="font-semibold text-[#344050]">
                                Bucket Items
                            </span>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="flex items-center gap-2 rounded bg-[#732269] px-3 py-2 text-sm font-medium text-white hover:bg-[#60205a]"
                            >
                                <FiPlus size={15} />
                                Add Item
                            </button>
                        </div>

                        <div className="space-y-4 p-4">
                            {items.length === 0 && (
                                <div className="rounded border border-dashed py-8 text-center text-sm text-gray-400">
                                    No items yet. Click "Add Item".
                                </div>
                            )}

                            {items.map((it, index) => (
                                <div
                                    key={it.drop_bucket_item_id ?? `item-${index}`}
                                    className="rounded border p-4"
                                >
                                    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
                                        {/* ITEM NAME */}
                                        <div className="lg:col-span-4">
                                            <label className="mb-1 block text-sm font-medium text-[#344050]">
                                                Item Name
                                            </label>
                                            <input
                                                type="text"
                                                value={it.item_name}
                                                onChange={(e) =>
                                                    updateItem(index, "item_name", e.target.value)
                                                }
                                                className="h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#732269]"
                                            />
                                        </div>

                                        {/* ITEM IMAGE */}
                                        <div className="lg:col-span-3">
                                            <label className="mb-1 block text-sm font-medium text-[#344050]">
                                                Item Image
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        handleImage(index, e.target.files?.[0] || null)
                                                    }
                                                    className="block h-[35px] w-full rounded-[3px] border border-[#D8E2EF] bg-white text-[12px] text-[#344050] file:mr-[10px] file:h-full file:border-0 file:bg-[#344050] file:px-[12px] file:text-[12px] file:font-medium file:text-white"
                                                />
                                                {it.item_image_preview && (
                                                    <img
                                                        src={toMediaUrl(it.item_image_preview)}
                                                        alt={it.item_name}
                                                        className="h-10 w-10 rounded border object-contain"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* BUCKET */}
                                        <div className="lg:col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-[#344050]">
                                                Bucket
                                            </label>
                                            <select
                                                value={it.bucket_id}
                                                onChange={(e) =>
                                                    updateItem(index, "bucket_id", e.target.value)
                                                }
                                                className="h-10 w-full rounded border px-2 text-sm outline-none focus:border-[#732269]"
                                            >
                                                {buckets.map((b) => (
                                                    <option key={b.bucket_id} value={b.bucket_id}>
                                                        {b.bucket_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* STATUS */}
                                        <div className="lg:col-span-2">
                                            <label className="mb-1 block text-sm font-medium text-[#344050]">
                                                Status
                                            </label>
                                            <select
                                                value={it.status}
                                                onChange={(e) =>
                                                    updateItem(index, "status", e.target.value)
                                                }
                                                className="h-10 w-full rounded border px-2 text-sm outline-none focus:border-[#732269]"
                                            >
                                                <option value={1}>Active</option>
                                                <option value={0}>Inactive</option>
                                            </select>
                                        </div>

                                        {/* DELETE */}
                                        <div className="lg:col-span-1 lg:pt-6">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteItem(index)}
                                                className="h-10 w-full rounded border border-red-400 px-2 text-xs text-red-500 hover:bg-red-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate("/drop-bucket-master")}
                            className="rounded border px-5 py-2 text-sm"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded bg-[#732269] px-6 py-2 text-sm text-white disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Update Bucket Items"}
                        </button>
                    </div>
                </form>
            )}
        </AppLayout>
    );
}
