import { useEffect, useState } from "react";
import AppLayout from "../../../components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../services/UserService";

import { deleteUser } from "../services/UserService";
import TableHeader from "../../../shared/components/table/TableHeader";
import DataTable from "../../../shared/components/table/DataTable";
import TableActions from "../../../shared/components/table/TableActions";
import EntriesDropdown from "../../../shared/components/table/EntriesDropdown";
import Pagination from "../../../shared/components/table/Pagination";
import Breadcrumbs from "../../../shared/components/breadcrumbs/Breadcrumbs";

import useTable from "../../../shared/hooks/useTable";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const table = useTable({
    data: users,
    searchableFields: [
      "name",
      "email",
      "role",
      "responsibility",
    ],
    initialEntries: 10,
  });

  const columns = [
    {
      key: "sr_no",
      title: "Sr No",
      sortable: false,
    },
    {
      key: "name",
      title: "Name",
      sortable: true,
    },
    {
      key: "email",
      title: "Email",
      sortable: true,
    },
    {
      key: "role",
      title: "Role",
      sortable: true,
    },
    {
      key: "responsibility",
      title: "Responsibility",
      sortable: true,
    },
    {
      key: "action",
      title: "Action",
      className: "text-center",
      sortable: false
    },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      console.log("Response:", response);
      console.log("Total Users:", response.length);
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handelDelete = async (userId) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this user?"
      );
      if (confirmDelete) {
        await deleteUser(userId);
        alert("User deleted successfully");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again later."
      );
    }
  }
  return (
    <AppLayout>
      <div className="min-h-screen w-full bg-[#eef3f9]">

        <div className="flex items-center justify-between mb-2 no-underline">
          <p className="text-[25px] font-normal text-gray-800">
            Users List
          </p>
          <Breadcrumbs
            items={[
              {
                label: "Home",
                path: "/dashboard",
              },
              {
                label: "Users List",
              },
            ]}
          />

        </div>

        <div className="bg-white rounded shadow-sm border p-3">

          <TableHeader
            totalEntries={table.totalEntries}
            startEntry={table.startEntry}
            endEntry={table.endEntry}
            search={table.search}
            setSearch={table.setSearch}
          />

          <DataTable
            columns={columns}
            data={table.paginatedData}
            sortField={table.sortField}
            sortDirection={table.sortDirection}
            onSort={table.handleSort}
            loading={loading}
            emptyMessage="No Users Found"
            renderRow={(user, index) => (
              <tr key={user.id} className="hover:bg-[#fafafa]">
                <td className="border text-[#5E6E82] border-[#dee2e6] px-4 py-2">
                  {(table.currentPage - 1) *
                    table.entriesPerPage +
                    index +
                    1}
                </td>

                <td className="border text-[#5E6E82] border-[#dee2e6] px-4 py-2">
                  {user.name}
                </td>

                <td className="border text-[#5E6E82] border-[#dee2e6] px-4 py-2">
                  {user.email}
                </td>

                <td className="border text-[#5E6E82] border-[#dee2e6] px-4 py-2">
                  {user.role || "-"}
                </td>

                <td className="border text-[#5E6E82] border-[#dee2e6] px-4 py-2">
                  {user.responsibility || "-"}
                </td>

                <td className="border text-[#5E6E82] border-[#dee2e6] px-4 py-2">
                  <TableActions
                    onView={() => navigate(`/users/view/${user.id}`)}
                    onEdit={() => navigate(`/users/edit/${user.id}`)}
                    onDelete={() => handelDelete(user.id)}
                  />
                </td>
              </tr>
            )}
          />

          <div className="flex flex-col md:flex-row justify-between items-center mt-5 gap-4">

            <EntriesDropdown
              value={table.entriesPerPage}
              onChange={table.setEntriesPerPage}
            />

            <Pagination
              currentPage={table.currentPage}
              totalPages={table.totalPages}
              onPageChange={table.setCurrentPage}
            />

          </div>

        </div>

      </div>
    </AppLayout>
  );
}