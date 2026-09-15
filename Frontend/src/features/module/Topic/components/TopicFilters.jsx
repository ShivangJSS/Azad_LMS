import {
    inputClass,
} from "@/features/module/Topic/hook/Topicconstants";
import SearchResetActions from "@/shared/components/table/SearchResetActions";

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
            <SearchResetActions onSearch={onSearch} onReset={onReset} />

        </div>
    );
}
