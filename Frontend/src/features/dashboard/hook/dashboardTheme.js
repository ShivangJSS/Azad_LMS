export const INK = "#1F1B2E";        // headings / primary text
export const SUB = "#6B6478";        // muted labels, axis ticks
export const LINE = "#EDEAF2";       // hairline borders
export const PAGE_BG = "#F7F6FA";    // page background (light lavender)

export const BRAND = "#732269";      // Azad purple
export const GREEN = "#10B981";      // positive / trend

/* Card surface used by the KPI cards and the filter bar. */
export const CARD_CLASS =
    "rounded-[14px] border border-[#EDEAF2] bg-white shadow-[0_1px_2px_rgba(31,27,46,0.04),0_10px_28px_-20px_rgba(31,27,46,0.20)]";

const PURPLE_RAMP = [
    "#4A1443",
    "#5F1B57",
    "#732269",
    "#8C3A82",
    "#A55A9C",  
    "#BE7EB6",
    "#D2A2CC",
    "#E0BEDC",
    "#EBD4E8",
    "#F3E6F1",
];

/* Trainee status keeps its semantic colours (red = poor, green = good). */
export const STATUS_COLORS = {
    YetToStart: "#B9B3C4",
    Poor: "#E0574B",
    Average: "#E8A23D",
    Good: "#10B981",
};

export const DONUT_FALLBACK = ["#732269", "#10B981", "#3D7FD6", "#E8A23D", "#A55A9C"];

/* Pick `count` evenly-spaced colours from the purple ramp. */
export function rampColors(count) {
    if (count <= 0) return [];
    if (count === 1) return [PURPLE_RAMP[2]];
    const last = PURPLE_RAMP.length - 1;
    return Array.from({ length: count }, (_, i) =>
        PURPLE_RAMP[Math.round((i / (count - 1)) * last)]
    );
}

export const formatNumber = (n) =>
    typeof n === "number" && Number.isFinite(n) ? n.toLocaleString("en-IN") : "0";

export const GLASS_SHELL_STYLE = {
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.85)",
    boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.95), 0 14px 34px -20px rgba(45,34,53,0.34), 0 2px 6px -3px rgba(45,34,53,0.10)",
};

export const GLASS_PANE_STYLE = {
    background:
        "linear-gradient(158deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.70) 46%, rgba(250,247,251,0.78) 100%)",
    backdropFilter: "blur(18px) saturate(1.35)",
    WebkitBackdropFilter: "blur(18px) saturate(1.35)",
};
export const ACCENTS = {
    purple:  { icon: "#732269", title: "#6A1F61", tint: "rgba(115,34,105,0.11)", glow: "rgba(115,34,105,0.055)" },
    blue:    { icon: "#2C8FE0", title: "#1F6FB8", tint: "rgba(44,143,224,0.13)", glow: "rgba(44,143,224,0.060)" },
    orchid:  { icon: "#A93FBF", title: "#8B2FA0", tint: "rgba(169,63,191,0.13)", glow: "rgba(169,63,191,0.055)" },
    emerald: { icon: "#10B981", title: "#0A7F5C", tint: "rgba(16,185,129,0.13)", glow: "rgba(16,185,129,0.055)" },
    amber:   { icon: "#E8A23D", title: "#A9701A", tint: "rgba(232,162,61,0.16)", glow: "rgba(232,162,61,0.070)" },
    teal:    { icon: "#00B8AD", title: "#00807A", tint: "rgba(0,184,173,0.13)", glow: "rgba(0,184,173,0.060)" },
};
