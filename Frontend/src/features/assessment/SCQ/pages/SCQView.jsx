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
    getSCQById,
    saveSCQTranslation,
} from "../services/SCQServices";

import SCQTranslationForm from "../components/SCQTranslationForm";


const INITIAL_FORM = {

    scq_question_title: "",

    scq_question_description: "",

    marks: "",

    image_url: "",

    options: [],

};


/* =========================================================
   ERROR FORMAT
========================================================= */

const formatApiError = (error) => {

    const detail =
        error?.response?.data?.detail;


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

    };


    if (Array.isArray(detail)) {

        return detail
            .map(formatItem)
            .join("; ");

    }


    if (
        typeof detail === "object" &&
        detail !== null
    ) {

        return formatItem(detail);

    }


    return String(detail);

};


export default function SCQView() {

    const {
        parentId,
    } = useParams();

    const [searchParams] = useSearchParams();


    const navigate =
        useNavigate();


    /* =====================================================
       FORM
    ===================================================== */

    const [form, setForm] =
        useState(INITIAL_FORM);


    const [loading, setLoading] =
        useState(false);


    /* =====================================================
       LANGUAGE
    ===================================================== */

    const [languageKey, setLanguageKey] =
        useState((searchParams.get("tab") || "english").toLowerCase());


    const language =
        getLanguageByKey(
            languageKey
        );


    const languageId =
        language?.id;


    const isEnglish =
        languageId === 1;


    /* =====================================================
       BREADCRUMB
    ===================================================== */

    const breadcrumbItems = [

        {
            label: "Home",
            path: "/",
        },

        {
            label: "SCQ List",
            path: "/scq-master",
        },

        {
            label: "View",
            path: `/scq-master/${parentId}`,
        },

    ];


    /* =====================================================
       LOAD SCQ
    ===================================================== */

    useEffect(() => {

        if (!parentId) {
            return;
        }


        loadSCQ();

    }, [
        parentId,
        languageId,
    ]);


    /* =====================================================
       LOAD
    ===================================================== */

    const loadSCQ = async () => {
        try {
            setLoading(true);


            const response = await getSCQById(
                parentId,
                languageId
            );


            let data = response?.data ?? response;

            if (Array.isArray(data)) {
                data = data.length > 0 ? data[0] : null;
            }


            if (!data) {
                setForm(INITIAL_FORM);
                return;
            }

            // ================================
            // NORMALIZE OPTIONS
            // ================================

            const normalizedOptions =
                (data.options || []).map((option) => ({
                    scq_option_id:
                        option.scq_option_id ??
                        option.option_id ??
                        option.id,

                    scq_option_text:
                        option.scq_option_text ??
                        option.option_text ??
                        option.text ??
                        "",

                    is_scq_option_correct:
                        option.is_scq_option_correct ??
                        option.is_correct ??
                        0,
                }));


            // ================================
            // SET FORM
            // ================================

            setForm({
                scq_question_title:
                    data.scq_question_title ??
                    data.question_title ??
                    "",

                scq_question_description:
                    data.scq_question_description ??
                    data.question_description ??
                    "",

                marks:
                    data.marks ?? "",

                image_url:
                    data.image_url ?? "",

                options:
                    normalizedOptions,
            });

        } catch (error) {
            console.error(
                "SCQ LOAD ERROR:",
                error
            );

            toast.error(
                formatApiError(error) ||
                "Unable to load SCQ."
            );

            setForm(INITIAL_FORM);

        } finally {
            setLoading(false);
        }
    };


    /* =====================================================
       FORM CHANGE
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
       OPTION CHANGE
    ===================================================== */

    const handleOptionChange = (
        index,
        field,
        value
    ) => {

        setForm((prev) => {

            const isCorrectField =
                field === "is_scq_option_correct" &&
                Number(value) === 1;

            const updatedOptions =
                (prev.options || []).map((opt, i) => {

                    // SCQ has a single correct answer: selecting one
                    // clears the others.
                    if (isCorrectField) {
                        return {
                            ...opt,
                            is_scq_option_correct:
                                i === index ? 1 : 0,
                        };
                    }

                    return i === index
                        ? { ...opt, [field]: value }
                        : opt;

                });


            return {

                ...prev,

                options:
                    updatedOptions,

            };

        });

    };


    /* =====================================================
       SAVE TRANSLATION
    ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEnglish) {
            return;
        }

        if (!form.scq_question_title?.trim()) {
            toast.error("Question title is required.");
            return;
        }

        const options = form.options || [];

        const hasEmptyOption = options.some((option) => {
            const text =
                option.scq_option_text ??
                option.option_text ??
                "";

            return !String(text).trim();
        });

        if (hasEmptyOption) {
            toast.error("All option texts are required.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                parent_id: Number(parentId),

                language_id: Number(languageId),

                scq_question_title:
                    form.scq_question_title.trim(),

                scq_question_description:
                    form.scq_question_description || "",

                image_url:
                    form.image_url || null,

                marks:
                    form.marks !== "" &&
                        form.marks !== null &&
                        form.marks !== undefined
                        ? Number(form.marks)
                        : 0,

                status: 1,

                options: options.map((option) => ({
                    scq_option_text:
                        (
                            option.scq_option_text ??
                            option.option_text ??
                            ""
                        ).trim(),

                    is_scq_option_correct:
                        Number(
                            option.is_scq_option_correct ?? 0
                        ),

                    status: 1,

                    language_id: Number(languageId),
                })),
            };





            await saveSCQTranslation(
                parentId,
                payload
            );


            toast.success(
                `${language?.label} translation saved successfully.`
            );


            // Redirect only after successful API response
            navigate("/scq-master");


        } catch (error) {

            console.error("========== SCQ TRANSLATION ERROR ==========");

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


            /* FastAPI validation error */

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

            }

            else if (
                typeof detail === "string"
            ) {

                toast.error(detail);

            }

            else {

                toast.error(
                    "Unable to save translation."
                );

            }

        } finally {

            setLoading(false);
        }
    };


    return (

        <AppLayout>


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-[22px] font-medium text-[#344050]">

                    SCQ View

                </span>


                <Breadcrumbs
                    items={
                        breadcrumbItems
                    }
                />

            </div>


            {/* =================================================
                MAIN
            ================================================= */}

            <div className="rounded-[6px] border border-[#D8E2EF] bg-white">


                {/* =================================================
                    LANGUAGE TABS
                ================================================= */}

                <LanguageTabs
                    activeTab={
                        languageKey
                    }
                    onChange={
                        setLanguageKey
                    }
                />


                {/* =================================================
                    FORM
                ================================================= */}

                <div className="rounded-md border bg-white">

                    <SCQTranslationForm
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
                                "/scq-master"
                            )
                        }
                    />

                </div>

            </div>

        </AppLayout>
    );
}