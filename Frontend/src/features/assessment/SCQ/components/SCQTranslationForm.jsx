import React from "react";

import { getMediaUrl } from "../../../../shared/utils/mediaUrl";

export default function SCQTranslationForm({
    form,
    readOnly,
    loading,
    languageName,
    onChange,
    onOptionChange,
    onSubmit,
    onCancel,
}) {

    const options = form?.options || [];

    return (
        <form onSubmit={onSubmit}>

            <div className="flex flex-col gap-2 p-4">

                {/* Question Title */}

                <div className="mb-3">

                    <label className="mb-1 block text-[12px] font-medium text-[#344050]">

                        Question Title

                        {!readOnly && (
                            <span className="text-red-500">
                                {" "}*
                            </span>
                        )}

                    </label>

                    <input
                        type="text"
                        name="scq_question_title"
                        value={
                            form?.scq_question_title ?? ""
                        }
                        onChange={onChange}
                        readOnly={readOnly}
                        placeholder={
                            !readOnly
                                ? "Enter question title"
                                : ""
                        }
                        className={`h-[32px] w-full rounded border border-[#CED4DA] px-2 text-[12px] outline-none
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
                        name="scq_question_description"
                        value={
                            form?.scq_question_description ?? ""
                        }
                        onChange={onChange}
                        readOnly={readOnly}
                        placeholder={
                            !readOnly
                                ? "Enter question description"
                                : ""
                        }
                        className={`w-full rounded border border-[#CED4DA] px-2 py-2 text-[12px] outline-none
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
                        value={
                            form?.marks ?? ""
                        }
                        readOnly
                        className="h-[32px] w-full rounded border border-[#CED4DA] bg-[#EEF4FB] px-2 text-[12px] text-[#5E6E82]"
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
                            alt="SCQ"
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

                                <th className="w-[80px] border border-[#DEE2E6] py-2 text-center">
                                    Correct
                                </th>

                                <th className="border border-[#DEE2E6] px-3 text-left">
                                    Option Text
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {options.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={2}
                                        className="border border-[#DEE2E6] py-4 text-center text-[12px] text-gray-500"
                                    >
                                        No options available.
                                    </td>

                                </tr>

                            ) : (

                                options.map(
                                    (option, index) => {

                                        const isCorrect =
                                            Number(
                                                option?.is_scq_option_correct ??
                                                0
                                            ) === 1;


                                        return (

                                            <tr
                                                key={
                                                    option?.scq_option_id ??
                                                    index
                                                }
                                            >

                                                <td className="border border-[#DEE2E6] text-center">

                                                    <input
                                                        type="checkbox"
                                                        name="correct_option"
                                                        checked={
                                                            isCorrect
                                                        }
                                                        disabled={readOnly}
                                                        onChange={() =>
                                                            onOptionChange(
                                                                index,
                                                                "is_scq_option_correct",
                                                                1
                                                            )
                                                        }
                                                    />

                                                </td>


                                                <td className="border border-[#DEE2E6]">

                                                    <input
                                                        type="text"
                                                        value={
                                                            option?.scq_option_text ??
                                                            ""
                                                        }
                                                        readOnly={
                                                            readOnly
                                                        }
                                                        onChange={(e) =>
                                                            onOptionChange(
                                                                index,
                                                                "scq_option_text",
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
                                                                ? "border-0 bg-[#EEF4FB] text-[#5E6E82]"
                                                                : "rounded border border-[#D8E2EF] bg-white focus:border-[#732269]"
                                                            }`}
                                                    />

                                                </td>

                                            </tr>

                                        );

                                    }
                                )

                            )}

                        </tbody>

                    </table></div>

                </div>


                {/* Footer */}

                <div className="mt-6 flex items-center justify-between">

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded border border-[#6C757D] bg-white px-4 py-1 text-[12px] disabled:opacity-60"
                    >
                        Back to List
                    </button>


                    {!readOnly && (

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                options.length === 0
                            }
                            className="rounded bg-[#732269] px-5 py-1 text-[12px] text-white hover:bg-[#5d1b57] disabled:cursor-not-allowed disabled:opacity-60"
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