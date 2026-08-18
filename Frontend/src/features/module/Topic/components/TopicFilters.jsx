import {
    inputClass,
    outlineButtonClass,
    primaryButtonClass,
} from "../hook/Topicconstants";

export default function TopicFilters({
    filters,
    onChange,
    onSearch,
    onReset,
}) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center w-full">

            {/* Search */}
            <div className="flex-[1]">
                <input
                    id="topic-search"
                    type="text"
                    value={filters.search}
                    placeholder="Search By Topic Name"
                    onChange={(e) => onChange("search", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    className={`${inputClass} rounded-sm shadow-inner text-[#5E6E82]`}
                />
            </div>

            {/* Buttons */}
            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-4">

                <button
                    type="button"
                    onClick={onSearch}
                    className={`${primaryButtonClass} w-full rounded-sm bg-[#732269] sm:w-30`}
                >
                    Search
                </button>

                <button
                    type="button"
                    onClick={onReset}
                    className={`${outlineButtonClass} w-full sm:w-30`}
                >
                    Reset
                </button>

            </div>

        </div>
    );
}
