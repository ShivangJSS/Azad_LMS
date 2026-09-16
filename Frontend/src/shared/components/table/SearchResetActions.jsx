export default function SearchResetActions({
    onSearch,
    onReset,
    loading = false,
}) {
    return (
        <div className="flex shrink-0 items-center gap-3">
            <button
                type="button"
                onClick={onSearch}
                disabled={loading}
                className="inline-flex h-[35px] min-w-[110px] items-center justify-center rounded-[4px] border border-[#7B216F] bg-[#7B216F] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#691B60] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? "Searching..." : "Search"}
            </button>

            <button
                type="button"
                onClick={onReset}
                disabled={loading}
                className="inline-flex h-[35px] min-w-[110px] items-center justify-center rounded-[4px] border border-[#344050] bg-white px-4 text-[14px] font-semibold text-[#344050] transition-colors hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-60"
            >
                Reset
            </button>
        </div>
    );
}
