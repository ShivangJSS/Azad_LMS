import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUpload } from "react-icons/fi";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import { LANGUAGE_OPTIONS } from "../../../../shared/constants/languageConstants";

import { getPdf, updatePdf } from "../services/PdfService";
import { toMediaUrl } from "../hook/pdfConstants";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "PDF List", path: "/pdf-masters" },
    { label: "Edit PDF" },
];

const labelClass = "mb-[6px] block text-[13px] font-medium text-[#344050]";
const inputClass =
    "h-[38px] w-full rounded-[4px] border border-[#d8e2ef] px-[10px] text-[13px] text-[#344050] outline-none focus:border-[#732269]";

export default function EditPdf() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        pdf_name: "",
        pdf_description: "",
        cloud_url: "",
        language_id: "",
        status: 1,
    });
    const [existingUrl, setExistingUrl] = useState("");
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadPdf = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getPdf(id);
            setForm({
                pdf_name: data?.pdf_name || "",
                pdf_description: data?.pdf_description || "",
                cloud_url: data?.cloud_url || "",
                language_id: data?.language_id || "",
                status: data?.status ?? 1,
            });
            setExistingUrl(toMediaUrl(data?.pdf_url));
        } catch (error) {
            toast.error("Unable to load PDF.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadPdf();
    }, [loadPdf]);

    useEffect(() => {
        if (!file) {
            setPreviewUrl("");
            return undefined;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const update = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.pdf_name.trim()) {
            toast.error("PDF name is required.");
            return;
        }

        try {
            setSaving(true);
            const fd = new FormData();
            fd.append("pdf_name", form.pdf_name);
            fd.append("pdf_description", form.pdf_description || "");
            fd.append("cloud_url", form.cloud_url || "");
            if (form.language_id) fd.append("language_id", form.language_id);
            fd.append("status", form.status);
            if (file) fd.append("media_file", file);

            await updatePdf(id, fd);
            toast.success("PDF updated successfully.");
            navigate(`/pdf-masters/${id}`);
        } catch (error) {
            toast.error(
                error?.response?.data?.detail || "Unable to update PDF."
            );
        } finally {
            setSaving(false);
        }
    };

    const previewSrc = previewUrl || existingUrl;

    return (
        <AppLayout>

            <div className="mb-3 flex items-center justify-between">
                <span className="text-[20px] font-medium text-[#344050]">
                    Editing PDF
                </span>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="w-full rounded-[8px] border border-[#D8E2EF] bg-white p-[20px]">
                {loading ? (
                    <p className="py-[16px] text-[13px] text-[#5e6e82]">Loading...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex max-w-[900px] flex-col gap-[16px]">

                        <div>
                            <label className={labelClass}>
                                PDF Name <span className="text-[#E63757]">*</span>
                            </label>
                            <input
                                name="pdf_name"
                                value={form.pdf_name}
                                onChange={update}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>PDF Description</label>
                            <textarea
                                name="pdf_description"
                                value={form.pdf_description}
                                onChange={update}
                                rows={3}
                                className="w-full rounded-[4px] border border-[#d8e2ef] px-[10px] py-[8px] text-[13px] text-[#344050] outline-none focus:border-[#732269]"
                            />
                        </div>

                        <div>
                            <label className={`${labelClass} inline-flex items-center gap-[6px]`}>
                                <FiUpload size={13} /> Upload PDF
                            </label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="block w-full max-w-[420px] text-[13px] file:mr-3 file:rounded-[4px] file:border-0 file:bg-[#732269] file:px-[14px] file:py-[8px] file:text-white"
                            />
                        </div>

                        {previewSrc && (
                            <div>
                                <label className={labelClass}>Preview</label>
                                <iframe
                                    title="PDF preview"
                                    src={previewSrc}
                                    className="h-[420px] w-full rounded-[4px] border border-[#D8E2EF]"
                                />
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>Cloud URL</label>
                            <input
                                name="cloud_url"
                                value={form.cloud_url}
                                onChange={update}
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
                                <option value="">Select language</option>
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
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                            </select>
                        </div>

                        <div className="flex gap-[10px]">
                            <button
                                type="button"
                                onClick={() => navigate(`/pdf-masters/${id}`)}
                                className="h-[38px] rounded-[4px] border border-[#adb5bd] bg-white px-[20px] text-[14px] font-medium text-[#344050]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="h-[38px] rounded-[4px] bg-[#732269] px-[20px] text-[14px] font-medium text-white disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Update PDF"}
                            </button>
                        </div>
                    </form>
                )}
            </div>

        </AppLayout>
    );
}
