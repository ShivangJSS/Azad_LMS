export default function EntriesDropdown({
    value,
    onChange,
    options = [10, 25, 50, 100],
}) {
    return (
        <div className="flex items-center gap-2">

            <span>Show</span>

            <select
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="border rounded-sm px-3 py-1 text-[#5E6E82] shadow-inner"
            >

                {options.map((option) => (

                    <option
                        key={option}
                        value={option}
                    >
                        {option}
                    </option>

                ))}

            </select>

            <span>Entries</span>

        </div>
    );
}