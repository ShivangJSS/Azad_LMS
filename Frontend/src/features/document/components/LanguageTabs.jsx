// export default function LanguageTabs({ languages = [], active, onChange }) {
//     return (
//         <div className="flex gap-[4px] border-b border-[#D8E2EF] px-3">
//             {languages.map((item) => {
//                 const value = String(item.id);
//                 const isActive = value === String(active);

//                 return (
//                     <button
//                         key={value}
//                         type="button"
//                         onClick={() => onChange(value)}
//                         aria-current={isActive ? "page" : undefined}
//                         className={`h-[38px] rounded-t-[4px] px-[24px] text-[14px] font-medium transition-colors ${isActive
//                                 ? "bg-[#7b216f] !text-white"
//                                 : "bg-white text-[#5E6E82] hover:bg-[#F5F7FA]"
//                             }`}
//                     >
//                         {item.name}
//                     </button>
//                 );
//             })}
//         </div>
//     );
// }
export default function LanguageTabs({ languages = [], active, onChange }) {
    return (
        <div className="flex w-full items-stretch  border-b border-[#D8E2EF] pb-0">
            {languages.map((item) => {
                const value = String(item.id);
                const isActive = value === String(active);

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onChange(value)}
                        className={`relative h-10 min-w-25 rounded-t-lg border border-b-0  text-[14px] font-medium transition-colors ${isActive
                            ? "z-10  border-[#732269] bg-[#732269] text-white!"
                            : "border-[#D8E2EF] bg-white text-[#5E6E82] hover:bg-[#F8FAFC]"
                            }`}
                    >
                        {item.name}

                        {isActive && (
                            <span className="pointer-events-none absolute -bottom-1.5 left-0 h-0 w-0 border-t-8 border-r-10 border-t-[#5c1856] border-r-transparent" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}