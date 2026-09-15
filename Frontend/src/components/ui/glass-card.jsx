import { useCallback } from "react";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const VARIANT_CLASS = {
    // Background is also set as a utility so it replaces shadcn's `bg-card`
    // (cn/tailwind-merge keeps the last background utility that is passed).
    card: "glass-card bg-(--glass-white-card)",
    panel: "glass-panel bg-(--glass-white-soft)",
    solid: "glass-solid bg-(--glass-white-solid)",
};

/*
 * Reset the shadcn defaults that would change the existing look:
 *   - `text-sm` / `text-card-foreground`  -> inherit the page's font size & color
 *   - `py-(--card-spacing)` + `gap-...`    -> no built-in vertical padding/gap; the
 *                                            existing header/content keep their own
 *   - `ring-1`                             -> the glass surface supplies its own border
 */
const RESET_CLASS =
    "gap-0 py-0 text-[length:inherit] text-[color:inherit] ring-0 rounded-[16px]";

/*
 * Writes the pointer position into CSS variables read by `.glass-spotlight`
 * / `.glass-spot`, and (with `tilt`) the small perspective angles read by
 * `.glass-tilt` (max ±maxTilt degrees, applied only while hovered).
 */
export function useSpotlight(enabled = true, onMouseMove, { tilt = false, maxTilt = 4 } = {}) {
    return useCallback(
        (event) => {
            if (enabled) {
                const el = event.currentTarget;
                const rect = el.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                el.style.setProperty("--spot-x", `${x}px`);
                el.style.setProperty("--spot-y", `${y}px`);
                if (tilt && rect.width && rect.height) {
                    const ry = ((x / rect.width - 0.5) * 2 * maxTilt).toFixed(2);
                    const rx = ((0.5 - y / rect.height) * 2 * maxTilt).toFixed(2);
                    el.style.setProperty("--tilt-x", `${rx}deg`);
                    el.style.setProperty("--tilt-y", `${ry}deg`);
                }
            }
            if (onMouseMove) onMouseMove(event);
        },
        [enabled, onMouseMove, tilt, maxTilt]
    );
}

function GlassCard({
    variant = "card",
    hover = false,
    spotlight = false,
    className,
    onMouseMove,
    ...props
}) {
    const handleMouseMove = useSpotlight(spotlight, onMouseMove);

    return (
        <Card
            data-glass={variant}
            className={cn(
                RESET_CLASS,
                VARIANT_CLASS[variant] || VARIANT_CLASS.card,
                hover && "glass-hover",
                spotlight && "glass-spotlight",
                className
            )}
            onMouseMove={spotlight || onMouseMove ? handleMouseMove : undefined}
            {...props}
        />
    );
}

/* Brand-colored card header (the purple strip used on dashboard panels). */
function GlassCardHeader({ className, ...props }) {
    return (
        <CardHeader
            className={cn(
                "flex flex-row items-center justify-between gap-[8px] rounded-t-[16px] bg-[#6B2D5B] px-[18px] py-[10px] text-[13px] font-semibold tracking-[0.02em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
                className
            )}
            {...props}
        />
    );
}

function GlassCardContent({ className, ...props }) {
    return <CardContent className={cn("px-0", className)} {...props} />;
}

/*
 * GlassIcon — frosted circular icon container.
 *   tone="light"  white glass, for use on brand/dark surfaces (default)
 *   tone="brand"  brand-tinted glass, for use on light surfaces
 * Size/spacing come from className (e.g. "h-[52px] w-[52px]").
 */
const ICON_TONE = {
    light: "glass-icon glass-icon--light",
    brand: "glass-icon glass-icon--brand",
};

function GlassIcon({ tone = "light", className, ...props }) {
    return (
        <span
            data-slot="glass-icon"
            className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-full",
                ICON_TONE[tone] || ICON_TONE.light,
                className
            )}
            {...props}
        />
    );
}

export {
    GlassCard,
    GlassCardHeader,
    GlassCardContent,
    GlassIcon,
    CardTitle,
    CardDescription,
    CardAction,
    CardFooter,
};
