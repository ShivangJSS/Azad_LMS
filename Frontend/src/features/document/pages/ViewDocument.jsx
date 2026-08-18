import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../components/layout/AppLayout";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";
import LanguageTabs from "../../../shared/components/language/LanguageTabs";
import {
    getLanguageById,
    getLanguageByKey,
} from "../../../shared/constants/languageConstants";

import { getDocument } from "../services/DocumentServices";
import useTranslation from "../hook/useTranslation";

import TranslationForm from "../components/TranslationForm";


const MEDIA_URL = import.meta.env.VITE_API_URL;


const breadcrumbItems = [
    {
        label: "Home",
        path: "/dashboard",
    },
    {
        label: "Documents",
        path: "/documents",
    },
    {
        label: "View",
    },
];


export default function ViewDocument() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    // Open on the language tab the user came from in the list.
    const initialLanguageId = getLanguageByKey(
        (searchParams.get("tab") || "english").toLowerCase()
    )?.id;


    /* ================================================================
       TRANSLATION
    ================================================================ */

    const {
        languages,
        activeLanguage,
        activeLanguageId,
        isSourceTab,
        existing,
        form,
        loadingForm,
        loadingTab,
        saving,
        changeTab,
        changeField,
        submit,
    } = useTranslation(id, initialLanguageId);


    /* ================================================================
       DOCUMENT
    ================================================================ */

    const [doc, setDoc] = useState(null);

    const [loadingDoc, setLoadingDoc] =
        useState(true);

    const [error, setError] =
        useState("");


    /* ================================================================
       FETCH DOCUMENT
    ================================================================ */

    const fetchDocument = useCallback(
        async () => {
            if (!id) {
                setDoc(null);
                setLoadingDoc(false);
                return;
            }

            setLoadingDoc(true);
            setError("");

            try {
                const response =
                    await getDocument(id);

                const documentData =
                    response?.document ??
                    response?.data ??
                    response ??
                    null;

                setDoc(documentData);

            } catch (requestError) {
                console.error(
                    "VIEW DOCUMENT ERROR:",
                    requestError?.response?.data ??
                        requestError
                );

                setError(
                    requestError?.response?.data
                        ?.detail ||
                        "Unable to load document."
                );

                setDoc(null);

            } finally {
                setLoadingDoc(false);
            }
        },
        [id]
    );


    useEffect(() => {
        fetchDocument();
    }, [fetchDocument]);


    /* ================================================================
       LOADING
    ================================================================ */

    const pageLoading =
        loadingDoc || loadingForm;


    /* ================================================================
       DOCUMENT TYPE
    ================================================================ */

    const docType =
        String(
            doc?.doc_type || ""
        ).toUpperCase();


    const fileLabel =
        docType === "VIDEO"
            ? "Video"
            : docType === "PDF"
                ? "PDF"
                : "File";


    /* ================================================================
       MEDIA URL
    ================================================================ */

    /* Handles both backend storage formats: a full path like
       "/uploads/pdfs/x.pdf" and a bare filename like "x.pdf" (legacy
       save_file) that lives under /uploads/<fallbackFolder>/. Leading
       slashes are stripped so the host is never joined with a double
       slash (which 404s as {"detail":"Not Found"}). */
    const getFullMediaUrl = (
        filePath,
        fallbackFolder = ""
    ) => {
        if (
            !filePath ||
            typeof filePath !== "string"
        ) {
            return "";
        }

        if (
            /^https?:\/\//i.test(
                filePath
            )
        ) {
            return filePath;
        }

        let clean = filePath
            .replace(/^\/+/, "")
            .replace(/^app\//, "");

        if (
            !clean.includes("/") &&
            fallbackFolder
        ) {
            clean = `uploads/${fallbackFolder}/${clean}`;
        }

        return `${MEDIA_URL}/${clean}`;
    };


    /* ================================================================
       MEDIA FILE
    ================================================================ */

    const filePath =
        docType === "VIDEO"
            ? existing?.video_url ||
              doc?.video_url
            : docType === "PDF"
                ? existing?.pdf_url ||
                  doc?.pdf_url
                : existing?.ppt_url ||
                  doc?.ppt_url;


    const fileFolder =
        docType === "VIDEO"
            ? "videos"
            : docType === "PDF"
                ? "pdfs"
                : "ppts";


    const fileUrl =
        getFullMediaUrl(
            filePath,
            fileFolder
        );


    /* ================================================================
       IMAGE
    ================================================================ */

    const savedImagePath =
        existing?.document_image_url ||
        doc?.document_image ||
        "";


    const savedImageUrl =
        getFullMediaUrl(
            savedImagePath,
            "documents"
        );


    const [
        pickedImageUrl,
        setPickedImageUrl,
    ] = useState("");


    useEffect(() => {
        const file =
            form?.document_image;


        if (!(file instanceof File)) {
            setPickedImageUrl("");
            return undefined;
        }


        const objectUrl =
            URL.createObjectURL(file);


        setPickedImageUrl(
            objectUrl
        );


        return () => {
            URL.revokeObjectURL(
                objectUrl
            );
        };
    }, [form?.document_image]);


    const imageUrl =
        pickedImageUrl ||
        savedImageUrl;


    /* ================================================================
       DERIVED
    ================================================================ */

    const sourceTitle =
        doc?.doc_title ||
        "Untitled";


    const languageName =
        activeLanguage?.name ||
        activeLanguage?.label ||
        "";


    /* ================================================================
       FIELD CHANGE
    ================================================================ */

    const handleChange = (
        field,
        value
    ) => {
        changeField(
            field,
            value
        );
    };


    /* ================================================================
       IMAGE CHANGE
    ================================================================ */

    const handleImageChange = (
        file
    ) => {
        if (!file) {
            handleChange(
                "document_image",
                null
            );
            return;
        }


        if (
            file.size >
            2 * 1024 * 1024
        ) {
            toast.error(
                "Image size must be less than 2MB."
            );
            return;
        }


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {
            toast.error(
                "Only JPG, PNG and WEBP images are allowed."
            );
            return;
        }


        handleChange(
            "document_image",
            file
        );
    };


    /* ================================================================
       MEDIA CHANGE
    ================================================================ */

    const handleMediaChange = (
        file
    ) => {
        handleChange(
            "media_file",
            file
        );
    };


    /* ================================================================
       SUBMIT
    ================================================================ */

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();


        /* English/source cannot save */

        if (isSourceTab) {
            return;
        }


        /* Title validation */

        if (
            !form?.title?.trim()
        ) {
            toast.error(
                "Document title is required."
            );
            return;
        }


        try {
            await submit();

            toast.success(
                `${languageName} translation saved successfully.`
            );

            // Go back to the document list on success.
            navigate("/documents");

        } catch (
            requestError
        ) {
            console.error(
                "SAVE TRANSLATION ERROR:",
                requestError?.response
                    ?.data ??
                    requestError
            );

            toast.error(
                requestError?.response
                    ?.data?.detail ||
                    "Unable to save translation."
            );
        }
    };


    /* ================================================================
       RENDER
    ================================================================ */

    return (
        <AppLayout>

            {/* ========================================================
                HEADER
            ======================================================== */}

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
                    View Document
                </span>

                <Breadcrumbs
                    items={breadcrumbItems}
                />
            </div>


            {/* ========================================================
                MAIN CARD
            ======================================================== */}

            <div
                className="
                    rounded-[6px]
                    border
                    border-[#D8E2EF]
                    bg-white
                "
            >

                {/* ====================================================
                    LOADING
                ==================================================== */}

                {pageLoading && (
                    <div className="p-4 text-[12px] text-[#5E6E82]">
                        Loading document...
                    </div>
                )}


                {/* ====================================================
                    ERROR
                ==================================================== */}

                {!pageLoading &&
                    error && (
                        <div className="p-3">
                            <div
                                className="
                                    rounded-[4px]
                                    border
                                    border-[#F5C2C7]
                                    bg-[#FDECEA]
                                    p-3
                                    text-[12px]
                                    text-[#D74D43]
                                "
                            >
                                {error}
                            </div>
                        </div>
                    )}


                {/* ====================================================
                    NOT FOUND
                ==================================================== */}

                {!pageLoading &&
                    !error &&
                    !doc && (
                        <div className="p-4 text-[12px] text-[#5E6E82]">
                            Document not found.
                        </div>
                    )}


                {/* ====================================================
                    DOCUMENT
                ==================================================== */}

                {!pageLoading &&
                    !error &&
                    doc && (
                        <>

                            {/* ==========================================
                                LANGUAGE TABS
                            ========================================== */}

                            <LanguageTabs
                                activeTab={
                                    getLanguageById(
                                        activeLanguageId
                                    )?.key
                                }
                                onChange={(
                                    key
                                ) =>
                                    changeTab(
                                        getLanguageByKey(
                                            key
                                        ).id
                                    )
                                }
                            />


                            {/* ==========================================
                                FORM
                            ========================================== */}

                            <div
                                className="
                                    border-t
                                    border-[#E6D7E8]
                                    bg-white
                                    p-3
                                "
                            >
                                {loadingTab ? (
                                    <div
                                        className="
                                            rounded-md
                                            border
                                            border-[#E6D7E8]
                                            bg-white
                                            p-3
                                            text-[12px]
                                            text-[#5E6E82]
                                        "
                                    >
                                        Loading{" "}
                                        {languageName ||
                                            "translation"}
                                        ...
                                    </div>
                                ) : (
                                    <TranslationForm
                                        form={form}
                                        readOnly={
                                            isSourceTab
                                        }
                                        loading={
                                            loadingTab
                                        }
                                        saving={
                                            saving
                                        }
                                        languageName={
                                            languageName
                                        }
                                        sourceTitle={
                                            sourceTitle
                                        }
                                        documentDescription={
                                            doc?.doc_description ||
                                            ""
                                        }
                                        fileUrl={
                                            fileUrl
                                        }
                                        docType={
                                            docType
                                        }
                                        fileLabel={
                                            fileLabel
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        onImageChange={
                                            handleImageChange
                                        }
                                        onMediaChange={
                                            handleMediaChange
                                        }
                                        onSubmit={
                                            handleSubmit
                                        }
                                        onCancel={() =>
                                            navigate(
                                                "/documents"
                                            )
                                        }
                                    />
                                )}
                            </div>

                        </>
                    )}

            </div>

        </AppLayout>
    );
}