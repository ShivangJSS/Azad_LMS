export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}) {
    if (totalPages <= 1) return null;

    const MAX_VISIBLE_PAGES = 5;

    let startPage = Math.max(
        1,
        currentPage - Math.floor(MAX_VISIBLE_PAGES / 2)
    );

    let endPage = startPage + MAX_VISIBLE_PAGES - 1;

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
    }

    const pages = [];

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="glass-pager inline-flex items-stretch">

            {/* First Page */}
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                aria-label="First page"
                title="First"
                className="glass-pager-btn border px-3 py-1 rounded-sm bg-white/60 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                First
            </button>

            {/* Previous */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                title="Previous"
                className="glass-pager-btn border px-3 py-1 rounded-sm bg-white/60 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span aria-hidden="true">&lsaquo;</span>
            </button>

            {/* Page Numbers */}
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    aria-current={
                        currentPage === page ? "page" : undefined
                    }
                    className={`glass-pager-btn px-3 py-1 rounded-sm border ${
                        currentPage === page
                            ? "bg-[#7b216f] text-white"
                            : "bg-white/60 hover:bg-gray-100"
                    }`}
                >
                    {page}
                </button>
            ))}

            {/* Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                title="Next"
                className="glass-pager-btn border px-3 py-1 rounded-sm bg-white/60 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span aria-hidden="true">&rsaquo;</span>
            </button>

            {/* Last Page */}
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
                title="Last"
                className="glass-pager-btn border px-3 py-1 rounded-sm bg-white/60 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Last
            </button>

        </div>
    );
}