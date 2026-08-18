import { useEffect, useMemo, useState } from "react";


import DataTable from "../../../shared/components/table/DataTable";
import Pagination from "../../../shared/components/table/Pagination";
import EntriesDropdown from "../../../shared/components/table/EntriesDropdown";

import { getBatchParticipants } from "../services/batchService";

const td = "border border-[#dee2e6] px-3 py-[8px] text-[15px]";

const columns = [
    {
        key: "sr_no",
        title: "Sr No",
    },
    {
        key: "Trainee Name",
        title: "Trainee Name",
        sortable: true,
    },
    {
        key: "email",
        title: "Email",
        sortable: true,
    },
    {
        key: "mobile_no",
        title: "Mobile",
        sortable: true,
    },
    {
        key: "enrollment_no",
        title: "Enrollment No",
        sortable: true,
    },
];

export default function BatchView({ batchId }) {


    const [loading, setLoading] = useState(true);
    const [participants, setParticipants] = useState([]);

    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [page, setPage] = useState(1);

    const [sortField, setSortField] = useState("");
    const [sortDirection, setSortDirection] = useState("asc");
    const [search, setSearch] = useState("");

    useEffect(() => {

        if (!batchId) return;

        loadParticipants();

    }, [batchId]);

    const loadParticipants = async () => {

        setLoading(true);

        try {

            const data = await getBatchParticipants(batchId);

            setParticipants(Array.isArray(data) ? data : []);

        } finally {

            setLoading(false);

        }
    };

    const handleSort = (field) => {

        if (sortField === field) {

            setSortDirection(prev =>
                prev === "asc" ? "desc" : "asc"
            );

        } else {

            setSortField(field);
            setSortDirection("asc");

        }
    };

    const filteredRows = useMemo(() => {

        let rows = [...participants];

        if (search.trim()) {

            const q = search.toLowerCase();

            rows = rows.filter((row) =>
                [
                    row.participant_name,
                    row.email,
                    row.mobile_no,
                    row.enrollment_no,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(q)
            );
        }

        if (sortField) {

            rows.sort((a, b) => {

                const x = String(a[sortField] ?? "").toLowerCase();
                const y = String(b[sortField] ?? "").toLowerCase();

                if (x < y) return sortDirection === "asc" ? -1 : 1;
                if (x > y) return sortDirection === "asc" ? 1 : -1;

                return 0;
            });

        }

        return rows;

    }, [participants, search, sortField, sortDirection]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredRows.length / entriesPerPage)
    );

    const pageRows = filteredRows.slice(
        (page - 1) * entriesPerPage,
        page * entriesPerPage
    );

    return (
        <div className="bg-white border border-[#D8E2EF] rounded-md shadow-sm mt-6">

            {/* Header */}
            <div className="px-5 py-4 border-b border-[#D8E2EF]">
                <span className="text-[20px] font-medium text-[#5E6E82]">
                    Assigned Trainees
                </span>
            </div>
            <div className="flex items-center justify-between mt-6 px-4 border-[#D8E2EF]">

                {/* Left Side */}
                <div className="flex items-center gap-4">

                    <EntriesDropdown
                        value={entriesPerPage}
                        onChange={(value) => {
                            setEntriesPerPage(Number(value));
                            setPage(1);
                        }}
                    />

                    {/* <p className="text-sm text-gray-500">
                        Showing {filteredRows.length} entries
                    </p> */}

                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2">

                    <span className="text-sm text-gray-500">
                        Search:
                    </span>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-60"
                    />

                </div>

            </div>

            {/* Table */}
            <div className="p-3">

                <DataTable
                    columns={columns}
                    data={pageRows}
                    loading={loading}
                    emptyMessage="No Assigned Trainees Found"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    renderRow={(row, index) => (
                        <tr key={row.participant_id}>

                            <td className={td}>
                                {(page - 1) * entriesPerPage + index + 1}
                            </td>

                            <td className={td}>
                                {row.participant_name}
                            </td>

                            <td className={td}>
                                {row.email || "-"}
                            </td>

                            <td className={td}>
                                {row.mobile_no || "-"}
                            </td>

                            <td className={td}>
                                {row.enrollment_no}
                            </td>

                        </tr>
                    )}
                />

                {/* Footer */}

                <div className="flex items-center justify-end mt-6 pt-4 border-t border-[#D8E2EF]">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />

                </div>

            </div>

        </div>
    );
}