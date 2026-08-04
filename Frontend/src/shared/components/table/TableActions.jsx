export default function TableActions({
    onView,
    onEdit,
    onDelete,
    showView = true,
    showEdit = true,
    showDelete = true,
}) {
    return (
        <div className="flex gap-2">

            {showView && onView && (
                <button
                    type="button"
                    onClick={onView}
                    className="border-2 border-[#732269] text-[#732269] px-2  py-0 rounded-sm! text-[10px] transition "
                >
                    View
                </button>
            )}

            {showEdit && onEdit && (
                <button 
                    type="button"
                    onClick={onEdit}
                    className="bg-[#732269] text-white px-3 py-0 rounded-sm! text-[10px] hover:opacity-90"
                >
                    Edit
                </button>
            )}

            {showDelete && onDelete && (
                <button 
                    type="button"
                    onClick={onDelete}
                    className="bg-[#DE4A4A] text-white px-2 py-0 rounded-sm! text-[10px] hover:bg-red-600"
                >
                    Delete
                </button>
            )}

        </div>
    );
}