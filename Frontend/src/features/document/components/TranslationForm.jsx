import React from "react";

import { getMediaUrl } from "../../../shared/utils/mediaUrl";
import PptViewer from "../../../shared/components/PptViewer";

export default function TranslationForm({
    form,
    readOnly,
    loading,
    saving,
    languageName,
    sourceTitle,
    documentDescription,
    imageUrl,
    fileUrl,
    docType,
    fileLabel,
    onChange,
    onImageChange,
    onMediaChange,
    onSubmit,
    onCancel,
}) {
    const hasImage =
        typeof imageUrl === "string" &&
        imageUrl.trim() !== "";

    const isSaving = loading || saving;

    // PPT (anything that isn't a video or PDF) renders inline in the browser
    // via <PptViewer>, so it previews on localhost and when deployed alike.
    const isPpt =
        docType !== "VIDEO" && docType !== "PDF";

    return (
        <>
            <form
                onSubmit={onSubmit}
                className="w-full rounded-[4px] border border-[#E6D6E4] bg-[#FFF9FE] p-[16px]"
            >
                {/* =====================================================
                    ENGLISH / SOURCE TAB
                ===================================================== */}

                {readOnly ? (
                    <>
                        {/* Document Title */}

                        <div className="mb-4">
                            <label className="mb-2 block text-[11px] font-medium text-[#344050]">
                                Document Title
                            </label>

                            <input
                                type="text"
                                value={sourceTitle || ""}
                                readOnly
                                className="h-[35px] w-full rounded-[4px] border border-[#D8E2EF] bg-[#EDF2F9] px-3 text-[12px] text-[#5E6E82] outline-none"
                            />
                        </div>

                        {/* Document Description */}

                        <div className="mb-4">
                            <label className="mb-2 block text-[11px] font-medium text-[#344050]">
                                Document Description
                            </label>

                            <textarea
                                rows={4}
                                value={documentDescription || ""}
                                readOnly
                                className="w-full resize-none rounded-[4px] border border-[#D8E2EF] bg-[#EDF2F9] px-3 py-2 text-[12px] leading-[20px] text-[#5E6E82] outline-none"
                            />
                        </div>

                        {/* Document File */}

                        <div className="mb-1">
                            <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                                Document {fileLabel}
                            </label>

                            {/* File Name */}

                            {fileUrl && (
                                <div className="mb-1 flex items-center gap-[7px] text-[12px] text-[#344050]">
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#00B074"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>

                                    {sourceTitle}
                                </div>
                            )}

                            {/* Video */}

                            {docType === "VIDEO" && fileUrl && (
                                <video
                                    controls
                                    preload="metadata"
                                    src={fileUrl}
                                    className="mt-1 block h-auto w-[430px] max-w-full rounded-[2px] bg-black"
                                >
                                    Your browser does not support video
                                    playback.
                                </video>
                            )}

                            {/* PDF */}

                            {docType === "PDF" && fileUrl && (
                                <iframe
                                    src={fileUrl}
                                    title={
                                        sourceTitle ||
                                        "Document PDF"
                                    }
                                    className="mt-1 h-[420px] w-full max-w-[760px] rounded border border-[#D8E2EF]"
                                />
                            )}

                            {/* PPT / Other */}

                            {isPpt && fileUrl && (
                                <>
                                    <div className="mt-1 max-w-[760px]">
                                        <PptViewer
                                            fileUrl={fileUrl}
                                            height={420}
                                        />
                                    </div>

                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-flex h-[35px] items-center rounded-[4px] bg-[#7B216F] px-5 text-[12px] font-medium text-white no-underline hover:bg-[#691B60]"
                                    >
                                        Open {fileLabel}
                                    </a>
                                </>
                            )}

                            {!fileUrl && (
                                <p className="text-[11px] text-[#9DA9BB]">
                                    No {fileLabel?.toLowerCase()} is attached.
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    /* =================================================
                       TRANSLATION TAB
                       Hindi / Bangla / Tamil / Other Languages
                    ================================================= */

                    <>
                        {/* Document Title */}

                        <div className="mb-4">
                            <label className="mb-2 block text-[11px] font-medium text-[#344050]">
                                Document Title
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form?.title || ""}
                                onChange={(e) =>
                                    onChange(
                                        "title",
                                        e.target.value
                                    )
                                }
                                required
                                placeholder={`Title in ${languageName}`}
                                className="h-[35px] w-full rounded-[4px] border border-[#D8E2EF] bg-white px-3 text-[12px] text-[#344050] outline-none focus:border-[#7B216F]"
                            />
                        </div>

                        {/* Document Description */}

                        <div className="mb-4">
                            <label className="mb-2 block text-[11px] font-medium text-[#344050]">
                                Document Description
                            </label>

                            <textarea
                                rows={4}
                                name="description"
                                value={form?.description || ""}
                                onChange={(e) =>
                                    onChange(
                                        "description",
                                        e.target.value
                                    )
                                }
                                placeholder={`Description in ${languageName}`}
                                className="w-full resize-none rounded-[4px] border border-[#D8E2EF] bg-white px-3 py-2 text-[12px] leading-[20px] text-[#344050] outline-none focus:border-[#7B216F]"
                            />
                        </div>

                        {/* Document Image */}

                        <div className="mb-4">
                            <label className="mb-2 block text-[11px] font-medium text-[#344050]">
                                Document Image
                            </label>

                            <input
                                type="file"
                                name="image"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) =>
                                    onImageChange(
                                        e.target.files?.[0] || null
                                    )
                                }
                                className="block h-[35px] w-full rounded-[4px] border border-[#D8E2EF] bg-white text-[12px] text-[#344050] file:mr-[10px] file:h-full file:border-0 file:bg-[#344050] file:px-[14px] file:text-[12px] file:font-medium file:text-white"
                            />

                            <p className="mt-1 text-[9px] text-[#7A7A7A]">
                                Accepted formats: JPG, JPEG, PNG, WEBP.
                                Max size: 2MB.
                            </p>
                        </div>

                        {/* Current Image */}

                        {hasImage && (
                            <div className="mb-4">
                                <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                                    Current {languageName} Image
                                </label>

                                <img
                                    src={getMediaUrl(imageUrl)}
                                    alt={`Current ${languageName}`}
                                    className="h-[100px] w-[100px] rounded border border-[#CED4DA] bg-white object-contain p-1"
                                    onError={(e) => {
                                        e.currentTarget.style.display =
                                            "none";
                                    }}
                                />

                                <p className="mt-1 text-[9px] text-[#7A7A7A]">
                                    Upload a new image to replace the
                                    current image.
                                </p>
                            </div>
                        )}

                        {/* Upload Media */}

                        <div className="mb-1">
                            <label className="mb-2 block text-[11px] font-medium text-[#344050]">
                                Upload {fileLabel}
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            {/* Existing File */}

                            {fileUrl && (
                                <>
                                    <div className="mb-1 flex items-center gap-[7px] text-[11px] text-[#344050]">
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#00B074"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>

                                        {sourceTitle}
                                    </div>

                                    {/* Existing Video */}

                                    {docType === "VIDEO" && (
                                        <video
                                            controls
                                            preload="metadata"
                                            src={fileUrl}
                                            className="mb-2 block h-auto w-[430px] max-w-full rounded-[2px] bg-black"
                                        >
                                            Your browser does not support
                                            video playback.
                                        </video>
                                    )}

                                    {/* Existing PDF */}

                                    {docType === "PDF" && (
                                        <iframe
                                            src={fileUrl}
                                            title={
                                                sourceTitle ||
                                                "Document PDF"
                                            }
                                            className="mb-2 h-[420px] w-full max-w-[760px] rounded border border-[#D8E2EF]"
                                        />
                                    )}

                                    {/* Existing PPT */}

                                    {isPpt && (
                                        <div className="mb-2 max-w-[760px]">
                                            <PptViewer
                                                fileUrl={fileUrl}
                                                height={420}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {fileUrl && (
                                <p className="mb-1 text-[9px] text-[#7A7A7A]">
                                    Current file (upload new to replace)
                                </p>
                            )}

                            {/* New File */}

                            <input
                                type="file"
                                name="media_file"
                                required={!fileUrl}
                                accept={
                                    docType === "VIDEO"
                                        ? "video/*"
                                        : docType === "PDF"
                                            ? "application/pdf"
                                            : ".ppt,.pptx"
                                }
                                onChange={(e) =>
                                    onMediaChange(
                                        e.target.files?.[0] || null
                                    )
                                }
                                className="block h-[35px] w-full rounded-[4px] border border-[#D8E2EF] bg-white text-[12px] text-[#344050] file:mr-[10px] file:h-full file:border-0 file:bg-[#344050] file:px-[14px] file:text-[12px] file:font-medium file:text-white"
                            />
                        </div>

                        {/* =================================================
                            SAVE TRANSLATION
                        ================================================= */}

                        <div className="mt-5 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="rounded-[3px] bg-[#7B216F] px-5 py-[7px] text-[11px] font-medium text-white hover:bg-[#691B60] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving
                                    ? "Saving..."
                                    : `Save ${languageName} Translation`}
                            </button>
                        </div>
                    </>
                )}
            </form>

            {/* =========================================================
                BACK TO LIST
            ========================================================= */}

            <div className="mt-3 flex justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="rounded border border-[#6C757D] bg-white px-4 py-1 text-[11px] text-[#344050] hover:bg-[#F8F9FA] disabled:opacity-60"
                >
                    Back to List
                </button>
            </div>
        </>
    );
}