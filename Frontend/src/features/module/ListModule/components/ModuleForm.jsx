export default function ModuleForm({
    form,
    courses = [],
    onChange,
    onFileChange,
    onSubmit,
    onCancel,
    loading = false,
    existingImage = "",
    errors = {},
}) {
    const inputClass = "h-[35px] w-full rounded-[3px] border border-[#D8E2EF] bg-white px-[12px] text-[14px] text-[#344050] outline-none transition focus:border-[#7B216F]";

    const labelClass = "mb-[7px] block text-[13px] font-medium text-[#344050]";

    const textareaClass = "h-[80px] w-full resize-y rounded-[3px] border border-[#D8E2EF] bg-white px-[12px] py-[8px] text-[14px] text-[#344050] outline-none transition focus:border-[#7B216F]";

    const fieldClass = (baseClass, fieldName) =>
        `${baseClass} ${errors[fieldName] ? "border-[#E63757]" : ""}`;

    const errorMessage = (fieldName) =>
        errors[fieldName] ? (
            <p className="mt-1 text-[12px] text-[#E63757]" role="alert">
                {errors[fieldName]}
            </p>
        ) : null;

    return (
        <form
            onSubmit={onSubmit}
            className="rounded-[6px] border border-[#D8E2EF] bg-white p-[20px]"
        >
            {/* ================= COURSE + LANGUAGE ================= */}

            <div className="mb-[16px] grid grid-cols-1 gap-[26px] lg:grid-cols-2">
                <div className="min-w-0">
                    <label className={labelClass}>
                        Course
                        <span className="ml-1 text-[#E63757]">*</span>
                    </label>

                    <select
                        name="fk_course_id"
                        value={form.fk_course_id}
                        onChange={onChange}
                        aria-invalid={Boolean(errors.fk_course_id)}
                        className={fieldClass(inputClass, "fk_course_id")}
                    >
                        <option value="">Select Course</option>

                        {courses.map((course) => (
                            <option key={course.course_id} value={course.course_id}>
                                {course.course_name}
                            </option>
                        ))}
                    </select>

                    {errorMessage("fk_course_id")}
                </div>

                <div className="min-w-0">
                    <label className={labelClass}>
                        Language
                        <span className="ml-1 text-[#E63757]">*</span>
                    </label>

                    <input
                        type="text"
                        value="English"
                        disabled
                        className={`${inputClass} bg-[#EDF2F8]`}
                    />
                </div>
            </div>

            {/* ================= MODULE TYPE ================= */}

            <div className="mb-[16px]">
                <label className={labelClass}>
                    Module Type
                    <span className="ml-1 text-[#E63757]">*</span>
                </label>

                <select
                    name="module_type"
                    value={form.module_type}
                    onChange={onChange}
                    aria-invalid={Boolean(errors.module_type)}
                    className={fieldClass(inputClass, "module_type")}
                >
                    <option value="">Select Module Type</option>
                    <option value="1">Technical</option>
                    <option value="2">Non Technical</option>
                </select>

                {errorMessage("module_type")}
            </div>

            {/* ================= MODULE NAME ================= */}

            <div className="mb-[16px]">
                <label className={labelClass}>
                    Module Name
                    <span className="ml-1 text-[#E63757]">*</span>
                </label>

                <input
                    type="text"
                    name="module_name"
                    value={form.module_name}
                    onChange={onChange}
                    aria-invalid={Boolean(errors.module_name)}
                    className={fieldClass(inputClass, "module_name")}
                />

                {errorMessage("module_name")}
            </div>

            {/* ================= DESCRIPTION + OVERVIEW ================= */}

            <div className="mb-[16px] grid grid-cols-1 gap-[26px] lg:grid-cols-2">
                <div className="min-w-0">
                    <label className={labelClass}>
                        Module Description
                        <span className="ml-1 text-[#E63757]">*</span>
                    </label>

                    <textarea
                        name="module_description"
                        value={form.module_description}
                        onChange={onChange}
                        aria-invalid={Boolean(errors.module_description)}
                        className={fieldClass(textareaClass, "module_description")}
                    />

                    {errorMessage("module_description")}
                </div>

                <div className="min-w-0">
                    <label className={labelClass}>
                        Module Overview
                        <span className="ml-1 text-[#E63757]">*</span>
                    </label>

                    <textarea
                        name="module_overview"
                        value={form.module_overview}
                        onChange={onChange}
                        aria-invalid={Boolean(errors.module_overview)}
                        className={fieldClass(textareaClass, "module_overview")}
                    />

                    {errorMessage("module_overview")}
                </div>
            </div>

            {/* ================= OBJECTIVE + DURATION ================= */}

            <div className="mb-[16px] grid grid-cols-1 gap-[26px] lg:grid-cols-2">
                <div className="min-w-0">
                    <label className={labelClass}>
                        Module Objective
                        <span className="ml-1 text-[#E63757]">*</span>
                    </label>

                    <textarea
                        name="module_objective"
                        value={form.module_objective}
                        onChange={onChange}
                        aria-invalid={Boolean(errors.module_objective)}
                        className={fieldClass(textareaClass, "module_objective")}
                    />

                    {errorMessage("module_objective")}
                </div>

                <div className="min-w-0">
                    <label className={labelClass}>
                        Module Duration (in minutes)
                        <span className="ml-1 text-[#E63757]">*</span>
                    </label>

                    <input
                        type="number"
                        min="1"
                        name="module_duration"
                        value={form.module_duration}
                        onChange={onChange}
                        aria-invalid={Boolean(errors.module_duration)}
                        className={fieldClass(inputClass, "module_duration")}
                    />

                    {errorMessage("module_duration")}
                </div>
            </div>

            {/* ================= STATUS + PUBLISHING ================= */}

            <div className="mb-[16px] grid grid-cols-1 gap-[26px] lg:grid-cols-2">
                <div className="min-w-0">
                    <label className={labelClass}>
                        Status
                        <span className="ml-1 text-[#E63757]">*</span>
                    </label>

                    <select
                        name="status"
                        value={form.status}
                        onChange={onChange}
                        aria-invalid={Boolean(errors.status)}
                        className={fieldClass(inputClass, "status")}
                    >
                        <option value="">Please select a Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>

                    {errorMessage("status")}
                </div>
            </div>

            {/* ================= MODULE ICON ================= */}

            <div className="mb-[22px]">
                <label className={labelClass}>
                    Module Icon Image
                    <span className="ml-1 text-[#E63757]">*</span>
                </label>

                <input
                    type="file"
                    name="module_icon"
                    accept="image/*"
                    onChange={onFileChange}
                    aria-invalid={Boolean(errors.module_icon)}
                    className={`${errors.module_icon ? "border-[#E63757]" : "border-[#D8E2EF]"} block h-[35px] w-full rounded-[3px] border bg-white text-[13px] text-[#344050] file:mr-[12px] file:h-full file:border-0 file:bg-[#344050] file:px-[14px] file:text-[13px] file:font-medium file:text-white`}
                />

                {errorMessage("module_icon")}

                {/* Existing Image */}

                {existingImage && (
                    <div className="mt-4">
                        <label className={labelClass}>
                            Existing Image
                        </label>

                        <div className="mt-2 flex min-h-[150px] max-h-[300px] w-full items-center justify-center overflow-hidden rounded-[4px] border border-[#D8E2EF] bg-[#F8FAFC] p-[10px]">
                            <img
                                src={existingImage}
                                alt="Module"
                                className="max-h-[280px] max-w-full rounded-[4px] object-contain"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ================= BUTTONS ================= */}

            <div className="flex items-center justify-end gap-[8px]">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-[35px] min-w-[75px] items-center justify-center rounded-[3px] border border-[#7B216F] bg-[#7B216F] px-[16px] text-[13px] font-semibold !text-white hover:bg-[#691B60] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Submitting..." : "Submit"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="inline-flex h-[35px] min-w-[75px] items-center justify-center rounded-[3px] border border-[#344050] bg-white px-[16px] text-[13px] font-medium text-[#344050] hover:bg-[#F8F9FA]"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}