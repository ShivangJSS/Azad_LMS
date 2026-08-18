import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Breadcrumbs from "../../../../../shared/components/breadcrumbs/Breadcrumbs";
import AddItemForm from "../../components/AddItemForm";
import AppLayout from "../../../../../components/layout/AppLayout";

import {
    createLeftItem,
} from "../../services/MatchingMakingService";

export default function LeftItemAdd() {
    const { matchMakingId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        left_item_1: "",
        left_item_2: "",
        left_item_3: "",
        left_item_4: "",
        left_item_5: "",
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

        // ---------------------------------------------
        // REQUIRED ITEMS
        // ---------------------------------------------

        if (!formData.left_item_1.trim()) {
            toast.error("Left Item 1 is required.");
            return;
        }

        if (!formData.left_item_2.trim()) {
            toast.error("Left Item 2 is required.");
            return;
        }

        if (!formData.left_item_3.trim()) {
            toast.error("Left Item 3 is required.");
            return;
        }

        try {
            setLoading(true);

            // ---------------------------------------------
            // CREATE ITEM LIST
            // ---------------------------------------------

            const items = [
                formData.left_item_1,
                formData.left_item_2,
                formData.left_item_3,
                formData.left_item_4,
                formData.left_item_5,
            ];

            // ---------------------------------------------
            // CREATE NON EMPTY ITEMS
            // ---------------------------------------------

            const itemsToCreate = items.filter(
                (item) => item.trim() !== ""
            );

            // ---------------------------------------------
            // CREATE EACH ITEM
            // ---------------------------------------------

            for (const item of itemsToCreate) {
                const payload = {
                    match_left_text: item.trim(),
                    sort_order: formData.sort_order || "asc",
                    language_id: Number(formData.language_id),
                };


                const response = await createLeftItem(
                    matchMakingId,
                    payload
                );

            }

            // ---------------------------------------------
            // SUCCESS
            // ---------------------------------------------

            toast.success(
                "Left items created successfully."
            );

            navigate(
                `/match-making-master/${matchMakingId}/left-items`
            );

        } catch (error) {
            console.error(
                "CREATE LEFT ITEMS ERROR:",
                error
            );

            console.error(
                "CREATE LEFT ITEMS ERROR RESPONSE:",
                error?.response?.data
            );

            toast.error(
                error?.response?.data?.detail ||
                "Unable to create left items."
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
            `/match-making-master/${matchMakingId}/left-items`
        );
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <AppLayout>

            {/* PAGE HEADER */}

            <div className="mb-3 flex items-center justify-between">

                <span className="text-[22px] font-medium text-[#344050]">
                    Add Left Item
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
                            label: "Left Items",
                            path: `/match-making-master/${matchMakingId}/left-items`,
                        },
                        {
                            label: "Add",
                            path: `/match-making-master/${matchMakingId}/left-items/add`,
                        },
                    ]}
                />

            </div>

            {/* FORM */}

            <AddItemForm
                type="left"
                formData={formData}
                loading={loading}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />

        </AppLayout>
    );
}