import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
    getTopicsForMainContent,
    getDocumentsForMainContent,
    createMainContent,
} from "../../services/ConfigurationService";

export default function AddContentModal({
    open,
    onClose,
    moduleId,
    onSaved,
    title = "Add Content",
    createContent = createMainContent,
}) {
    const [topics, setTopics] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [topicId, setTopicId] = useState("");
    const [docId, setDocId] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        setTopicId("");
        setDocId("");

        const load = async () => {
            try {
                setLoading(true);
                const [topicData, docData] = await Promise.all([
                    getTopicsForMainContent(moduleId),
                    getDocumentsForMainContent(),
                ]);
                setTopics(Array.isArray(topicData) ? topicData : []);
                setDocuments(Array.isArray(docData) ? docData : []);
            } catch (error) {
                toast.error("Unable to load topics / documents.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [open, moduleId]);

    if (!open) return null;

    const handleSave = async () => {
        if (!topicId || !docId) {
            toast("Please select a topic and a document.");
            return;
        }

        try {
            setSaving(true);
            const res = await createContent({
                module_id: Number(moduleId),
                topic_id: Number(topicId),
                doc_id: Number(docId),
            });

            if (res?.success === false) {
                toast.error(res.message || "Record already exists!");
                return;
            }

            toast.success(res?.message || "Main content assigned.");
            onSaved?.();
            onClose?.();
        } catch (error) {
            toast.error(
                error?.response?.data?.detail ||
                "Unable to assign content."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[520px] overflow-hidden rounded-[6px] bg-white shadow-lg">

                {/* HEADER */}
                <div className="flex items-center justify-between bg-[#732269] px-[18px] py-[12px]">
                    <span className="text-[15px] font-semibold text-white">
                        {title}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[20px] leading-none text-white"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                {/* BODY */}
                <div className="px-[18px] py-[16px]">
                    {loading ? (
                        <p className="py-[20px] text-center text-[13px] text-[#6c757d]">
                            Loading...
                        </p>
                    ) : (
                        <div className="flex flex-col gap-[14px]">
                            <div>
                                <label className="mb-[6px] block text-[13px] font-medium text-[#344050]">
                                    Topic
                                </label>
                                <select
                                    value={topicId}
                                    onChange={(e) => setTopicId(e.target.value)}
                                    className="h-[38px] w-full rounded-[4px] border border-[#d8e2ef] px-[10px] text-[13px] text-[#344050] outline-none focus:border-[#732269]"
                                >
                                    <option value="">Select topic</option>
                                    {topics.map((t) => (
                                        <option key={t.topic_id} value={t.topic_id}>
                                            {t.topic_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-[6px] block text-[13px] font-medium text-[#344050]">
                                    Document
                                </label>
                                <select
                                    value={docId}
                                    onChange={(e) => setDocId(e.target.value)}
                                    className="h-[38px] w-full rounded-[4px] border border-[#d8e2ef] px-[10px] text-[13px] text-[#344050] outline-none focus:border-[#732269]"
                                >
                                    <option value="">Select document</option>
                                    {documents.map((d) => (
                                        <option key={d.doc_id} value={d.doc_id}>
                                            {d.doc_title}
                                            {d.doc_type ? ` (${d.doc_type})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-[10px] border-t border-[#eef0f3] px-[18px] py-[12px]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-[34px] rounded-[4px] border border-[#adb5bd] bg-white px-[16px] text-[13px] font-medium text-[#344050]"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="h-[34px] rounded-[4px] bg-[#732269] px-[18px] text-[13px] font-medium text-white disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Assign"}
                    </button>
                </div>

            </div>
        </div>
    );
}
