import { FaChevronDown } from "react-icons/fa";

import {
    inputClass,
    selectClass,
} from "@/features/document/hook/Documentconstants";
import SearchResetActions from "@/shared/components/table/SearchResetActions";

export default function DocumentFilters({
    filters,
    docTypes = [],
    onChange,
    onSearch,
    onReset,
    onApply,
}) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center w-full">

            {/* Search */}
            <div className="flex-[3]">
                <input
                    id="document-title"
                    type="text"
                    value={filters.title}
                    placeholder="Search By Document Title"
                    onChange={(e) => onChange("title", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    className={`${inputClass} rounded-sm shadow-inner text-[#5E6E82]`}
                />
            </div>

            {/* Document Type */}
            <div className="relative flex-[1.2]">

                <select
                    id="document-type"
                    value={filters.doc_type}
                    onChange={(e) => onChange("doc_type", e.target.value)}
                    className={`${selectClass} rounded-sm shadow-inner text-[#5E6E82]`}
                >
                    <option value="">All Document Types</option>

                    {docTypes.map((type) => (
                        <option
                            key={type.id}
                            value={type.id}
                        >
                            {type.name}
                        </option>
                    ))}
                </select>

                <FaChevronDown
                    size={12}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
                />

            </div>

            {/* Buttons */}
            <SearchResetActions onSearch={onSearch} onReset={onReset} />

        </div>
    );
}