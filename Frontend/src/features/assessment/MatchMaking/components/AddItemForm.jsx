import React from "react";

export default function AddItemForm({
    type = "left",
    formData,
    loading,
    onChange,
    onSubmit,
    onCancel,
    questionTitle = "demo",
}) {
    const isLeft = type === "left";

    const itemPrefix = isLeft
        ? "Left Item"
        : "Right Item";

    const buttonText = isLeft
        ? "Save Left Items"
        : "Save Right Items";

    const fieldPrefix = isLeft
        ? "left_item"
        : "right_item";

    const items = [
        { id: 1, required: true },
        { id: 2, required: true },
        { id: 3, required: true },
        { id: 4, required: false },
        { id: 5, required: false },
    ];

    return (
        <form
            onSubmit={onSubmit}
            className="w-full overflow-hidden rounded-md border border-[#D8E2EF] bg-white"
        >
            {/* HEADER */}
            <div className="border-b border-[#DEE2E6] px-4 py-3">
                <span className="text-[15px] font-semibold text-[#344050]">
                    Add {itemPrefix} for: {questionTitle}
                </span>
            </div>

            {/* FORM BODY */}
            <div className="space-y-4 p-4">
                {items.map((item) => (
                    <div key={item.id}>
                        <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                            {itemPrefix} {item.id}
                            {item.required && (
                                <span className="ml-1 text-red-500">*</span>
                            )}
                        </label>
                        <input
                            type="text"
                            name={`${fieldPrefix}_${item.id}`}
                            value={formData?.[`${fieldPrefix}_${item.id}`] || ""}
                            onChange={onChange}
                            placeholder={`Enter ${itemPrefix.toLowerCase()} ${item.id}`}
                            className="h-[34px] w-full rounded border border-[#CED4DA] px-3 text-[12px] text-[#344050] outline-none focus:border-[#732269]"
                        />
                    </div>
                ))}

                {/* SORT ORDER */}

                <div>
                    <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                        Sort Order
                    </label>

                    <select
                        name="sort_order"
                        value={formData?.sort_order || "asc"}
                        onChange={onChange}
                        className="h-[34px] w-full rounded border border-[#CED4DA] bg-white px-3 text-[12px] text-[#344050] outline-none focus:border-[#732269]"
                    >
                        <option value="asc">
                            Ascending
                        </option>

                        <option value="desc">
                            Descending
                        </option>
                    </select>
                </div>


                {/* LANGUAGE */}

                <div>
                    <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                        Language
                    </label>

                    <select
                        name="language_id"
                        value={formData?.language_id ?? 1}
                        onChange={onChange}
                        className="h-[34px] w-full rounded border border-[#CED4DA] bg-white px-3 text-[12px] text-[#344050] outline-none focus:border-[#732269]"
                    >
                        <option value={1}>
                            English
                        </option>

                        <option value={2}>
                            Hindi
                        </option>

                        <option value={3}>
                            Bangla
                        </option>

                        <option value={4}>
                            Tamil
                        </option>
                    </select>
                </div>

            </div>


            {/* FOOTER */}

            <div className="flex items-center gap-1 border-t border-[#DEE2E6] px-4 py-3">

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded border border-[#732269] bg-[#732269] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#5D1B57] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Saving..." : buttonText}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded border border-[#6C757D] bg-white px-3 py-1.5 text-[11px] text-[#344050] hover:bg-[#F8F9FA] disabled:opacity-60"
                >
                    Cancel
                </button>

            </div>

        </form>
    );
}