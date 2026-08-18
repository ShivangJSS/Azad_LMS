import {
    FaEnvelope,
    FaMapMarkerAlt,
    FaMobileAlt,
    FaIdCard,
} from "react-icons/fa";

import { getParticipantImageUrl } from "../../../shared/utils/mediaUrl";

const toMediaUrl = getParticipantImageUrl;

const labelClass = "text-[12px] text-[#7F8C8D]";
const valueClass = "text-[13px] text-[#344050] font-medium";

/**
 * Participant profile header for the report page.
 * Receives the already-fetched `participant` object (report.participant).
 */
export default function ParticipantInfoCard({ participant }) {
    const p = participant || {};

    return (
        <div className="rounded-md border border-[#D8E2EF] bg-white p-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Left */}
                <div className="flex items-start gap-4">
                    <img
                        src={
                            toMediaUrl(p.image) ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                p.participant_name || "User"
                            )}&background=732269&color=fff`
                        }
                        alt="participant"
                        className="h-16 w-16 rounded-full border object-cover"
                        onError={(e) => {
                            // Fall back to a generated initials avatar if the
                            // stored photo can't be loaded.
                            const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                p.participant_name || "User"
                            )}&background=732269&color=fff`;
                            if (e.currentTarget.src !== fallback) {
                                e.currentTarget.src = fallback;
                            }
                        }}
                    />

                    <div>
                        <h2 className="text-[18px] font-semibold text-[#344050]">
                            {p.participant_name || "-"}
                        </h2>

                        <p className="mb-3 text-[12px] text-[#8A8D91]">
                            Thank you for participating in the assessment.
                        </p>

                        <div className="mb-2 flex items-center gap-2">
                            <FaIdCard size={12} className="text-gray-500" />
                            <span className={labelClass}>Enrollment :</span>
                            <span className={valueClass}>
                                {p.enrollment_no || "-"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt size={12} className="text-gray-500" />
                            <span className={labelClass}>Location :</span>
                            <span className={valueClass}>{p.location || "-"}</span>
                        </div>
                    </div>
                </div>

                {/* Middle */}
                <div className="flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <FaMobileAlt size={12} className="text-gray-500" />
                        <span className={labelClass}>Mobile :</span>
                        <span className={valueClass}>{p.mobile_no || "-"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <FaIdCard size={12} className="text-gray-500" />
                        <span className={labelClass}>State :</span>
                        <span className={valueClass}>{p.state_name || "-"}</span>
                    </div>
                </div>

                {/* Right */}
                <div className="flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <FaEnvelope size={12} className="text-gray-500" />
                        <span className={labelClass}>Email :</span>
                        <span className={valueClass}>{p.email || "-"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <FaIdCard size={12} className="text-gray-500" />
                        <span className={labelClass}>District :</span>
                        <span className={valueClass}>
                            {p.district_name || "-"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
