import React from "react";

import { getMediaUrl } from "../../../../shared/utils/mediaUrl";

export default function MatchMakingTranslationForm({
    form,
    readOnly,
    loading,
    languageName,
    onChange,
    onImageChange,
    onSubmit,
    onCancel,
}) {
    const hasImage =
        typeof form?.image_url === "string" &&
        form.image_url.trim() !== "";

    return (
        <form onSubmit={onSubmit} className="w-full rounded-md border border-[#E6D7E8] bg-white p-3">

            {/* Question Title */}

            <div className="mb-3">
                <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                    Question Title
                    {!readOnly && (
                        <span className="ml-1 text-red-500">*</span>
                    )}
                </label>

                <input
                    type="text"
                    name="match_making_question_title"
                    value={form?.match_making_question_title || ""}
                    onChange={onChange}
                    readOnly={readOnly}
                    placeholder={!readOnly ? "Enter question title" : ""}
                    className={`h-[32px] w-full rounded border border-[#CED4DA] px-2 text-[12px] outline-none ${readOnly ? "bg-[#EEF4FB] text-[#5E6E82]" : "bg-white text-[#344050]"}`}
                />
            </div>

            {/* Question Description */}

            <div className="mb-3">
                <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                    Question Description
                </label>

                <textarea
                    rows={3}
                    name="match_making_question_description"
                    value={form?.match_making_question_description || ""}
                    onChange={onChange}
                    readOnly={readOnly}
                    placeholder={!readOnly ? "Enter question description" : ""}
                    className={`w-full resize-none rounded border border-[#CED4DA] px-2 py-2 text-[12px] outline-none ${readOnly ? "bg-[#EEF4FB] text-[#5E6E82]" : "bg-white text-[#344050]"}`}
                />
            </div>

            {/* Marks */}

            <div className="mb-3">
                <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                    Marks
                </label>

                <input
                    type="text"
                    value={form?.marks ?? ""}
                    readOnly
                    className="h-[32px] w-full rounded border border-[#CED4DA] bg-[#EEF4FB] px-2 text-[12px] text-[#5E6E82] outline-none"
                />
            </div>

            {/* English Image View */}

            {readOnly && (
                <div className="mb-3">
                    <label className="mb-2 block text-[11px] font-medium text-[#344050]">
                        Image
                    </label>

                    {hasImage ? (
                        <img
                            src={getMediaUrl(form.image_url)}
                            alt="Match Making"
                            className="h-[112px] w-[112px] rounded border border-[#CED4DA] bg-white object-contain p-1"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        <div className="flex h-[80px] w-[112px] items-center justify-center rounded border border-[#CED4DA] bg-[#F8F9FA] text-[11px] text-gray-500">
                            No Image
                        </div>
                    )}
                </div>
            )}

            {/* Other Language Image */}

            {!readOnly && (
                <>
                    {/* Choose File */}

                    <div className="mb-3">
                        <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                            Question Image
                        </label>

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={onImageChange}
                            className="block h-[35px] w-full rounded border border-[#D8E2EF] bg-white text-[13px] text-[#344050] file:mr-[12px] file:h-full file:border-0 file:bg-[#344050] file:px-[14px] file:text-[13px] file:font-medium file:text-white"
                        />

                        <p className="mt-1 text-[9px] text-[#7A7A7A]">
                            Accepted formats: JPG, JPEG, PNG, WEBP. Max size: 2MB.
                        </p>
                    </div>

                    {/* Existing Image */}

                    {hasImage && (
                        <div className="mb-3">
                            <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                                Current {languageName} Image:
                            </label>

                            <img
                                src={getMediaUrl(form.image_url)}
                                alt={`Current ${languageName}`}
                                className="h-[100px] w-[100px] rounded border border-[#CED4DA] bg-white object-contain p-1"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />

                            <p className="mt-1 text-[9px] text-[#7A7A7A]">
                                Upload a new image to replace the current image.
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Footer */}

            <div className="mt-4 flex items-center justify-between border-t border-[#E9ECEF] pt-3">

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded border border-[#6C757D] bg-white px-4 py-1 text-[11px] text-[#344050] hover:bg-[#F8F9FA] disabled:opacity-60"
                >
                    Back to List
                </button>

                {!readOnly && (
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded bg-[#732269] px-5 py-1 text-[11px] text-white hover:bg-[#5D1B57] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Saving..."
                            : `Save ${languageName} Translation`}
                    </button>
                )}

            </div>

        </form>
    );
}