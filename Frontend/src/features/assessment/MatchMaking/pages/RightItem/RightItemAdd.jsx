import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Breadcrumbs from "../../../../../shared/components/breadcrumbs/Breadcrumbs";
import AppLayout from "../../../../../components/layout/AppLayout";
import AddItemForm from "../../components/AddItemForm";

import {
    createRightItem,
} from "../../services/MatchingMakingService";

export default function RightItemAdd() {
    const { matchMakingId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        right_item_1: "",
        right_item_2: "",
        right_item_3: "",
        right_item_4: "",
        right_item_5: "",
        sort_order: "asc",
        language_id: 1,
    });

    // =====================================================
    // CHANGE
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!matchMakingId) {
            toast.error("Match Making ID not found.");
            return;
        }

        // Required fields
        if (!formData.right_item_1.trim()) {
            toast.error("Right Item 1 is required.");
            return;
        }

        if (!formData.right_item_2.trim()) {
            toast.error("Right Item 2 is required.");
            return;
        }

        if (!formData.right_item_3.trim()) {
            toast.error("Right Item 3 is required.");
            return;
        }

        try {
            setLoading(true);

            const items = [
                formData.right_item_1,
                formData.right_item_2,
                formData.right_item_3,
                formData.right_item_4,
                formData.right_item_5,
            ];

            const itemsToCreate = items.filter(
                (item) => item.trim() !== ""
            );

            // Create each right item separately
            for (const item of itemsToCreate) {
                const payload = {
                    match_right_text: item.trim(),
                    sort_order: formData.sort_order || "asc",
                    language_id: Number(formData.language_id),
                };


                const response = await createRightItem(
                    matchMakingId,
                    payload
                );

            }

            toast.success(
                "Right items created successfully."
            );

            navigate(
                `/match-making-master/${matchMakingId}/right-items`
            );

        } catch (error) {
            console.error(
                "CREATE RIGHT ITEMS ERROR:",
                error
            );

            console.error(
                "CREATE RIGHT ITEMS ERROR RESPONSE:",
                error?.response?.data
            );

            toast.error(
                error?.response?.data?.detail ||
                "Unable to create right items."
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // CANCEL
    // =====================================================

    const handleCancel = () => {
        navigate(
            `/match-making-master/${matchMakingId}/right-items`
        );
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <AppLayout>

            <div className="mb-3 flex items-center justify-between">

                <span className="text-[22px] font-medium text-[#344050]">
                    Add Right Item
                </span>

                <Breadcrumbs
                    items={[
                        {
                            label: "Home",
                            path: "/",
                        },
                        {
                            label: "Match Making List",
                            path: "/match-making-master",
                        },
                        {
                            label: "Right Items",
                            path: `/match-making-master/${matchMakingId}/right-items`,
                        },
                        {
                            label: "Add",
                            path: `/match-making-master/${matchMakingId}/right-items/add`,
                        },
                    ]}
                />

            </div>

            <AddItemForm
                type="right"
                formData={formData}
                loading={loading}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />

        </AppLayout>
    );
}