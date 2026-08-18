import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import LanguageTabs from "../../../../shared/components/language/LanguageTabs";
import {
    getModuleById,
    getModuleTranslation,
    saveModuleTranslation,
} from "../services/ListService";
import toast from "react-hot-toast";

import TranslationForm from "../components/ModuleTranslationForm";
import { getLanguageByKey } from "../../../../shared/constants/languageConstants";

const breadcrumbItems = [
    {
        label: "Home",
        path: "/dashboard",
    },
    {
        label: "Modules",
        path: "/modules",
    },
    {
        label: "Translation",
    },
];


export default function ViewModule() {
    const { moduleId } = useParams();
    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);


    const [languageKey, setLanguageKey] = useState((searchParams.get("tab") || "english").toLowerCase());

    const language = getLanguageByKey(languageKey);

    const languageId = language?.id;

    const isEnglish = languageId === 1;
    const [moduleData, setModuleData] = useState({
        module_name: "",
        module_description: "",
        module_overview: "",
        module_objective: "",
        module_icon: "",
    });

    useEffect(() => {
        loadModule();
    }, [languageId]);

    const loadModule = async () => {
        try {
            setLoading(true);

            let response;

            if (languageId === 1) {
                response = await getModuleById(moduleId);
            } else {
                response = await getModuleTranslation(moduleId, languageId);
            }

            setModuleData(response);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setModuleData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        setModuleData((prev) => ({
            ...prev,
            module_icon: e.target.files[0],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const payload = {
                language_id: languageId,
                module_name: moduleData.module_name,
                module_description: moduleData.module_description,
                module_overview: moduleData.module_overview,
                module_objective: moduleData.module_objective,
                status: 1,
            };


            const response = await saveModuleTranslation(
                moduleId,
                payload
            );


            toast.success("Translation saved successfully.");

            // Go back to the module list on success.
            navigate("/modules");

        } catch (error) {
            console.error(error);

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

            <div className="mb-3 flex items-center justify-between">

                <span className="text-[22px] font-medium text-[#344050]">
                    Module Translation
                </span>

                <Breadcrumbs items={breadcrumbItems} />

            </div>

            <div className="rounded-[6px] border border-[#D8E2EF] bg-white">

                <LanguageTabs
                    activeTab={languageKey}
                    onChange={setLanguageKey}
                />

                <TranslationForm
                    form={moduleData}
                    languageName={
                        languageId === 2
                            ? "Hindi"
                            : languageId === 3
                                ? "Bangla"
                                : languageId === 4
                                    ? "Tamil"
                                    : "English"
                    }
                    readOnly={isEnglish}
                    loading={loading}
                    onChange={handleChange}
                    onFileChange={handleFileChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate("/modules")}
                />
            </div>

        </AppLayout>
    );
}