import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";

import MatchMakingForm from "../components/MatchMakingForm";

export default function MatchMakingAdd() {

    return (
        <AppLayout>

            <div className="mb-3 flex items-center justify-between">

                <span className="text-[22px] font-medium">
                    Add Match Making Question
                </span>

                <Breadcrumbs
                    items={[
                        {
                            label: "Home",
                            path: "/dashboard",
                        },
                        {
                            label: "Match Making Questions",
                            path: "/match-making-master",
                        },
                        {
                            label: "Create",
                            path: "/match-making-master/create",
                        },
                    ]}
                />

            </div>

            <MatchMakingForm />

        </AppLayout>
    );
}