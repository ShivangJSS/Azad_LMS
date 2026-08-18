import Api from "../../../../api/Api";


/* =========================================================
   IMAGE UPLOAD
   Uploads the actual file and returns the permanent backend
   URL (e.g. "/uploads/assessment_images/<file>"). Never a blob.
========================================================= */

export const uploadImage = async (file) => {

    const formData = new FormData();
    formData.append("image", file);

    const response = await Api.post(
        "/assessment/upload-image",
        formData
    );

    return response.data?.image_url || "";
};


/* =========================================================
   SCQ LIST
========================================================= */

export const getSCQs = async (
    params = {}
) => {

    const response =
        await Api.get(
            "/scqs",
            {
                params,
            }
        );

    return response.data;
};


/* =========================================================
   SINGLE SCQ
========================================================= */

export const getSCQById = async (
    parentId,
    languageId = 1
) => {

    const response =
        await Api.get(
            `/scqs/${parentId}`,
            {
                params: {
                    language_id:
                        languageId,
                },
            }
        );

    return response.data;
};


/* =========================================================
   CREATE
========================================================= */

export const createSCQ = async (payload) => {


    const response = await Api.post(
        "/scqs/",
        payload,
        {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        }
    );

    return response.data;
};


/* =========================================================
   UPDATE
========================================================= */

export const updateSCQ = async (
    scqId,
    payload
) => {

    const response =
        await Api.put(
            `/scqs/${scqId}`,
            payload,
            {
                headers: {
                    "Content-Type":
                        "application/json",
                },
            }
        );

    return response.data;
};


/* =========================================================
   DELETE
========================================================= */

export const deleteSCQ = async (
    scqId
) => {

    const response =
        await Api.delete(
            `/scqs/${scqId}`
        );

    return response.data;
};


/* =========================================================
   TRANSLATION GET
========================================================= */

export const getSCQTranslation = async (
    parentId,
    languageId
) => {

    const response =
        await Api.get(
            `/scqs/${parentId}`,
            {
                params: {
                    language_id:
                        languageId,
                },
            }
        );

    return response.data;
};


/* =========================================================
   TRANSLATION SAVE
========================================================= */

export const saveSCQTranslation = async (
    parentId,
    payload
) => {

    const response = await Api.put(
        `/scqs/${parentId}/translation`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        }
    );

    return response.data;
};
/* =========================================================
   EXPORT
========================================================= */

export const exportSCQs = async (
    languageId
) => {

    const response =
        await Api.get(
            "/scqs/export",
            {
                params: {
                    language_id:
                        languageId,
                },
                responseType: "blob",
            }
        );

    return response.data;
};