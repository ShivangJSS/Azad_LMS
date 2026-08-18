import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import SCQForm from "../components/SCQForm";

import { createSCQ, uploadImage } from "../services/SCQServices";


const INITIAL_FORM = {
    language_id: 1,

    scq_question_title: "",

    scq_question_description: "",

    image: null,

    // Permanent backend URL only (never a blob URL).
    image_url: "",

    // Temporary blob: URL used ONLY for instant local preview.
    image_preview_url: "",

    marks: "",

    status: 1,

    options: [
        {
            scq_option_text: "",
            is_scq_option_correct: 0,
            status: 1,
            language_id: 1,
        },
        {
            scq_option_text: "",
            is_scq_option_correct: 0,
            status: 1,
            language_id: 1,
        },
    ],
};


export default function SCQAdd() {

    const navigate = useNavigate();

    const [loading, setLoading] =
        useState(false);

    const [form, setForm] =
        useState(INITIAL_FORM);


    /* =====================================================
       INPUT CHANGE
    ===================================================== */

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


    /* =====================================================
       IMAGE
    ===================================================== */

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


    /* =====================================================
       OPTION CHANGE
    ===================================================== */

    const handleOptionChange = (
        index,
        field,
        value
    ) => {

        const updated =
            [...form.options];


        /*
         * Only ONE correct option
         */

        if (
            field ===
            "is_scq_option_correct"
        ) {

            updated.forEach(
                (item, i) => {

                    item.is_scq_option_correct =
                        i === index
                            ? 1
                            : 0;

                }
            );

        } else {

            updated[index] = {
                ...updated[index],

                [field]: value,
            };

        }


        setForm((prev) => ({
            ...prev,

            options: updated,
        }));

    };


    /* =====================================================
       ADD OPTION
    ===================================================== */

    const handleAddOption = () => {

        if (
            form.options.length >= 6
        ) {

            toast.error(
                "Maximum 6 options allowed."
            );

            return;
        }


        setForm((prev) => ({
            ...prev,

            options: [
                ...prev.options,

                {
                    scq_option_text: "",

                    is_scq_option_correct: 0,

                    status: 1,

                    language_id: 1,
                },
            ],
        }));

    };


    /* =====================================================
       DELETE OPTION
    ===================================================== */

    const handleDeleteOption = (
        index
    ) => {

        if (
            form.options.length <= 2
        ) {

            toast.error(
                "Minimum 2 options required."
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


    /* =====================================================
       SUBMIT
    ===================================================== */

    const handleSubmit = async (
        e
    ) => {

        e.preventDefault();


        /* ---------------------------------------------
           QUESTION VALIDATION
        --------------------------------------------- */

        if (
            !form.scq_question_title?.trim()
        ) {

            toast.error(
                "Question title is required."
            );

            return;
        }


        /* ---------------------------------------------
           OPTIONS
        --------------------------------------------- */

        const options =
            form.options || [];


        if (
            options.length < 2
        ) {

            toast.error(
                "Minimum 2 options are required."
            );

            return;
        }


        /* ---------------------------------------------
           EMPTY OPTION
        --------------------------------------------- */

        const hasEmptyOption =
            options.some(
                (option) =>
                    !(
                        option.scq_option_text ||
                        ""
                    ).trim()
            );


        if (hasEmptyOption) {

            toast.error(
                "Option text cannot be empty."
            );

            return;
        }


        /* ---------------------------------------------
           CORRECT OPTION
        --------------------------------------------- */

        const correctCount =
            options.filter(
                (option) =>
                    Number(
                        option.is_scq_option_correct
                    ) === 1
            ).length;


        if (
            correctCount !== 1
        ) {

            toast.error(
                "Exactly one option must be marked as correct."
            );

            return;
        }


        try {

            setLoading(true);

            // Upload the actual file and use its permanent URL.
            let imageUrl =
                form.image_url &&
                !form.image_url.startsWith("blob:")
                    ? form.image_url
                    : null;

            if (form.image instanceof File) {
                imageUrl = await uploadImage(form.image);
            }


            /* -----------------------------------------
               CREATE SCQ PAYLOAD

               This matches:

               ScqCreate
            ----------------------------------------- */

            const payload = {

                /*
                 * New English SCQ has
                 * no parent.
                 */
                parent_id: null,


                scq_question_title:
                    form.scq_question_title.trim(),


                scq_question_description:
                    form.scq_question_description?.trim() ||
                    null,


                image_url: imageUrl,


                marks:
                    Number(
                        form.marks || 0
                    ),


                status:
                    Number(
                        form.status ?? 1
                    ),


                /*
                 * English
                 */
                language_id: 1,


                options:
                    options.map(
                        (option) => ({

                            scq_option_text:
                                (
                                    option.scq_option_text ||
                                    ""
                                ).trim(),


                            is_scq_option_correct:
                                Number(
                                    option.is_scq_option_correct
                                ),


                            status:
                                Number(
                                    option.status ?? 1
                                ),


                            language_id: 1,

                        })
                    ),

            };






            /* -----------------------------------------
               API
            ----------------------------------------- */

            await createSCQ(
                payload
            );


            /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

            toast.success(
                "SCQ created successfully."
            );


            /* -----------------------------------------
               BACK TO LIST
            ----------------------------------------- */

            navigate(
                "/scq-master"
            );


        } catch (error) {

            console.error(
                "========== SCQ CREATE ERROR =========="
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


            if (
                Array.isArray(detail)
            ) {

                detail.forEach(
                    (item) => {

                        const location =
                            Array.isArray(
                                item?.loc
                            )
                                ? item.loc.join(
                                    " → "
                                )
                                : "";


                        toast.error(
                            location
                                ? `${location}: ${item?.msg ||
                                "Validation error"
                                }`
                                : (
                                    item?.msg ||
                                    "Validation error"
                                )
                        );

                    }
                );

            } else {

                toast.error(
                    detail ||
                    "Unable to create SCQ."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       UI
    ===================================================== */

    return (

        <AppLayout>

            <div className="mb-4 flex items-center justify-between">

                <span className="text-[22px] font-medium text-[#344050]">
                    Create SCQ
                </span>


                <Breadcrumbs
                    items={[
                        {
                            label: "Home",
                            path: "/",
                        },

                        {
                            label: "SCQ List",
                            path: "/scq-master",
                        },

                        {
                            label: "Create",
                        },
                    ]}
                />

            </div>


            <SCQForm
                form={form}

                loading={loading}

                submitLabel="Create SCQ"

                onChange={
                    handleChange
                }

                onImageChange={
                    handleImageChange
                }

                onOptionChange={
                    handleOptionChange
                }

                onAddOption={
                    handleAddOption
                }

                onDeleteOption={
                    handleDeleteOption
                }

                onSubmit={
                    handleSubmit
                }

                onCancel={() =>
                    navigate(
                        "/scq-master"
                    )
                }
            />

        </AppLayout>
    );
}