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
    getBucketById,
    saveBucketTranslation,
} from "../services/DropBucketServices";

import TranslationDropBucket from "../components/TranslationDropBucket";


/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM = {
    drop_bucket_question_title: "",
    drop_bucket_question_description: "",
    marks: "",
    image_url: "",
    buckets: [],
};


/* =========================================================
   IMAGE VALIDATION
========================================================= */

const isValidImageUrl = (url) => {

    if (
        !url ||
        typeof url !== "string"
    ) {
        return false;
    }

    if (
        url.startsWith("blob:")
    ) {
        return false;
    }

    return true;
};


/* =========================================================
   NORMALIZE API RESPONSE
========================================================= */

// const normalizeBucketData = (
//     response,
//     languageId
// ) => {

//     let data =
//         response?.data ?? response;


//     // Same as MCQ
//     if (Array.isArray(data)) {
//         data =
//             data.length > 0
//                 ? data[0]
//                 : null;
//     }


//     if (!data) {
//         return null;
//     }


//     // ============================================
//     // QUESTION DATA
//     // ============================================

//     const questionTitle =
//         data.drop_bucket_question_title ??
//         data.question_title ??
//         "";

//     const questionDescription =
//         data.drop_bucket_question_description ??
//         data.question_description ??
//         "";

//     const marks =
//         data.marks ?? "";

//     const imageUrl =
//         data.image_url ??
//         "";


//     // ============================================
//     // SAME LOGIC AS MCQ OPTIONS
//     // ============================================

//     const sourceBuckets =
//         Array.isArray(data?.buckets)
//             ? data.buckets
//             : Array.isArray(data?.drop_buckets)
//             ? data.drop_buckets
//             : [];

//     const normalizedBuckets =
//         sourceBuckets
//             .filter(
//                 (bucket) =>
//                     Number(bucket?.language_id) ===
//                     Number(languageId)
//             )
//             .map(
//                 (bucket) => ({
//                     drop_bucket_id:
//                         bucket?.drop_bucket_id ??
//                         bucket?.bucket_id ??
//                         bucket?.id,

//                     bucket_id:
//                         bucket?.bucket_id ??
//                         bucket?.id,

//                     bucket_name:
//                         bucket?.bucket_name ??
//                         bucket?.name ??
//                         "",

//                     image_url:
//                         bucket?.bucket_image ??
//                         bucket?.image_url ??
//                         "",

//                     status:
//                         Number(
//                             bucket?.status ?? 1
//                         ),

//                     language_id:
//                         Number(
//                             bucket?.language_id
//                         ),
//                 })
//             );

//     console.log(
//         "SELECTED LANGUAGE ID:",
//         languageId
//     );

//     console.log(
//         "NORMALIZED LANGUAGE BUCKETS:",
//         normalizedBuckets
//     );

//     // ============================================
//     // FINAL FORM
//     // ============================================

//     return {

//         drop_bucket_question_title:
//             questionTitle,

//         drop_bucket_question_description:
//             questionDescription,

//         marks,

//         image_url:
//             imageUrl,

//         buckets:
//             normalizedBuckets,

//     };
// };

const normalizeBucketData = (
    response,
    languageId,
    masterBuckets = []
) => {
    let data = response?.data ?? response;

    if (Array.isArray(data)) {
        data = data.length > 0 ? data[0] : null;
    }

    if (!data) {
        return null;
    }

    const questionTitle =
        data.drop_bucket_question_title ??
        data.question_title ??
        "";

    const questionDescription =
        data.drop_bucket_question_description ??
        data.question_description ??
        "";

    const marks = data.marks ?? "";

    const imageUrl =
        data.image_url ?? "";

    const sourceBuckets =
        Array.isArray(data?.buckets)
            ? data.buckets
            : Array.isArray(data?.drop_buckets)
                ? data.drop_buckets
                : [];

    /*
     * =====================================================
     * ENGLISH / MASTER
     * =====================================================
     */

    if (Number(languageId) === 1) {
        return {
            drop_bucket_question_title:
                questionTitle,

            drop_bucket_question_description:
                questionDescription,

            marks,

            image_url:
                imageUrl,

            buckets:
                sourceBuckets.map((bucket) => ({
                    drop_bucket_id:
                        bucket?.drop_bucket_id ??
                        bucket?.bucket_id ??
                        bucket?.id,

                    bucket_id:
                        bucket?.bucket_id ??
                        bucket?.id,

                    bucket_name:
                        bucket?.bucket_name ??
                        bucket?.name ??
                        "",

                    image_url:
                        bucket?.bucket_image ??
                        bucket?.bucket_image_url ??
                        bucket?.image_url ??
                        "",

                    status:
                        Number(bucket?.status ?? 1),

                    language_id: 1,
                })),
        };
    }

    /*
     * =====================================================
     * TRANSLATION
     * =====================================================
     *
     * First use translation buckets if backend returned them.
     * Otherwise use master buckets so the real IDs are never lost.
     */

    const translationBuckets =
        sourceBuckets.length > 0
            ? sourceBuckets
            : [];

    const masterList =
        Array.isArray(masterBuckets)
            ? masterBuckets
            : [];

    /*
     * Create lookup using actual bucket ID.
     */
    const translationMap = new Map();

    translationBuckets.forEach((bucket) => {
        const bucketId =
            bucket?.drop_bucket_id ??
            bucket?.bucket_id ??
            bucket?.id;

        if (bucketId !== undefined && bucketId !== null) {
            translationMap.set(
                Number(bucketId),
                bucket
            );
        }
    });

    /*
     * Use master buckets as the source of truth
     * for IDs and bucket structure.
     */
    const normalizedBuckets =
        masterList.map((masterBucket) => {

            const bucketId =
                masterBucket?.drop_bucket_id ??
                masterBucket?.bucket_id ??
                masterBucket?.id;

            const translationBucket =
                translationMap.get(
                    Number(bucketId)
                );

            return {
                drop_bucket_id:
                    bucketId,

                bucket_id:
                    masterBucket?.bucket_id ??
                    masterBucket?.id,

                /*
                 * Translation name if available.
                 * Otherwise empty so user can translate it.
                 */
                bucket_name:
                    translationBucket?.bucket_name ??
                    translationBucket?.name ??
                    "",

                /*
                 * Keep master image.
                 */
                image_url:
                    translationBucket?.bucket_image ??
                    translationBucket?.bucket_image_url ??
                    translationBucket?.image_url ??
                    masterBucket?.bucket_image ??
                    masterBucket?.bucket_image_url ??
                    masterBucket?.image_url ??
                    "",

                status:
                    Number(
                        translationBucket?.status ??
                        masterBucket?.status ??
                        1
                    ),

                language_id:
                    Number(languageId),
            };
        });

    return {
        drop_bucket_question_title:
            questionTitle,

        drop_bucket_question_description:
            questionDescription,

        marks,

        image_url:
            imageUrl,

        buckets:
            normalizedBuckets,
    };
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ViewDropBucket() {

    const {
        parentId,
    } = useParams();

    const [searchParams] = useSearchParams();


    const navigate =
        useNavigate();


    const [
        form,
        setForm,
    ] = useState(
        INITIAL_FORM
    );


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        languageKey,
        setLanguageKey,
    ] = useState((searchParams.get("tab") || "english").toLowerCase());


    /* =====================================================
       LANGUAGE
    ===================================================== */

    const language =
        getLanguageByKey(
            languageKey
        );


    const languageId =
        Number(
            language?.id || 1
        );


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
            label: "Drop Buckets",
            path: "/drop-bucket-master",
        },

        {
            label: "View",
            path:
                `/drop-bucket-master/${parentId}`,
        },

    ];


    /* =====================================================
       LOAD DROP BUCKET
    ===================================================== */

    useEffect(() => {

        if (!parentId) {
            return;
        }

        const loadDropBucket = async () => {

            try {

                setLoading(true);


                const response =
                    await getBucketById(
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


                if (!data) {

                    setForm({
                        ...INITIAL_FORM,
                    });

                    return;
                }

                const sourceBuckets =
                    Array.isArray(data?.buckets)
                        ? data.buckets
                        : Array.isArray(data?.drop_buckets)
                            ? data.drop_buckets
                            : [];

                const normalizedBuckets =
                    sourceBuckets
                        .filter((bucket) =>
                            Number(bucket?.language_id) ===
                            Number(languageId)
                        )
                        .map((bucket) => ({

                            drop_bucket_id:
                                bucket.drop_bucket_id ??
                                bucket.bucket_id ??
                                bucket.id,

                            bucket_name:
                                bucket.bucket_name ??
                                bucket.name ??
                                "",

                            image_url:
                                bucket.bucket_image ??
                                bucket.image_url ??
                                "",

                            status:
                                Number(
                                    bucket.status ?? 1
                                ),

                            language_id:
                                Number(
                                    bucket.language_id
                                ),

                        })
                        );


                setForm({

                    drop_bucket_question_title:
                        data.drop_bucket_question_title ??
                        data.question_title ??
                        "",

                    drop_bucket_question_description:
                        data.drop_bucket_question_description ??
                        data.question_description ??
                        "",

                    marks:
                        data.marks ?? "",

                    image_url:
                        data.image_url ?? "",

                    buckets:
                        normalizedBuckets,

                });

            } catch (error) {

                console.error(
                    "DROP BUCKET LOAD ERROR:",
                    error
                );

                console.error(
                    "DROP BUCKET ERROR RESPONSE:",
                    error?.response?.data
                );

                toast.error(
                    "Unable to load Drop Bucket."
                );

                setForm({
                    ...INITIAL_FORM,
                });

            } finally {

                setLoading(false);

            }

        };

        loadDropBucket();

    }, [
        parentId,
        languageId,
    ]);

    /* =====================================================
       LANGUAGE CHANGE
    ===================================================== */

    const handleLanguageChange =
        (value) => {

            if (
                value === languageKey
            ) {
                return;
            }


            setForm(
                INITIAL_FORM
            );


            setLanguageKey(
                value
            );
        };


    /* =====================================================
       QUESTION CHANGE
    ===================================================== */

    const handleChange =
        (event) => {

            const {
                name,
                value,
            } = event.target;


            setForm(
                (previous) => ({

                    ...previous,

                    [name]:
                        value,

                })
            );
        };


    /* =====================================================
       BUCKET CHANGE
    ===================================================== */

    const handleBucketChange =
        (
            index,
            value
        ) => {

            setForm(
                (previous) => {

                    const buckets = [
                        ...(previous.buckets || []),
                    ];


                    buckets[index] = {

                        ...buckets[index],

                        bucket_name:
                            value,

                    };


                    return {

                        ...previous,

                        buckets,

                    };

                }
            );
        };


    /* =====================================================
       SAVE TRANSLATION
    ===================================================== */

    const handleSubmit =
        async (event) => {

            event.preventDefault();


            /*
             * English is read-only
             */

            if (
                isEnglish
            ) {
                return;
            }


            /*
             * -------------------------------------------------
             * QUESTION TITLE
             * -------------------------------------------------
             */

            if (
                !form
                    ?.drop_bucket_question_title
                    ?.trim()
            ) {

                toast.error(
                    "Question title is required."
                );

                return;
            }


            /*
             * -------------------------------------------------
             * BUCKETS
             * -------------------------------------------------
             */

            const buckets =
                form?.buckets || [];


            if (
                buckets.length === 0
            ) {

                toast.error(
                    "No buckets available to translate."
                );

                return;
            }


            /*
             * -------------------------------------------------
             * BUCKET NAME VALIDATION
             * -------------------------------------------------
             */

            const hasEmptyBucket =
                buckets.some(
                    (bucket) => {

                        const name =
                            bucket?.bucket_name ??
                            "";


                        return !String(
                            name
                        ).trim();

                    }
                );


            if (
                hasEmptyBucket
            ) {

                toast.error(
                    "All bucket names are required."
                );

                return;
            }


            try {

                setLoading(
                    true
                );


                /*
                 * =================================================
                 * PAYLOAD
                 *
                 * Same style as MCQ:
                 * parent fields + child array.
                 * =================================================
                 */

                const payload = {

                    language_id:
                        Number(
                            languageId
                        ),

                    drop_bucket_question_title:
                        form
                            .drop_bucket_question_title
                            .trim(),

                    drop_bucket_question_description:
                        form
                            ?.drop_bucket_question_description
                            ?.trim() ||
                        "",

                    marks:
                        form?.marks !== "" &&
                            form?.marks !== null &&
                            form?.marks !== undefined
                            ? Number(
                                form.marks
                            )
                            : 0,

                    image_url:
                        form?.image_url ||
                        null,

                    buckets:
                        buckets.map(
                            (bucket) => ({

                                drop_bucket_id:
                                    bucket?.drop_bucket_id ??
                                    bucket?.bucket_id ??
                                    bucket?.id,

                                bucket_name:
                                    String(
                                        bucket?.bucket_name ||
                                        ""
                                    ).trim(),

                                image_url:
                                    bucket?.image_url ||
                                    null,

                                status:
                                    Number(
                                        bucket?.status ??
                                        1
                                    ),

                                language_id:
                                    Number(
                                        languageId
                                    ),

                            })
                        ),

                };










                /*
                 * =================================================
                 * API
                 * =================================================
                 */

                await saveBucketTranslation(
                    parentId,
                    payload
                );


                /*
                 * =================================================
                 * SUCCESS
                 * =================================================
                 */

                toast.success(
                    `${language?.label} translation saved successfully.`
                );


                navigate(
                    "/drop-bucket-master"
                );


            } catch (error) {

                console.error(
                    "DROP BUCKET SAVE ERROR:",
                    error
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
                    "RESPONSE:",
                    error?.response?.data
                );


                const detail =
                    error?.response?.data?.detail;


                /*
                 * FastAPI validation errors
                 */

                if (
                    Array.isArray(
                        detail
                    )
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


                            const message =
                                item?.msg ||
                                "Validation error.";


                            toast.error(
                                location
                                    ? `${location}: ${message}`
                                    : message
                            );

                        }
                    );


                } else if (
                    typeof detail ===
                    "string"
                ) {

                    toast.error(
                        detail
                    );


                } else {

                    toast.error(
                        `Unable to save translation${error?.response?.status
                            ? ` (${error.response.status})`
                            : ""
                        }`
                    );

                }

            } finally {

                setLoading(
                    false
                );

            }

        };


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <AppLayout>

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
                    Drop Bucket View
                </span>


                <Breadcrumbs
                    items={
                        breadcrumbItems
                    }
                />

            </div>


            <div
                className="
                    rounded-[6px]
                    border
                    border-[#D8E2EF]
                    bg-white
                "
            >

                <LanguageTabs
                    activeTab={
                        languageKey
                    }
                    onChange={
                        handleLanguageChange
                    }
                />


                <div
                    className="
                        m-3
                        rounded-md
                        border
                        border-[#D8E2EF]
                        bg-white
                    "
                >

                    {loading ? (

                        <div
                            className="
                                py-10
                                text-center
                                text-[12px]
                                text-gray-500
                            "
                        >
                            Loading...
                        </div>

                    ) : (

                        <TranslationDropBucket
                            form={
                                form
                            }
                            readOnly={
                                isEnglish
                            }
                            loading={
                                loading
                            }
                            languageName={
                                language?.label
                            }
                            onChange={
                                handleChange
                            }
                            onBucketChange={
                                handleBucketChange
                            }
                            onSubmit={
                                handleSubmit
                            }
                            onCancel={() =>
                                navigate(
                                    "/drop-bucket-master"
                                )
                            }
                            isValidImageUrl={
                                isValidImageUrl
                            }
                        />

                    )}

                </div>

            </div>

        </AppLayout>
    );
}