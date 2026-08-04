import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../../components/layout/AppLayout";
import UserForm from "../components/UserForm";
import { getUserById, updateUser } from "../services/UserService";

export default function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            setLoading(true);

            const response = await getUserById(id);

            setUser(response);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (data) => {
        try {
            setLoading(true);

            const payload = {
                name: data.name,
                email: data.email,
                role: data.role
            };

            console.log("Payload:", payload);

            await updateUser(id, payload);

            alert("User updated successfully");
            navigate("/users/userlist");

        } catch (error) {
            console.log(error.response?.data);
            console.log(error.response.data.detail[0]); 
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <AppLayout>
                <div className="p-6 text-lg">Loading...</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>

            <div className="min-h-screen bg-[#eef3f9]">

                <div className="flex justify-between items-center mb-4">

                    <p className="text-[25px] font-medium text-gray-700">
                        Edit User
                    </p>
                    <button
                        onClick={() => navigate("/users/userlist")}
                        className="bg-white border border-gray-300 rounded-md px-5 py-2 hover:bg-gray-100"
                    >
                        Back to List
                    </button>

                </div>

                <div className="bg-white border rounded-md shadow-sm p-6">
                    <UserForm
                        mode="edit"
                        defaultValues={user}
                        loading={loading}
                        onSubmit={handleUpdate}
                        onCancel={() => navigate("/users/userlist")}
                    />
                </div>

            </div>
        </AppLayout >
    );
}