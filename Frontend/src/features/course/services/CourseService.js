import API from "../../../api/Api";

export const getAllCourses = async () => {
    const { data } = await API.get("/courses");
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
