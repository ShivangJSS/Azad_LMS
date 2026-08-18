import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";

import { getVideo } from "../services/VideoService";
import { toMediaUrl } from "../hook/videoConstants";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Videos", path: "/video-masters" },
    { label: "View" },
];

function Field({ label, children }) {
    return (
        <div className="flex flex-col gap-[2px] py-[9px] sm:flex-row sm:items-start sm:gap-4">
            <span className="w-[150px] shrink-0 text-[13px] font-medium text-[#4d5969]">
                {label}
            </span>
            <span className="text-[13px] text-[#3f9d90]">{children}</span>
        </div>
    );
}

export default function ViewVideo() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadVideo = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getVideo(id);
            setVideo(data);
        } catch (err) {
            setVideo(null);
            setError(err?.response?.data?.detail || "Unable to load video.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadVideo();
    }, [loadVideo]);

    const videoUrl = toMediaUrl(video?.video_url);
    const youtubeEmbed = video?.youtube_url
        ? video.youtube_url.replace("watch?v=", "embed/")
        : "";

    return (
        <AppLayout>

            <div className="mb-3 flex items-center justify-between">
                <span className="text-[20px] font-medium text-[#344050]">
                    Video Details
                </span>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="w-full rounded-[8px] border border-[#D8E2EF] bg-white p-[20px]">

                {loading ? (
                    <p className="py-[16px] text-[13px] text-[#5e6e82]">
                        Loading video...
                    </p>
                ) : error ? (
                    <div className="rounded-[4px] border border-[#F5C2C7] bg-[#FDECEA] p-3 text-[13px] text-[#D74D43]">
                        {error}
                    </div>
                ) : !video ? (
                    <p className="py-[16px] text-[13px] text-[#5e6e82]">
                        Video not found.
                    </p>
                ) : (
                    <>
                        <div className="mb-[12px] flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                navigate(`/video-masters/edit/${video.video_id}`)
                            }
                            className="inline-flex h-[32px] items-center rounded-[4px] bg-[#732269] px-[16px] text-[13px] font-medium text-white"
                        >
                            Edit
                        </button>
                        <button type="button" onClick={() => navigate(-1)} className="inline-flex h-[32px] items-center gap-[6px] rounded-[4px] border border-[#344050] bg-white px-[14px] text-[13px] font-medium text-[#344050] hover:bg-[#f8f9fa]">← Back</button>
                        </div>

                        <Field label="Video ID">{video.video_id}</Field>
                        <Field label="Video Name">{video.video_name || "-"}</Field>
                        <Field label="Description">
                            {video.video_description || ""}
                        </Field>
                        <Field label="Video Language">
                            {video.language_name || "-"}
                        </Field>

                        <div className="flex flex-col gap-[2px] py-[9px] sm:flex-row sm:items-start sm:gap-4">
                            <span className="w-[150px] shrink-0 text-[13px] font-medium text-[#4d5969]">
                                Video Preview
                            </span>
                            <div className="w-full">
                                {videoUrl ? (
                                    <video
                                        src={videoUrl}
                                        controls
                                        className="h-[420px] w-full rounded-[4px] border border-[#D8E2EF] bg-black"
                                    />
                                ) : youtubeEmbed ? (
                                    <iframe
                                        title="Video preview"
                                        src={youtubeEmbed}
                                        className="h-[420px] w-full rounded-[4px] border border-[#D8E2EF]"
                                        allowFullScreen
                                    />
                                ) : (
                                    <span className="text-[13px] text-[#3f9d90]">
                                        Not provided
                                    </span>
                                )}
                            </div>
                        </div>

                        <Field label="YouTube URL">
                            {video.youtube_url ? (
                                <a
                                    href={video.youtube_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#732269] underline"
                                >
                                    {video.youtube_url}
                                </a>
                            ) : (
                                "Not provided"
                            )}
                        </Field>

                        <Field label="Status">
                            <span
                                className={`rounded px-2 py-[2px] text-[11px] ${
                                    String(video.status) === "1"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {String(video.status) === "1"
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        </Field>

                        <Field label="Created At">
                            {video.created_at || "-"}
                        </Field>
                        <Field label="Updated At">
                            {video.updated_at || "-"}
                        </Field>
                    </>
                )}
            </div>

        </AppLayout>
    );
}
