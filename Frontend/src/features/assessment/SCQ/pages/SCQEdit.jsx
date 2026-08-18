import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";

import SCQForm from "../components/SCQForm";

import {
    getSCQById,
    updateSCQ,
    uploadImage,
} from "../services/SCQServices";


const INITIAL_FORM = {
    parent_id: "",
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


export default function SCQEdit() {

    const navigate = useNavigate();

    const { scqId } = useParams();

    const [form, setForm] =
        useState(INITIAL_FORM);

    const [loading, setLoading] =
        useState(false);


    /* =====================================================
       LOAD SCQ
    ===================================================== */

    useEffect(() => {

        if (!scqId) {
            toast.error("SCQ ID is missing.");
            return;
        }

        loadSCQ();

    }, [scqId]);


    const loadSCQ = async () => {

        try {

            setLoading(true);


            const response =
                await getSCQById(
                    scqId,
                    1
                );

            const data =
                response?.data ??
                response;


            if (!data) {

                toast.error(
                    "SCQ not found."
                );

                return;
            }


            const normalizedOptions =
                (
                    data.options ||
                    []
                ).map((option) => ({

                    scq_option_id:
                        option.scq_option_id,

                    scq_option_text:
                        option.scq_option_text ??
                        "",

                    is_scq_option_correct:
                        Number(
                            option.is_scq_option_correct ??
                            0
                        ),

                    status:
                        Number(
                            option.status ??
                            1
                        ),

                    language_id:
                        Number(
                            option.language_id ??
                            data.language_id ??
                            1
                        ),

                }));


            setForm({

                parent_id:
                    data.parent_id ??
                    data.scq_id,

                language_id:
                    Number(
                        data.language_id ??
                        1
                    ),

                scq_question_title:
                    data.scq_question_title ??
                    "",

                scq_question_description:
                    data.scq_question_description ??
                    "",

                image:
                    null,

                image_url:
                    data.image_url ??
                    "",

                image_preview_url: "",

                marks:
                    data.marks ??
                    "",

                status:
                    Number(
                        data.status ??
                        1
                    ),

                options:
                    normalizedOptions.length >= 2
                        ? normalizedOptions
                        : INITIAL_FORM.options,

            });

        } catch (error) {

            console.error(
                "SCQ EDIT LOAD ERROR:",
                error
            );

            const detail =
                error?.response?.data?.detail;

            toast.error(
                typeof detail === "string"
                    ? detail
                    : "Unable to load SCQ."
            );

        } finally {

            setLoading(false);

        }
    };


    /* =====================================================
       FIELD CHANGE
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
       IMAGE CHANGE
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
                    URL.createObjectURL(
                        file
                    ),

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

        setForm((prev) => {

            const updated =
                [
                    ...(prev.options || [])
                ];


            /*
             * Only one correct answer
             */

            if (
                field ===
                "is_scq_option_correct"
            ) {

                updated.forEach(
                    (option, i) => {

                        option.is_scq_option_correct =
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


            return {

                ...prev,

                options:
                    updated,

            };

        });
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

                    language_id:
                        Number(
                            prev.language_id
                        ),

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

    const handleSubmit = async (e) => {

        e.preventDefault();


        /* ===========================
           VALIDATION
        =========================== */

        if (
            !form.scq_question_title?.trim()
        ) {

            toast.error(
                "Question title is required."
            );

            return;
        }


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


        const hasEmptyOption =
            options.some(
                (option) =>
                    !option.scq_option_text?.trim()
            );


        if (hasEmptyOption) {

            toast.error(
                "Option text cannot be empty."
            );

            return;
        }


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


            /* =================================================
               UPDATE PAYLOAD
            ================================================= */

            const payload = {

                parent_id:
                    form.parent_id
                        ? Number(
                            form.parent_id
                        )
                        : Number(scqId),

                scq_question_title:
                    form.scq_question_title.trim(),

                scq_question_description:
                    form.scq_question_description ||
                    null,

                image_url: imageUrl,

                marks:
                    form.marks !== ""
                        ? Number(
                            form.marks
                        )
                        : 0,

                status:
                    Number(
                        form.status ?? 1
                    ),

                language_id:
                    Number(
                        form.language_id ?? 1
                    ),

                options:
                    options.map(
                        (option) => ({

                            scq_option_text:
                                option.scq_option_text.trim(),

                            is_scq_option_correct:
                                Number(
                                    option.is_scq_option_correct
                                ),

                            status:
                                Number(
                                    option.status ?? 1
                                ),

                            language_id:
                                Number(
                                    form.language_id ?? 1
                                ),

                        })
                    ),

            };






            await updateSCQ(
                scqId,
                payload
            );


            toast.success(
                "SCQ updated successfully."
            );


            navigate(
                "/scq-master"
            );


        } catch (error) {

            console.error(
                "SCQ UPDATE ERROR:",
                error
            );

            console.error(
                "BACKEND:",
                error?.response?.data
            );


            const detail =
                error?.response?.data?.detail;


            if (
                Array.isArray(detail)
            ) {

                detail.forEach(
                    (item) => {

                        toast.error(
                            item?.msg ||
                            "Validation error."
                        );

                    }
                );

            } else if (
                typeof detail === "string"
            ) {

                toast.error(
                    detail
                );

            } else {

                toast.error(
                    "Unable to update SCQ."
                );

            }

        } finally {

            setLoading(false);
        }
    };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <AppLayout>

            {/* HEADER */}

            <div className="mb-4 flex items-center justify-between">

                <span className="text-[22px] font-medium text-[#344050]">

                    Edit SCQ

                </span>


                <Breadcrumbs
                    items={[
                        {
                            label: "Home",
                            path: "/dashboard",
                        },

                        {
                            label: "SCQ List",
                            path: "/scq-master",
                        },

                        {
                            label: "Edit",
                        },
                    ]}
                />

            </div>


            {/* FORM */}

            <SCQForm

                form={form}

                loading={loading}

                submitLabel="Update SCQ"

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