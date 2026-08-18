import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import LanguageTabs from "../../../../shared/components/language/LanguageTabs";
import DataTable from "../../../../shared/components/table/DataTable";
import Pagination from "../../../../shared/components/table/Pagination";
import TableActions from "../../../../shared/components/table/TableActions";
import ExportButton from "../../../../shared/components/table/ExportButton";

import { exportMCQs } from "../services/MCQServices";
import { getMediaUrl } from "../../../../shared/utils/mediaUrl";

import useMCQList, {
    mcqColumns,
    getLanguageName,
} from "../hook/useMCQList";



export default function MCQList() {

    const navigate = useNavigate();

    const {
        loading,
        mcqs,

        language,
        setLanguage,

        search,
        setSearch,

        currentPage,
        totalPages,
        setCurrentPage,

        loadMCQs,
        resetSearch,
        removeMCQ,
        handleView,
        handleEdit,
        handleDelete,
    } = useMCQList();

    const languageMap = {
        english: 1,
        hindi: 2,
        bangla: 3,
        assamese: 4,
    };

    return (
        <AppLayout>

            <div className="mb-3 flex items-center justify-between">

                <span className="text-[22px] font-medium">
                    MCQ List
                </span>

                <Breadcrumbs
                    items={[
                        { label: "Home", path: "/dashboard" },
                        { label: "Assessments" },
                        { label: "MCQ" },
                    ]}
                />

            </div>

            <div className="overflow-hidden rounded-md border bg-white">

                <LanguageTabs
                    activeTab={language}
                    onChange={setLanguage}
                />

                {/* Search */}

                <div className="border-b p-4">

                    <div className="flex gap-3">

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search By Question Title"
                            className="h-8 flex-1 rounded border px-3"
                        />

                        <button
                            onClick={loadMCQs}
                            className="rounded bg-[#732269] px-7 text-white"
                        >
                            Search
                        </button>

                        <button
                            onClick={resetSearch}
                            className="rounded border px-7"
                        >
                            Reset
                        </button>

                    </div>

                </div>

                {/* Header */}

                <div className="flex items-center justify-between p-3">

                    <span>
                        Total MCQ(s): {mcqs.length}
                    </span>

                    <button
                        onClick={() => navigate("/mcq-master/create")}
                        className="flex items-center gap-2 rounded border px-2 py-1"
                    >
                        <FiPlus />

                        Add MCQ

                    </button>

                </div>

                {/* Table */}

                <div className="px-3 pb-3">

                    <DataTable
                        columns={mcqColumns}
                        data={mcqs}
                        loading={loading}
                        emptyMessage="No MCQ Found"
                        renderRow={(mcq, index) => (

                            <tr key={mcq.mcq_id}>

                                <td className="border px-1 py-1 text-center">
                                    {index + 1}
                                </td>

                                <td className="border px-1 py-3">
                                    {mcq.mcq_question_title}
                                </td>

                                <td className="border px-1 py-3">
                                    {mcq.mcq_question_description}
                                </td>

                                <td className="border px-2 py-3 text-center">

                                    {mcq.image_url ? (

                                        <img
                                            src={getMediaUrl(mcq.image_url)}
                                            alt=""
                                            className="mx-auto h-12 w-12 rounded object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />

                                    ) : (

                                        "-"

                                    )}

                                </td>

                                <td className="border px-2 py-3 text-center">
                                    {mcq.marks}
                                </td>

                                <td className="border px-2 py-3 text-center">
                                    {getLanguageName(mcq.language_id)}
                                </td>

                                <td className="border px-2 py-3 text-center">

                                    <span
                                        className={`rounded px-2 py-1 text-xs ${mcq.status == 1
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {mcq.status == 1
                                            ? "Active"
                                            : "Inactive"}
                                    </span>

                                </td>

                                <td className="border px-2 py-3">

                                    <TableActions
                                        onView={() => handleView(mcq)}
                                        onEdit={() => handleEdit(mcq.mcq_id)}
                                        onDelete={() => handleDelete(mcq.mcq_id)}
                                    />

                                </td>

                            </tr>

                        )}
                    />

                </div>

                {/* Footer */}

                <div className="flex items-center justify-between p-5">

                    <ExportButton
                        exportFunction={exportMCQs}
                        params={{
                            language_id: languageMap[language],
                            search,
                        }}
                        filename="mcqs.csv"
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />

                </div>

            </div>

        </AppLayout>
    );
}