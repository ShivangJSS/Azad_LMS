import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import LanguageTabs from "../../../../shared/components/language/LanguageTabs";
import DataTable from "../../../../shared/components/table/DataTable";
import Pagination from "../../../../shared/components/table/Pagination";
import TableActions from "../../../../shared/components/table/TableActions";
import ExportButton from "../../../../shared/components/table/ExportButton";

import { exportSCQs } from "../services/SCQServices";
import { getMediaUrl } from "../../../../shared/utils/mediaUrl";


import useSCQList, {
    scqColumns,
    getLanguageName,
} from "../hook/useSCQList";

export default function SCQList() {

    const navigate = useNavigate();

    const {
        loading,
        scqs,

        language,
        setLanguage,

        search,
        setSearch,

        currentPage,
        totalPages,
        setCurrentPage,

        handleSearch,
        resetSearch,

        handleView,
        handleEdit,
        handleDelete,
    } = useSCQList();

    const languageMap = {
        english: 1,
        hindi: 2,
        bangla: 3,
        tamil: 4,
    };

    return (

        <AppLayout>

            <div className="mb-3 flex items-center justify-between">

                <span className="text-[22px] font-medium">
                    SCQ List
                </span>

                <Breadcrumbs
                    items={[
                        {
                            label: "Home",
                            path: "/dashboard",
                        },
                        {
                            label: "Assessments",
                        },
                        {
                            label: "SCQ",
                        },
                    ]}
                />

            </div>

            <div className="overflow-hidden rounded-md border border-[#D8E2EF] bg-white">

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
                            className="h-8 flex-1 rounded border border-[#D8E2EF] px-3"
                        />

                        <button
                            onClick={handleSearch}
                            className="rounded bg-[#732269] px-7 text-white"
                        >
                            Search
                        </button>

                        <button
                            onClick={resetSearch}
                            className="rounded border border-[#D8E2EF] px-7"
                        >
                            Reset
                        </button>

                    </div>

                </div>

                {/* Header */}

                <div className="flex items-center justify-between p-3">

                    <span className="text-[13px]">
                        Total SCQ(s): {scqs.length}
                    </span>

                    <button
                        onClick={() => navigate("/scq-master/create")}
                        className="flex items-center gap-2 rounded border border-[#D8E2EF] px-2 py-1 text-[13px]"
                    >
                        <FiPlus />

                        Add SCQ

                    </button>

                </div>

                {/* Table */}

                <div className="px-3 pb-3">

                    <DataTable
                        columns={scqColumns}
                        data={scqs}
                        loading={loading}
                        emptyMessage="No SCQ Found"
                        renderRow={(scq, index) => (

                            <tr key={scq.scq_id}>

                                <td className="border px-2 py-2 text-center">
                                    {index + 1}
                                </td>

                                <td className="border px-2 py-2">
                                    {scq.scq_question_title}
                                </td>

                                <td className="border px-2 py-2">
                                    {scq.scq_question_description}
                                </td>

                                <td className="border px-2 py-2 text-center">

                                    {scq.image_url ? (

                                        <img
                                            src={getMediaUrl(scq.image_url)}
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

                                <td className="border px-2 py-2 text-center">
                                    {scq.marks}
                                </td>

                                <td className="border px-2 py-2 text-center">
                                    {getLanguageName(scq.language_id)}
                                </td>

                                <td className="border px-2 py-2 text-center">

                                    <span
                                        className={`rounded px-2 py-1 text-xs ${scq.status === 1
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {scq.status === 1
                                            ? "Active"
                                            : "Inactive"}
                                    </span>

                                </td>

                                <td className="border px-2 py-2">

                                    <TableActions
                                        onView={() => handleView(scq)}
                                        onEdit={() => handleEdit(scq.scq_id)}
                                        onDelete={() => handleDelete(scq.scq_id)}
                                    />

                                </td>

                            </tr>

                        )}
                    />

                </div>

                {/* Footer */}

                <div className="flex items-center justify-between p-5">

                    <ExportButton
                        exportFunction={exportSCQs}
                        params={{
                            language_id: languageMap[language],
                            search,
                        }}
                        filename="scqs.xlsx"
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