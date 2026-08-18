import { useEffect, useMemo, useState } from "react";

import PptViewer from "../../../shared/components/PptViewer";

const DOC_TYPES = ["PDF", "PPT", "Video"];


const MEDIA_ACCEPT = {
    PDF: ".pdf,application/pdf",
    PPT: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    Video: "video/*",
};

const EMPTY_FORM = {
    doc_title: "",
    doc_description: "",
    doc_category_id: "",
    doc_type: "",
    status: "",
    language_id: "",
};

const labelClass = "mb-[8px] block text-[14px] font-medium text-[#4d3b45]";

const controlClass =
    "h-[44px] w-full rounded-sm border border-[#EBD3E7] bg-white px-[14px] text-[14px] text-[#5E6E82] placeholder:text-[#9DA9BB] outline-none focus:border-[#7b216f] shadow-inner";

const selectClass = `${controlClass} cursor-pointer appearance-none pr-[38px]`;
const fileClass =
    "w-full rounded-sm border border-[#EBD3E7] bg-white text-[14px] text-[#5E6E82] outline-none file:mr-[14px] file:h-[42px] file:cursor-pointer file:rounded-l-sm file:border-0 file:bg-[#4A5568] file:px-[16px] file:text-[14px] file:text-white hover:file:bg-[#3c4655] shadow-inner";

function Field({ label, required = false, htmlFor, children }) {
    return (
        <div>
            <label htmlFor={htmlFor} className={labelClass}>
                {label}
                {required && <span className="ml-[2px] text-[#E63757]">*</span>}
            </label>

            {children}
        </div>
    );
}

/* Native <select> with a visible dropdown caret so it's obvious the field
   is a menu. The native arrow is removed (appearance-none) and replaced with
   an inline chevron that never intercepts clicks. */
function SelectBox({ className = "", children, ...props }) {
    return (
        <div style={{ position: "relative" }}>
            <select {...props} className={`${selectClass} ${className}`}>
                {children}
            </select>

            {/* Inline SVG + inline styles so the caret renders regardless of
                Tailwind class generation or icon-library bundling. */}
            <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="#5E6E82"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                }}
            >
                <path d="M4 6l4 4 4-4" />
            </svg>
        </div>
    );
}

function Section({ title, tone = "purple", children }) {
    const styles =
        tone === "purple"
            ? { wrapper: "border-[#E8C4E3] bg-[#FDF7FC]", badge: "bg-[#7b216f] text-white" }
            : { wrapper: "border-[#F5CFC9] bg-[#FFFAFB]", badge: "bg-[#FDECEA] text-[#D74D43]" };

    return (
        <section className={`relative mt-[26px] rounded-[8px] border p-[20px] pt-[28px] ${styles.wrapper}`}>
            <span className={`absolute -top-[14px] left-[20px] rounded-[4px] px-[18px] py-[5px] text-[13px] font-semibold ${styles.badge}`}>
                {title}
            </span>

            {children}
        </section>
    );
}

export default function DocumentForm({
    mode = "create",
    defaultValues = null,
    languages = [],
    categories = [],
    submitting = false,
    existingFileUrl = "",
    existingDocType = "",
    onLanguageChange,
    onSubmit,
    onCancel,
}) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [mediaFile, setMediaFile] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (mode !== "edit" || !defaultValues) return;

        setForm({
            doc_title: defaultValues.doc_title ?? "",
            doc_description: defaultValues.doc_description ?? "",
            doc_category_id: String(defaultValues.doc_category_id ?? ""),
            doc_type: defaultValues.doc_type ?? "",
            status: String(defaultValues.status ?? ""),
            language_id: String(defaultValues.language_id ?? ""),
        });
    }, [mode, defaultValues]);

    useEffect(() => {
        if (mode === "edit" || languages.length === 0) return;

        setForm((current) =>
            current.language_id
                ? current
                : { ...current, language_id: String(languages[0].id) },
        );
    }, [mode, languages]);

    useEffect(() => {
        if (!form.language_id) return;

        onLanguageChange?.(form.language_id);
    }, [form.language_id, onLanguageChange]);

    const update = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
            ...(name === "language_id" ? { doc_category_id: "" } : {}),
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setError("");

        if (mode === "create" && !mediaFile) {
            setError(`${form.doc_type || "Document"} file is required.`);
            return;
        }

        const payload = new FormData();

        payload.append("doc_title", form.doc_title.trim());
        payload.append("doc_description", form.doc_description);
        payload.append("doc_category_id", form.doc_category_id);
        payload.append("doc_type", form.doc_type);
        payload.append("status", form.status);
        payload.append("language_id", form.language_id);

        if (mediaFile) payload.append("media_file", mediaFile);

        onSubmit(payload);
    };

    const activeLanguage = useMemo(
        () => languages.find((item) => String(item.id) === String(form.language_id)),
        [languages, form.language_id],
    );

    return (
        <form onSubmit={handleSubmit} className="rounded-[10px] border border-[#7b216f] bg-white p-[20px]">

            <Section title="Document" tone="purple">
                <div className="grid grid-cols-1 gap-x-[24px] gap-y-[20px] md:grid-cols-3">

                    <Field label="Document Type" required htmlFor="doc_type">
                        <SelectBox id="doc_type" name="doc_type" value={form.doc_type} onChange={update} required>
                            <option value="">Select Document Type</option>
                            {DOC_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </SelectBox>
                    </Field>

                    <Field label="Category" required htmlFor="doc_category_id">
                        <SelectBox id="doc_category_id" name="doc_category_id" value={form.doc_category_id} onChange={update} required>
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </SelectBox>
                    </Field>

                    <Field label="Status" required htmlFor="status">
                        <SelectBox id="status" name="status" value={form.status} onChange={update} required>
                            <option value="">Please select a Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </SelectBox>
                    </Field>

                    <Field label="Language" required htmlFor="language_id">
                        <SelectBox id="language_id" name="language_id" value={form.language_id} onChange={update} required className="bg-[#F5F7FA]">
                            <option value="">Select Language</option>
                            {languages.map((language) => (
                                <option key={language.id} value={language.id}>{language.name}</option>
                            ))}
                        </SelectBox>
                    </Field>
                </div>
            </Section>

            <Section title={activeLanguage?.name || "Document Content"} tone="pink">
                <div className="grid grid-cols-1 gap-[20px]">

                    <Field label="Document Title" required htmlFor="doc_title">
                        <input id="doc_title" name="doc_title" type="text" value={form.doc_title} onChange={update} required className={controlClass} />
                    </Field>

                    <Field label="Document Description" htmlFor="doc_description">
                        <textarea id="doc_description" name="doc_description" value={form.doc_description} onChange={update} rows={4} className={`${controlClass} h-auto resize-y py-[12px]`} />
                    </Field>

                    <Field label="Document File" required={mode === "create"} htmlFor="media_file">
                        <input
                            id="media_file"
                            type="file"
                            accept={MEDIA_ACCEPT[form.doc_type] || "*"}
                            disabled={!form.doc_type}
                            onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                            className={`${fileClass} disabled:cursor-not-allowed disabled:file:bg-gray-400`}
                        />
                        {!form.doc_type && (
                            <p className="mt-1 text-xs text-gray-500">
                                Please select a Document Type first to enable file upload.
                            </p>
                        )}

                        {/* Current file preview (edit mode). Shows the stored
                            file inline so the admin sees exactly what is saved;
                            it stays until a replacement file is picked. */}
                        {mode === "edit" && existingFileUrl && !mediaFile && (
                            <div className="mt-[14px]">
                                <p className="mb-[6px] text-[13px] font-medium text-[#4d3b45]">
                                    Current File
                                </p>

                                {existingDocType === "VIDEO" ? (
                                    <video
                                        src={existingFileUrl}
                                        controls
                                        className="h-[320px] w-full max-w-[640px] rounded-[4px] border border-[#EBD3E7] bg-black"
                                    />
                                ) : existingDocType === "PDF" ? (
                                    <iframe
                                        title="Current PDF"
                                        src={existingFileUrl}
                                        className="h-[440px] w-full max-w-[760px] rounded-[4px] border border-[#EBD3E7]"
                                    />
                                ) : (
                                    <div className="max-w-[760px]">
                                        <PptViewer
                                            fileUrl={existingFileUrl}
                                            height={440}
                                        />
                                    </div>
                                )}

                                <a
                                    href={existingFileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-[8px] inline-block text-[12px] text-[#7b216f] hover:underline"
                                >
                                    Open current file in new tab
                                </a>

                                <p className="mt-[4px] text-[12px] text-[#9DA9BB]">
                                    Choose a file above only to replace it.
                                </p>
                            </div>
                        )}
                    </Field>

                    {error && <p className="m-0 text-[13px] text-[#E63757]">{error}</p>}
                </div>
            </Section>

            <div className="mt-[26px] flex justify-end gap-[12px]">
                <button
                    type="submit"
                    disabled={submitting}
                    className="h-[38px] rounded-sm bg-[#732269] px-[28px] text-[14px] font-medium !text-white hover:opacity-90 disabled:opacity-50"
                >
                    {submitting ? "Submitting..." : "Submit"}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="h-[38px] rounded-sm border border-[#D8E2EF] bg-white px-[28px] text-[14px] text-[#344050] hover:bg-gray-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}