import { cn } from "@/lib/utils";

/*
 * shadcn/ui "skeleton" (style: base-nova) — registry item
 * https://ui.shadcn.com/r/styles/base-nova/skeleton.json
 * Ported to JSX (components.json has tsx: false); classes are verbatim.
 */
function Skeleton({ className, ...props }) {
    return (
        <div
            data-slot="skeleton"
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    );
}

export { Skeleton };
