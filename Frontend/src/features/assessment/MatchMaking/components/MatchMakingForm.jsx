import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
    createMatchMaking,
    uploadImage,
} from "../services/MatchingMakingService";

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

export default function MatchMakingForm({
    initialData = null,
    isEdit = false,
    onSubmit: externalSubmit,
}) {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        language_id: initialData?.language_id ?? 1,

        match_making_question_title:
            initialData?.match_making_question_title ?? "",

        match_making_question_description:
            initialData?.match_making_question_description ?? "",

        image_url:
            initialData?.image_url ?? "",

        marks:
            initialData?.marks ?? "",

        status:
            initialData?.status ?? 1,
    });

    const [imageFile, setImageFile] = useState(null);

    // Temporary blob: URL used ONLY for instant local preview.
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");

    // =====================================================
    // FIELD CHANGE
    // =====================================================

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =====================================================
    // IMAGE CHANGE
    // =====================================================

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        // 2 MB
        if (file.size > 2 * 1024 * 1024) {
            toast.error(
                "Image size must be less than 2MB."
            );

            e.target.value = "";

            return;
        }

        // Allowed types
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error(
                "Only JPG, PNG and WEBP images are allowed."
            );

            e.target.value = "";

            return;
        }

        setImageFile(file);

        setImagePreviewUrl((prev) => {
            if (prev?.startsWith("blob:")) {
                URL.revokeObjectURL(prev);
            }
            return URL.createObjectURL(file);
        });
    };

    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ---------------------------------------------
        // TITLE VALIDATION
        // ---------------------------------------------

        if (
            !formData
                .match_making_question_title
                .trim()
        ) {
            toast.error(
                "Question title is required."
            );

            return;
        }

        // ---------------------------------------------
        // MARKS VALIDATION
        // ---------------------------------------------

        if (
            formData.marks === "" ||
            formData.marks === null ||
            formData.marks === undefined
        ) {
            toast.error(
                "Marks is required."
            );

            return;
        }

        try {
            setLoading(true);

            // ---------------------------------------------
            // UPLOAD IMAGE (get permanent URL); keep existing
            // backend URL when no new file was selected.
            // ---------------------------------------------

            let imageUrl =
                formData.image_url &&
                !formData.image_url.startsWith("blob:")
                    ? formData.image_url
                    : null;

            if (imageFile instanceof File) {
                imageUrl = await uploadImage(imageFile);
            }

            // ---------------------------------------------
            // PAYLOAD
            // ---------------------------------------------

            const payload = {
                parent_id:
                    initialData?.parent_id ?? 0,

                match_making_question_title:
                    formData
                        .match_making_question_title
                        .trim(),

                match_making_question_description:
                    formData
                        .match_making_question_description
                        .trim() || null,

                image_url: imageUrl,

                marks:
                    Number(formData.marks),

                status:
                    Number(formData.status),

                language_id:
                    Number(formData.language_id),
            };

            // =================================================
            // EDIT
            // =================================================

            if (isEdit && externalSubmit) {
                await externalSubmit(
                    payload,
                    imageFile
                );

                return;
            }

            // =================================================
            // CREATE
            // =================================================

            await createMatchMaking(
                payload
            );

            toast.success(
                "Match Making Question created successfully."
            );

            navigate(
                "/match-making-master"
            );

        } catch (error) {
            console.error(
                "MATCH MAKING FORM ERROR:",
                error
            );

            toast.error(
                error?.response?.data?.detail ||
                "Unable to save Match Making Question."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <form onSubmit={handleSubmit}>

            <div className="overflow-hidden rounded-md border bg-white">

                {/* HEADER */}

                <div className="border-b px-4 py-4">

                    <span className="text-[18px] font-medium">

                        {isEdit
                            ? "Edit Match Making Question"
                            : "Create Match Making Question"
                        }

                    </span>

                </div>

                {/* FORM BODY */}

                <div className="space-y-4 p-4">

                    {/* =================================================
                        LANGUAGE
                    ================================================= */}

                    <div>

                        <label className="mb-1 block text-sm text-[#34495e]">

                            Language

                            <span className="text-red-500">
                                {" "}*
                            </span>

                        </label>

                        <select
                            name="language_id"
                            value={formData.language_id}
                            onChange={handleChange}
                            className="h-9 w-full rounded border border-[#cbd5e1] bg-[#eef4fb] px-3 text-sm outline-none focus:border-[#732269]"
                        >

                            <option value={1}>
                                English
                            </option>

                            <option value={2}>
                                Hindi
                            </option>

                            <option value={3}>
                                Bangla
                            </option>

                            <option value={4}>
                                Tamil
                            </option>

                        </select>

                    </div>

                    {/* =================================================
                        QUESTION TITLE
                    ================================================= */}

                    <div>

                        <label className="mb-1 block text-sm text-[#34495e]">

                            Question Title

                            <span className="text-red-500">
                                {" "}*
                            </span>

                        </label>

                        <input
                            type="text"
                            name="match_making_question_title"
                            value={
                                formData
                                    .match_making_question_title
                            }
                            onChange={handleChange}
                            placeholder="Enter question title"
                            className="h-9 w-full rounded border border-[#cbd5e1] px-3 text-sm outline-none focus:border-[#732269]"
                        />

                    </div>

                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <div>

                        <label className="mb-1 block text-sm text-[#34495e]">
                            Question Description
                        </label>

                        <textarea
                            name="match_making_question_description"
                            value={
                                formData
                                    .match_making_question_description
                            }
                            onChange={handleChange}
                            rows={3}
                            placeholder="Enter question description"
                            className="w-full resize-none rounded border border-[#cbd5e1] px-3 py-2 text-sm outline-none focus:border-[#732269]"
                        />

                    </div>

                    {/* =================================================
                        IMAGE
                    ================================================= */}

                    <div>

                        <label className="mb-1 block text-sm text-[#34495e]">
                            Question Image
                        </label>

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="block h-9 w-full rounded border border-[#cbd5e1] text-sm file:mr-3 file:h-9 file:border-0 file:bg-[#34495e] file:px-3 file:text-white"
                        />

                        {/* New selected file */}

                        {imageFile && (
                            <p className="mt-1 text-xs text-gray-500">
                                Selected: {imageFile.name}
                            </p>
                        )}

                        {/* Preview: new selection (blob) or existing backend image */}

                        {(imagePreviewUrl || formData.image_url) && (

                                <img
                                    src={getImageUrl(
                                        imagePreviewUrl ||
                                            formData.image_url
                                    )}
                                    alt="Match Making"
                                    className="mt-2 h-24 w-24 rounded border border-[#CED4DA] bg-white object-contain p-1"
                                    onError={(e) => {
                                        e.currentTarget.style.display =
                                            "none";
                                    }}
                                />

                            )}

                    </div>

                    {/* =================================================
                        MARKS
                    ================================================= */}

                    <div>

                        <label className="mb-1 block text-sm text-[#34495e]">

                            Marks

                            <span className="text-red-500">
                                {" "}*
                            </span>

                        </label>

                        <input
                            type="number"
                            name="marks"
                            value={formData.marks}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="h-9 w-full rounded border border-[#cbd5e1] px-3 text-sm outline-none focus:border-[#732269]"
                        />

                    </div>

                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <div>

                        <label className="mb-1 block text-sm text-[#34495e]">

                            Status

                            <span className="text-red-500">
                                {" "}*
                            </span>

                        </label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="h-9 w-full rounded border border-[#cbd5e1] px-3 text-sm outline-none focus:border-[#732269]"
                        >

                            <option value={1}>
                                Active
                            </option>

                            <option value={0}>
                                Inactive
                            </option>

                        </select>

                    </div>

                </div>

            </div>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="mt-4 flex gap-2">

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/match-making-master"
                        )
                    }
                    disabled={loading}
                    className="rounded border border-gray-400 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-[#732269] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >

                    {loading

                        ? isEdit
                            ? "Updating..."
                            : "Creating..."

                        : isEdit
                            ? "Update Match Making Question"
                            : "Create Match Making Question"

                    }

                </button>

            </div>

        </form>
    );
}