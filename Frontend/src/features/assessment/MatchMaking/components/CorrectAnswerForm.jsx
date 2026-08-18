import React from "react";

export default function CorrectAnswerForm({
    formData,
    leftItems = [],
    rightItems = [],
    languages = [],
    loading = false,
    onChange,
    onSubmit,
    onCancel,
}) {
    const leftFields = [
        {
            name: "left_item_1",
            label: "Left Item 1",
            required: true,
        },
        {
            name: "left_item_2",
            label: "Left Item 2",
            required: true,
        },
        {
            name: "left_item_3",
            label: "Left Item 3",
            required: true,
        },
        {
            name: "left_item_4",
            label: "Left Item 4",
            required: false,
        },
        {
            name: "left_item_5",
            label: "Left Item 5",
            required: false,
        },
    ];

    const rightFields = [
        {
            name: "right_item_1",
            label: "Right Item 1",
            required: true,
        },
        {
            name: "right_item_2",
            label: "Right Item 2",
            required: true,
        },
        {
            name: "right_item_3",
            label: "Right Item 3",
            required: true,
        },
        {
            name: "right_item_4",
            label: "Right Item 4",
            required: false,
        },
        {
            name: "right_item_5",
            label: "Right Item 5",
            required: false,
        },
    ];

    return (
        <form
            onSubmit={onSubmit}
            className="w-full rounded-md border border-[#D8E2EF] bg-white"
        >
            {/* HEADER */}

            <div className="border-b border-[#E1E5EA] px-4 py-3">
                <h2 className="text-[15px] font-semibold text-[#344050]">
                    Add Correct Answers for:{" "}
                    <span className="font-bold">
                        {formData?.questionTitle || "demo"}
                    </span>
                </h2>

                <p className="mt-1 text-[10px] text-[#6C7A89]">
                    Select the correct matching items.
                </p>
            </div>

            {/* BODY */}

            <div className="p-4">

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">

                    {leftFields.map((leftField, index) => {
                        const rightField =
                            rightFields[index];

                        return (
                            <React.Fragment
                                key={leftField.name}
                            >
                                {/* LEFT ITEM */}

                                <div>
                                    <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                                        {leftField.label}

                                        {leftField.required && (
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        )}
                                    </label>

                                    <select
                                        name={leftField.name}
                                        value={
                                            formData?.[
                                            leftField.name
                                            ] || ""
                                        }
                                        onChange={onChange}
                                        disabled={
                                            loading
                                        }
                                        className="h-[28px] w-full rounded border border-[#CED4DA] bg-white px-2 text-[11px] text-[#344050] outline-none focus:border-[#732269] disabled:bg-[#EEF4FB]"
                                    >
                                        <option value="">
                                            -- Select Left Item --
                                        </option>

                                        {leftItems.map(
                                            (item) => (
                                                <option
                                                    key={
                                                        item.match_left_id
                                                    }
                                                    value={
                                                        item.match_left_id
                                                    }
                                                >
                                                    {
                                                        item.match_left_text
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* RIGHT ITEM */}

                                <div>
                                    <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                                        {
                                            rightField.label
                                        }

                                        {rightField.required && (
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        )}
                                    </label>

                                    <select
                                        name={
                                            rightField.name
                                        }
                                        value={
                                            formData?.[
                                            rightField.name
                                            ] || ""
                                        }
                                        onChange={onChange}
                                        disabled={
                                            loading
                                        }
                                        className="h-[28px] w-full rounded border border-[#CED4DA] bg-white px-2 text-[11px] text-[#344050] outline-none focus:border-[#732269] disabled:bg-[#EEF4FB]"
                                    >
                                        <option value="">
                                            -- Select Right Item --
                                        </option>

                                        {rightItems.map(
                                            (item) => (
                                                <option
                                                    key={
                                                        item.match_right_id
                                                    }
                                                    value={
                                                        item.match_right_id
                                                    }
                                                >
                                                    {
                                                        item.match_right_text
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* SORT ORDER */}

                <div className="mt-4">
                    <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                        Sort Order
                    </label>

                    <select
                        name="sort_order"
                        value={
                            formData?.sort_order ||
                            "asc"
                        }
                        onChange={onChange}
                        disabled={loading}
                        className="h-[28px] w-full rounded border border-[#CED4DA] bg-white px-2 text-[11px] text-[#344050] outline-none focus:border-[#732269]"
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

                <div className="mt-4">
                    <label className="mb-1 block text-[11px] font-medium text-[#344050]">
                        Language
                    </label>

                    <select
                        name="language_id"
                        value={
                            formData?.language_id || 1
                        }
                        onChange={onChange}
                        disabled={loading}
                        className="h-[28px] w-full rounded border border-[#CED4DA] bg-white px-2 text-[11px] text-[#344050] outline-none focus:border-[#732269]"
                    >
                        {languages.length > 0 ? (
                            languages.map(
                                (language) => (
                                    <option
                                        key={
                                            language.language_id
                                        }
                                        value={
                                            language.language_id
                                        }
                                    >
                                        {
                                            language.language_name
                                        }
                                    </option>
                                )
                            )
                        ) : (
                            <>
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
                            </>
                        )}
                    </select>
                </div>
            </div>

            {/* FOOTER */}

            <div className="flex items-center justify-between border-t border-[#E1E5EA] px-4 py-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="rounded border border-[#6C757D] bg-white px-4 py-1.5 text-[11px] text-[#344050] hover:bg-[#F8F9FA] disabled:opacity-60"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-[#732269] px-5 py-1.5 text-[11px] font-medium text-white hover:bg-[#5D1B57] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading
                        ? "Saving..."
                        : "Save Correct Answers"}
                </button>
            </div>
        </form>
    );
}