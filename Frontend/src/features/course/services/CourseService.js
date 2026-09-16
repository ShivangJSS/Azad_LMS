import API from "@/api/Api";

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

// export const getModuleCountsByCourse = async (languageId = 1) => {
//     const counts = {};
//     let page = 1;
//     let pages = 1;

//     do {
//         const { data } = await API.get("/modules", {
//             params: {
//                 language_id: languageId,
//                 page,
//                 limit: 100,
//             },
//         });

//         const modules = Array.isArray(data?.data) ? data.data : [];

//         modules.forEach((module) => {
//             const courseId =
//                 module.fk_course_id ??
//                 module.course_id ??
//                 module.parent_course_id ??
//                 module.base_course_id ??
//                 module.course?.course_id;
//             if (courseId != null) {
//                 const key = String(courseId);
//                 counts[key] = (counts[key] || 0) + 1;
//             }
//         });

//         pages = data?.pagination?.pages ?? page;
//         page += 1;
//     } while (page <= pages);

//     return counts;
// };

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

export const exportCourses = async (params = {}) => {
    const response = await API.get("/courses/export", {
        params,
        responseType: "blob",
    });

    return response.data;
};

export const getCourseImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const baseUrl = API.defaults.baseURL.replace(/\/api$/, "");
    return `${baseUrl}/${imagePath.replace(/^app\//, "")}`;
};
