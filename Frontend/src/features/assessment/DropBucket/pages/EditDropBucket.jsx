import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";

import AllLanguageDropBucketForm from "../components/AllLanguageDropBucketForm";

import {
    getBucketAllLanguages,
    bulkUpdateBuckets,
    uploadImage,
} from "../services/DropBucketServices";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Drop Bucket Questions", path: "/drop-bucket-master" },
    { label: "Edit" },
];

const formatApiError = (error) => {
    const detail = error?.response?.data?.detail;
    if (!detail) return "An unexpected error occurred. Please try again.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
        return detail
            .map((item) =>
                typeof item === "string"
                    ? item
                    : item?.msg || JSON.stringify(item)
            )
            .join("; ");
    }
    return "An unexpected error occurred. Please try again.";
};

export default function EditDropBucket() {
    const { parentId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        drop_bucket_question_title: "",
        drop_bucket_question_description: "",
        image_url: "",
        image_preview: "",
        // Actual File to upload on submit (null when unchanged).
        image_file: null,
        marks: "",
        status: 1,
        buckets: [],
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    /* ================= LOAD ================= */

    useEffect(() => {
        const loadDropBucket = async () => {
            setLoading(true);
            try {
                const data = await getBucketAllLanguages(parentId);

                setForm({
                    drop_bucket_question_title:
                        data?.drop_bucket_question_title || "",
                    drop_bucket_question_description:
                        data?.drop_bucket_question_description || "",
                    image_url: data?.image_url || "",
                    image_preview: data?.image_url || "",
                    image_file: null,
                    marks: data?.marks ?? "",
                    status: data?.status ?? 1,
                    buckets: (Array.isArray(data?.buckets) ? data.buckets : []).map(
                        (b) => ({
                            bucket_id: b.bucket_id,
                            bucket_name: b.bucket_name || "",
                            bucket_image: b.bucket_image || "",
                            bucket_image_preview: b.bucket_image || "",
                            bucket_image_file: null,
                            language_id: b.language_id,
                            language_name: b.language_name,
                            status: b.status ?? 1,
                        })
                    ),
                });
            } catch (error) {
                toast.error(formatApiError(error));
            } finally {
                setLoading(false);
            }
        };

        if (parentId) loadDropBucket();
    }, [parentId]);

    /* ================= HANDLERS ================= */

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0] || null;
        if (!file) return;
        // Keep the File for upload-on-submit; show a temporary blob preview.
        setForm((prev) => {
            if (prev.image_preview?.startsWith("blob:")) {
                URL.revokeObjectURL(prev.image_preview);
            }
            return {
                ...prev,
                image_file: file,
                image_preview: URL.createObjectURL(file),
            };
        });
    };

    const handleBucketChange = (index, field, value) => {
        setForm((prev) => {
            const buckets = [...prev.buckets];
            buckets[index] = { ...buckets[index], [field]: value };
            return { ...prev, buckets };
        });
    };

    const handleBucketImageChange = (index, file) => {
        if (!file) return;
        setForm((prev) => {
            const buckets = [...prev.buckets];
            if (buckets[index]?.bucket_image_preview?.startsWith("blob:")) {
                URL.revokeObjectURL(buckets[index].bucket_image_preview);
            }
            buckets[index] = {
                ...buckets[index],
                bucket_image_file: file,
                bucket_image_preview: URL.createObjectURL(file),
            };
            return { ...prev, buckets };
        });
    };

    const handleAddBucket = () => {
        setForm((prev) => ({
            ...prev,
            buckets: [
                ...prev.buckets,
                {
                    bucket_name: "",
                    bucket_image: "",
                    bucket_image_preview: "",
                    bucket_image_file: null,
                    language_id: 1,
                    language_name: "English",
                    status: 1,
                },
            ],
        }));
    };

    const handleDeleteBucket = (index) => {
        setForm((prev) => ({
            ...prev,
            buckets: prev.buckets.filter((_, i) => i !== index),
        }));
    };

    /* ================= SUBMIT ================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.drop_bucket_question_title.trim()) {
            toast.error("Question title is required.");
            return;
        }

        const englishCount = form.buckets.filter(
            (b) => Number(b.language_id) === 1
        ).length;
        if (englishCount < 2) {
            toast.error("At least two English buckets are required.");
            return;
        }

        try {
            setSaving(true);

            // Upload a newly-selected question image; keep the existing URL otherwise.
            let questionImageUrl = form.image_url || null;
            if (form.image_file instanceof File) {
                questionImageUrl = await uploadImage(form.image_file);
            }

            // Upload any newly-selected bucket images; keep existing URLs otherwise.
            const bucketsForPayload = [];
            for (const b of form.buckets) {
                let bucketImage = b.bucket_image || null;
                if (b.bucket_image_file instanceof File) {
                    bucketImage = await uploadImage(b.bucket_image_file);
                }
                bucketsForPayload.push({
                    bucket_name: b.bucket_name,
                    bucket_image: bucketImage,
                    language_id: Number(b.language_id),
                    sort_order: 1,
                });
            }

            const payload = {
                drop_bucket_question_title: form.drop_bucket_question_title,
                drop_bucket_question_description:
                    form.drop_bucket_question_description || null,
                image_url: questionImageUrl,
                marks: Number(form.marks) || 0,
                status: Number(form.status),
                buckets: bucketsForPayload,
            };

            await bulkUpdateBuckets(parentId, payload);
            toast.success("Drop Bucket updated successfully.");
            navigate("/drop-bucket-master");
        } catch (error) {
            toast.error(formatApiError(error));
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout>
            <div className="mb-3 flex items-center justify-between">
                <span className="text-[20px] font-medium text-[#344050]">
                    Edit Drop Bucket Question
                </span>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            {loading ? (
                <div className="rounded border bg-white p-6 text-sm text-[#5e6e82]">
                    Loading...
                </div>
            ) : (
                <AllLanguageDropBucketForm
                    form={form}
                    loading={saving}
                    submitLabel="Update"
                    onChange={handleChange}
                    onImageChange={handleImageChange}
                    onBucketChange={handleBucketChange}
                    onBucketImageChange={handleBucketImageChange}
                    onAddBucket={handleAddBucket}
                    onDeleteBucket={handleDeleteBucket}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate("/drop-bucket-master")}
                />
            )}
        </AppLayout>
    );
}
