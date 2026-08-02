import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";

import { deleteUser, getUsers, updateUserStatus } from "../../api/user.api";
import type { User } from "../../types/user";
import UserTable from "../../components/user/UserTable";
import UserFormModal from "../../components/user/UserFormModal";

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers({ search: search || undefined, limit: 50 });
      setUsers(data.users ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    return users.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()),
    );
  }, [users, search]);

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );
    if (!confirmed) return;

    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      loadUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    }
  };

  const handleToggleStatus = async (id: string, current: boolean) => {
    try {
      await updateUserStatus(id, !current);
      toast.success("User status updated");
      loadUsers();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to update user status",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">
            Manage user accounts, roles, and activation status.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            New User
          </button>
        </div>
      </div>

      <UserTable
        users={filteredUsers}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <UserFormModal
        open={isModalOpen}
        editingUser={editingUser}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          loadUsers();
        }}
      />
    </div>
  );
}
