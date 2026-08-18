import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import LanguageTabs from "../../../../shared/components/language/LanguageTabs";

import {
    getLanguageByKey,
} from "../../../../shared/constants/languageConstants";

import {
    getMCQById,
    saveMCQTranslation,
} from "../services/MCQServices";

import MCQTranslationForm from "../components/MCQTranslationForm";

const INITIAL_FORM = {
    mcq_question_title: "",
    mcq_question_description: "",
    marks: "",
    image_url: "",
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

    const formatItem = (item) => {
        if (typeof item === "string") {
            return item;
        }

        const loc = Array.isArray(item?.loc)
            ? item.loc.slice(1).join(" -> ")
            : "";

        const msg =
            item?.msg ||
            JSON.stringify(item);

        return loc
            ? `${loc}: ${msg}`
            : msg;
    };

    if (Array.isArray(detail)) {
        return detail.map(formatItem).join("; ");
    }

    if (
        typeof detail === "object" &&
        detail !== null
    ) {
        return formatItem(detail);
    }

    return String(detail);
};

export default function MCQView() {

    const { parentId } = useParams();
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const [form, setForm] = useState(INITIAL_FORM);

    const [loading, setLoading] = useState(false);

    const [languageKey, setLanguageKey] =
        useState((searchParams.get("tab") || "english").toLowerCase());

    const language =
        getLanguageByKey(languageKey);

    const languageId =
        language?.id;

    const isEnglish =
        Number(languageId) === 1;

    const breadcrumbItems = [
        {
            label: "Home",
            path: "/",
        },
        {
            label: "MCQ List",
            path: "/mcq-master",
        },
        {
            label: "View",
            path: `/mcq-master/${parentId}`,
        },
    ];

    // =====================================================
    // LOAD WHEN ID OR LANGUAGE CHANGES
    // =====================================================

    useEffect(() => {

        if (!parentId) {
            return;
        }

        loadMCQ();

    }, [parentId, languageId]);

    // =====================================================
    // LOAD MCQ
    // =====================================================

    const loadMCQ = async () => {

        try {

            setLoading(true);


            /*
             * IMPORTANT:
             * Pass languageId so English/Hindi/Bangla/Tamil
             * data is loaded according to selected tab.
             */

            const response =
                await getMCQById(
                    parentId,
                    languageId
                );


            let data =
                response?.data ?? response;

            if (Array.isArray(data)) {
                data =
                    data.length > 0
                        ? data[0]
                        : null;
            }


            // =================================================
            // NO TRANSLATION
            // =================================================

            if (!data) {

                setForm({
                    ...INITIAL_FORM,
                });

                return;
            }

            // =================================================
            // NORMALIZE OPTIONS
            // =================================================

            const normalizedOptions =
                (data.options || []).map(
                    (option) => ({
                        mcq_option_id:
                            option.mcq_option_id ??
                            option.option_id ??
                            option.id,

                        mcq_option_text:
                            option.mcq_option_text ??
                            option.option_text ??
                            option.text ??
                            "",

                        is_mcq_option_correct:
                            Number(
                                option.is_mcq_option_correct ??
                                option.is_correct ??
                                0
                            ),

                        status:
                            Number(
                                option.status ?? 1
                            ),

                        language_id:
                            Number(
                                option.language_id ??
                                languageId
                            ),
                    })
                );


            // =================================================
            // SET FORM
            // =================================================

            setForm({

                mcq_question_title:
                    data.mcq_question_title ??
                    data.question_title ??
                    "",

                mcq_question_description:
                    data.mcq_question_description ??
                    data.question_description ??
                    "",

                marks:
                    data.marks ?? "",

                /*
                 * IMPORTANT:
                 * Keep image_url exactly as backend returns.
                 * MCQTranslationForm can display it.
                 */

                image_url:
                    data.image_url ?? "",

                options:
                    normalizedOptions,

            });

        } catch (error) {

            console.error(
                "MCQ LOAD ERROR:",
                error
            );

            console.error(
                "MCQ ERROR RESPONSE:",
                error?.response?.data
            );

            toast.error(
                formatApiError(error) ||
                "Unable to load MCQ."
            );

            setForm({
                ...INITIAL_FORM,
            });

        } finally {

            setLoading(false);

        }
    };

    // =====================================================
    // FIELD CHANGE
    // =====================================================

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

    // =====================================================
    // OPTION CHANGE
    // =====================================================

    const handleOptionChange = (
        index,
        field,
        value
    ) => {

        setForm((prev) => {

            const updatedOptions =
                [...(prev.options || [])];

            updatedOptions[index] = {
                ...updatedOptions[index],
                [field]: value,
            };

            return {
                ...prev,
                options: updatedOptions,
            };

        });

    };

    // =====================================================
    // SAVE TRANSLATION
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        // =====================================================
        // ENGLISH IS READ ONLY
        // =====================================================

        if (isEnglish) {
            return;
        }


        // =====================================================
        // QUESTION TITLE VALIDATION
        // =====================================================

        if (
            !form.mcq_question_title?.trim()
        ) {

            toast.error(
                "Question title is required."
            );

            return;
        }


        // =====================================================
        // OPTIONS
        // =====================================================

        const options =
            form.options || [];


        if (options.length === 0) {

            toast.error(
                "No options available to translate."
            );

            return;
        }


        // =====================================================
        // OPTION TEXT VALIDATION
        // =====================================================

        const hasEmptyOption =
            options.some((option) => {

                const text =
                    option?.mcq_option_text ??
                    option?.option_text ??
                    "";

                return !String(text).trim();

            });


        if (hasEmptyOption) {

            toast.error(
                "All option texts are required."
            );

            return;
        }


        // =====================================================
        // SAVE
        // =====================================================

        try {

            setLoading(true);


            // =================================================
            // PAYLOAD
            // =================================================

            const payload = {

                parent_id:
                    Number(parentId),

                language_id:
                    Number(languageId),

                mcq_question_title:
                    form.mcq_question_title.trim(),

                mcq_question_description:
                    form.mcq_question_description || "",

                image_url:
                    form.image_url || null,

                marks:
                    form.marks !== "" &&
                        form.marks !== null &&
                        form.marks !== undefined
                        ? Number(form.marks)
                        : 0,

                status: 1,

                options:
                    options.map((option) => ({

                        mcq_option_text:
                            (
                                option?.mcq_option_text ??
                                option?.option_text ??
                                ""
                            ).trim(),

                        is_mcq_option_correct:
                            Number(
                                option?.is_mcq_option_correct ?? 0
                            ),

                        status: 1,

                        language_id:
                            Number(languageId),

                    })),

            };


            // =================================================
            // DEBUG
            // =================================================




            // =================================================
            // API
            // =================================================

            await saveMCQTranslation(
                parentId,
                payload
            );


            // =================================================
            // SUCCESS
            // =================================================

            toast.success(
                `${language?.label} translation saved successfully.`
            );


            // =================================================
            // BACK TO LIST
            // =================================================

            navigate(
                "/mcq-master"
            );


        } catch (error) {

            console.error(
                "========== MCQ TRANSLATION ERROR =========="
            );

            console.error(
                "STATUS:",
                error?.response?.status
            );

            console.error(
                "REQUEST:",
                error?.config?.data
            );

            console.error(
                "BACKEND RESPONSE:",
                error?.response?.data
            );


            const detail =
                error?.response?.data?.detail;


            if (Array.isArray(detail)) {

                detail.forEach((item) => {

                    const location =
                        Array.isArray(item?.loc)
                            ? item.loc.join(" → ")
                            : "";

                    const message =
                        item?.msg ||
                        "Validation error";


                    toast.error(
                        location
                            ? `${location}: ${message}`
                            : message
                    );

                });

            } else if (
                typeof detail === "string"
            ) {

                toast.error(
                    detail
                );

            } else {

                toast.error(
                    "Unable to save translation."
                );

            }

        } finally {

            setLoading(false);

        }
    };

    // =====================================================
    // UI
    // =====================================================

    return (

        <AppLayout>

            <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-[22px] font-medium text-[#344050]">
                    MCQ View
                </span>

                <Breadcrumbs
                    items={breadcrumbItems}
                />

            </div>

            <div className="rounded-[6px] border border-[#D8E2EF] bg-white">

                <LanguageTabs
                    activeTab={languageKey}
                    onChange={setLanguageKey}
                />

                <div className="rounded-md border bg-white">

                    <MCQTranslationForm
                        form={form}
                        readOnly={isEnglish}
                        loading={loading}
                        languageName={
                            language?.label
                        }
                        onChange={
                            handleChange
                        }
                        onOptionChange={
                            handleOptionChange
                        }
                        onSubmit={
                            handleSubmit
                        }
                        onCancel={() =>
                            navigate(
                                "/mcq-master"
                            )
                        }
                    />

                </div>

            </div>

        </AppLayout>
    );
}