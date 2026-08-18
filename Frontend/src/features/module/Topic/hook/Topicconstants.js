import { LANGUAGES } from "../../../../shared/constants/languageConstants";

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
    search: "",
};

/* ==========================================================================
   TABLE COLUMNS
========================================================================== */

export const TOPIC_COLUMNS = [
    { key: "sno", title: "S. No.", width: "w-[90px]", align: "text-center" },
    { key: "topic_name", title: "Topic Name", width: "w-[340px]", align: "text-left" },
    { key: "module_name", title: "Module Name", width: "w-[260px]", align: "text-left" },
    { key: "language", title: "Language", width: "w-[130px]", align: "text-left" },
    { key: "status", title: "Status", width: "w-[120px]", align: "text-left" },
    { key: "action", title: "Action", width: "w-[240px]", align: "text-center" },
];

/* ==========================================================================
   INPUTS
========================================================================== */

export const inputClass =
    "h-[35px] w-full rounded-[4px] border border-[#D8E2EF] bg-white px-3 text-[14px] text-[#344050] placeholder:text-[#9DA9BB] shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] outline-none transition-all duration-200 focus:border-[#7B216F] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)]";

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
    "border border-[#6D1F5F] bg-[#7B216F] px-3 py-2  text-[14px] font-semibold text-white";

export const cellClass =
    "border border-[#E3E6ED] px-1 py-2  text-[14px] text-[#344050] items-center gap-2";
