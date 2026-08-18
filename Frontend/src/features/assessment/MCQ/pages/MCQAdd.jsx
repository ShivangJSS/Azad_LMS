import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import MCQForm from "../components/MCQForm";

import { createMCQ, uploadImage } from "../services/MCQServices";

const INITIAL_FORM = {
    language_id: 1,

    mcq_question_title: "",

    mcq_question_description: "",

    // Permanent backend URL only (never a blob URL).
    image_url: "",

    // Temporary blob: URL used ONLY for instant local preview.
    image_preview_url: "",


    image: null,

    marks: "",

    status: 1,

    options: [
        {
            mcq_option_text: "",
            is_mcq_option_correct: 0,
            status: 1,
            language_id: 1,
        },
        {
            mcq_option_text: "",
            is_mcq_option_correct: 0,
            status: 1,
            language_id: 1,
        },
    ],
};

const formatApiError = (error) => {

    const detail =
        error?.response?.data?.detail;

    if (!detail) {
        return "An unexpected error occurred. Please try again.";
    }

    if (typeof detail === "string") {
        return detail;
    }

    if (Array.isArray(detail)) {

        return detail
            .map((item) => {

                if (typeof item === "string") {
                    return item;
                }

                const loc =
                    Array.isArray(item?.loc)
                        ? item.loc
                            .slice(1)
                            .join(" -> ")
                        : "";

                const msg =
                    item?.msg ||
                    JSON.stringify(item);

                return loc
                    ? `${loc}: ${msg}`
                    : msg;
            })
            .join("; ");
    }

    return String(detail);
};

export default function MCQAdd() {

    const navigate = useNavigate();

    const [loading, setLoading] =
        useState(false);

    const [form, setForm] =
        useState(INITIAL_FORM);

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /*
     * IMAGE PREVIEW
     * Keep the actual File for upload-on-submit and show a temporary
     * blob preview only. The permanent image_url is set after upload.
     */
    const handleImageChange = (e) => {

        const file =
            e.target.files?.[0];
        if (!file) {
            return;
        }
        setForm((prev) => {

            if (
                prev.image_preview_url?.startsWith("blob:")
            ) {
                URL.revokeObjectURL(prev.image_preview_url);
            }

            return {
                ...prev,

                image: file,

                image_preview_url:
                    URL.createObjectURL(file),
            };
        });

    };

    const handleOptionChange = (
        index,
        field,
        value
    ) => {

        setForm((prev) => {

            const updated = [
                ...prev.options,
            ];

            if (
                field ===
                "is_mcq_option_correct"
            ) {

                // MCQ allows multiple correct answers: toggle only the
                // clicked option instead of resetting all others.
                updated[index] = {
                    ...updated[index],
                    is_mcq_option_correct: value,
                };

            } else {

                updated[index] = {
                    ...updated[index],
                    [field]: value,
                };
            }

            return {
                ...prev,
                options: updated,
            };
        });
    };

    const handleAddOption = () => {

        if (form.options.length >= 6) {

            toast.error(
                "Maximum 6 options are allowed."
            );

            return;
        }

        setForm((prev) => ({
            ...prev,

            options: [
                ...prev.options,

                {
                    mcq_option_text: "",
                    is_mcq_option_correct: 0,
                    status: 1,
                    language_id: 1,
                },
            ],
        }));
    };

    const handleDeleteOption = (
        index
    ) => {

        if (form.options.length <= 2) {

            toast.error(
                "An MCQ must have at least two options."
            );

            return;
        }

        setForm((prev) => ({
            ...prev,

            options:
                prev.options.filter(
                    (_, i) =>
                        i !== index
                ),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // -------------------------
        // VALIDATION
        // -------------------------

        if (!form.mcq_question_title?.trim()) {
            toast.error("Question title is required.");
            return;
        }

        if (
            form.marks === "" ||
            form.marks === null ||
            form.marks === undefined
        ) {
            toast.error("Marks are required.");
            return;
        }

        if (Number(form.marks) < 0) {
            toast.error("Marks cannot be negative.");
            return;
        }

        if (form.options.length < 2) {
            toast.error("Minimum 2 options are required.");
            return;
        }

        if (
            form.options.some(
                (option) =>
                    !option.mcq_option_text?.trim()
            )
        ) {
            toast.error("Option text cannot be empty.");
            return;
        }

        const correctCount = form.options.filter(
            (option) =>
                Number(option.is_mcq_option_correct) === 1
        ).length;

        // MCQ allows multiple correct answers — require at least one.
        if (correctCount < 1) {
            toast.error(
                "At least one option must be marked as correct."
            );
            return;
        }

        try {
            setLoading(true);

            // -------------------------
            // UPLOAD IMAGE (get permanent URL)
            // -------------------------

            let imageUrl =
                form.image_url &&
                !form.image_url.startsWith("blob:")
                    ? form.image_url
                    : null;

            if (form.image instanceof File) {
                imageUrl = await uploadImage(form.image);
            }

            // -------------------------
            // JSON PAYLOAD
            // -------------------------

            const payload = {
                parent_id: null,

                mcq_question_title:
                    form.mcq_question_title.trim(),

                mcq_question_description:
                    form.mcq_question_description?.trim() || null,

                image_url: imageUrl,

                marks: Number(form.marks),

                status: Number(form.status),

                language_id:
                    Number(form.language_id),

                options: form.options.map((option) => ({
                    mcq_option_text:
                        option.mcq_option_text.trim(),

                    is_mcq_option_correct:
                        Number(
                            option.is_mcq_option_correct
                        ),

                    status:
                        Number(option.status ?? 1),

                    language_id:
                        Number(
                            option.language_id ??
                            form.language_id
                        ),
                })),
            };



            // -------------------------
            // CREATE
            // -------------------------

            await createMCQ(payload);

            toast.success(
                "MCQ created successfully."
            );

            navigate("/mcq-master");

        } catch (error) {

            console.error(
                "========== MCQ CREATE ERROR =========="
            );

            console.error(
                "STATUS:",
                error?.response?.status
            );

            console.error(
                "BACKEND RESPONSE:",
                error?.response?.data
            );

            const detail =
                error?.response?.data?.detail;

            if (Array.isArray(detail)) {

                detail.forEach((item) => {
                    toast.error(
                        item?.msg ||
                        "Validation error."
                    );
                });

            } else if (
                typeof detail === "string"
            ) {

                toast.error(detail);

            } else {

                toast.error(
                    "Unable to create MCQ."
                );

            }

        } finally {
            setLoading(false);
        }
    };
    return (
        <AppLayout>

            <div className="mb-4 flex items-center justify-between">

                <span className="text-[22px] font-semibold text-[#101113]">
                    Create MCQ
                </span>

                <Breadcrumbs
                    items={[
                        {
                            label: "Home",
                            path: "/dashboard",
                        },
                        {
                            label: "MCQ",
                            path: "/mcq-master",
                        },
                        {
                            label: "Create MCQ",
                        },
                    ]}
                />

            </div>

            <MCQForm
                form={form}
                loading={loading}
                submitLabel="Create MCQ"
                onChange={handleChange}
                onImageChange={handleImageChange}
                onOptionChange={
                    handleOptionChange
                }
                onAddOption={
                    handleAddOption
                }
                onDeleteOption={
                    handleDeleteOption
                }
                onSubmit={handleSubmit}
                onCancel={() =>
                    navigate(
                        "/mcq-master"
                    )
                }
            />

        </AppLayout>
    );
}