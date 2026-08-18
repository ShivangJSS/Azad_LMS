import { useCallback, useEffect, useState } from "react";

import {
    getTranslationForm,
    getTranslation,
    saveTranslation,
} from "../services/DocumentServices";


const EMPTY_FORM = {
    title: "",
    description: "",
    document_image: null, // File | null (new upload)
    media_file: null,     // File | null (new upload)
};

// The source/original language is not editable and has no Save button.
// Adjust this check if your LANGUAGES constant marks it differently
// (e.g. language.code === "en" or language.is_source).
const isSourceLanguage = (language) =>
    // English (language_id 1) is the source: read-only, no Save.
    Number(language?.language_id ?? language?.id) === 1 ||
    String(language?.name ?? "").trim().toLowerCase() === "english";

export default function useTranslation(documentId, initialLanguageId = null) {
    const [languages, setLanguages] = useState([]);
    const [activeLanguageId, setActiveLanguageId] = useState(null);

    const [existing, setExisting] = useState(null); // last-saved data for the active tab
    const [form, setForm] = useState(EMPTY_FORM);

    const [loadingForm, setLoadingForm] = useState(true);   // page-level (languages) load
    const [loadingTab, setLoadingTab] = useState(false);    // per-tab translation load
    const [saving, setSaving] = useState(false);

    /* ==============================
       LANGUAGES (once)
    ============================== */

    useEffect(() => {
        if (!documentId) return;

        const loadForm = async () => {
            setLoadingForm(true);
            try {
                const response = await getTranslationForm(documentId);
                const list = response?.languages ?? [];

                setLanguages(list);
                // Prefer the language the user came from (initialLanguageId);
                // otherwise default to the source language tab (English).
                const preferred =
                    initialLanguageId != null
                        ? list.find(
                              (l) =>
                                  Number(l.language_id ?? l.id) ===
                                  Number(initialLanguageId)
                          )
                        : null;
                const source =
                    preferred ?? list.find(isSourceLanguage) ?? list[0];
                setActiveLanguageId(source?.language_id ?? source?.id ?? null);
            } catch (error) {
                console.error(
                    "Translation form load error:",
                    error?.response?.data ?? error,
                );
                setLanguages([]);
            } finally {
                setLoadingForm(false);
            }
        };

        loadForm();
    }, [documentId, initialLanguageId]);

    /* ==============================
       ACTIVE TAB DATA
    ============================== */

    const activeLanguage = languages.find(
        (l) => (l.language_id ?? l.id) === activeLanguageId,
    );

    const loadActiveTranslation = useCallback(async () => {
        if (!documentId || !activeLanguageId) return;

        setLoadingTab(true);
        try {
            const response = await getTranslation(documentId, activeLanguageId);

            if (response?.success && response.data) {
                setExisting(response.data);
                setForm({
                    title: response.data.title ?? "",
                    description: response.data.description ?? "",
                    document_image: null,
                    media_file: null,
                });
            } else {
                // No translation yet for this language — blank editable form.
                setExisting(null);
                setForm(EMPTY_FORM);
            }
        } catch (error) {
            console.error(
                "Translation fetch error:",
                error?.response?.data ?? error,
            );
            setExisting(null);
            setForm(EMPTY_FORM);
        } finally {
            setLoadingTab(false);
        }
    }, [documentId, activeLanguageId]);

    useEffect(() => {
        loadActiveTranslation();
    }, [loadActiveTranslation]);

    /* ==============================
       ACTIONS
    ============================== */

    const changeTab = useCallback((languageId) => {
        setActiveLanguageId(languageId);
    }, []);

    const changeField = useCallback((name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const submit = useCallback(async () => {
        if (!documentId || !activeLanguageId) return;

        setSaving(true);
        try {
            const payload = new FormData();
            payload.append("language_id", activeLanguageId);
            payload.append("title", form.title);
            if (form.description) payload.append("description", form.description);
            if (form.document_image) payload.append("document_image", form.document_image);
            if (form.media_file) payload.append("media_file", form.media_file);

            const result = await saveTranslation(documentId, payload);

            // Refresh the tab so the saved values (and any cleared upload
            // inputs) reflect what the server now has.
            await loadActiveTranslation();

            return result;
        } finally {
            setSaving(false);
        }
    }, [documentId, activeLanguageId, form, loadActiveTranslation]);

    return {
        languages,
        activeLanguage,
        activeLanguageId,
        isSourceTab: activeLanguage ? isSourceLanguage(activeLanguage) : true,

        existing,
        form,

        loadingForm,
        loadingTab,
        saving,

        changeTab,
        changeField,
        submit,
    };
}