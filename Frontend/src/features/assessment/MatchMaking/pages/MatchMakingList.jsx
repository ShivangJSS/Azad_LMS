import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import LanguageTabs from "../../../../shared/components/language/LanguageTabs";
import DataTable from "../../../../shared/components/table/DataTable";
import Pagination from "../../../../shared/components/table/Pagination";
import { getMediaUrl } from "../../../../shared/utils/mediaUrl";

import useMatchMakingList, {
    matchMakingColumns,
    getLanguageName,
} from "../hook/useMatchMakingList";

export default function MatchMakingList() {

    const navigate = useNavigate();

    const {
        loading,
        matchMakings,
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
        handleLeftItems,
        handleRightItems,
        handleCorrectAnswers,
        handleDelete,
    } = useMatchMakingList();

    return (
        <AppLayout>

            <div className="mb-3 flex items-center justify-between">

                <span className="text-[22px] font-medium">
                    Match Making Question List
                </span>

                <Breadcrumbs
                    items={[
                        { label: "Home", path: "/dashboard" },
                        { label: "Match Making Questions" },
                        { label: "List" },
                    ]}
                />

            </div>

            <div className="overflow-hidden rounded-md border bg-white">

                <LanguageTabs
                    activeTab={language}
                    onChange={setLanguage}
                />

                <div className="border-b p-4">

                    <div className="flex gap-3">

                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Search By Question Title" className="h-9 flex-1 rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#732269]" />

                        <button type="button" onClick={handleSearch} className="rounded bg-[#732269] px-8 text-sm font-medium text-white hover:bg-[#64205c]">
                            Search
                        </button>

                        <button type="button" onClick={resetSearch} className="rounded border border-gray-400 px-8 text-sm font-medium hover:bg-gray-50">
                            Reset
                        </button>

                    </div>

                </div>

                <div className="flex items-center justify-between p-4">

                    <span className="font-medium">
                        Total Match Making(s):
                        <span className="ml-1 text-[#732269]">
                            {matchMakings.length}
                        </span>
                    </span>

                    <button type="button" onClick={() => navigate("/match-making-master/create")} className="flex items-center gap-2 rounded border border-gray-400 px-3 py-2 text-sm font-medium hover:bg-gray-50">
                        <FiPlus size={16} />
                        Add Match Making
                    </button>

                </div>

                <div className="px-3 pb-5">

                    <DataTable
                        columns={matchMakingColumns}
                        data={matchMakings}
                        loading={loading}
                        emptyMessage="No Match Making Found"
                        renderRow={(matchMaking, index) => {

                            const questionTitle =
                                matchMaking.match_making_question_title ??
                                matchMaking.question_title ??
                                matchMaking.match_making_title ??
                                matchMaking.title ??
                                "-";

                            const questionDescription =
                                matchMaking.match_making_question_description ??
                                matchMaking.question_description ??
                                matchMaking.match_making_description ??
                                matchMaking.description ??
                                "-";

                            const imageUrl =
                                matchMaking.image_url ??
                                matchMaking.image ??
                                matchMaking.match_making_image ??
                                matchMaking.question_image ??
                                null;

                            const marks =
                                matchMaking.marks ??
                                matchMaking.mark ??
                                0;

                            const languageId = matchMaking.language_id;
                            const status = matchMaking.status;

                            return (

                                <tr key={matchMaking.match_making_id ?? matchMaking.id ?? index} className="hover:bg-gray-50">

                                    <td className="border px-2 py-2 text-center">
                                        {index + 1}
                                    </td>

                                    <td className="border px-3 py-2">
                                        {questionTitle}
                                    </td>

                                    <td className="border px-3 py-2">
                                        {questionDescription}
                                    </td>

                                    <td className="border px-2 py-2 text-center">

                                        {imageUrl ? (
                                            <img
                                                src={getMediaUrl(imageUrl)}
                                                alt="Question"
                                                className="mx-auto h-16 w-16 rounded border border-gray-200 object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            "-"
                                        )}

                                    </td>

                                    <td className="border px-2 py-3 text-center">
                                        {Number(marks).toFixed(2)}
                                    </td>

                                    <td className="border px-2 py-3 text-center">
                                        {getLanguageName(languageId)}
                                    </td>

                                    <td className="border px-2 py-3 text-center">

                                        <span className={`rounded px-2 py-1 text-xs ${status == 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {status == 1 ? "Active" : "Inactive"}
                                        </span>

                                    </td>

                                    <td className="border px-2 py-2">

                                        <div className="flex flex-wrap items-center justify-center gap-2">

                                            <button type="button" onClick={() => handleView(matchMaking)} className="rounded border border-[#732269] px-3 py-1 text-sm text-[#732269] hover:bg-[#732269] hover:text-white">
                                                View
                                            </button>

                                            <button type="button" onClick={() => handleEdit(matchMaking.match_making_id)} className="rounded bg-[#732269] px-3 py-1 text-sm text-white">
                                                Edit
                                            </button>

                                            <button type="button" onClick={() => handleLeftItems(matchMaking.match_making_id)} className="rounded border border-gray-400 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100">
                                                Left Items
                                            </button>

                                            <button type="button" onClick={() => handleRightItems(matchMaking.match_making_id)} className="rounded border border-gray-400 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100">
                                                Right Items
                                            </button>

                                            <button type="button" onClick={() => handleCorrectAnswers(matchMaking.match_making_id)} className="rounded border border-[#732269] px-3 py-1 text-sm text-[#732269] hover:bg-[#732269] hover:text-white">
                                                Correct Answers
                                            </button>

                                            <button type="button" onClick={() => handleDelete(matchMaking.match_making_id)} className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600">
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            );

                        }}
                    />

                </div>


                {/* Footer */}

                <div className="flex items-center justify-between p-5">

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