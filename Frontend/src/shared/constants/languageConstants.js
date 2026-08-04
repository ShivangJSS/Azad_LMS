export const LANGUAGES = [
    { id: 1, key: "english", label: "English", code: "en" },
    { id: 2, key: "hindi", label: "Hindi", code: "hi" },
    { id: 3, key: "bangla", label: "Bangla", code: "bn" },
    { id: 4, key: "tamil", label: "Tamil", code: "ta" },
];


/** Default language used when no ?tab= is present. */
export const DEFAULT_LANGUAGE = LANGUAGES[0];


/** Look up a language by its URL key, e.g. "hindi". */
export function getLanguageByKey(key) {
    const target = String(key || "").toLowerCase().trim();
    return LANGUAGES.find((lang) => lang.key === target) || DEFAULT_LANGUAGE;
}


/** Look up a language by its API id, e.g. 2. */
export function getLanguageById(id) {
    return LANGUAGES.find((lang) => String(lang.id) === String(id)) || null;
}


/** "Hindi" for id 2. Returns "-" when unknown. */
export function getLanguageLabel(id) {
    return getLanguageById(id)?.label || "-";
}


/** Options shaped for a <select> or react-select. */
export const LANGUAGE_OPTIONS = LANGUAGES.map((lang) => ({
    value: lang.id,
    label: lang.label,
}));