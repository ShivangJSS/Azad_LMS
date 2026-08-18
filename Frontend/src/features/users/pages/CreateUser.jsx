import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../components/layout/AppLayout";


import UserForm from "../components/UserForm";
import { createUser } from "../services/UserService";

export default function CreateUser() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const handleCreate = async (data) => {
        try {
            setLoading(true);

            await createUser(data);

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