// Reusable stat "tile" used by the report summary and each module block.
// Shell only: caller supplies the value markup as children so each card
// (Total Questions / Score / Percentage / Progress) can format its own value.

export default function ScoreCard({ icon, label, children, footer }) {
    return (
        <div className="flex-1 min-w-[200px] rounded-[6px] border border-[#D8E2EF] bg-white p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F4EEF3] text-[#732269]">
                    {icon}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-[#8A94A6]">
                        {label}
                    </div>

                    <div className="mt-1">{children}</div>
                </div>
            </div>

            {footer && (
                <div className="mt-3 border-t border-[#EDF0F5] pt-2">
                    {footer}
                </div>
            )}
        </div>
    );
}
