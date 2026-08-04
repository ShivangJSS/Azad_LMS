export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}) {

    if (totalPages <= 1) return null;

    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="flex gap-2">

            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border px-3 py-1 rounded-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded-sm border ${currentPage === page
                            ? "bg-[#7b216f] text-white"
                            : "hover:bg-gray-100"
                        }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border px-3 py-1 rounded-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>

        </div>
    );
}