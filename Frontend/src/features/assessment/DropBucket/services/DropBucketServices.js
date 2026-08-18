// import API from "../../../../api/Api";

// /* =========================================================
//    DROP BUCKET LIST
// ========================================================= */
// export const getBuckets = async (params = {}) => {
//   const response = await API.get("/drop-buckets/", { params });
//   return response.data;
// };

// /* =========================================================
//    GET SINGLE DROP BUCKET / TRANSLATION
// ========================================================= */
// export const getBucketById = async (parentId, languageId = 1) => {
//   const response = await API.get(`/drop-buckets/${parentId}`, {
//     params: { language_id: Number(languageId) },
//   });
//   return response.data;
// };

// /* =========================================================
//    SAVE TRANSLATION
// ========================================================= */
// export const saveBucketTranslation = async (parentId, payload) => {
//   const response = await API.put(
//     `/drop-buckets/${parentId}/translation`,
//     payload
//   );
//   return response.data;
// };

// /* =========================================================
//    CREATE / UPDATE / DELETE
// ========================================================= */
// export const createBucket = async (payload) => {
//   const response = await API.post("/drop-buckets/", payload);
//   return response.data;
// };

// export const updateBucket = async (dropBucketId, payload) => {
//   const response = await API.put(`/drop-buckets/${dropBucketId}`, payload);
//   return response.data;
// };

// export const deleteBucket = async (dropBucketId) => {
//   const response = await API.delete(`/drop-buckets/${dropBucketId}`);
//   return response.data;
// };

// /* =========================================================
//    BUCKET ITEMS API (FIXED ROUTE)
// ========================================================= */
// export const getBucketItems = async (bucketId) => {
//   // Corrected path to match FastAPI prefix /drop-buckets + /buckets/{bucket_id}/items
//   const response = await API.get(`/drop-buckets/buckets/${bucketId}/items`);
//   return response.data;
// };

// export const updateBucketItems = async (bucketId, payload) => {
//   const response = await API.put(
//     `/drop-buckets/buckets/${bucketId}/items`,
//     payload
//   );
//   return response.data;
// };



import API from "../../../../api/Api";

/* =========================================================
IMAGE UPLOAD
Uploads the actual file and returns the permanent backend URL
(e.g. "/uploads/assessment_images/<file>"). Never a blob URL.
========================================================= */

export const uploadImage = async (file) => {

    const formData = new FormData();
    formData.append("image", file);

    const response = await API.post(
        "/assessment/upload-image",
        formData
    );

    return response.data?.image_url || "";
};

/* =========================================================
DROP BUCKET LIST
========================================================= */

export const getBuckets = async (params = {}) => {


    const response = await API.get(
        "/drop-buckets/",
        {
            params,
        }
    );



    return response.data;
};

/* =========================================================
GET SINGLE DROP BUCKET / TRANSLATION
========================================================= */

export const getBucketById = async (
    parentId,
    languageId = 1
) => {



    const response = await API.get(
        `/drop-buckets/${parentId}`,
        {
            params: {
                language_id:
                    Number(languageId),
            },
        }
    );


    return response.data;
};

/* =========================================================
GET ALL LANGUAGES (flat) — English question + every language's buckets
GET /drop-buckets/{parentId}/all
========================================================= */

export const getBucketAllLanguages = async (parentId) => {
    const response = await API.get(
        `/drop-buckets/${parentId}/all`
    );

    return response.data;
};

/* =========================================================
BULK UPDATE ALL LANGUAGES
PUT /drop-buckets/{parentId}/all
========================================================= */

export const bulkUpdateBuckets = async (parentId, payload) => {
    const response = await API.put(
        `/drop-buckets/${parentId}/all`,
        payload
    );

    return response.data;
};

/* =========================================================
SAVE TRANSLATION
========================================================= */

export const saveBucketTranslation = async (
    parentId,
    payload
) => {



    const response = await API.put(
        `/drop-buckets/${parentId}/translation`,
        payload
    );


    return response.data;
};

/* =========================================================
CREATE
========================================================= */

export const createBucket = async (
    payload
) => {


    const response = await API.post(
        "/drop-buckets/",
        payload
    );


    return response.data;
};

/* =========================================================
UPDATE
========================================================= */

export const updateBucket = async (
    dropBucketId,
    payload
) => {



    const response = await API.put(
        `/drop-buckets/${dropBucketId}`,
        payload
    );


    return response.data;
};

/* =========================================================
DELETE
========================================================= */

export const deleteBucket = async (
    dropBucketId
) => {


    const response = await API.delete(
        `/drop-buckets/${dropBucketId}`
    );


    return response.data;
};

/* =========================================================
QUESTION ITEMS (all buckets) — for Show Items / Edit Items
GET /drop-buckets/{dropBucketId}/items?language_id=1
Returns { drop_bucket_id, buckets:[{bucket_id,bucket_name}], items:[...] }
========================================================= */

export const getQuestionItems = async (
    dropBucketId,
    languageId = 1
) => {
    const response = await API.get(
        `/drop-buckets/${dropBucketId}/items`,
        {
            params: { language_id: Number(languageId) },
        }
    );

    return response.data;
};

/* =========================================================
BUCKET ITEMS
========================================================= */

export const getBucketItems = async (
    bucketId,
    languageId = 1
) => {



    const params = {
        language_id:
            Number(languageId),
    };


    const url =
        `/drop-buckets/buckets/${bucketId}/items`;


    const response = await API.get(
        url,
        {
            params,
        }
    );



    return response.data;
};

/* =========================================================
UPDATE BUCKET ITEMS
========================================================= */

export const updateBucketItems = async (
    bucketId,
    payload
) => {



    const response = await API.put(
        `/drop-buckets/buckets/${bucketId}/items`,
        payload
    );


    return response.data;
};