import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useNavigate, Link } from "react-router-dom";
import { deleteUser, getAllUsers } from "@/features/users/services/UserService";
import TableHeader from "@/shared/components/table/TableHeader";
import DataTable from "@/shared/components/table/DataTable";
import TableActions from "@/shared/components/table/TableActions";
import EntriesDropdown from "@/shared/components/table/EntriesDropdown";
import Pagination from "@/shared/components/table/Pagination";
import Breadcrumbs from "@/shared/components/breadcrumbs/Breadcrumbs";

import useTable from "@/shared/hooks/useTable";
import { canManageRole } from "@/config/permissions";

const USER_SEARCH_FIELDS = ["name", "email", "role_name", "responsibility"];

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const currentUserRole = localStorage.getItem("userRole");

  // ================= FILTERS: Name + Role =================
  // `nameFilter` is the draft in the box; `appliedName` is what actually
  // filters the table — updated only when the user clicks Search / Enter.
  const [nameFilter, setNameFilter] = useState("");
  const [appliedName, setAppliedName] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Distinct roles present in the fetched users, for the Role dropdown.
  const roleOptions = useMemo(() => {
    const seen = new Map();
    users.forEach((user) => {
      if (user.role && !seen.has(user.role)) {
        seen.set(user.role, user.role_name || user.role);
      }
    });
    return Array.from(seen, ([role, role_name]) => ({ role, role_name }));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = appliedName.trim().toLowerCase();

    return users.filter((user) => {
      const nameMatch = !keyword || (user.name ?? "").toLowerCase().includes(keyword);
      const roleMatch = !roleFilter || String(user.role) === roleFilter;
      return nameMatch && roleMatch;
    });
  }, [users, appliedName, roleFilter]);

  const handleSearch = () => {
    setAppliedName(nameFilter.trim());
  };

  const handleResetFilters = () => {
    setNameFilter("");
    setAppliedName("");
    setRoleFilter("");
  };

  const table = useTable({
    data: filteredUsers,
    searchableFields: USER_SEARCH_FIELDS,
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
      key: "role_name",
      title: "Role",
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

        <div className="bg-white p-3">

          {/* ================= FILTERS: Name + Role ================= */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_110px_110px] gap-3 items-center mb-4">

            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search By Name"
              className="w-full h-[38px] border border-gray-300 rounded-md px-4 text-[14px] text-gray-700 placeholder:text-gray-400 shadow-inner focus:outline-none focus:ring-1 focus:ring-[#7e2081]"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full h-[38px] border border-gray-300 rounded-md px-3 text-[14px] text-gray-700 bg-white focus:outline-none focus:ring-1 shadow-inner focus:ring-[#7e2081]"
            >
              <option value="">Select Role</option>
              {roleOptions.map((option) => (
                <option key={option.role} value={option.role}>
                  {option.role_name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSearch}
              className="h-[38px] bg-[#7e2081] text-white text-[14px] rounded-sm! hover:bg-[#6a1b6d] transition-colors"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="h-[38px] border-1 border-[#171616e3] text-[14px] text-black rounded-sm! hover:bg-gray-100 transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="border-t border-[#4FC3C3] my-[20px]" />

          <div className="flex flex-wrap items-center justify-between gap-[12px] mb-[16px]">
            <TableHeader
              totalEntries={table.totalEntries}
              startEntry={table.startEntry}
              endEntry={table.endEntry}
              showSearch={false}
            />
            <Link
              to="/users/create"
              className="inline-flex items-center h-[38px] px-[20px] bg-white border border-[#344050] rounded-sm text-[14px] font-bold !text-[#344050] !no-underline hover:bg-gray-50"
            >
              +Add User
            </Link>

          </div>

          {/* Built-in TableHeader search hidden — the Name/Role row above is
              the single search bar for this page (no duplicate). */}
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
                  {user.role_name || "-"}
                </td>

                <td className="border text-[#5E6E82] border-[#dee2e6] px-4 py-2">
                  <TableActions
                    onView={() => navigate(`/users/view/${user.id}`)}
                    onEdit={() => navigate(`/users/edit/${user.id}`)}
                    onDelete={() => handelDelete(user.id)}
                    showEdit={canManageRole(currentUserRole, user.role)}
                    showDelete={canManageRole(currentUserRole, user.role)}
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
