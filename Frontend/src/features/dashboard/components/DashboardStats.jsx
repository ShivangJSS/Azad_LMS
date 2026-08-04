import React from "react";
import {
    FaBuilding,
    FaUsers,
    FaCubes,
    FaLayerGroup,
    FaFileAlt,
} from "react-icons/fa";

const statsConfig = [
    {
        key: "centres",
        label: "Centres",
        icon: FaBuilding,
        gradient: "bg-[linear-gradient(120deg,#3f5a52_0%,#5d8479_45%,#a9ccc0_100%)]",
        glow: "shadow-[0_10px_22px_-8px_rgba(214,178,74,0.55)]",
    },
    {
        key: "trainees",
        label: "Trainees",
        icon: FaUsers,
        gradient: "bg-[linear-gradient(120deg,#4a2242_0%,#3d4f61_55%,#2f7e7c_100%)]",
        glow: "shadow-[0_10px_22px_-8px_rgba(56,132,196,0.55)]",
    },
    {
        key: "modules",
        label: "Modules",
        icon: FaCubes,
        gradient: "bg-[linear-gradient(120deg,#dcaad2_0%,#b96bad_55%,#8e3b8a_100%)]",
        glow: "shadow-[0_10px_22px_-8px_rgba(129,180,229,0.55)]",
    },
    {
        key: "batches",
        label: "Batches",
        icon: FaLayerGroup,
        gradient: "bg-[linear-gradient(120deg,#28352d_0%,#41544a_55%,#75847a_100%)]",
        glow: "shadow-[0_10px_22px_-8px_rgba(96,180,120,0.55)]",
    },
    {
        key: "documents",
        label: "Documents",
        icon: FaFileAlt,
        gradient: "bg-[linear-gradient(120deg,#33101c_0%,#5c1e26_55%,#7e2f30_100%)]",
        glow: "shadow-[0_10px_22px_-8px_rgba(228,110,130,0.55)]",
    },
];

export default function StatsCards({
    centres = 0,
    trainees = 0,
    modules = 0,
    batches = 0,
    documents = 0,
}) {
    const values = { centres, trainees, modules, batches, documents };

    return (
        <div className="w-full bg-white px-[20px] pt-[4px] pb-[16px]">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-[20px] items-stretch">
                {statsConfig.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.key}
                            className={`group relative flex flex-col justify-center overflow-hidden h-full min-h-[124px] rounded-[14px] px-[18px] py-[16px] cursor-pointer transition-all duration-300 ease-out will-change-transform hover:-translate-y-[6px] hover:shadow-[0_18px_30px_-10px_rgba(0,0,0,0.35)] ${card.gradient} ${card.glow}`}
                        >
                            <span className="pointer-events-none absolute right-[-26px] bottom-[-56px] w-[150px] h-[150px] rounded-full bg-white/[0.10]" />
                            <span className="pointer-events-none absolute right-[54px] bottom-[-70px] w-[120px] h-[120px] rounded-full bg-white/[0.07]" />
                            <span className="pointer-events-none absolute right-[16px] top-[-34px] w-[92px] h-[92px] rounded-full bg-white/[0.07]" />

                            <div className="relative z-[1] flex flex-row items-center justify-between gap-[12px]">
                                <div className="flex flex-col min-w-0">
                                    <span className="block text-[13px] leading-[18px] font-semibold uppercase tracking-[0.06em] text-white whitespace-nowrap font-['Open_Sans']">
                                        {card.label}
                                    </span>

                                    <span className="block mt-[6px] text-[30px] leading-[38px] font-bold text-white font-['Open_Sans']">
                                        {values[card.key]}
                                    </span>
                                </div>

                                <div className="flex items-center justify-center shrink-0 w-[52px] h-[52px] rounded-full bg-white/[0.18] transition-all duration-300 group-hover:bg-white/[0.28] group-hover:scale-110">
                                    <Icon size={22} className="text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}