import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUpload } from "react-icons/fi";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import { LANGUAGE_OPTIONS } from "../../../../shared/constants/languageConstants";

import { createPpt } from "../services/PptService";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "PPT List", path: "/ppt-masters" },
    { label: "Add PPT" },
];

const labelClass = "mb-[6px] block text-[13px] font-medium text-[#344050]";
const inputClass =
    "h-[38px] w-full rounded-[4px] border border-[#d8e2ef] px-[10px] text-[13px] text-[#344050] outline-none focus:border-[#732269]";

export default function AddPpt() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        ppt_name: "",
        ppt_description: "",
        cloud_url: "",
        language_id: "",
        status: "",
    });
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const update = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.ppt_name.trim()) {
            toast.error("PPT name is required.");
            return;
        }
        if (!file) {
            toast.error("Please upload a PPT file.");
            return;
        }
        if (!form.language_id) {
            toast.error("Please select a language.");
            return;
        }
        if (form.status === "") {
            toast.error("Please select a status.");
            return;
        }

        try {
            setSaving(true);
            const fd = new FormData();
            fd.append("ppt_name", form.ppt_name);
            fd.append("ppt_description", form.ppt_description || "");
            fd.append("cloud_url", form.cloud_url || "");
            fd.append("language_id", form.language_id);
            fd.append("status", form.status);
            fd.append("media_file", file);

            await createPpt(fd);
            toast.success("PPT created successfully.");
            navigate("/ppt-masters");
        } catch (error) {
            toast.error(
                error?.response?.data?.detail || "Unable to create PPT."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout>

            <div className="mb-3 flex items-center justify-between">
                <span className="text-[20px] font-medium text-[#344050]">
                    Add New PPT
                </span>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="w-full rounded-[8px] border border-[#D8E2EF] bg-white p-[20px]">
                <form
                    onSubmit={handleSubmit}
                    className="flex max-w-[900px] flex-col gap-[16px]"
                >

                    <div>
                        <label className={labelClass}>
                            PPT Name <span className="text-[#E63757]">*</span>
                        </label>
                        <input
                            name="ppt_name"
                            value={form.ppt_name}
                            onChange={update}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>PPT Description</label>
                        <textarea
                            name="ppt_description"
                            value={form.ppt_description}
                            onChange={update}
                            rows={3}
                            className="w-full rounded-[4px] border border-[#d8e2ef] px-[10px] py-[8px] text-[13px] text-[#344050] outline-none focus:border-[#732269]"
                        />
                    </div>

                    <div>
                        <label className={`${labelClass} inline-flex items-center gap-[6px]`}>
                            <FiUpload size={13} /> Upload PPT{" "}
                            <span className="text-[#E63757]">*</span>
                        </label>
                        <input
                            type="file"
                            accept=".ppt,.pptx"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full max-w-[420px] text-[13px] file:mr-3 file:rounded-[4px] file:border-0 file:bg-[#732269] file:px-[14px] file:py-[8px] file:text-white"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Cloud URL</label>
                        <input
                            name="cloud_url"
                            value={form.cloud_url}
                            onChange={update}
                            placeholder="NA"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Language <span className="text-[#E63757]">*</span>
                        </label>
                        <select
                            name="language_id"
                            value={form.language_id}
                            onChange={update}
                            className={inputClass}
                        >
                            <option value="">Select Language</option>
                            {LANGUAGE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>
                            Status <span className="text-[#E63757]">*</span>
                        </label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={update}
                            className={inputClass}
                        >
                            <option value="">Please select a Status</option>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </select>
                    </div>

                    <div className="flex gap-[10px]">
                        <button
                            type="button"
                            onClick={() => navigate("/ppt-masters")}
                            className="h-[38px] rounded-[4px] border border-[#adb5bd] bg-white px-[20px] text-[14px] font-medium text-[#344050]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="h-[38px] rounded-[4px] bg-[#732269] px-[20px] text-[14px] font-medium text-white disabled:opacity-60"
                        >
                            {saving ? "Creating..." : "Create PPT"}
                        </button>
                    </div>
                </form>
            </div>

        </AppLayout>
    );
}
