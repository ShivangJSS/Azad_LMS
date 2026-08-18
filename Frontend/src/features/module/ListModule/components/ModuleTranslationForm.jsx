import { getModuleIconUrl } from "../../../../shared/utils/mediaUrl";

export default function ModuleTranslationForm({
    form = {
        module_name: "",
        module_description: "",
        module_overview: "",
        module_objective: "",
        module_icon: "",
    },
    languageName,
    readOnly = false,
    loading = false,
    onChange,
    onFileChange,
    onSubmit,
    onCancel,
}) {
    const LABEL =
        "mb-[8px] block text-[13px] font-medium text-[#344050]";

    const FIELD_BASE =
        "w-full rounded-[4px] border px-[12px] py-[9px] text-[14px] leading-[20px] outline-none";

    const FIELD_EDITABLE =
        `${FIELD_BASE} border-[#E6D6E4] bg-white text-[#344050] ` +
        "transition-colors duration-200 focus:border-[#7B216F] focus:ring-0";

    const FIELD_READONLY =
        `${FIELD_BASE} border-[#D8E2EF] bg-[#EDF2F9] text-[#5E6E82]`;

    const FILE_FIELD =
        "w-full rounded-[4px] border border-[#E6D6E4] bg-white " +
        "text-[13px] text-[#5E6E82] outline-none " +
        "file:mr-[12px] file:h-[38px] file:cursor-pointer " +
        "file:border-0 file:bg-[#3F4A5A] file:px-[16px] " +
        "file:text-[13px] file:font-medium file:text-white " +
        "hover:file:bg-[#333D4B]";

    return (
        <>
            <form
                onSubmit={onSubmit}
                className="rounded-[5px] border border-[#E6D6E4] bg-[#FFF9FE] p-[18px]"
            >
                {/* Module Name */}
                <div className="mb-[18px]">
                    <label className={LABEL}>
                        Module Name{" "}
                        {!readOnly && (
                            <span className="ml-[2px] text-[#E63757]">*</span>
                        )}
                    </label>

                    {readOnly ? (
                        <div className={FIELD_READONLY}>
                            {form.module_name || ""}
                        </div>
                    ) : (
                        <input
                            name="module_name"
                            type="text"
                            value={form.module_name}
                            onChange={onChange}
                            required
                            placeholder={`Module name in ${languageName}`}
                            className={FIELD_EDITABLE}
                        />
                    )}
                </div>

                {/* Module Description */}
                <div className="mb-[18px]">
                    <label className={LABEL}>
                        Module Description
                    </label>

                    {readOnly ? (
                        <div
                            className={`${FIELD_READONLY} min-h-[100px] whitespace-pre-wrap`}
                        >
                            {form.module_description || ""}
                        </div>
                    ) : (
                        <textarea
                            name="module_description"
                            rows={4}
                            value={form.module_description}
                            onChange={onChange}
                            placeholder={`Description in ${languageName}`}
                            className={`${FIELD_EDITABLE} resize-y`}
                        />
                    )}
                </div>

                {/* Module Overview */}
                <div className="mb-[18px]">
                    <label className={LABEL}>
                        Module Overview
                    </label>

                    {readOnly ? (
                        <div
                            className={`${FIELD_READONLY} min-h-[100px] whitespace-pre-wrap`}
                        >
                            {form.module_overview || ""}
                        </div>
                    ) : (
                        <textarea
                            name="module_overview"
                            rows={4}
                            value={form.module_overview}
                            onChange={onChange}
                            placeholder={`Overview in ${languageName}`}
                            className={`${FIELD_EDITABLE} resize-y`}
                        />
                    )}
                </div>

                {/* Module Objective */}
                <div className="mb-[18px]">
                    <label className={LABEL}>
                        Module Objective
                    </label>

                    {readOnly ? (
                        <div
                            className={`${FIELD_READONLY} min-h-[120px] whitespace-pre-wrap`}
                        >
                            {form.module_objective || ""}
                        </div>
                    ) : (
                        <textarea
                            name="module_objective"
                            rows={5}
                            value={form.module_objective}
                            onChange={onChange}
                            placeholder={`Objective in ${languageName}`}
                            className={`${FIELD_EDITABLE} resize-y`}
                        />
                    )}
                </div>

                {/* Module Icon */}
                <div className="mb-[18px]">
                    <label className={LABEL}>
                        Module Icon
                    </label>

                    {readOnly ? (
                        form.module_icon ? (
                            <div className="mt-[2px]">
                                <img
                                    src={getModuleIconUrl(form.module_icon)}
                                    alt={form.module_name || "Module"}
                                    className="h-[110px] w-[110px] rounded-[4px] border border-[#D8E2EF] object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            </div>
                        ) : (
                            <p className="m-0 text-[13px] text-[#9DA9BB]">
                                No module icon is attached.
                            </p>
                        )
                    ) : (
                        <>
                            {form.module_icon &&
                                typeof form.module_icon === "string" && (
                                    <img
                                        src={getModuleIconUrl(form.module_icon)}
                                        alt={form.module_name || "Module"}
                                        className="mb-[10px] h-[110px] w-[110px] rounded-[4px] border border-[#D8E2EF] object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                )}

                            <input
                                type="file"
                                name="module_icon"
                                accept="image/*"
                                onChange={onFileChange}
                                className={FILE_FIELD}
                            />
                        </>
                    )}
                </div>

                {/* Save */}
                {!readOnly && (
                    <div className="mt-[20px] flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                h-[38px]
                                rounded-[4px]
                                bg-[#7B216F]
                                px-[22px]
                                text-[14px]
                                font-semibold
                                text-white
                                transition-colors
                                duration-200
                                hover:bg-[#691B60]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {loading
                                ? "Saving..."
                                : `Save ${languageName} Translation`}
                        </button>
                    </div>
                )}
            </form>

            {/* Back to List */}
            <div className="mt-[12px] flex justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="
                        h-[36px]
                        rounded-[4px]
                        border
                        border-[#B9C4D3]
                        bg-white
                        px-[20px]
                        text-[14px]
                        font-medium
                        text-[#344050]
                        transition-colors
                        duration-200
                        hover:bg-[#F8F9FA]
                    "
                >
                    Back to List
                </button>
            </div>
        </>
    );
}