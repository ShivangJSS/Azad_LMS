import CenterUserForm from "../components/CenterUserForm";
import AppLayout from "../../../components/layout/AppLayout";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";
export default function EditCenter() {
    const breadcrumbItems = [
        { label: "Home", path: "/dashboard" },
        { label: "Centre Masters", path: "/centres/list" },
        { label: "Edit Centre" }
    ];

    return (
        <AppLayout>
            <div className="w-full flex items-center justify-between mb-[20px] px-3">

                <div className="text-[20px]  font-medium text-[#344050] font-[Poppins]">
                    Edit Centre
                </div>

                <Breadcrumbs items={breadcrumbItems} />
            </div>
            <CenterUserForm />
        </AppLayout>
    )
}
