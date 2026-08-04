import AppLayout from "../../../components/layout/AppLayout";
import ParticipantInfoCard from "../components/ParticipantInfoCard";
import { useParams } from "react-router-dom";

export default function ParticipantViewReport() {
    const { id } = useParams();
    console.log("ParticipantViewReport participantId:", id);

    return (
        <AppLayout>
            <div className="flex flex-col gap-4">
                <ParticipantInfoCard participantId={id} />
            </div>
        </AppLayout>
    )
}
