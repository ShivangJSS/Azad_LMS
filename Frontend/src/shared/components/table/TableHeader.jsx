export default function TableHeader({
    totalEntries,
    startEntry,
    endEntry,
    search,
    setSearch,
}) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">

            <p className="text-sm text-gray-600">
                Showing {startEntry} to {endEntry} of {totalEntries} entries
            </p>

            <div className="flex items-center gap-2">

                <label className="text-sm font-medium">
                    Search:
                </label>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..." 
                    className="w-44 h-8 border border-gray-300 rounded-sm px-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-600"
                />

            </div>

        </div>
    );
}