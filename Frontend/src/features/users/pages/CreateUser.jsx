import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "@/components/layout/AppLayout";


import UserForm from "@/features/users/components/UserForm";
import { createUser } from "@/features/users/services/UserService";

export default function CreateUser() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const handleCreate = async (data) => {
        try {
            setLoading(true);
            const payload = {
                ...data,
                role: Number(data.role),
                state_lgd_code: data.state_lgd_code
                    ? Number(data.state_lgd_code)
                    : null,
                district_lgd_code: data.district_lgd_code
                    ? Number(data.district_lgd_code)
                    : null,
                block_lgd_code: data.block_lgd_code
                    ? Number(data.block_lgd_code)
                    : null,
                centre_id: data.centre_id ? Number(data.centre_id) : null,
            };
            await createUser(payload);

            toast.success("User Created Successfully");

            navigate("/users/userlist");
        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Unable to create user."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#eef3f9]">

                <div className="flex justify-between items-center mb-4">

                    <p className="text-[25px] font-medium text-gray-700">
                        Create New User
                    </p>

                </div>

                <div className="bg-white border rounded-md shadow-sm p-6">

                    <UserForm
                        mode="create"
                        loading={loading}
                        onSubmit={handleCreate}
                        onCancel={() => navigate("/users/userlist")}
                    />

                </div>

            </div>
        </AppLayout>
    );
}