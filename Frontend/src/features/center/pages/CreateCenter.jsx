import React from "react";
import AppLayout from "../../../components/layout/AppLayout";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";
import CenterUserForm from "../components/CenterUserForm";

export default function CreateCentre() {

    const breadcrumbItems = [
        { label: "Home", path: "/dashboard" },
        { label: "Centre Masters", path: "/centres/list" },
        { label: "Add Centre" },
    ];

    return (
        <AppLayout>

            <div className="w-full">

                {/* PAGE TITLE + BREADCRUMB */}
                <div className="w-full flex items-center justify-between mb-[20px] px-3">

                    <div className="text-[20px]  font-medium text-[#344050] font-[Poppins]">
                        Centre Masters
                    </div>

                    <Breadcrumbs items={breadcrumbItems} />

                </div>

                {/* FORM */}
                <CenterUserForm />

            </div>

        </AppLayout>
    );
}