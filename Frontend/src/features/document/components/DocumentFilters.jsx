// import {
//     inputClass,
//     outlineButtonClass,
//     primaryButtonClass,
//     selectClass,
// } from "../hook/Documentconstants";

// export default function DocumentFilters({
//     filters,
//     docTypes = [],
//     onChange,
//     onSearch,
//     onReset,
// }) {
//     return (
//         <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full">

//             {/* Search */}
//             <div className="flex-[3.8]">
//                 <input
//                     id="document-title"
//                     type="text"
//                     value={filters.title}
//                     onChange={(e) => onChange("title", e.target.value)}
//                     onKeyDown={(e) => e.key === "Enter" && onSearch()}
//                     placeholder="Search By Document Title"
//                     className={`${inputClass} h-[38px] w-full`}
//                 />
//             </div>

//             {/* Document Type */}
//             <div className="flex-[1.2]">
//                 <select
//                     id="document-type"
//                     value={filters.doc_type}
//                     onChange={(e) => onChange("doc_type", e.target.value)}
//                     className={`${selectClass} h-[38px] w-full`}
//                 >
//                     <option value="">All Document Types</option>

//                     {docTypes.map((type) => (
//                         <option key={type.id} value={type.id}>
//                             {type.name}
//                         </option>
//                     ))}
//                 </select>
//             </div>

//             {/* Buttons */}
//             <div className="flex items-center gap-4 shrink-0">

//                 <button
//                     type="button"
//                     onClick={onSearch}
//                     className={`${primaryButtonClass} h-[38px] w-[140px]`}
//                 >
//                     Search
//                 </button>

//                 <button
//                     type="button"
//                     onClick={onReset}
//                     className={`${outlineButtonClass} h-[38px] w-[130px]`}
//                 >
//                     Reset
//                 </button>

//             </div>

//         </div>
//     );
// }


import { FaChevronDown } from "react-icons/fa";

import {
    inputClass,
    outlineButtonClass,
    primaryButtonClass,
    selectClass,
} from "../hook/Documentconstants";

export default function DocumentFilters({
    filters,
    docTypes = [],
    onChange,
    onSearch,
    onReset,
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