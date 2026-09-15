import { useEffect, useState } from "react";

export default function TableHeader({
    totalEntries,
    startEntry,
    endEntry,
    search,
    setSearch,
    // Hide the built-in search box on pages that have their own filter row
    // (e.g. the Users list), so there's never a duplicate search bar.
    showSearch = true,
}) {
    // The box edits a local draft; the search is only applied when the user
    // clicks Search or presses Enter — never on every keystroke.
    const [draft, setDraft] = useState(search ?? "");

    // Keep the draft in sync when the applied search is cleared externally.
    useEffect(() => {
        setDraft(search ?? "");
    }, [search]);

    const applySearch = () => setSearch?.(draft.trim());

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-2">

            {<p className="m-0 text-[14px] font-bold text-[#344050]">
                Total Centre (s):{" "}
                <span className="text-[#7b216f]">{totalEntries}</span>
            </p>}

            {showSearch && setSearch && (
                <div className="flex items-center gap-2">

                    <label className="text-sm font-medium">
                        Search:
                    </label>

                    <input
                        type="text"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && applySearch()}
                        placeholder="Search..."
                        className="w-44 h-8 border border-gray-300 rounded-sm px-2 bg-white/80 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />

                    <button
                        type="button"
                        onClick={applySearch}
                        className="h-8 px-4 bg-[#7e2081] text-white text-sm rounded-sm hover:bg-[#6a1b6d] transition-colors"
                    >
                        Search
                    </button>
                </div>
            )}

        </div>
    );
}
