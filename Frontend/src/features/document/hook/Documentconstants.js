import { LANGUAGES } from "../../../shared/constants/languageConstants";

export const PER_PAGE = 10;

/* ==========================================================================
   FALLBACK LANGUAGES
========================================================================== */

export const FALLBACK_LANGUAGES = LANGUAGES.map((language) => ({
    id: language.id,
    name: language.name,
}));

/* ==========================================================================
   FILTERS
========================================================================== */

export const EMPTY_FILTERS = {
    title: "",
    doc_type: "",
};

/* ==========================================================================
   TABLE COLUMNS
========================================================================== */

export const DOCUMENT_COLUMNS = [
    { key: "sno", title: "S. No.", width: "w-[90px]", align: "text-center" },
    { key: "title", title: "Title", width: "", align: "text-left" },
    { key: "doc_type", title: "Doc Type", width: "w-[130px]", align: "text-left" },
    { key: "category", title: "Category", width: "w-[160px]", align: "text-left" },
    { key: "language", title: "Language", width: "w-[130px]", align: "text-left" },
    { key: "status", title: "Status", width: "w-[120px]", align: "text-left" },
    { key: "action", title: "Action", width: "w-[240px]", align: "text-center" },
];

/* ==========================================================================
   INPUTS
========================================================================== */

export const inputClass =
    "h-[35px] w-full rounded-[4px] border border-[#D8E2EF] bg-white px-3 text-[14px] text-[#344050] placeholder:text-[#9DA9BB] shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] outline-none transition-all duration-200 focus:border-[#7B216F] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)]";

export const selectClass =
    "h-[35px] w-full cursor-pointer appearance-none rounded-[4px] border border-[#D8E2EF] bg-white px-3 pr-10 text-[14px] text-[#344050] shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] outline-none transition-all duration-200 focus:border-[#7B216F] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] bg-[length:14px_11px] bg-no-repeat bg-[right_12px_center] bg-[url('data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Cpath fill=%22none%22 stroke=%22%235E6E82%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.6%2２ d=%2２m2 5 6 6 6-6%２２/%3E%3C/svg%3E')]";

/* ==========================================================================
   BUTTONS
========================================================================== */

export const primaryButtonClass =
    "flex h-[35px] w-[115px] items-center justify-center !rounded-sm border border-[#7B216F] bg-[#7B216F] text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#691B60]";

export const outlineButtonClass =
    "flex h-[35px] w-[115px] items-center justify-center !rounded-sm border-1 border-[#030303] bg-white text-[15px] font-semibold text-[#344050] transition-all duration-200 hover:bg-[#F8F9FA]";
/* ==========================================================================
   TABLE
========================================================================== */

export const headCellClass =
    "border border-[#6D1F5F] bg-[#7B216F] px-4 py-[10px] text-[14px] font-semibold text-white";

export const cellClass =
    "border border-[#E3E6ED] px-2 py-[10px] text-[14px] text-[#344050]";