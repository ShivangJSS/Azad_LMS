import React from "react";

import { getMediaUrl } from "../../../../shared/utils/mediaUrl";

export default function MCQTranslationForm({
    form,
    readOnly,
    loading,
    languageName,
    onChange,
    onOptionChange,
    onSubmit,
    onCancel,
}) {
    return (
        <form onSubmit={onSubmit} className="rounded-md border border-[#E6D7E8] bg-white w-full p-4">

            {/* Form Body */}

            <div className="flex flex-col gap-2">

                {/* Question Title */}

                <div className="mb-3">
                    <label className="mb-1 block text-[12px] font-medium text-[#344050]">
                        Question Title
                        {!readOnly && (
                            <span className="text-red-500"> *</span>
                        )}
                    </label>

                    <input
                        type="text"
                        name="mcq_question_title"
                        value={form.mcq_question_title || ""}
                        onChange={onChange}
                        readOnly={readOnly}
                        className={`h-[32px] w-full rounded border border-[#CED4DA] px-2 text-[12px]
                        ${readOnly
                                ? "bg-[#EEF4FB] text-[#5E6E82]"
                                : "bg-white"
                            }`}
                    />
                </div>

                {/* Description */}

                <div className="mb-3">
                    <label className="mb-1 block text-[12px] font-medium text-[#344050]">
                        Question Description
                    </label>

                    <textarea
                        rows={3}
                        name="mcq_question_description"
                        value={form.mcq_question_description || ""}
                        onChange={onChange}
                        readOnly={readOnly}
                        className={`w-full rounded border border-[#CED4DA] px-2 py-2 text-[12px]
                        ${readOnly
                                ? "bg-[#EEF4FB] text-[#5E6E82]"
                                : "bg-white"
                            }`}
                    />
                </div>

                {/* Marks */}

                <div className="mb-3">
                    <label className="mb-1 block text-[12px] font-medium text-[#344050]">
                        Marks
                    </label>

                    <input
                        type="number"
                        name="marks"
                        value={form.marks || ""}
                        readOnly={true}
                        className="h-[32px] w-full rounded border border-[#CED4DA] bg-[#EEF4FB] px-2 text-[12px]"
                    />
                </div>

                {/* Image */}

                <div className="mb-3">

                    <label className="mb-2 block text-[12px] font-medium text-[#344050]">
                        Image
                    </label>

                    {form?.image_url ? (

                        <img
                            src={getMediaUrl(form.image_url)}
                            alt="MCQ"
                            className="h-28 w-28 rounded border border-[#CED4DA] object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />

                    ) : (

                        <div className="flex h-20 w-28 items-center justify-center rounded border border-[#CED4DA] bg-[#F8F9FA] text-[11px] text-gray-500">
                            No Image
                        </div>

                    )}

                </div>

                {/* Options */}

                <div className="overflow-hidden rounded border border-[#CED4DA]">

                    <div className="border-b bg-[#F8F9FA] px-3 py-2">

                        <span className="text-[13px] font-semibold text-[#344050]">
                            Options
                        </span>

                    </div>

                    <div className="overflow-x-auto"><table className="w-full border-collapse text-[12px]">

                        <thead>

                            <tr className="bg-[#F8F9FA]">

                                <th className="w-[80px] border border-[#DEE2E6] py-2">
                                    Correct
                                </th>

                                <th className="border border-[#DEE2E6] px-3 text-left">
                                    Option Text
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {(form.options || []).map((option, index) => (

                                <tr key={index}>

                                    <td className="border border-[#DEE2E6] text-center">

                                        <input
                                            type="checkbox"
                                            checked={
                                                option.is_mcq_option_correct === 1
                                            }
                                            disabled={readOnly}
                                            onChange={(e) =>
                                                onOptionChange(
                                                    index,
                                                    "is_mcq_option_correct",
                                                    e.target.checked ? 1 : 0
                                                )
                                            }
                                        />

                                    </td>

                                    <td className="border border-[#DEE2E6]">

                                        <input
                                            type="text"
                                            value={option.mcq_option_text || ""}
                                            readOnly={readOnly}
                                            onChange={(e) =>
                                                onOptionChange(
                                                    index,
                                                    "mcq_option_text",
                                                    e.target.value
                                                )
                                            }
                                            placeholder={
                                                !readOnly
                                                    ? `Option ${index + 1}`
                                                    : ""
                                            }
                                            className={`w-full px-2 py-2 text-[12px] outline-none
                                            ${readOnly
                                                    ? "border-0 bg-[#EEF4FB]"
                                                    : "rounded border border-[#D8E2EF] bg-white focus:border-[#732269]"
                                                }`}
                                        />

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table></div>

                </div>

                {/* Footer */}

                <div className="mt-6 flex items-center justify-between">

                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded border border-[#6C757D] bg-white px-4 py-1 text-[12px]"
                    >
                        Back to List
                    </button>

                    {!readOnly && (

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded bg-[#732269] px-5 py-1 text-[12px] text-white hover:bg-[#5d1b57]"
                        >
                            {loading
                                ? "Saving..."
                                : `Save ${languageName} Translation`}
                        </button>

                    )}

                </div>

            </div>

        </form>
    );
}