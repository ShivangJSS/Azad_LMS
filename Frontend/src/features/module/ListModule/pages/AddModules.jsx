import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";

import ModuleForm from "../components/ModuleForm";

import { createModule } from "../services/ListService";

import { getAllCourses } from "../../../course/services/CourseService";
import {
  LANGUAGES,
  getLanguageByKey,
} from "../../../../shared/constants/languageConstants";

import LanguageTabs from "../../../../shared/components/language/LanguageTabs";

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

  /* ================= STATE ================= */

  const [form, setForm] = useState(INITIAL_FORM);

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(
    LANGUAGES[0].key
  );

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
  };

  /* ================= FILE ================= */

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    setForm((prev) => ({
      ...prev,
      module_icon: file,
    }));
  };

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    if (!form.fk_course_id) {
      toast.error("Please select course.");
      return false;
    }

    if (!form.module_type) {
      toast.error("Please select module type.");
      return false;
    }

    if (!form.module_name.trim()) {
      toast.error("Please enter module name.");
      return false;
    }

    if (!form.module_description.trim()) {
      toast.error(
        "Please enter module description."
      );
      return false;
    }

    if (!form.module_overview.trim()) {
      toast.error(
        "Please enter module overview."
      );
      return false;
    }

    if (!form.module_objective.trim()) {
      toast.error(
        "Please enter module objective."
      );
      return false;
    }

    if (!form.module_duration) {
      toast.error(
        "Please enter module duration."
      );
      return false;
    }

    if (form.status === "") {
      toast.error("Please select status.");
      return false;
    }

    if (!form.publishing_status) {
      toast.error(
        "Please select publishing status."
      );
      return false;
    }

    if (!form.module_icon) {
      toast.error(
        "Please select module icon."
      );
      return false;
    }

    return true;
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

      // Debug FormData
      for (const [key, value] of formData.entries()) {
      }

      const response =
        await createModule(formData);


      toast.success(
        "Module created successfully."
      );

      navigate("/modules");

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
    navigate("/modules");
  };

  return (
    <AppLayout>

      {/* ================= PAGE HEADER ================= */}

      <div className="mb-[20px] flex items-center justify-between">

        <span className="m-0 text-[20px] font-medium text-[#344050]">
          New Module
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
        />
      )}

    </AppLayout>
  );
}