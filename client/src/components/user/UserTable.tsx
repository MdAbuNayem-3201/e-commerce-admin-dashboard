import { Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { User } from "../../types/user";

type Props = {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, current: boolean) => void;
};

export default function UserTable({
  users,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Loading users...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Role</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="border-t border-slate-200">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">
                    {user.phone || "—"}
                  </div>
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.role?.name || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleStatus(user.id, user.isActive)}
                      className="rounded p-2 text-slate-600 hover:bg-slate-100"
                      title={user.isActive ? "Deactivate" : "Activate"}
                    >
                      {user.isActive ? (
                        <ToggleRight size={18} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={18} className="text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="rounded p-2 text-blue-600 hover:bg-blue-50"
                      title="Edit user"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="rounded p-2 text-red-600 hover:bg-red-50"
                      title="Delete user"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
