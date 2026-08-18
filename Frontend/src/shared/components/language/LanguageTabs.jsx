import { LANGUAGES } from "../../constants/languageConstants";

const PURPLE = "#732269";

export default function LanguageTabs({ activeTab, onChange }) {
    const activeIndex = LANGUAGES.findIndex(
        (language) => language.key === activeTab
    );

    return (
        <div className="flex flex-wrap items-end">
            {LANGUAGES.map((language, index) => {
                const isActive = language.key === activeTab;

                return (
                    <button
                        key={language.id}
                        type="button"
                        onClick={() => onChange(language.key)}
                        className={`relative px-3 py-1.5 text-[14px] font-medium  !rounded-b-none  overflow-visible ${
                            isActive
                                ? "!text-white"
                                : "!bg-white !text-[#4d5969] hover:!bg-[#f7f8fa]"
                        }`}
                    >
                        {isActive && (
                            <span
                                className="absolute inset-0 z-0 !rounded-t-md transition-all duration-500 ease-in-out"
                                style={{
                                    backgroundColor: PURPLE,
                                }}
                            />
                        )}

                        <span className="relative z-10">
                            {language.label}
                        </span>

                        {isActive && (
                            <span
                                className="absolute left-1/2 -bottom-[5px] h-[9px] w-[9px] -translate-x-1/2 rotate-45 transition-all duration-500 ease-in-out"
                                style={{ backgroundColor: PURPLE }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}