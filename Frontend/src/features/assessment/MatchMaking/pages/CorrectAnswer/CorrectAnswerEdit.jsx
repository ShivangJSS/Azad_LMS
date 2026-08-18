import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../../shared/components/breadcrumbs/Breadcrumbs";

import CorrectAnswerForm from "../../components/CorrectAnswerForm";

import {
    getCorrectAnswers,
    getLeftItems,
    getRightItems,
    updateCorrectAnswer,
} from "../../services/MatchingMakingService";

export default function CorrectAnswerEdit() {
    const { matchMakingId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

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
    // LOAD EXISTING DATA
    // =====================================================

    useEffect(() => {
        loadData();
    }, [matchMakingId]);

    const loadData = async () => {
        if (!matchMakingId) {
            toast.error("Match Making ID not found.");
            return;
        }

        try {
            setLoading(true);

            const [
                correctResponse,
                leftResponse,
                rightResponse,
            ] = await Promise.all([
                getCorrectAnswers(matchMakingId),
                getLeftItems(matchMakingId, 1),
                getRightItems(matchMakingId, 1),
            ]);




            const correctAnswers =
                Array.isArray(correctResponse)
                    ? correctResponse
                    : [];

            const leftData =
                Array.isArray(leftResponse)
                    ? leftResponse
                    : [];

            const rightData =
                Array.isArray(rightResponse)
                    ? rightResponse
                    : [];

            setLeftItems(leftData);
            setRightItems(rightData);

            // =================================================
            // EXISTING CORRECT ANSWERS -> FORM DATA
            // =================================================

            const newFormData = {
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
            };

            correctAnswers
                .slice(0, 5)
                .forEach((answer, index) => {
                    newFormData[
                        `left_item_${index + 1}`
                    ] = String(
                        answer.match_left_id
                    );

                    newFormData[
                        `right_item_${index + 1}`
                    ] = String(
                        answer.match_right_id
                    );
                });


            setFormData(newFormData);

        } catch (error) {
            console.error(
                "LOAD CORRECT ANSWERS ERROR:",
                error
            );

            console.error(
                "ERROR RESPONSE:",
                error?.response?.data
            );

            toast.error(
                error?.response?.data?.detail ||
                "Unable to load correct answers."
            );

        } finally {
            setLoading(false);
        }
    };

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

        const mappings = [];

        for (let i = 1; i <= 5; i++) {
            const leftId =
                formData[`left_item_${i}`];

            const rightId =
                formData[`right_item_${i}`];

            if (leftId && rightId) {
                mappings.push({
                    leftId: Number(leftId),
                    rightId: Number(rightId),
                });
            }
        }

        if (mappings.length < 3) {
            toast.error(
                "Please select at least 3 correct mappings."
            );
            return;
        }

        try {
            setLoading(true);

            /*
             * IMPORTANT:
             * Existing records ko update karna hai.
             *
             * Correct answer API ka exact update payload
             * tumhare MatchCorrectAnswerUpdate schema par
             * depend karega.
             */

            const existingAnswers =
                await getCorrectAnswers(
                    matchMakingId
                );

            const answers = Array.isArray(
                existingAnswers
            )
                ? existingAnswers
                : [];

            for (
                let i = 0;
                i < mappings.length;
                i++
            ) {
                const existing =
                    answers[i];

                if (!existing) {
                    continue;
                }

                await updateCorrectAnswer(
                    existing.match_correct_answers_id,
                    {
                        match_left_id:
                            mappings[i].leftId,

                        match_right_id:
                            mappings[i].rightId,
                    }
                );
            }

            toast.success(
                "Correct answers updated successfully."
            );

            navigate(
                `/match-making-master/${matchMakingId}/correct-answers`
            );

        } catch (error) {
            console.error(
                "UPDATE CORRECT ANSWERS ERROR:",
                error
            );

            console.error(
                "UPDATE ERROR RESPONSE:",
                error?.response?.data
            );

            toast.error(
                error?.response?.data?.detail ||
                "Unable to update correct answers."
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

    // =====================================================
    // UI
    // =====================================================

    return (
        <AppLayout>

            <div className="mb-3 flex items-center justify-between">

                <span className="text-[22px] font-medium text-[#344050]">
                    Edit Correct Answers
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
                            label: "Edit",
                            path:
                                `/match-making-master/${matchMakingId}/correct-answers/edit`,
                        },
                    ]}
                />

            </div>

            <CorrectAnswerForm
                formData={formData}
                leftItems={leftItems}
                rightItems={rightItems}
                loading={loading}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />

        </AppLayout>
    );
}