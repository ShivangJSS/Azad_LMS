import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../../components/layout/AppLayout";
import { getUserById } from "../services/UserService";

export default function UserView() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await getUserById(id);
            setUser(response);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="p-6">Loading...</div>
            </AppLayout>
        );
    }

    if (!user) {
        return (
            <AppLayout>
                <div className="p-6">User not found.</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="bg-white rounded border border-gray-200 shadow-sm h-full w-full">

                <div className="border-b px-4 py-2">
                    <p className=" font-semibold text-gray-800 text-[25px]">
                        User Details
                    </p>
                </div>

                <div className="p-4">

                    <div className="grid grid-cols-2 gap-y-3">

                        <div className="font-semibold text-gray-700">
                            Name
                        </div>
                        <div>{user.name || "-"}</div>

                        <div className="font-semibold text-gray-700">
                            Email
                        </div>
                        <div>{user.email || "-"}</div>

                        <div className="font-semibold text-gray-700">
                            Role
                        </div>
                        <div>{user.role || "-"}</div>

                        <div className="font-semibold text-gray-700">
                            Responsibility
                        </div>
                        <div>{user.responsibility || "-"}</div>

                        <div className="font-semibold text-gray-700">
                            State
                        </div>
                        <div>{user.state || "N/A"}</div>

                        <div className="font-semibold text-gray-700">
                            District
                        </div>
                        <div>{user.district || "N/A"}</div>

                        <div className="font-semibold text-gray-700">
                            Block
                        </div>
                        <div>{user.block || "N/A"}</div>

                        <div className="font-semibold text-gray-700">
                            Centre
                        </div>
                        <div>{user.centre || "N/A"}</div>

                    </div>

                </div>

                <div className="border-t px-6 py-4 flex gap-3">

                    <button
                        onClick={() => navigate("/users/userlist")}
                        className="px-5 py-1 border rounded border-gray-400 hover:bg-gray-100"
                    >
                        Back
                    </button>

                    {/* <button
                        onClick={() => navigate(`/users/edit/${user.id}`)}
                        className="px-5 py-2 bg-[#7b216f] text-white rounded hover:opacity-90"
                    >
                        Edit
                    </button> */}

                </div>

            </div>
        </AppLayout>
    );
}