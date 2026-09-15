import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { LANGUAGES } from "@/shared/constants/languageConstants";

const PURPLE = "#732269";


export default function LanguageTabs({ activeTab, onChange }) {
    const activeIndex = LANGUAGES.findIndex(
        (language) => language.key === activeTab
    );

    const stripRef = useRef(null);
    const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

    const measure = () => {
        const strip = stripRef.current;
        const el = strip && strip.querySelector('[data-tab-active="true"]');
        if (!el) return;
        setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    };

    // Re-measure when the active tab changes (before paint, so no flicker).
    useLayoutEffect(measure, [activeTab]);

    // Keep the indicator aligned if the strip wraps/resizes.
    useEffect(() => {
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    const isFirst = activeIndex === 0;
    const isLast = activeIndex === LANGUAGES.length - 1;

    return (
        <div ref={stripRef} className="glass-tabs relative flex flex-wrap items-end">
            {/* Sliding highlight (sits above tab backgrounds, below labels). */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 z-[1] h-[44px]"
                style={{
                    left: indicator.left,
                    width: indicator.width,
                    backgroundColor: PURPLE,
                    borderRadius: `${isFirst ? 8 : 0}px ${isLast ? 8 : 0}px 0 0`,
                    opacity: indicator.ready ? 1 : 0,
                    transition:
                        "left 0.32s cubic-bezier(0.22, 0.61, 0.36, 1), width 0.32s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.2s ease",
                }}
            >
                <span
                    className="absolute left-1/2 -bottom-[5px] h-[9px] w-[9px] -translate-x-1/2 rotate-45"
                    style={{ backgroundColor: PURPLE }}
                />
            </span>

            {LANGUAGES.map((language) => {
                const isActive = language.key === activeTab;

                return (
                    <button
                        key={language.id}       
                        type="button"
                        data-tab-active={isActive}
                        onClick={() => onChange(language.key)}
                        className={`relative -ml-px first:ml-0 h-[44px] min-w-[96px] px-[22px] text-[15px] font-medium border border-[#d8e2ef] !rounded-b-none first:!rounded-tl-[8px] last:!rounded-tr-[8px] overflow-visible transition-colors duration-300 ${
                            isActive
                                ? "z-[2] !border-[#732269] !bg-[#732269] !text-white"
                                : "!bg-white !text-[#4d5969] hover:!bg-[#f7f8fa] hover:!text-[#732269]"
                        }`}
                    >
                        <span className="relative z-10">
                            {language.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
