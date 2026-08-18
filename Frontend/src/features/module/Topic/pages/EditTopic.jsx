import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";

import TopicForm from "../components/TopicForm";

import {
    getTopicById,
    updateTopic,
} from "../services/TopicService";

import { getModules } from "../../ListModule/services/ListService";

import toast from "react-hot-toast";

export default function EditTopic() {

    const { topicId } = useParams();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [modules, setModules] = useState([]);

    const [moduleId, setModuleId] = useState("");

    const [topics, setTopics] = useState([
        {
            topic_name: "",
            status: "1",
        },
    ]);

    useEffect(() => {
        loadModules();
        loadTopic();
    }, []);

    const loadModules = async () => {
        try {

            const response = await getModules({
                language_id: 1,
                page: 1,
                limit: 100,
            });

            setModules(
                response.data.map((m) => ({
                    id: String(m.module_id),
                    name: m.module_name,
                }))
            );

        } catch (error) {
        }
    };

    const loadTopic = async () => {
        try {

            setLoading(true);

            const response = await getTopicById(topicId);

            const data = response.data;

            const english = data.translations.find(
                (item) => item.language_id === 1
            );

            setModuleId(data.module_id);

            setTopics([
                {
                    topic_name: english?.topic_name || "",
                    status: data.status,
                },
            ]);

        } catch (error) {


        } finally {

            setLoading(false);

        }
    };

    const handleTopicChange = (index, field, value) => {

        const updated = [...topics];

        updated[index][field] = value;

        setTopics(updated);
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            await updateTopic(topicId, {
                module_id: moduleId,
                topic_name: topics[0].topic_name,
                is_active: topics[0].status,
            });

            toast.success("Topic updated successfully.");

            navigate("/topic-master");

        } catch (error) {

            toast.error(
                error?.response?.data?.detail ||
                "Unable to update topic."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <AppLayout>

            <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-[22px] font-medium text-[#344050]">
                    Edit Topic
                </span>

                <Breadcrumbs
                    items={[
                        { label: "Home", path: "/dashboard" },
                        { label: "Topics", path: "/topic-master" },
                        { label: "Edit" },
                    ]}
                />

            </div>

            <TopicForm
                title="Edit Topic"
                submitText="Update Topic"
                showAddMore={false}
                moduleId={moduleId}
                modules={modules}
                topics={topics}
                loading={loading}
                onModuleChange={setModuleId}
                onTopicChange={handleTopicChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/topic-master")}
            />

        </AppLayout>
    );
}