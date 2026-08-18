import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../../shared/components/breadcrumbs/Breadcrumbs";

import CorrectAnswerForm from "../../components/CorrectAnswerForm";

import {
    getLeftItems,
    getRightItems,
    createCorrectAnswer,
} from "../../services/MatchingMakingService";

export default function CorrectAnswerAdd() {
    const { matchMakingId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [itemsLoading, setItemsLoading] = useState(false);

    const [leftItems, setLeftItems] = useState([]);
    const [rightItems, setRightItems] = useState([]);

    const [formData, setFormData] = useState({
        left_item_1: "",
        left_item_2: "",
        left_item_3: "",
        left_item_4: "",
        left_item_5: "",

        right_item_1: "",
        right_item_2: "",
        right_item_3: "",
        right_item_4: "",
        right_item_5: "",

        sort_order: "asc",
        language_id: 1,
    });

    // =====================================================
    // LOAD LEFT + RIGHT ITEMS
    // =====================================================

    useEffect(() => {
        const loadItems = async () => {
            if (!matchMakingId) {
                return;
            }

            try {
                setItemsLoading(true);

                const [leftResponse, rightResponse] =
                    await Promise.all([
                        getLeftItems(matchMakingId, 1),
                        getRightItems(matchMakingId, 1),
                    ]);



                setLeftItems(
                    Array.isArray(leftResponse)
                        ? leftResponse
                        : []
                );

                setRightItems(
                    Array.isArray(rightResponse)
                        ? rightResponse
                        : []
                );

            } catch (error) {
                console.error(
                    "LOAD ITEMS ERROR:",
                    error
                );

                console.error(
                    "LOAD ITEMS RESPONSE:",
                    error?.response?.data
                );

                toast.error(
                    error?.response?.data?.detail ||
                    "Unable to load items."
                );

            } finally {
                setItemsLoading(false);
            }
        };

        loadItems();
    }, [matchMakingId]);

    // =====================================================
    // CHANGE
    // =====================================================

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

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
            toast.error(
                "Match Making ID not found."
            );
            return;
        }

        if (
            !formData.left_item_1 ||
            !formData.left_item_2 ||
            !formData.left_item_3 ||
            !formData.right_item_1 ||
            !formData.right_item_2 ||
            !formData.right_item_3
        ) {
            toast.error(
                "Please select all required items."
            );
            return;
        }

        try {
            setLoading(true);

            // ------------------------------------------------
            // CREATE 1 RECORD FOR EACH MAPPING
            // ------------------------------------------------

            const mappings = [];

            for (let i = 1; i <= 5; i++) {
                const leftId =
                    formData[`left_item_${i}`];

                const rightId =
                    formData[`right_item_${i}`];

                if (leftId && rightId) {
                    mappings.push({
                        match_left_id: Number(leftId),
                        match_right_id: Number(rightId),
                    });
                }
            }


            // ------------------------------------------------
            // SAVE EACH MAPPING
            // ------------------------------------------------

            for (const mapping of mappings) {
                await createCorrectAnswer(
                    matchMakingId,
                    mapping
                );
            }

            toast.success(
                "Correct answers saved successfully."
            );

            navigate(
                `/match-making-master/${matchMakingId}/correct-answers`
            );

        } catch (error) {
            console.error(
                "CREATE CORRECT ANSWER ERROR:",
                error
            );

            console.error(
                "CREATE CORRECT ANSWER RESPONSE:",
                error?.response?.data
            );

            toast.error(
                error?.response?.data?.detail ||
                "Unable to save correct answers."
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
            `/match-making-master/${matchMakingId}/correct-answers`
        );
    };

    return (
        <AppLayout>

            {/* HEADER */}

            <div className="mb-3 flex items-center justify-between">

                <span className="text-[22px] font-medium text-[#344050]">
                    Add Correct Answers
                </span>

                <Breadcrumbs
                    items={[
                        {
                            label: "Home",
                            path: "/",
                        },
                        {
                            label:
                                "Match Making Questions",
                            path:
                                "/match-making-master",
                        },
                        {
                            label:
                                "Correct Answers",
                            path:
                                `/match-making-master/${matchMakingId}/correct-answers`,
                        },
                        {
                            label:
                                "Add Correct Answers",
                            path:
                                `/match-making-master/${matchMakingId}/correct-answers/add`,
                        },
                    ]}
                />

            </div>

            {/* FORM */}

            {itemsLoading ? (
                <div className="rounded-md border border-[#D8E2EF] bg-white p-6 text-center text-[13px] text-[#60758D]">
                    Loading items...
                </div>
            ) : (
                <CorrectAnswerForm
                    formData={formData}
                    leftItems={leftItems}
                    rightItems={rightItems}
                    loading={loading}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            )}

        </AppLayout>
    );
}