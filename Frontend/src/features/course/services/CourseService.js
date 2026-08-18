import API from "../../../api/Api";

export const getAllCourses = async (languageId = 1) => {
    const { data } = await API.get("/courses", {
        params: {
            language_id: languageId,
            page: 1,
            page_size: 100,
        },
    });

    return data;
};

export const getCourseById = async (courseId, languageId = 1) => {
    const { data } = await API.get(
        `/courses/${courseId}/edit`,
        {
            params: {
                language_id: languageId,
            },
        }
    );

    return data;
};

export const updateCourse = async (courseId, languageId, payload) => {
    const { data } = await API.put(
        `/courses/${courseId}`,
        payload,
        {
            params: { language_id: languageId },
            headers: { "Content-Type": undefined },
        }
    );
    return data;
};

export const getCourseImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const baseUrl = API.defaults.baseURL.replace(/\/api$/, "");
    return `${baseUrl}/${imagePath.replace(/^app\//, "")}`;
};
