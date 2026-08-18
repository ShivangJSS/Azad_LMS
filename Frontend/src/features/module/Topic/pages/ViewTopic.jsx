import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import LanguageTabs from "../../../../shared/components/language/LanguageTabs";

import {
    getTopicById,
    getTopicTranslation,
    saveTopicTranslation,
} from "../services/TopicService";

import {
    getLanguageByKey,
} from "../../../../shared/constants/languageConstants";

import TopicTranslationForm from "../components/TopicTranslation";

const breadcrumbItems = [
    {
        label: "Home",
        path: "/dashboard",
    },
    {
        label: "Topics",
        path: "/topic-master",
    },
    {
        label: "View",
    },
];

export default function ViewTopic() {

    const { topicId } = useParams();
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [languageKey, setLanguageKey] = useState((searchParams.get("tab") || "english").toLowerCase());

    const language = getLanguageByKey(languageKey);

    const languageId = language?.id;

    const isEnglish = languageId === 1;

    const [topicData, setTopicData] = useState({
        topic_name: "",
        module_name: "",
        status: 1,
    });

    useEffect(() => {
        loadTopic();
    }, [languageId]);

    const loadTopic = async () => {
        try {
            setLoading(true);

            if (isEnglish) {
                const response = await getTopicById(topicId);


                const {data} = response;

                const english = data.translations.find(
                    (item) => item.language_id === 1
                );

                setTopicData({
                    topic_name: english?.topic_name || "",
                    module_name: data.module_name,
                    status: data.status,
                });

            } else {

                const response = await getTopicTranslation(
                    topicId,
                    languageId
                );

                setTopicData(response.data);
            }

        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {

        const { name, value } = e.target;

        setTopicData((prev) => ({
            ...prev,
            [name]: value,
        }));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            await saveTopicTranslation(topicId, {
                language_id: languageId,
                topic_name: topicData.topic_name,
                status: topicData.status,
            });

            toast.success("Translation saved successfully.");

            // Go back to the topic list on success.
            navigate("/topic-master");

        } catch (error) {

            toast.error(
                error?.response?.data?.detail ||
                "Unable to save translation."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <AppLayout>

            <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-[22px] font-medium text-[#344050]">
                    Topic Translation
                </span>

                <Breadcrumbs items={breadcrumbItems} />

            </div>

            <div className="rounded-[6px] border-1 border-[#D8E2EF] bg-white">

                <LanguageTabs
                    activeTab={languageKey}
                    onChange={setLanguageKey}
                />

                <TopicTranslationForm
                    form={topicData}
                    readOnly={isEnglish}
                    languageName={language.label}
                    loading={loading}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate("/topic-master")}
                />

            </div>

        </AppLayout>

    );
}