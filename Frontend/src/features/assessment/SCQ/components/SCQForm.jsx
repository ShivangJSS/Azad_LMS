import { FiPlus, FiTrash2 } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";

    // Temporary local preview.
    if (imageUrl.startsWith("blob:")) {
        return imageUrl;
    }

    // Already an absolute URL.
    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    // Backend relative path (strip legacy "app/" prefix + leading slashes)
    return `${API_URL}/${imageUrl.replace(/^app\//, "").replace(/^\/+/, "")}`;
};

export default function SCQForm({
    form,
    loading,
    submitLabel,

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
            className="rounded-md border border-[#D8E2EF] bg-white p-4"
        >
            {/* Basic Details */}

            <div className="space-y-4">

                {/* Language */}

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Language <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        value="English"
                        readOnly
                        className="h-10 w-full rounded border bg-[#EEF4FB] px-3"
                    />
                </div>

                {/* Question Title */}

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Question Title <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="text"
                        name="scq_question_title"
                        value={form.scq_question_title}
                        onChange={onChange}
                        className="h-10 w-full rounded border px-3"
                    />
                </div>

                {/* Description */}

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Question Description
                    </label>

                    <textarea
                        rows={4}
                        name="scq_question_description"
                        value={form.scq_question_description}
                        onChange={onChange}
                        className="w-full rounded border px-3 py-2"
                    />
                </div>

                {/* Image */}

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Question Image
                    </label>

                    <input onChange={onImageChange} type="file" name="image" accept="image/*" className="block h-[35px] w-full rounded-[3px] border border-[#D8E2EF] bg-white text-[13px] text-[#344050] file:mr-[12px] file:h-full file:border-0 file:bg-[#344050] file:px-[14px] file:text-[13px] file:font-medium file:text-white" />

                    {(form.image_preview_url || form.image_url) && (
                        <img
                            src={getImageUrl(
                                form.image_preview_url ||
                                    form.image_url
                            )}
                            alt=""
                            className="mt-3 h-28 w-28 rounded border object-cover"
                        />
                    )}
                </div>

                {/* Marks */}

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Marks <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="number"
                        name="marks"
                        value={form.marks}
                        onChange={onChange}
                        className="h-10 w-full rounded border px-3"
                    />
                </div>

                {/* Status */}

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Status <span className="text-red-500">*</span>
                    </label>

                    <select
                        name="status"
                        value={form.status}
                        onChange={onChange}
                        className="h-10 w-full rounded border px-3"
                    >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                    </select>
                </div>
            </div>

            {/* Options */}

            <div className="mt-8 rounded border">

                <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">

                    <span className="font-semibold">
                        SCQ Options
                        <span className="text-red-500"> *</span>
                    </span>

                    <button
                        type="button"
                        onClick={onAddOption}
                        className="flex items-center gap-2 rounded bg-[#732269] px-3 py-2 text-sm text-white"
                    >
                        <FiPlus />

                        Add Option
                    </button>

                </div>

                <div className="overflow-x-auto"><table className="w-full border-collapse">

                    <thead>

                        <tr>

                            <th className="w-24 border p-2">
                                Correct
                            </th>

                            <th className="border p-2 text-left">
                                Option Text
                            </th>

                            <th className="w-24 border p-2">
                                Remove
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {form.options.map((option, index) => (

                            <tr key={index}>

                                <td className="border text-center">

                                    <input
                                        type="radio"
                                        name="correctOption"
                                        checked={
                                            option.is_scq_option_correct === 1
                                        }
                                        onChange={() =>
                                            onOptionChange(
                                                index,
                                                "is_scq_option_correct",
                                                1
                                            )
                                        }
                                    />

                                </td>

                                <td className="border">

                                    <input
                                        type="text"
                                        value={option.scq_option_text}
                                        onChange={(e) =>
                                            onOptionChange(
                                                index,
                                                "scq_option_text",
                                                e.target.value
                                            )
                                        }
                                        className="w-full border-0 px-3 py-2 outline-none"
                                    />

                                </td>

                                <td className="border text-center">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDeleteOption(index)
                                        }
                                        className="text-red-600"
                                    >
                                        <FiTrash2 />
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table></div>

            </div>

            {/* Footer */}

            <div className="mt-6 flex justify-start gap-2 items-center">

                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded border px-5 py-2"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-[#732269] px-6 py-2 text-white"
                >
                    {loading ? "Saving..." : submitLabel}
                </button>

            </div>

        </form>
    );
}