import {
    inputClass,
    outlineButtonClass,
    primaryButtonClass,
} from "../hook/Listconstants";

export default function ListFilters({
    filters,
    onChange,
    onSearch,
    onReset,
}) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center w-full">

            {/* Search */}
            <div className="flex-[3]">
                <input
                    id="module-search"
                    type="text"
                    value={filters.search}
                    placeholder="Search By Module Name"
                    onChange={(e) =>
                        onChange("search", e.target.value)
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onSearch();
                        }
                    }}
                    className={`${inputClass} rounded-sm shadow-inner text-[#5E6E82]`}
                />
            </div>

            {/* Buttons */}
            <div className="flex shrink-0 items-center gap-4">

                <button
                    type="button"
                    onClick={onSearch}
                    className={`${primaryButtonClass} rounded-sm bg-[#732269]`}
                >
                    Search
                </button>

                <button
                    type="button"
                    onClick={onReset}
                    className={outlineButtonClass}
                >
                    Reset
                </button>

            </div>

        </div>
    );
}
