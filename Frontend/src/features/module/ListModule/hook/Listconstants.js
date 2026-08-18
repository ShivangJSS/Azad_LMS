import { LANGUAGES } from "../../../../shared/constants/languageConstants";

export const PER_PAGE = 10;

/* ==========================================================================
   FALLBACK LANGUAGES
========================================================================== */

export const FALLBACK_LANGUAGES = LANGUAGES.map((language) => ({
    id: language.id,
    key: language.key,
    name: language.label,
    label: language.label,
    code: language.code,
}));

/* ==========================================================================
   FILTERS
========================================================================== */

export const EMPTY_FILTERS = {
    search: "",
};

/* ==========================================================================
   MODULE TYPES
========================================================================== */

export const MODULE_TYPES = {
    1: "Technical",
    2: "Non Technical",
};

/* ==========================================================================
   STATUS
========================================================================== */

export const STATUS_OPTIONS = {
    1: "Active",
    0: "Inactive",
};

/* ==========================================================================
   TABLE COLUMNS
========================================================================== */

export const MODULE_COLUMNS = [
    {
        key: "serial",
        title: "S. No.",
        width: "w-[6%]",
        align: "center",
    },
    {
        key: "module_name",
        title: "Module Name",
        width: "w-[21%]",
        align: "left",
    },
    {
        key: "module_type",
        title: "Module Type",
        width: "w-[12%]",
        align: "left",
    },
    {
        key: "topic_count",
        title: "Number of Topics",
        width: "w-[12%]",
        align: "center",
    },
    {
        key: "language_name",
        title: "Language",
        width: "w-[10%]",
        align: "left",
    },
    {
        key: "status",
        title: "Status",
        width: "w-[8%]",
        align: "left",
    },

    // THIS WAS MISSING
    {
        key: "actions",
        title: "Action",
        width: "w-[31%]",
        align: "center",
    },
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
    "flex h-[35px] w-[115px] items-center justify-center !rounded-sm border border-[#7B216F] bg-[#7B216F] text-[15px] font-semibold !text-white transition-all duration-200 hover:bg-[#691B60]";

export const outlineButtonClass =
    "flex h-[35px] w-[115px] items-center justify-center !rounded-sm border border-[#030303] bg-white text-[15px] font-semibold text-[#344050] transition-all duration-200 hover:bg-[#F8F9FA]";

/* ==========================================================================
   TABLE
========================================================================== */

export const headCellClass =
    "border border-[#6D1F5F] bg-[#7B216F] px-4 py-[10px] text-[14px] font-semibold !text-white";

export const cellClass =
    "border border-[#E3E6ED] px-2 py-[10px] text-[14px] text-[#344050]";