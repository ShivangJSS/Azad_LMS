import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import MCQForm from "../components/MCQForm";

import {
    getMCQById,
    updateMCQ,
    uploadImage,
} from "../services/MCQServices";

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
    options: [],
};

const formatApiError = (error) => {
    const detail = error?.response?.data?.detail;

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

                const loc = Array.isArray(item?.loc)
                    ? item.loc.slice(1).join(" -> ")
                    : "";

                const msg =
                    item?.msg ||
                    JSON.stringify(item);

                return loc ? `${loc}: ${msg}` : msg;
            })
            .join("; ");
    }

    if (typeof detail === "object") {
        return detail?.msg || JSON.stringify(detail);
    }

    return String(detail);
};

export default function MCQEdit() {

    const { mcqId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);

    useEffect(() => {
        if (mcqId) {
            loadMCQ();
        }
    }, [mcqId]);

    const loadMCQ = async () => {
        try {
            setLoading(true);

            const response = await getMCQById(mcqId);

            const data = response?.data || response;


            setForm({
                language_id: data.language_id ?? 1,

                mcq_question_title:
                    data.mcq_question_title || "",

                mcq_question_description:
                    data.mcq_question_description || "",

                image_url:
                    data.image_url || "",

                image_preview_url: "",

                image: null,

                marks:
                    data.marks ?? "",

                status:
                    data.status ?? 1,

                options:
                    Array.isArray(data.options)
                        ? data.options
                        : [],
            });

        } catch (error) {
            console.error(
                "MCQ LOAD ERROR:",
                error?.response?.data || error
            );

            toast.error("Unable to load MCQ.");

        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /*
     * IMAGE
     *
     * image_url          = existing permanent backend URL (kept until replaced)
     * image_preview_url  = temporary blob: URL for instant preview only
     * image              = the actual File, uploaded on submit
     */
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

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

            const updatedOptions = [
                ...(prev.options || []),
            ];

            if (
                field ===
                "is_mcq_option_correct"
            ) {

                // MCQ allows multiple correct answers: toggle only the
                // clicked option instead of resetting all others.
                updatedOptions[index] = {
                    ...updatedOptions[index],
                    is_mcq_option_correct: value,
                };

            } else {

                updatedOptions[index] = {
                    ...updatedOptions[index],
                    [field]: value,
                };
            }

            return {
                ...prev,
                options: updatedOptions,
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
                    language_id:
                        Number(prev.language_id || 1),
                },
            ],
        }));
    };

    const handleDeleteOption = (index) => {

        if (form.options.length <= 2) {

            toast.error(
                "An MCQ must have at least two options."
            );

            return;
        }

        setForm((prev) => ({
            ...prev,

            options: prev.options.filter(
                (_, optionIndex) =>
                    optionIndex !== index
            ),
        }));
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        /*
         * QUESTION VALIDATION
         */
        if (
            !form.mcq_question_title?.trim()
        ) {
            toast.error(
                "Question title is required."
            );

            return;
        }

        /*
         * MARKS VALIDATION
         */
        if (
            form.marks === "" ||
            form.marks === null ||
            form.marks === undefined
        ) {
            toast.error(
                "Marks are required."
            );

            return;
        }

        /*
         * OPTIONS VALIDATION
         */
        if (form.options.length < 2) {

            toast.error(
                "An MCQ must have at least two options."
            );

            return;
        }

        const emptyOption =
            form.options.some(
                (option) =>
                    !option.mcq_option_text
                        ?.trim()
            );

        if (emptyOption) {

            toast.error(
                "Please enter all option texts."
            );

            return;
        }

        const correctCount =
            form.options.filter(
                (option) =>
                    Number(
                        option.is_mcq_option_correct
                    ) === 1
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

            // Upload a newly-selected file and use its permanent URL;
            // otherwise keep the existing backend URL. Never send a blob.
            let imageUrl =
                form.image_url &&
                !form.image_url.startsWith("blob:")
                    ? form.image_url
                    : null;

            if (form.image instanceof File) {
                imageUrl = await uploadImage(form.image);
            }

            const payload = {

                mcq_question_title:
                    form.mcq_question_title.trim(),

                mcq_question_description:
                    form.mcq_question_description || null,

                marks:
                    Number(form.marks),

                status:
                    Number(form.status),

                language_id:
                    Number(form.language_id),

                image_url: imageUrl,

                options:
                    form.options.map((option) => ({
                        mcq_option_id:
                            option.mcq_option_id,

                        mcq_option_text:
                            option.mcq_option_text.trim(),

                        is_mcq_option_correct:
                            Number(
                                option.is_mcq_option_correct
                            ),

                        status:
                            Number(
                                option.status ?? 1
                            ),

                        language_id:
                            Number(
                                option.language_id ??
                                form.language_id ??
                                1
                            ),
                    })),
            };


            await updateMCQ(
                mcqId,
                payload
            );

            toast.success(
                "MCQ updated successfully."
            );

            navigate("/mcq-master");

        } catch (error) {

            console.error(
                "MCQ UPDATE ERROR:",
                error?.response?.data || error
            );

            toast.error(
                formatApiError(error) ||
                "Unable to update MCQ."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <AppLayout>

            <div className="mb-4 flex items-center justify-between">

                <span className="text-[22px] font-medium text-[#344050]">
                    Edit MCQ
                </span>

                <Breadcrumbs
                    items={[
                        {
                            label: "Home",
                            path: "/",
                        },
                        {
                            label: "MCQ List",
                            path: "/mcq-master",
                        },
                        {
                            label: "Edit",
                        },
                    ]}
                />

            </div>

            <MCQForm
                form={form}
                loading={loading}
                submitLabel="Update MCQ"
                onChange={handleChange}
                onImageChange={handleImageChange}
                onOptionChange={handleOptionChange}
                onAddOption={handleAddOption}
                onDeleteOption={handleDeleteOption}
                onSubmit={handleSubmit}
                onCancel={() =>
                    navigate("/mcq-master")
                }
            />

        </AppLayout>
    );
}