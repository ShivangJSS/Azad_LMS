import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUpload } from "react-icons/fi";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import { LANGUAGE_OPTIONS } from "../../../../shared/constants/languageConstants";

import { createVideo } from "../services/VideoService";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Video List", path: "/video-masters" },
    { label: "Add Video" },
];

const labelClass = "mb-[6px] block text-[13px] font-medium text-[#344050]";
const inputClass =
    "h-[38px] w-full rounded-[4px] border border-[#d8e2ef] px-[10px] text-[13px] text-[#344050] outline-none focus:border-[#732269]";

export default function AddVideo() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        video_name: "",
        video_description: "",
        youtube_url: "",
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

        if (!form.video_name.trim()) {
            toast.error("Video name is required.");
            return;
        }
        if (!file && !form.youtube_url.trim()) {
            toast.error("Please upload a video file or provide a YouTube URL.");
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
            fd.append("video_name", form.video_name);
            fd.append("video_description", form.video_description || "");
            fd.append("youtube_url", form.youtube_url || "");
            fd.append("language_id", form.language_id);
            fd.append("status", form.status);
            if (file) fd.append("media_file", file);

            await createVideo(fd);
            toast.success("Video created successfully.");
            navigate("/video-masters");
        } catch (error) {
            toast.error(
                error?.response?.data?.detail || "Unable to create video."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout>

            <div className="mb-3 flex items-center justify-between">
                <span className="text-[20px] font-medium text-[#344050]">
                    Add New Video
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
                            Video Name <span className="text-[#E63757]">*</span>
                        </label>
                        <input
                            name="video_name"
                            value={form.video_name}
                            onChange={update}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Video Description</label>
                        <textarea
                            name="video_description"
                            value={form.video_description}
                            onChange={update}
                            rows={3}
                            className="w-full rounded-[4px] border border-[#d8e2ef] px-[10px] py-[8px] text-[13px] text-[#344050] outline-none focus:border-[#732269]"
                        />
                    </div>

                    <div>
                        <label className={`${labelClass} inline-flex items-center gap-[6px]`}>
                            <FiUpload size={13} /> Upload Video
                        </label>
                        <input
                            type="file"
                            accept="video/*,.mp4,.webm,.mov"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full max-w-[420px] text-[13px] file:mr-3 file:rounded-[4px] file:border-0 file:bg-[#732269] file:px-[14px] file:py-[8px] file:text-white"
                        />
                        <p className="mt-[6px] text-[12px] text-[#8a94a6]">
                            Upload a file or provide a YouTube URL below.
                        </p>
                    </div>

                    <div>
                        <label className={labelClass}>YouTube URL</label>
                        <input
                            name="youtube_url"
                            value={form.youtube_url}
                            onChange={update}
                            placeholder="https://youtube.com/..."
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
                            onClick={() => navigate("/video-masters")}
                            className="h-[38px] rounded-[4px] border border-[#adb5bd] bg-white px-[20px] text-[14px] font-medium text-[#344050]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="h-[38px] rounded-[4px] bg-[#732269] px-[20px] text-[14px] font-medium text-white disabled:opacity-60"
                        >
                            {saving ? "Creating..." : "Create Video"}
                        </button>
                    </div>
                </form>
            </div>

        </AppLayout>
    );
}
