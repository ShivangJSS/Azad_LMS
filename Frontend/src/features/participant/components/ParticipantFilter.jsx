import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BRAND } from "./ParticipantTable";
import SearchResetActions from "@/shared/components/table/SearchResetActions";

export default function ParticipantFilter({
    filters,
    states,
    districts,
    centres,
    batches,
    totalCount,
    onFilterChange,
    onSearch,
    onReset,
    onAddTrainee,
}) {
    const navigate = useNavigate();

    const handleAddTrainee = () => {
        onAddTrainee?.();
        navigate("/participants/create");
    };

    return (
        <div className="bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
                <select
                    className="py-1 w-1/7 border border-[#d9e1ec] rounded-md px-4 text-[16px] text-[#253858] bg-white !shadow-inner focus:outline-none"
                    value={filters.state_id}
                    onChange={onFilterChange("state_id")}
                >
                    <option value="">Select State</option>
                    {states.map((s) => (
                        <option key={s.state_lgd_code} value={s.state_lgd_code}>
                            {s.state_name}
                        </option>
                    ))}
                </select>

                <select
                    className="py-1 w-1/7 border border-[#d9e1ec] rounded-md px-4 text-[16px] text-[#253858] bg-white !shadow-inner focus:outline-none disabled:bg-[#edf2f8]"
                    value={filters.district_id}
                    onChange={onFilterChange("district_id")}
                    disabled={!filters.state_id}
                >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                        <option key={d.district_lgd_code} value={d.district_lgd_code}>
                            {d.district_name}
                        </option>
                    ))}
                </select>

                <select
                    className="py-1 w-1/7 border border-[#d9e1ec] rounded-md px-4 text-[16px] text-[#253858] bg-white !shadow-inner focus:outline-none"
                    value={filters.centre_id}
                    onChange={onFilterChange("centre_id")}
                >
                    <option value="">Select Centre</option>
                    {centres.map((c) => (
                        <option key={c.centre_id} value={c.centre_id}>
                            {c.centre_name}
                        </option>
                    ))}
                </select>

                <select
                    className="py-1 w-1/7 border border-[#d9e1ec] rounded-md px-4 text-[16px] text-[#253858] bg-white !shadow-inner focus:outline-none"
                    value={filters.batch_id}
                    onChange={onFilterChange("batch_id")}
                >
                    <option value="">Select Batch</option>
                    {batches.map((b) => (
                        <option key={b.batch_id} value={b.batch_id}>
                            {b.batch_name}
                        </option>
                    ))}
                </select>

                <div className="relative flex-1 min-w-50">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b9bb2]" />

                    <input
                        type="text"
                        placeholder="Search By Trainee Name"
                        className="w-full py-1 border border-[#d9e1ec] rounded-md pl-9 pr-3 text-[16px] text-[#253858] !shadow-inner focus:outline-none"
                        value={filters.search}
                        onChange={onFilterChange("search")}
                        onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    />
                </div>

                <SearchResetActions onSearch={onSearch} onReset={onReset} />
            </div>

            <div className="border-t border-[#4FC3C3] mt-3 mb-3" />

            <div className="flex items-center justify-between px-1 ">
                <p className="text-[16px] font-medium text-[#253858]">
                    Total Trainees:{" "}
                    <span
                        className="font-bold"
                        style={{ color: BRAND }}
                    >
                        {totalCount}
                    </span>
                </p>

                <button
                    type="button"
                    onClick={handleAddTrainee}
                    style={{
                        backgroundColor: "white",
                        color: "#111827",
                        border: "1px solid #111827",
                    }}
                    className="py-1 flex items-center gap-2 px-4     text-[15px] font-medium !rounded-md hover:bg-gray-50 transition-colors"
                >
                    <Plus className="w-[18px] h-[18px]" />
                    Add Trainee
                </button>
            </div>
        </div>
    );
}