import {
    useState,
    useEffect,
    useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
    getBucketById,
    createBucket,
    updateBucket,
    uploadImage,
} from "../services/DropBucketServices";

const createEmptyBucket = () => ({
    bucket_name: "",
    bucket_image: null,
    // Permanent backend URL only (never a blob URL).
    bucket_image_url: "",
    // Temporary blob: URL used ONLY for instant local preview.
    bucket_image_preview_url: "",
    status: 1,
    language_id: 1,
});

const INITIAL_FORM = {
    language_id: 1,
    drop_bucket_question_title: "",
    drop_bucket_question_description: "",
    image: null,
    // Permanent backend URL only (never a blob URL).
    image_url: "",
    // Temporary blob: URL used ONLY for instant local preview.
    image_preview_url: "",
    marks: "",
    status: 1,
    buckets: [createEmptyBucket(), createEmptyBucket()],
};


const formatApiError = (error) => {
    const detail = error?.response?.data?.detail;
    if (!detail) return "An unexpected error occurred.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
        return detail.map(item => {
            const loc = Array.isArray(item?.loc) ? item.loc.join(" → ") : "";
            const msg = item?.msg || "Validation error.";
            return loc ? `${loc}: ${msg}` : msg;
        }).join("\n");
    }
    return "Unable to process the request.";
};

export default function useDropBucketForm({ id = null } = {}) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);

    const isEditMode = !!id;

    const loadDropBucket = useCallback(async () => {
        if (!isEditMode) return;

        setLoading(true);
        try {
            const response = await getBucketById(id, 1);
            const data = response?.data?.[0] || response?.data || response;

            if (!data) {
                toast.error("Drop Bucket not found.");
                navigate("/drop-bucket-master");
                return;
            }

            const sourceBuckets = Array.isArray(data?.buckets) ? data.buckets : (Array.isArray(data?.drop_buckets) ? data.drop_buckets : []);

            const normalizedBuckets = sourceBuckets
                .filter(bucket => Number(bucket.language_id) === 1)
                .map(bucket => ({
                    bucket_id: bucket.bucket_id || bucket.id,
                    drop_bucket_id: bucket.drop_bucket_id,
                    bucket_name: bucket.bucket_name || "",
                    bucket_image: null,
                    bucket_image_url: bucket.bucket_image || bucket.image_url || "",
                    bucket_image_preview_url: "",
                    status: bucket.status ?? 1,
                    language_id: 1,
                }));

            setForm({
                language_id: 1,
                drop_bucket_question_title: data.drop_bucket_question_title || "",
                drop_bucket_question_description: data.drop_bucket_question_description || "",
                image: null,
                image_url: data.image_url || "",
                image_preview_url: "",
                marks: data.marks ?? "",
                status: data.status ?? 1,
                buckets: normalizedBuckets.length > 0 ? normalizedBuckets : [createEmptyBucket(), createEmptyBucket()],
            });
        } catch (error) {
            console.error("DROP BUCKET LOAD ERROR:", error);
            toast.error("Unable to load Drop Bucket data.");
            navigate("/drop-bucket-master");
        } finally {
            setLoading(false);
        }
    }, [id, isEditMode, navigate]);

    useEffect(() => {
        if (isEditMode) {
            loadDropBucket();
        }
    }, [isEditMode, loadDropBucket]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image.");
            e.target.value = "";
            return;
        }

        setForm((prev) => {
            if (prev.image_preview_url?.startsWith("blob:")) {
                URL.revokeObjectURL(prev.image_preview_url);
            }
            const previewUrl = URL.createObjectURL(file);
            return { ...prev, image: file, image_preview_url: previewUrl };
        });
    };

    const handleBucketChange = (bucketIndex, field, value) => {
        if (field === "bucket_image") {
            const file = value;
            if (!file) return;
            if (!file.type.startsWith("image/")) {
                toast.error("Please select a valid image.");
                return;
            }

            setForm((prev) => {
                const buckets = [...prev.buckets];
                if (buckets[bucketIndex]) {
                    if (buckets[bucketIndex].bucket_image_preview_url?.startsWith("blob:")) {
                        URL.revokeObjectURL(buckets[bucketIndex].bucket_image_preview_url);
                    }
                    const previewUrl = URL.createObjectURL(file);
                    buckets[bucketIndex] = { ...buckets[bucketIndex], bucket_image: file, bucket_image_preview_url: previewUrl };
                }
                return { ...prev, buckets };
            });
            return;
        }

        setForm((prev) => {
            const buckets = [...prev.buckets];
            if (buckets[bucketIndex]) {
                buckets[bucketIndex] = { ...buckets[bucketIndex], [field]: value };
            }
            return { ...prev, buckets };
        });
    };

    const handleAddBucket = () => {
        setForm((prev) => {
            if (prev.buckets.length >= 10) {
                toast.error("Maximum 10 buckets allowed.");
                return prev;
            }
            return { ...prev, buckets: [...prev.buckets, createEmptyBucket()] };
        });
    };

    const handleDeleteBucket = (bucketIndex) => {
        setForm((prev) => {
            if (prev.buckets.length <= 2) {
                toast.error("At least two buckets are required.");
                return prev;
            }
            const bucket = prev.buckets[bucketIndex];
            if (bucket?.bucket_image_preview_url?.startsWith("blob:")) {
                URL.revokeObjectURL(bucket.bucket_image_preview_url);
            }
            return { ...prev, buckets: prev.buckets.filter((_, index) => index !== bucketIndex) };
        });
    };

    const validateForm = () => {
        if (!form.drop_bucket_question_title?.trim()) {
            toast.error("Question title is required.");
            return false;
        }
        if (form.marks === "" || form.marks === null || Number.isNaN(Number(form.marks)) || Number(form.marks) < 0) {
            toast.error("Valid marks are required.");
            return false;
        }
        if (!Array.isArray(form.buckets) || form.buckets.length < 2) {
            toast.error("At least two buckets are required.");
            return false;
        }
        for (let i = 0; i < form.buckets.length; i++) {
            if (!form.buckets[i]?.bucket_name?.trim()) {
                toast.error(`Bucket #${i + 1} name is required.`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Upload the actual files and send permanent backend URLs.
            // If no new file was chosen, keep the existing backend URL.
            let questionImageUrl =
                form.image_url &&
                !form.image_url.startsWith("blob:")
                    ? form.image_url
                    : null;

            if (form.image instanceof File) {
                questionImageUrl = await uploadImage(form.image);
            }

            const bucketsForPayload = [];

            for (const bucket of form.buckets) {

                let bucketImageUrl =
                    bucket.bucket_image_url &&
                    !bucket.bucket_image_url.startsWith("blob:")
                        ? bucket.bucket_image_url
                        : null;

                if (bucket.bucket_image instanceof File) {
                    bucketImageUrl = await uploadImage(bucket.bucket_image);
                }

                bucketsForPayload.push({
                    ...(isEditMode && { bucket_id: bucket.bucket_id }),
                    bucket_name: bucket.bucket_name.trim(),

                    image_url: bucketImageUrl,

                    status: Number(bucket.status ?? 1),
                    language_id: 1,
                });
            }

            const payload = {
                drop_bucket_question_title:
                    form.drop_bucket_question_title.trim(),

                drop_bucket_question_description:
                    form.drop_bucket_question_description?.trim() || null,

                image_url: questionImageUrl,

                marks: Number(form.marks),
                status: Number(form.status),
                language_id: 1,
                buckets: bucketsForPayload,
            };

            if (!isEditMode) {
                payload.parent_id = 0;
            }

            if (isEditMode) {
                await updateBucket(id, payload);
                toast.success("Drop Bucket updated successfully.");
            } else {
                await createBucket(payload);
                toast.success("Drop Bucket created successfully.");
            }
            navigate("/drop-bucket-master");
        } catch (error) {
            console.error(isEditMode ? "UPDATE ERROR:" : "CREATE ERROR:", error);
            toast.error(formatApiError(error));
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        form,
        isEditMode,
        handleChange,
        handleImageChange,
        handleBucketChange,
        handleAddBucket,
        handleDeleteBucket,
        handleSubmit,
    };
}