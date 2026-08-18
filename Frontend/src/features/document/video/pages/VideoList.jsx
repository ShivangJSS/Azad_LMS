import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";

import AppLayout from "../../../../components/layout/AppLayout";
import Breadcrumbs from "../../../../shared/components/breadcrumbs/Breadcrumbs";
import DataTable from "../../../../shared/components/table/DataTable";
import Pagination from "../../../../shared/components/table/Pagination";
import EntriesDropdown from "../../../../shared/components/table/EntriesDropdown";
import ExportButton from "../../../../shared/components/table/ExportButton";
import FloatingAddButton from "../../../../shared/components/FloatingAddBUtton";

import useVideoList from "../hook/useVideoList";
import {
    VIDEO_COLUMNS,
    ARCHIVED_COLUMNS,
    ENTRIES_OPTIONS,
    toMediaUrl,
} from "../hook/videoConstants";
import { exportVideos } from "../services/VideoService";

const breadcrumbItems = [
    { label: "Home", path: "/dashboard" },
    { label: "Videos", path: "/video-masters" },
    { label: "Videos List" },
];

export default function VideoList() {
    const navigate = useNavigate();

    const {
        videos,
        totalEntries,
        totalPages,
        search,
        setSearch,
        applySearch,
        resetSearch,
        appliedSearch,
        perPage,
        changePerPage,
        currentPage,
        setCurrentPage,
        loading,
        removeVideo,
        archivedForId,
        archivedRows,
        archivedLoading,
        toggleArchived,
    } = useVideoList();

    const startIndex = (currentPage - 1) * perPage;

    const handleDelete = async (video) => {
        const confirmed = window.confirm(
            `Delete "${video.video_name}"? It will be moved to archived.`
        );
        if (!confirmed) return;

        try {
            await removeVideo(video.video_id);
            toast.success("VIDEO deleted successfully.");
        } catch (error) {
            toast.error(
                error?.response?.data?.detail || "Unable to delete VIDEO."
            );
        }
    };

    return (
        <AppLayout>

            <div className="mb-3 flex items-center justify-between">
                <span className="text-[20px] font-medium text-[#344050]">
                    Video(s) List
                </span>
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="w-full rounded-[8px] border border-[#D8E2EF] bg-white p-[20px]">

                {/* ===== TOP: count + search ===== */}
                <div className="mb-[14px] flex flex-wrap items-center justify-between gap-[12px]">
                    <p className="m-0 text-[13px] text-[#5E6E82]">
                        Showing {totalEntries === 0 ? 0 : startIndex + 1} to{" "}
                        {Math.min(startIndex + perPage, totalEntries)} of{" "}
                        {totalEntries} entries
                    </p>

                    <div className="flex items-center gap-2">
                        <span className="text-[13px] text-[#5E6E82]">Search:</span>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applySearch()}
                            className="h-[32px] rounded-sm border px-3 text-[13px] !shadow-inner"
                        />
                        <button
                            type="button"
                            onClick={applySearch}
                            className="h-[32px] !rounded-sm bg-[#732269] px-4 text-[13px] text-white"
                        >
                            Search
                        </button>
                        {appliedSearch && (
                            <button
                                type="button"
                                onClick={resetSearch}
                                className="h-[32px] !rounded-sm border px-4 text-[13px] "
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== TABLE ===== */}
                <DataTable
                    columns={VIDEO_COLUMNS}
                    data={videos}
                    loading={loading}
                    emptyMessage="No data available in table"
                    renderRow={(video, index) => (
                        <tr key={video.video_id}>
                            <td className="border border-[#eef0f3] px-[16px] py-[15px] text-center">
                                {startIndex + index + 1}
                            </td>
                            <td className="border border-[#eef0f3] px-[16px] py-[15px] text-[#4d5969]">
                                {video.video_name || "-"}
                            </td>
                            <td className="border border-[#eef0f3] px-[16px] py-[15px]">
                                {video.video_description || ""}
                            </td>
                            <td className="border border-[#eef0f3] px-[16px] py-[15px] text-center">
                                {video.video_url ? (
                                    <a
                                        href={toMediaUrl(video.video_url)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="!text-[#732269] font-medium !no-underline hover:underline"
                                    >
                                        Open
                                    </a>
                                ) : (
                                    "NA"
                                )}
                            </td>
                            <td className="border border-[#eef0f3] px-[16px] py-[15px] text-center">
                                {video.youtube_url ? (
                                    <a
                                        href={video.youtube_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#732269] font-medium no-underline hover:underline"
                                    >
                                        Open
                                    </a>
                                ) : (
                                    "NA"
                                )}
                            </td>
                            <td className="border border-[#eef0f3] px-[16px] py-[15px] text-center">
                                {video.language_name || "-"}
                            </td>
                            <td className="border border-[#eef0f3] px-[16px] py-[15px] text-center">
                                <span
                                    className={`text-[13px] font-medium ${String(video.status) === "1"
                                        ? "text-[#2e7d32]"
                                        : "text-[#d64545]"
                                        }`}
                                >
                                    {String(video.status) === "1"
                                        ? "Active"
                                        : "Inactive"}
                                </span>
                            </td>
                            <td className="whitespace-nowrap border border-[#eef0f3] px-[16px] py-[15px]">
                                <div className="flex flex-nowrap items-center gap-[8px]">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(`/video-masters/${video.video_id}`)
                                        }
                                        className="whitespace-nowrap !rounded-md bg-[#732269] px-2 py-1 text-[10px] font-semibold text-white shadow-sm hover:bg-[#611c58]"
                                    >
                                        View
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/video-masters/edit/${video.video_id}`
                                            )
                                        }
                                        className="whitespace-nowrap !rounded-md bg-[#732269] px-3 py-1 text-[10px] font-semibold text-white shadow-sm hover:bg-[#611c58]"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleArchived(video.video_id)}
                                        className="whitespace-nowrap !rounded-md border border-[#d5d9de] bg-white px-2 py-1 text-[10px  ] font-semibold text-[#3c4858] shadow-sm hover:bg-[#f5f6f8]"
                                    >
                                        {archivedForId === video.video_id
                                            ? "Hide Archived Versions"
                                            : "Show Archived Versions"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(video)}
                                        className="whitespace-nowrap !rounded-md bg-[#e0524a] px-2 py-1 text-[10px] font-semibold text-white shadow-sm hover:bg-[#d3453c]"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                />

                {/* ===== BOTTOM: entries + pagination ===== */}
                <div className="mt-[16px] flex flex-wrap items-center justify-between gap-[12px] text-[13px] text-[#5E6E82]">
                    <EntriesDropdown
                        value={perPage}
                        onChange={changePerPage}
                        options={ENTRIES_OPTIONS}
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>

                {/* ===== EXPORT ===== */}
                <div className="mt-[16px]">
                    <ExportButton
                        exportFunction={exportVideos}
                        params={
                            appliedSearch ? { search: appliedSearch } : {}
                        }
                        filename="videos.csv"
                    />
                </div>
            </div>

            {/* ===== ARCHIVED VERSIONS (toggled) ===== */}
            {archivedForId && (
                <div className="mt-[24px] w-full rounded-[8px] border border-[#D8E2EF] bg-white p-[20px]">
                    <p className="mb-[14px] text-[16px] font-medium text-[#344050]">
                        Archived Versions
                    </p>

                    <DataTable
                        columns={ARCHIVED_COLUMNS}
                        data={archivedRows}
                        loading={archivedLoading}
                        emptyMessage="No data available in table"
                        renderRow={(row, index) => (
                            <tr key={`${row.video_id}-${index}`}>
                                <td className="border border-[#eef0f3] px-[16px] py-[15px] text-center">
                                    {index + 1}
                                </td>
                                <td className="border border-[#eef0f3] px-[16px] py-[15px]">
                                    {row.video_name || "-"}
                                </td>
                                <td className="border border-[#eef0f3] px-[16px] py-[15px]">
                                    {row.video_description || ""}
                                </td>
                                <td className="border border-[#eef0f3] px-[16px] py-[15px] text-center">
                                    {row.video_url ? (
                                        <a
                                            href={toMediaUrl(row.video_url)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[#732269] font-medium no-underline hover:underline"
                                        >
                                            Open
                                        </a>
                                    ) : (
                                        "NA"
                                    )}
                                </td>
                                <td className="border border-[#eef0f3] px-[16px] py-[15px] text-center">
                                    {row.youtube_url || "NA"}
                                </td>
                                <td className="border border-[#eef0f3] px-[16px] py-[15px] text-center">
                                    {row.language_name || "-"}
                                </td>
                                <td className="border border-[#eef0f3] px-[16px] py-[15px] text-center">
                                    {row.created_at || "-"}
                                </td>
                            </tr>
                        )}
                    />
                </div>
            )}

            {/* ===== FLOATING "ADD VIDEO" BUTTON ===== */}
            <FloatingAddButton
                onClick={() => navigate("/video-masters/create")}
                title="Create New Video Record"
            />
        </AppLayout>
    );
}
