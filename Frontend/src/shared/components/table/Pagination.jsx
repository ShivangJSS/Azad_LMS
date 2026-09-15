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
        <div className="glass-pager inline-flex items-stretch">

            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                title="Previous"
                className="glass-pager-btn border px-3 py-1 rounded-sm bg-white/60 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span aria-hidden="true">&lsaquo;</span>
            </button>

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    aria-current={currentPage === page ? "page" : undefined}
                    className={`glass-pager-btn px-3 py-1 rounded-sm border ${currentPage === page
                        ? "bg-[#7b216f] text-white"
                        : "bg-white/60 hover:bg-gray-100"
                        }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                title="Next"
                className="glass-pager-btn border px-3 py-1 rounded-sm bg-white/60 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span aria-hidden="true">&rsaquo;</span>
            </button>

        </div>
    );
}