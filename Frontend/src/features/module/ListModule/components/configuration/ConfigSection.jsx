/* =========================================================
   ConfigSection

   A single Module-Configuration block:
   - purple header bar
   - white body (table / tabs live here as children)
   - circular purple "+" FAB at the bottom-right

   Purely presentational. All data + handlers are passed in,
   matching the existing design system (#732269 primary).
========================================================= */

export default function ConfigSection({
    title,
    children,
    onAdd,
    addTitle = "Add",
    addDisabled = false,
}) {
    return (
        <div className="relative mb-[34px]">

            {/* ================= HEADER BAR ================= */}

            <div className="rounded-t-[4px] bg-[#732269] px-[16px] py-[10px]">
                <span className="text-[14px] font-semibold text-white">
                    {title}
                </span>
            </div>

            {/* ================= BODY ================= */}

            <div className="rounded-b-[4px] border border-t-0 border-[#e3d3e0] bg-white px-[16px] pb-[42px] pt-[16px]">
                {children}
            </div>

            {/* ================= ADD FAB ================= */}

            <button
                type="button"
                onClick={onAdd}
                disabled={addDisabled}
                title={addTitle}
                aria-label={addTitle}
                style={{ borderRadius: "9999px" }}
                className={`absolute -bottom-[18px] right-[22px] flex aspect-square h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full text-[22px] leading-none text-white shadow-md transition
                ${
                    addDisabled
                        ? "cursor-not-allowed bg-[#b98fb0]"
                        : "bg-[#732269] hover:bg-[#611c58]"
                }`}
            >
                +
            </button>

        </div>
    );
}
