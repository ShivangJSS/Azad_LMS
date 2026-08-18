import { FiTrash2 } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";

    // Local preview
    if (imageUrl.startsWith("blob:")) {
        return imageUrl;
    }

    // Already complete URL
    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    // Backend relative path (strip legacy "app/" prefix + leading slashes)
    return `${API_URL}/${imageUrl.replace(/^app\//, "").replace(/^\/+/, "")}`;
};

export default function MCQForm({
    form,
    loading,
    submitLabel = "Create MCQ",
    onChange,
    onImageChange,
    onOptionChange,
    onAddOption,
    onDeleteOption,
    onSubmit,
    onCancel,
}) {
    return (
        <form
            onSubmit={onSubmit}
            className="overflow-hidden rounded-[4px] border border-[#D8E2EF] bg-white"
        >
            {/* Header */}

            <div className="border-b border-[#D8E2EF] px-4 py-3">
                <span className="text-[20px] font-medium text-[#344050]">
                    {submitLabel}
                </span>
            </div>

            {/* Body */}

            <div className="space-y-4 p-4">

                {/* Language */}

                <div>
                    <label className="mb-1 block text-[13px] text-[#344050]">
                        Language{" "}
                        <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        readOnly
                        value="English"
                        className="h-[38px] w-full rounded-[3px] border border-[#D8E2EF] bg-[#EEF4FB] px-3 text-[14px]"
                    />
                </div>

                {/* Question Title */}

                <div>
                    <label className="mb-1 block text-[13px] text-[#344050]">
                        Question Title{" "}
                        <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        name="mcq_question_title"
                        value={
                            form.mcq_question_title || ""
                        }
                        onChange={onChange}
                        className="h-[38px] w-full rounded-[3px] border border-[#D8E2EF] px-3 text-[14px] outline-none"
                    />
                </div>

                {/* Description */}

                <div>
                    <label className="mb-1 block text-[13px] text-[#344050]">
                        Question Description
                    </label>

                    <textarea
                        name="mcq_question_description"
                        value={
                            form.mcq_question_description || ""
                        }
                        onChange={onChange}
                        rows={4}
                        className="w-full rounded-[3px] border border-[#D8E2EF] p-3 text-[14px] outline-none"
                    />
                </div>

                {/* Image */}

                <div>
                    <label className="mb-1 block text-[13px] text-[#344050]">
                        Question Image
                    </label>

                    {(form.image_preview_url || form.image_url) && (
                        <img
                            src={getImageUrl(
                                form.image_preview_url ||
                                    form.image_url
                            )}
                            alt="Question Preview"
                            className="mb-2 h-28 w-28 rounded border object-contain"
                        />
                    )}

                    <input
                        onChange={onImageChange}
                        type="file"
                        name="image"
                        accept="image/*"
                        className="
                            block
                            h-[35px]
                            w-full
                            rounded-[3px]
                            border
                            border-[#D8E2EF]
                            bg-white
                            text-[13px]
                            text-[#344050]

                            file:mr-[12px]
                            file:h-full
                            file:border-0
                            file:bg-[#344050]
                            file:px-[14px]
                            file:text-[13px]
                            file:font-medium
                            file:text-white
                        "
                    />
                </div>

                {/* Marks */}

                <div>
                    <label className="mb-1 block text-[13px] text-[#344050]">
                        Marks{" "}
                        <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="number"
                        name="marks"
                        value={form.marks ?? ""}
                        onChange={onChange}
                        className="h-[38px] w-full rounded-[3px] border border-[#D8E2EF] px-3 text-[14px] outline-none"
                    />
                </div>

                {/* Status */}

                <div>
                    <label className="mb-1 block text-[13px] text-[#344050]">
                        Status{" "}
                        <span className="text-red-500">*</span>
                    </label>

                    <select
                        name="status"
                        value={form.status ?? 1}
                        onChange={onChange}
                        className="h-[38px] w-full rounded-[3px] border border-[#D8E2EF] px-3 text-[14px]"
                    >
                        <option value="">
                            Please select a Status
                        </option>

                        <option value="1">
                            Active
                        </option>

                        <option value="0">
                            Inactive
                        </option>
                    </select>
                </div>

            </div>

            {/* Options */}

            <div className="mx-4 mb-4 overflow-hidden rounded-[3px] border border-[#D8E2EF]">

                <div className="flex items-center justify-between border-b border-[#D8E2EF] bg-white px-4 py-3">

                    <h3 className="text-[16px] font-medium text-[#344050]">
                        MCQ Options{" "}
                        <span className="text-red-500">
                            *
                        </span>
                    </h3>

                    <button
                        type="button"
                        onClick={onAddOption}
                        className="rounded-[3px] bg-[#7B216F] px-3 py-1 text-[13px] font-medium text-white hover:bg-[#6A1C60]"
                    >
                        + Add Option
                    </button>

                </div>

                <div className="overflow-x-auto"><table className="w-full border-collapse">

                    <thead>

                        <tr className="bg-white">

                            <th className="w-[90px] border border-[#E3E6ED] py-3 text-center text-[13px] font-medium">
                                Correct
                            </th>

                            <th className="border border-[#E3E6ED] px-4 text-left text-[13px] font-medium">
                                Option Text{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </th>

                            <th className="w-[90px] border border-[#E3E6ED] text-center text-[13px] font-medium">
                                Delete
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {(form.options || []).map(
                            (item, index) => (

                                <tr
                                    key={
                                        item.mcq_option_id ??
                                        index
                                    }
                                >

                                    {/* Correct */}

                                    <td className="border border-[#E3E6ED] text-center">

                                        <input
                                            type="checkbox"
                                            checked={
                                                Number(
                                                    item.is_mcq_option_correct
                                                ) === 1
                                            }
                                            onChange={() =>
                                                onOptionChange(
                                                    index,
                                                    "is_mcq_option_correct",
                                                    Number(
                                                        item.is_mcq_option_correct
                                                    ) === 1
                                                        ? 0
                                                        : 1
                                                )
                                            }
                                        />

                                    </td>

                                    {/* Text */}

                                    <td className="border border-[#E3E6ED] p-2">

                                        <input
                                            type="text"
                                            value={
                                                item.mcq_option_text ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                onOptionChange(
                                                    index,
                                                    "mcq_option_text",
                                                    e.target.value
                                                )
                                            }
                                            className="h-[36px] w-full border-0 px-2 text-[13px] outline-none"
                                        />

                                    </td>

                                    {/* Delete */}

                                    <td className="border border-[#E3E6ED] text-center">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onDeleteOption(
                                                    index
                                                )
                                            }
                                            className="p-2"
                                        >
                                            <FiTrash2 className="mx-auto text-red-500" />
                                        </button>

                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table></div>

            </div>

            {/* Footer */}

            <div className="flex items-center gap-2 px-4 pb-4">

                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-[3px] border border-[#344050] bg-white px-5 py-2 text-[13px]"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-[3px] bg-[#7B216F] px-5 py-2 text-[13px] font-medium text-white disabled:opacity-60"
                >
                    {loading
                        ? "Saving..."
                        : submitLabel}
                </button>

            </div>

        </form>
    );
}