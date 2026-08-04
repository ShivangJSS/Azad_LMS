import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../../components/layout/AppLayout";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";
import { getDocument, updateDocument } from "../services/DocumentServices";

const breadcrumbItems = [
  { label: "Home", path: "/dashboard" },
  { label: "Documents", path: "/documents" },
  { label: "Edit" },
];

const DOCUMENT_TYPES = ["VIDEO", "PDF", "PPT"];
const CATEGORIES = ["Technical", "Non Technical"];
const STATUSES = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "0" },
];
const LANGUAGES = ["English", "Hindi"];

const FIELD_CLASS =
  "w-full h-[40px] rounded-[6px] border border-[#D8E2EF] bg-[#F8FAFC] px-[12px] text-[14px] text-[#344050] outline-none focus:border-[#7b216f]";

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="text-[13px] text-[#5E6E82]">
        {label} {required && <span className="text-[#E63757]">*</span>}
      </label>
      {children}
    </div>
  );
}

function FileField({ label, required, fileName, onChange, existingUrl }) {
  const id = label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="flex flex-col gap-[6px]">
      <label className="text-[13px] font-medium text-[#344050]">
        {label} {required && <span className="text-[#E63757]">*</span>}
      </label>

      <div className="flex h-[40px] w-full max-w-[420px] overflow-hidden rounded-[6px] border border-[#D8E2EF] bg-[#F8FAFC]">
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center bg-[#344050] px-[16px] text-[13px] font-medium !text-white hover:opacity-90"
        >
          Choose File
        </label>

        <input id={id} type="file" className="hidden" onChange={onChange} />

        <span className="flex flex-1 items-center truncate px-[12px] text-[13px] text-[#9DA9BB]">
          {fileName || "No file chosen"}
        </span>
      </div>

      {!fileName && existingUrl && (
        <a
          href={existingUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[12px] text-[#7b216f] hover:underline"
        >
          View current file
        </a>
      )}
    </div>
  );
}

export default function EditDocument() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    doc_type: "",
    category: "",
    status: "1",
    language_name: "",
    doc_title: "",
    doc_description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  /* ==============================
     FETCH EXISTING DOCUMENT
     Populates the form from live data instead of hardcoded values, so the
     edit page always reflects what's actually stored for this id.
  ============================== */

  const fetchDocument = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getDocument(id);
      const data = response?.document ?? response?.data ?? response;

      setDoc(data);
      setForm({
        doc_type: data?.doc_type || "",
        category: data?.category || "",
        status: String(data?.status ?? "1"),
        language_name: data?.language_name || "",
        doc_title: data?.doc_title || "",
        doc_description: data?.doc_description || "",
      });
    } catch (requestError) {
      console.error("Fetch failed:", requestError?.response?.data);

      setError(
        requestError?.response?.data?.detail ||
        "Unable to load document.",
      );
      setDoc(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  /* ==============================
     SUBMIT
     Files are only appended when the admin actually picks a new one, so an
     untouched upload field leaves the existing stored file in place.
  ============================== */

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        payload.append(key, value ?? "");
      });

      if (imageFile) payload.append("doc_image", imageFile);
      if (videoFile) payload.append("doc_file", videoFile);

      await updateDocument(id, payload);

      navigate(`/documents/view/${id}`);
    } catch (requestError) {
      console.error("Update failed:", requestError?.response?.data);

      setError(
        requestError?.response?.data?.detail ||
        "Unable to update document.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-[16px] flex items-center justify-between px-3">
        <h1 className="m-0 text-[20px] font-medium text-[#344050]">
          Edit Document
        </h1>

        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="px-3">
        {loading && (
          <div className="rounded-[8px] border border-[#D8E2EF] bg-white p-[20px] text-[14px] text-[#5E6E82]">
            Loading document...
          </div>
        )}

        {!loading && error && !doc && (
          <div className="rounded-[8px] border border-[#F5C2C7] bg-[#FDECEA] p-[16px] text-[14px] text-[#D74D43]">
            {error}
          </div>
        )}

        {!loading && doc && (
          <form
            onSubmit={handleSubmit}
            className="rounded-[8px] border border-[#D8E2EF] bg-white p-[20px]"
          >
            {error && (
              <div className="mb-[20px] rounded-[6px] border border-[#F5C2C7] bg-[#FDECEA] p-[12px] text-[13px] text-[#D74D43]">
                {error}
              </div>
            )}

            <h3 className="mb-[20px] text-[16px] font-medium text-[#5E6E82]">
              Document
            </h3>

            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-3">
              <Field label="Document Type" required>
                <select
                  className={FIELD_CLASS}
                  value={form.doc_type}
                  onChange={handleChange("doc_type")}
                >
                  <option value="">Select type</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Category" required>
                <select
                  className={FIELD_CLASS}
                  value={form.category}
                  onChange={handleChange("category")}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Status" required>
                <select
                  className={FIELD_CLASS}
                  value={form.status}
                  onChange={handleChange("status")}
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-[20px] grid grid-cols-1 gap-[20px] md:grid-cols-3">
              <Field label="Language" required>
                <select
                  className={FIELD_CLASS}
                  value={form.language_name}
                  onChange={handleChange("language_name")}
                >
                  <option value="">Select language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* <h3 className="mb-[20px] mt-[28px] text-[16px] font-medium text-[#5E6E82]">
              {form.language_name || "Content"}
            </h3> */}

            <Field label="Document Title" required>
              <input
                type="text"
                className={FIELD_CLASS}
                value={form.doc_title}
                onChange={handleChange("doc_title")}
              />
            </Field>

            <div className="mt-[20px] flex flex-col gap-[6px]">
              <label className="text-[13px] text-[#5E6E82]">
                Document Description
              </label>

              <textarea
                rows={4}
                className="w-full resize-y rounded-[6px] border border-[#D8E2EF] bg-[#F8FAFC] px-[12px] py-[10px] text-[14px] text-[#344050] outline-none focus:border-[#7b216f]"
                value={form.doc_description}
                onChange={handleChange("doc_description")}
              />
            </div>

            <div className="mt-[20px]">
              <FileField
                label="Document Image"
                fileName={imageFile?.name}
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                existingUrl={doc?.doc_image}
              />
            </div>

            <div className="mt-[20px]">
              <FileField
                label="Upload File"
                fileName={videoFile?.name}
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                existingUrl={doc?.video_url || doc?.pdf_url || doc?.ppt_url}
              />
            </div>

            <div className="mt-[28px] flex justify-end gap-[12px] border-t border-[#E3E6ED] pt-[20px]">
              <button
                type="button"
                onClick={() => navigate("/documents")}
                disabled={saving}
                className="h-[38px] rounded-[6px] border border-[#D8E2EF] bg-white px-[24px] text-[14px] text-[#344050] hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                onClick={() => navigate("/documents")}
                className="h-[38px] rounded-[6px] bg-[#7b216f] px-[24px] text-[14px] font-medium !text-white hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Updating..." : "Update Document"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}