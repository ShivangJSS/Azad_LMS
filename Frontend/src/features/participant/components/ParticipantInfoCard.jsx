import { FaEnvelope, FaMapMarkerAlt, FaMobileAlt, FaIdCard, } from "react-icons/fa";
import { getParticipantReport } from "../services/ParticipantService";
import { useEffect, useState } from "react";

const labelClass = "text-[12px] text-[#7F8C8D]";
const valueClass = "text-[13px] text-[#344050] font-medium";

export default function ParticipantInfoCard({ participantId }) {
    const [participant, setParticipant] = useState(null);

    useEffect(() => {
        console.log("useEffect fired");
        console.log("participantId =", participantId);
        const fetchParticipant = async () => {
            console.log("Fetching participant...");

            try {
                const data = await getParticipantReport(participantId);
                console.log("Response:", data);
                setParticipant(data);
            } catch (error) {
                console.error(error);
            }
        };

        if (participantId) {
            fetchParticipant();
        }
    }, [participantId]);

    return (
        <div className="bg-white border border-[#D8E2EF] rounded-md p-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left */}

                <div className="flex items-start gap-4">

                    <img
                        src={
                            participant?.image ||
                            "https://ui-avatars.com/api/?name=User&background=732269&color=fff"
                        }
                        alt="participant"
                        className="w-16 h-16 rounded-full object-cover border"
                    />

                    <div>

                        <h2 className="text-[18px] font-semibold text-[#344050]">
                            {participant?.participant_name || "-"}
                        </h2>

                        <p className="text-[12px] text-[#8A8D91] mb-3">
                            Thank you for participating in the assessment.
                        </p>

                        <div className="flex items-center gap-2 mb-2">
                            <FaIdCard size={12} className="text-gray-500" />
                            <span className={labelClass}>
                                Enrollment :
                            </span>

                            <span className={valueClass}>
                                {participant?.enrollment_no || "-"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt size={12} className="text-gray-500" />
                            <span className={labelClass}>
                                Location :
                            </span>

                            <span className={valueClass}>
                                {participant?.address || "-"}
                            </span>
                        </div>

                    </div>

                </div>

                {/* Middle */}

                <div className="flex flex-col justify-center gap-4">

                    <div className="flex items-center gap-2">

                        <FaMobileAlt
                            size={12}
                            className="text-gray-500"
                        />

                        <span className={labelClass}>
                            Mobile :
                        </span>

                        <span className={valueClass}>
                            {participant?.mobile_no || "-"}
                        </span>

                    </div>

                    <div className="flex items-center gap-2">

                        <FaIdCard
                            size={12}
                            className="text-gray-500"
                        />

                        <span className={labelClass}>
                            State :
                        </span>

                        <span className={valueClass}>
                            {participant?.state_name || "-"}
                        </span>

                    </div>

                </div>

                {/* Right */}

                <div className="flex flex-col justify-center gap-4">

                    <div className="flex items-center gap-2">

                        <FaEnvelope
                            size={12}
                            className="text-gray-500"
                        />

                        <span className={labelClass}>
                            Email :
                        </span>

                        <span className={valueClass}>
                            {participant?.email || "-"}
                        </span>

                    </div>

                    <div className="flex items-center gap-2">

                        <FaIdCard
                            size={12}
                            className="text-gray-500"
                        />

                        <span className={labelClass}>
                            District :
                        </span>

                        <span className={valueClass}>
                            {participant?.district_name || "-"}
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
}