import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "@/components/layout/AppLayout";
import Breadcrumbs from "@/shared/components/breadcrumbs/Breadcrumbs";

import ModuleForm from "@/features/module/ListModule/components/ModuleForm";

import { createModule } from "@/features/module/ListModule/services/ListService";

import { getAllCourses } from "@/features/course/services/CourseService";
import { validateImage } from "@/shared/utils/imageValidation";
import { getLanguageByKey } from "@/shared/constants/languageConstants";

// Modules are always added in English - HI/BN/TA content comes from
// translating an existing English module, not from a fresh add here.
const INITIAL_FORM = {
  fk_course_id: "",
  module_type: "",
  module_name: "",
  module_description: "",
  module_overview: "",
  module_objective: "",
  module_duration: "",
  status: "",
  publishing_status: "In Review",
  module_icon: null,
};

const breadcrumbItems = [
  {
    label: "Home",
    path: "/dashboard",
  },
  {
    label: "Modules",
    path: "/modules",
  },
  {
    label: "Add Module",
  },
];

export default function AddModules() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const language = getLanguageByKey(searchParams.get("tab"));

  /* ================= STATE ================= */

  const [form, setForm] = useState(INITIAL_FORM);

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const [courseLoading, setCourseLoading] =
    useState(false);

  /* ================= LOAD COURSES ================= */

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setCourseLoading(true);

        const response = await getAllCourses();


        // Correct path
        const courseList = response?.data?.items ?? [];


        setCourses(
          Array.isArray(courseList)
            ? courseList
            : []
        );

      } catch (error) {
        console.error(
          "Course Load Error:",
          error?.response?.data ?? error
        );

        setCourses([]);

        toast.error("Unable to load courses.");
      } finally {
        setCourseLoading(false);
      }
    };

    loadCourses();
  }, []);

  /* ================= INPUT CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  /* ================= FILE ================= */


  const handleFileChange = async (e) => {
    const input = e.target;
    const file = input.files?.[0] || null;

    if (file) {
      const result = await validateImage(file);
      if (!result.ok) {
        setErrors((previous) => ({
          ...previous,
          module_icon: result.error,
        }));
        input.value = "";
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      module_icon: file,
    }));

    setErrors((previous) => ({
      ...previous,
      module_icon: "",
    }));
  };
  /* ================= VALIDATION ================= */

  const validateForm = () => {
    const validationErrors = {
      fk_course_id: !form.fk_course_id ? "Please select course." : "",
      module_type: !form.module_type ? "Please select module type." : "",
      module_name: !form.module_name.trim() ? "Please enter module name." : "",
      module_description: !form.module_description.trim()
        ? "Please enter module description."
        : "",
      module_overview: !form.module_overview.trim()
        ? "Please enter module overview."
        : "",
      module_objective: !form.module_objective.trim()
        ? "Please enter module objective."
        : "",
      module_duration: !form.module_duration ? "Please enter module duration." : "",
      status: form.status === "" ? "Please select status." : "",
      publishing_status: !form.publishing_status
        ? "Please select publishing status."
        : "",
      module_icon: !form.module_icon ? "Please select module icon." : "",
    };

    setErrors(validationErrors);

    const firstInvalidField = Object.keys(validationErrors).find(
      (field) => validationErrors[field]
    );

    if (firstInvalidField) {
      window.requestAnimationFrame(() => {
        const field = document.querySelector(
          `[name="${firstInvalidField}"]`
        );
        field?.scrollIntoView({ behavior: "smooth", block: "center" });
        field?.focus({ preventScroll: true });
      });
    }

    return !firstInvalidField;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "fk_course_id",
        form.fk_course_id
      );

      formData.append("language_id", String(language.id));

      formData.append(
        "module_name",
        form.module_name.trim()
      );

      formData.append(
        "module_description",
        form.module_description.trim()
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
        form.module_overview.trim()
      );

      formData.append(
        "module_objective",
        form.module_objective.trim()
      );

      formData.append(
        "module_icon",
        form.module_icon
      );

      await createModule(formData);

      toast.success(
        "Module created successfully."
      );

      navigate(`/modules?tab=${language.key}`);

    } catch (error) {
      console.error(
        "Create Module Error:",
        error?.response?.data ?? error
      );

      const detail =
        error?.response?.data?.detail;

      if (typeof detail === "string") {
        toast.error(detail);
      } else {
        toast.error(
          "Unable to create module."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= CANCEL ================= */

  const handleCancel = () => {
    navigate(`/modules?tab=${language.key}`);
  };

  return (
    <AppLayout>

      {/* ================= PAGE HEADER ================= */}

      <div className="mb-[20px] flex items-center justify-between">

        <span className="m-0 text-[20px] font-medium text-[#344050]">
          Add Module
        </span>

        <Breadcrumbs
          items={breadcrumbItems}
        />

      </div>

      {/* ================= FORM ================= */}

      {courseLoading ? (
        <div className="rounded-[6px] border border-[#D8E2EF] bg-white py-[50px] text-center text-[14px] text-[#5E6E82]">
          Loading...
        </div>
      ) : (
        <ModuleForm
          form={form}
          courses={courses}
          onChange={handleChange}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          errors={errors}
        />
      )}

    </AppLayout>
  );
}
