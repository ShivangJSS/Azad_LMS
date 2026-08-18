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
    getMatchMakingById,
    updateMatchMaking,
} from "../services/MatchingMakingService";

import MatchMakingTranslationForm from "../components/MatchMakingTranslation";


// =====================================================
// INITIAL FORM
// =====================================================

const INITIAL_FORM = {
    match_making_question_title: "",
    match_making_question_description: "",
    marks: "",
    image_url: "",
    reference_image_url: "",
    image_file: null,
};


// =====================================================
// COMPONENT
// =====================================================

export default function MatchMakingView() {

    const { parentId } = useParams();
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();


    // =================================================
    // STATE
    // =================================================

    const [form, setForm] = useState(INITIAL_FORM);

    const [matchMakingId, setMatchMakingId] = useState(null);

    const [loading, setLoading] = useState(false);

    const [languageKey, setLanguageKey] = useState((searchParams.get("tab") || "english").toLowerCase());


    // =================================================
    // LANGUAGE
    // =================================================

    const language =
        getLanguageByKey(languageKey);

    const languageId =
        language?.id;


    // English = READ ONLY

    const isEnglish =
        Number(languageId) === 1;


    // =================================================
    // API BASE URL
    // =================================================

    const API_BASE_URL =
        "http://127.0.0.1:8000";


    // =================================================
    // IMAGE URL
    // =================================================

    const getImageUrl = (url) => {

        if (!url) {
            return "";
        }

        if (
            url.startsWith("http://") ||
            url.startsWith("https://")
        ) {
            return url;
        }

        // Strip legacy "app/" prefix and leading slashes, then prefix host.
        return `${API_BASE_URL}/${url.replace(/^app\//, "").replace(/^\/+/, "")}`;
    };


    // =================================================
    // BREADCRUMB
    // =================================================

    const breadcrumbItems = [

        {
            label: "Home",
            path: "/",
        },

        {
            label: "Match Making List",
            path: "/match-making-master",
        },

        {
            label: "View",
            path: `/match-making-master/${parentId}`,
        },

    ];


    // =================================================
    // LOAD DATA
    // =================================================

    useEffect(() => {

        if (!parentId || !languageId) {
            return;
        }

        loadMatchMaking();

    }, [
        parentId,
        languageId,
    ]);


    // =================================================
    // GET MATCH MAKING
    // =================================================

    const loadMatchMaking = async () => {

        try {

            setLoading(true);



            const response =
                await getMatchMakingById(
                    parentId,
                    languageId
                );




            let data =
                response?.data ??
                response;


            // -----------------------------------------
            // ARRAY RESPONSE SUPPORT
            // -----------------------------------------

            if (Array.isArray(data)) {

                data =
                    data.length > 0
                        ? data[0]
                        : null;

            }


            // -----------------------------------------
            // NO DATA
            // -----------------------------------------

            if (!data) {

                setMatchMakingId(null);

                setForm({
                    ...INITIAL_FORM,
                });

                return;
            }


            // -----------------------------------------
            // IMPORTANT
            // Store actual record ID
            // -----------------------------------------

            setMatchMakingId(
                data.match_making_id
            );


            // -----------------------------------------
            // SET FORM
            // -----------------------------------------

            setForm({

                match_making_question_title:
                    data.match_making_question_title ??
                    data.question_title ??
                    "",


                match_making_question_description:
                    data.match_making_question_description ??
                    data.question_description ??
                    "",


                marks:
                    data.marks ??
                    "",


                image_url:
                    getImageUrl(
                        data.image_url
                    ),


                reference_image_url:
                    getImageUrl(
                        data.reference_image_url ??
                        data.reference_image ??
                        ""
                    ),


                image_file: null,

            });


        } catch (error) {

            console.error(
                "MATCH MAKING LOAD ERROR:",
                error
            );


            console.error(
                "MATCH MAKING ERROR RESPONSE:",
                error?.response?.data
            );


            toast.error(
                "Unable to load Match Making."
            );


            setMatchMakingId(null);


            setForm({
                ...INITIAL_FORM,
            });


        } finally {

            setLoading(false);

        }

    };


    // =================================================
    // FIELD CHANGE
    // =================================================

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


    // =================================================
    // IMAGE CHANGE
    // =================================================

    const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.");
        e.target.value = "";
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG and WEBP images are allowed.");
        e.target.value = "";
        return;
    }

    setForm((prev) => ({
        ...prev,
        image_file: file,
    }));
};


    // =================================================
    // SUBMIT / SAVE TRANSLATION
    // =================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        // -----------------------------------------
        // ENGLISH READ ONLY
        // -----------------------------------------

        if (isEnglish) {
            return;
        }


        // -----------------------------------------
        // VALIDATE ID
        // -----------------------------------------

        if (!matchMakingId) {

            toast.error(
                "Match Making ID not found."
            );

            return;
        }


        // -----------------------------------------
        // VALIDATE TITLE
        // -----------------------------------------

        if (
            !form
                .match_making_question_title
                ?.trim()
        ) {

            toast.error(
                "Question title is required."
            );

            return;
        }


        try {

            setLoading(true);


            // -------------------------------------
            // JSON PAYLOAD
            // -------------------------------------

            const payload = {

                match_making_question_title:
                    form
                        .match_making_question_title
                        .trim(),


                match_making_question_description:
                    form
                        .match_making_question_description
                        ?.trim() || null,


                language_id:
                    Number(languageId),

            };






            // -------------------------------------
            // ACTUAL DATABASE UPDATE
            // -------------------------------------

            const response =
                await updateMatchMaking(
                    matchMakingId,
                    payload
                );




            // -------------------------------------
            // SUCCESS
            // -------------------------------------

            toast.success(
                `${language?.label} translation saved successfully.`
            );


            // -------------------------------------
            // REDIRECT TO LIST
            // -------------------------------------

            navigate(
                "/match-making-master"
            );


        } catch (error) {

            console.error(
                "MATCH MAKING UPDATE ERROR:",
                error
            );


            console.error(
                "BACKEND ERROR:",
                error?.response?.data
            );


            toast.error(

                error
                    ?.response
                    ?.data
                    ?.detail ||

                "Unable to save translation."

            );


        } finally {

            setLoading(false);

        }

    };


    // =================================================
    // UI
    // =================================================

    return (

        <AppLayout>

            {/* =========================================
                PAGE HEADER
            ========================================= */}

            <div
                className="
                    mb-3
                    flex
                    flex-col
                    items-start
                    gap-2
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >

                <span
                    className="
                        text-[22px]
                        font-medium
                        text-[#344050]
                    "
                >
                    Match Making Translation
                </span>


                <Breadcrumbs
                    items={breadcrumbItems}
                />

            </div>


            {/* =========================================
                MAIN CARD
            ========================================= */}

            <div
                className="
                    rounded-[6px]
                    border
                    border-[#D8E2EF]
                    bg-white
                "
            >

                {/* =====================================
                    LANGUAGE TABS
                ===================================== */}

                <LanguageTabs

                    activeTab={
                        languageKey
                    }

                    onChange={
                        setLanguageKey
                    }

                />


                {/* =====================================
                    FORM
                ===================================== */}

                <div
                    className="
                        border-t
                        border-[#E6D7E8]
                        bg-white
                    "
                >

                    <MatchMakingTranslationForm

                        form={form}

                        readOnly={
                            isEnglish
                        }

                        loading={
                            loading
                        }

                        languageName={
                            language?.label || ""
                        }

                        onChange={
                            handleChange
                        }

                        onImageChange={
                            handleImageChange
                        }

                        onSubmit={
                            handleSubmit
                        }

                        onCancel={() =>
                            navigate(
                                "/match-making-master"
                            )
                        }

                    />

                </div>

            </div>

        </AppLayout>

    );

}