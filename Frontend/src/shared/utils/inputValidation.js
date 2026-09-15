// Shared, data-type-aware input helpers so text fields accept only what
// their underlying data allows (digits for numeric fields, a valid shape
// for email, etc.). Use these to sanitise input as the user types, in
// addition to any on-submit validation.

/** Keep only digits, optionally capped to `maxLength` characters. */
export const sanitizeDigits = (value, maxLength) => {
    const digits = String(value ?? "").replace(/\D/g, "");
    return maxLength ? digits.slice(0, maxLength) : digits;
};

/** Collapse whitespace and strip characters that don't belong in a name. */
export const sanitizeName = (value) =>
    String(value ?? "").replace(/[^A-Za-zऀ-ॿঀ-৿஀-௿\s.'-]/g, "");

/** Letters and spaces only (Latin + Devanagari/Bengali/Tamil). */
export const sanitizeAlpha = (value) =>
    String(value ?? "").replace(/[^A-Za-zऀ-ॿঀ-৿஀-௿\s]/g, "");

/** Letters and digits only (no spaces or symbols). */
export const sanitizeAlphanumeric = (value) =>
    String(value ?? "").replace(/[^A-Za-z0-9]/g, "");

// Shared regexes / rules for on-submit validation.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MOBILE_REGEX = /^\d{10}$/;
export const PIN_REGEX = /^\d{6}$/;
export const AADHAAR_REGEX = /^\d{12}$/;
export const ALPHA_REGEX = /^[A-Za-zऀ-ॿঀ-৿஀-௿\s]+$/;
export const ALPHANUMERIC_REGEX = /^[A-Za-z0-9]+$/;
// Login usernames / emails: letters, digits and . _ - @ only. This rejects
// the quotes, spaces, semicolons and comment markers used in SQL-injection
// payloads (the backend is ORM-parameterised, so this is defence-in-depth).
export const USERNAME_REGEX = /^[A-Za-z0-9._@-]+$/;

/**
 * Validate a value against a named data type. Returns an error string when
 * invalid, or "" when valid. Empty values are treated as valid here so the
 * caller decides "required" separately.
 */
export const validateByType = (type, value, label = "This field") => {
    const v = String(value ?? "").trim();
    if (v === "") return "";

    switch (type) {
        case "email":
            return EMAIL_REGEX.test(v) ? "" : "Please enter a valid email address.";
        case "mobile":
            return MOBILE_REGEX.test(v) ? "" : "Mobile number must be exactly 10 digits.";
        case "pin":
            return PIN_REGEX.test(v) ? "" : "PIN code must be exactly 6 digits.";
        case "aadhaar":
            return AADHAAR_REGEX.test(v) ? "" : "Aadhaar number must be exactly 12 digits.";
        case "digits":
            return /^\d+$/.test(v) ? "" : `${label} must contain digits only.`;
        case "alpha":
            return ALPHA_REGEX.test(v) ? "" : `${label} must contain letters only.`;
        case "alphanumeric":
            return ALPHANUMERIC_REGEX.test(v)
                ? ""
                : `${label} must contain letters and numbers only.`;
        case "username":
            return USERNAME_REGEX.test(v)
                ? ""
                : `${label} may contain only letters, numbers and . _ - @`;
        default:
            return "";
    }
};
