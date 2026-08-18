export default function TopicTranslationForm({
    form,
    readOnly,
    loading,
    languageName,
    onChange,
    onSubmit,
    onCancel,
}) {
    return (
        <form onSubmit={onSubmit} className="p-5 border-1 border-[#D8E2EF]">
            {/* Topic Name */}

            <div className="mb-4">
                <label className="mb-2 block text-[14px] font-medium text-[#344050]">
                    Topic Name
                    {!readOnly && (
                        <span className="text-red-500"> *</span>
                    )}
                </label>

                <input
                    type="text"
                    name="topic_name"
                    value={form.topic_name || ""}
                    onChange={onChange}
                    readOnly={readOnly}
                    className={`h-10 w-full rounded border border-[#D8E2EF] px-3 text-[14px]
                    ${readOnly
                            ? "bg-[#F8F9FA] text-[#5E6E82]"
                            : "bg-white"
                        }`}
                />
            </div>

            {/* Module */}

            {readOnly && (
                <div className="mb-4">
                    <label className="mb-2 block text-[14px] font-medium text-[#344050]">
                        Module
                    </label>

                    <input
                        type="text"
                        value={form.module_name || ""}
                        readOnly
                        className="h-10 w-full rounded border border-[#D8E2EF] bg-[#F8F9FA] px-3 text-[14px]"
                    />
                </div>
            )}

            {/* Status */}

            {readOnly && (
                <div className="mb-4">
                    <label className="mb-2 block text-[14px] font-medium text-[#344050]">
                        Status
                    </label>

                    <input
                        type="text"
                        value={
                            String(form.status) === "1"
                                ? "Active"
                                : "Inactive"
                        }
                        readOnly
                        className="h-10 w-full rounded border border-[#D8E2EF] bg-[#F8F9FA] px-3 text-[14px]"
                    />
                </div>
            )}

            {/* Buttons */}

            <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">

                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full rounded border border-[#D8E2EF] bg-white px-6 py-2 text-[14px] text-[#344050] sm:w-auto"
                >
                    Back
                </button>

                {!readOnly && (
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded bg-[#732269] px-6 py-2 text-[14px] text-white hover:bg-[#5d1b57] sm:w-auto"
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