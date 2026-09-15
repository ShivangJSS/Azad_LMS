import { FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";

export default function TopicForm({
    title = "Create Topic",
    submitText = "Submit",
    showAddMore = true,
    moduleId = "",
    modules = [],
    topics = [],
    onModuleChange,
    onTopicChange,
    onAddMore,
    onRemove,
    onSubmit,
    onCancel,
    loading = false,
}) {
    return (
        <form
            onSubmit={onSubmit}
            className="overflow-hidden rounded-[7px] border-2 border-[#D8E2EF] bg-white"
        >
            {/* ================= HEADER ================= */}

            <div className="border-b border-[#D8E2EF] px-[22px] py-[18px]">
                <span className="m-0 text-[20px] font-medium text-[#344050]">
                    {title}
                </span>
            </div>

            {/* ================= FORM BODY ================= */}

            <div className="px-[22px] py-[24px]">

                {/* ================= MODULE + LANGUAGE ================= */}

                <div className="mb-[20px] grid grid-cols-1 gap-[34px] lg:grid-cols-2">

                    {/* Module */}

                    <div>
                        <label className="mb-[8px] block text-[14px] font-medium text-[#344050]">
                            Module
                            <span className="ml-1 text-[#E63757]">*</span>
                        </label>

                        <select
                            value={moduleId}
                            onChange={(e) => onModuleChange(e.target.value)}
                            className="h-[35px] w-full rounded-[4px] border border-[#D8E2EF] bg-white px-[12px] text-[14px] text-[#344050] outline-none focus:border-[#7B216F]"
                        >
                            <option value="">
                                Select Module
                            </option>

                            {modules.map((module) => (
                                <option
                                    key={module.id}
                                    value={module.id}
                                >
                                    {module.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Language */}

                    <div>
                        <label className="mb-[8px] block text-[14px] font-medium text-[#344050]">
                            Language
                            <span className="ml-1 text-[#E63757]">*</span>
                        </label>

                        <input
                            type="text"
                            value="English"
                            disabled
                            className="h-[35px] w-full rounded-[4px] border border-[#D8E2EF] bg-[#EDF2F8] px-[12px] text-[14px] text-[#344050] outline-none"
                        />
                    </div>
                </div>

                {/* ================= TOPIC ROWS ================= */}

                <div className="flex flex-col gap-[20px]">

                    {topics.map((topic, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 items-end gap-[34px] lg:grid-cols-[1fr_1fr_225px]"
                        >

                            {/* Topic Name */}

                            <div>
                                <label className="mb-[8px] block text-[14px] font-medium text-[#344050]">
                                    Topic Name
                                    <span className="ml-1 text-[#E63757]">*</span>
                                </label>

                                <input
                                    type="text"
                                    value={topic.topic_name}
                                    placeholder="Enter Topic Name"
                                    onChange={(e) =>
                                        onTopicChange(
                                            index,
                                            "topic_name",
                                            e.target.value,
                                        )
                                    }
                                    className="h-[35px] w-full rounded-[4px] border border-[#D8E2EF] bg-white px-[12px] text-[14px] text-[#344050] placeholder:text-[#AAB7CB] outline-none focus:border-[#7B216F]"
                                />
                            </div>

                            {/* Status */}

                            <div>
                                <label className="mb-[8px] block text-[14px] font-medium text-[#344050]">
                                    Status
                                    <span className="ml-1 text-[#E63757]">*</span>
                                </label>

                                <select
                                    value={topic.status}
                                    onChange={(e) =>
                                        onTopicChange(
                                            index,
                                            "status",
                                            e.target.value,
                                        )
                                    }
                                    className="h-[35px] w-full rounded-[4px] border border-[#D8E2EF] bg-white px-[12px] text-[14px] text-[#344050] outline-none focus:border-[#7B216F]"
                                >
                                    <option value="1">
                                        Active
                                    </option>

                                    <option value="0">
                                        Inactive
                                    </option>
                                </select>
                            </div>

                            {/* Add / Remove Button */}

                            {showAddMore && (
                                <div>
                                    {index === 0 ? (
                                        <button
                                            type="button"
                                            onClick={onAddMore}
                                            className="flex h-[35px] w-full items-center justify-center gap-[7px] rounded-[4px] border border-[#7B216F] bg-white text-[14px] font-medium text-[#7B216F]"
                                        >
                                            <FiPlus size={17} />
                                            Add More
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => onRemove(index)}
                                            className="flex h-[35px] w-full items-center justify-center gap-[7px] rounded-[4px] border border-[#E63757] bg-white text-[14px] font-medium text-[#E63757]"
                                        >
                                            <FiTrash2 size={15} />
                                            Remove
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* ================= FOOTER ================= */}
                <div className="mt-[34px] flex flex-col-reverse gap-2 border-t border-[#D8E2EF] pt-[15px] sm:flex-row sm:justify-end sm:gap-[10px]">


                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex h-[35px] w-full items-center justify-center gap-[7px] !rounded-sm border-2 border-[#344050] bg-white text-[14px] font-medium text-[#344050] hover:bg-[#F8F9FA] sm:w-[140px]"
                    >
                        <FiX size={16} />

                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex h-[35px] w-[200px] items-center justify-center gap-1 text-[2px] !rounded-sm border-2 border-[#7B216F] bg-[#7B216F] !text-white hover:bg-[#691B60] disabled:cursor-not-allowed disabled:opacity-50 sm:w-40"
                    >
                        <FiSave size={15} />

                        {loading ? "Please wait..." : submitText}
                    </button>


                </div>
            </div>
        </form>
    );
}