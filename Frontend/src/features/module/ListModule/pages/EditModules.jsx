import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";

import ModuleForm from "../components/ModuleForm";

import {
    getModuleById,
    updateModule,
} from "../services/ListService";

import {
    getAllCourses,
    getCourseImageUrl,
} from "../../../course/services/CourseService";

const INITIAL_FORM = {
    fk_course_id: "",
    module_type: "",
    module_name: "",
    module_description: "",
    module_overview: "",
    module_objective: "",
    module_duration: "",
    status: "",
    publishing_status: "",
    module_icon: null,
};

export default function EditModules() {
    const { moduleId } = useParams();

    const navigate = useNavigate();

    const [form, setForm] = useState(INITIAL_FORM);

    const [courses, setCourses] = useState([]);

    const [existingImage, setExistingImage] = useState("");

    const [loading, setLoading] = useState(false);

    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setPageLoading(true);

            const [moduleRes, courseRes] = await Promise.all([
                getModuleById(moduleId),
                getAllCourses(),
            ]);

            const module = moduleRes;

            setForm({
                fk_course_id: module.fk_course_id || "",
                module_type: String(module.module_type || ""),
                module_name: module.module_name || "",
                module_description:
                    module.module_description || "",
                module_overview:
                    module.module_overview || "",
                module_objective:
                    module.module_objective || "",
                module_duration:
                    module.module_duration || "",
                status: String(module.status || ""),
                publishing_status:
                    module.publishing_status || "Published",
                module_icon: null,
            });

            if (module.module_icon) {
                setExistingImage(
                    getCourseImageUrl(module.module_icon)
                );
            } else if (module.icon_images) {
                setExistingImage(
                    getCourseImageUrl(module.icon_images)
                );
            }

            const list =
                courseRes?.data?.items ??
                courseRes?.items ??
                courseRes ??
                [];

            setCourses(list);
        } catch (error) {
            console.error(error);

            toast.error("Unable to load module.");
        } finally {
            setPageLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        setForm((prev) => ({
            ...prev,
            module_icon: file,
        }));

        if (file) {
            setExistingImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append(
                "fk_course_id",
                form.fk_course_id
            );

            formData.append(
                "module_name",
                form.module_name
            );

            formData.append(
                "module_description",
                form.module_description
            );

            formData.append(
                "module_type",
                form.module_type
            );

            formData.append(
                "module_duration",
                form.module_duration
            );

            formData.append(
                "publishing_status",
                form.publishing_status
            );

            formData.append(
                "status",
                form.status
            );

            formData.append(
                "module_overview",
                form.module_overview
            );

            formData.append(
                "module_objective",
                form.module_objective
            );

            if (form.module_icon) {
                formData.append(
                    "module_icon",
                    form.module_icon
                );
            }

            await updateModule(
                moduleId,
                formData
            );

            toast.success(
                "Module updated successfully."
            );

            navigate("/modules");
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.detail ||
                    "Unable to update module."
            );
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <AppLayout>
                <div className="p-10 text-center">
                    Loading...
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="mb-3 flex items-center justify-between">
                <span className="text-[20px] font-medium">
                    Edit Module
                </span>

                <Breadcrumbs
                    items={[
                        {
                            label: "Home",
                            path: "/dashboard",
                        },
                        {
                            label: "Modules",
                            path: "/modules",
                        },
                        {
                            label: "Edit Module",
                        },
                    ]}
                />
            </div>

            <ModuleForm
                form={form}
                courses={courses}
                existingImage={existingImage}
                onChange={handleChange}
                onFileChange={handleFileChange}
                onSubmit={handleSubmit}
                onCancel={() =>
                    navigate("/modules")
                }
                loading={loading}
            />
        </AppLayout>
    );
}