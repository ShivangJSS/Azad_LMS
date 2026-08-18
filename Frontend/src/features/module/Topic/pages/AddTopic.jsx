import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import TopicForm from "../components/TopicForm";

import { createTopic } from "../services/TopicService";
import { getModules } from "../../ListModule/services/ListService";

export default function AddTopic() {
    const navigate = useNavigate();

    /* =========================
       STATE
    ========================= */

    const [moduleId, setModuleId] = useState("");

    const [modules, setModules] = useState([]);

    const [topics, setTopics] = useState([
        {
            topic_name: "",
            status: "1",
        },
    ]);

    const [loading, setLoading] = useState(false);

    /* =========================
       LOAD MODULES
    ========================= */

    useEffect(() => {
        const loadModules = async () => {
            try {
                const response = await getModules({
                    language_id: 1,
                    page: 1,
                    limit: 100,
                });


                const list = response?.data ?? [];

                setModules(
                    list.map((item) => ({
                        id: item.module_id,
                        name: item.module_name,
                    }))
                );
            } catch (error) {
                console.error(
                    "Module Load Error:",
                    error?.response?.data ?? error,
                );

                setModules([]);
                toast.error("Unable to load modules.");
            }
        };

        loadModules();
    }, []);

    /* =========================
       MODULE CHANGE
    ========================= */

    const handleModuleChange = (value) => {
        setModuleId(value);
    };

    /* =========================
       TOPIC CHANGE
    ========================= */

    const handleTopicChange = (index, name, value) => {
        setTopics((prev) =>
            prev.map((topic, topicIndex) =>
                topicIndex === index
                    ? {
                        ...topic,
                        [name]: value,
                    }
                    : topic,
            ),
        );
    };

    /* =========================
       ADD MORE
    ========================= */

    const handleAddMore = () => {
        setTopics((prev) => [
            ...prev,
            {
                topic_name: "",
                status: "1",
            },
        ]);
    };

    /* =========================
       REMOVE
    ========================= */

    const handleRemove = (index) => {
        setTopics((prev) =>
            prev.filter((_, topicIndex) => topicIndex !== index),
        );
    };

    /* =========================
       SUBMIT
    ========================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!moduleId) {
            toast.error("Please select module.");
            return;
        }

        const invalidTopic = topics.some(
            (topic) => !topic.topic_name.trim(),
        );

        if (invalidTopic) {
            toast.error("Please enter topic name.");
            return;
        }

        try {
            setLoading(true);

            /*
             * Send ALL topics in a SINGLE request. The backend already
             * creates one row per entry in `topics`, so one call is enough.
             * (The previous code looped once per topic while each request
             * carried every topic, which inserted N x N duplicate rows.)
             */

            const payload = {
                module_id: Number(moduleId),
                topics: topics.map((topic) => ({
                    topic_name: topic.topic_name.trim(),
                    is_active: topic.status,
                })),
            };

            await createTopic(payload);

            toast.success(
                topics.length > 1
                    ? "Topics created successfully."
                    : "Topic created successfully.",
            );

            navigate("/topic-master");
        } catch (error) {
            console.error(
                "Create Topic Error:",
                error?.response?.data ?? error,
            );

            const detail =
                error?.response?.data?.detail;

            toast.error(
                typeof detail === "string"
                    ? detail
                    : "Unable to create topic.",
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       CANCEL
    ========================= */

    const handleCancel = () => {
        navigate("/topic-master");
    };

    return (
        <AppLayout>
            {/* PAGE HEADER */}

            <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[20px] font-medium text-[#344050]">
                    Add Topic
                </span>

                <Breadcrumbs
                    items={[
                        {
                            label: "Home",
                            path: "/dashboard",
                        },
                        {
                            label: "Topics",
                            path: "/topic-master",
                        },
                        {
                            label: "Add Topic",
                        },
                    ]}
                />
            </div>

            {/* FORM */}

            <TopicForm
                moduleId={moduleId}
                modules={modules}
                topics={topics}
                onModuleChange={handleModuleChange}
                onTopicChange={handleTopicChange}
                onAddMore={handleAddMore}
                onRemove={handleRemove}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
            />
        </AppLayout>
    );
}