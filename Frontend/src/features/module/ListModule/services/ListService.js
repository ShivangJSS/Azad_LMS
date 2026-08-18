import API from "../../../../api/Api";

/* =========================================================
   GET MODULE LIST
   Backend:
   GET /modules?language_id=1&page=1&limit=10&search=
========================================================= */

export const getModules = async (params = {}) => {
    try {
        const response = await API.get("/modules", {
            params,
        });

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching modules:",
            error?.response?.data ?? error
        );

        throw error;
    }
};


/* =========================================================
   GET MODULE BY ID
   Backend:
   GET /modules/{module_id}
========================================================= */

export const getModuleById = async (moduleId) => {
    try {
        const response = await API.get(`/modules/${moduleId}`);

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching module:",
            error?.response?.data ?? error
        );

        throw error;
    }
};


/* =========================================================
   CREATE MODULE
   Backend expects FormData because:
   Form(...)
   File(...)
========================================================= */

export const createModule = async (formData) => {
    try {
        const response = await API.post(
            "/modules",
            formData,
            {
                headers: {
                    "Content-Type": undefined,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error creating module:",
            error?.response?.data ?? error
        );

        throw error;
    }
};


/* =========================================================
   UPDATE MODULE
   Backend:
   PUT /modules/{module_id}

   Also expects FormData
========================================================= */

export const updateModule = async (moduleId, formData) => {
    try {
        const response = await API.put(
            `/modules/${moduleId}`,
            formData,
            {
                headers: {
                    "Content-Type": undefined,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error updating module:",
            error?.response?.data ?? error
        );

        throw error;
    }
};


/* =========================================================
   DELETE MODULE
   Backend:
   DELETE /modules/{module_id}
========================================================= */

export const deleteModule = async (moduleId) => {
    try {
        const response = await API.delete(
            `/modules/${moduleId}`
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error deleting module:",
            error?.response?.data ?? error
        );

        throw error;
    }
};


/* =========================================================
   EXPORT MODULES
   Backend:
   GET /modules/export?language_id=1

   Backend returns XLSX
========================================================= */

export const exportModules = async (languageId) => {
    try {
        const response = await API.get(
            "/modules/export",
            {
                params: {
                    language_id: languageId,
                },
                responseType: "blob",
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error exporting modules:",
            error?.response?.data ?? error
        );

        throw error;
    }
};


/* =========================================================
   SAVE MODULE TRANSLATION
   Backend:
   POST /modules/{module_id}/translation

   ModuleTranslation is JSON body
========================================================= */

export const saveModuleTranslation = async (
    moduleId,
    data
) => {
    try {
        const response = await API.post(
            `/modules/${moduleId}/translation`,
            data
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error saving module translation:",
            error?.response?.data ?? error
        );

        throw error;
    }
};


/* =========================================================
   GET MODULE TRANSLATION
   Backend:
   GET /modules/{module_id}/translation?language_id=2
========================================================= */

export const getModuleTranslation = async (
    moduleId,
    languageId
) => {
    try {
        const response = await API.get(
            `/modules/${moduleId}/translation`,
            {
                params: {
                    language_id: languageId,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching module translation:",
            error?.response?.data ?? error
        );

        throw error;
    }
};