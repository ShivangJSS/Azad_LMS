import { FiPlus } from "react-icons/fi";


export default function FloatingAddButton({
    onClick,
    title = "Create New Record",
    iconSize = 30,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            className="fixed bottom-[32px] right-[32px] z-[900] flex h-15 w-15 items-center justify-center !rounded-full bg-[#732269] text-white shadow-[0_8px_22px_rgba(115,34,105,0.5)] transition-all duration-200 ease-out hover:scale-110 hover:bg-[#611c58] hover:shadow-[0_14px_32px_rgba(115,34,105,0.6)] active:scale-95"
        >
            <FiPlus size={iconSize} />
        </button>
    );
}
