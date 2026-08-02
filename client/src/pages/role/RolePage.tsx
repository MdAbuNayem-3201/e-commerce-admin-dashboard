import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { deleteRole, getRoles as getAllRoles } from "../../api/role.api";
import RoleFormModal from "../../components/role/RoleFormModal";

export default function RolePage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const loadRoles = async () => {
    try {
      setLoading(true);

      const rolesData = await getAllRoles();

      setRoles(rolesData?.data ?? rolesData ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = async (roleId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this role?",
    );

    if (!confirmed) return;

    try {
      await deleteRole(roleId);
      toast.success("Role deleted successfully");
      loadRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete role");
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading roles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-gray-500">
            Manage application roles and permissions
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          New Role
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-t">
                <td className="px-4 py-3">{role.name}</td>
                <td className="px-4 py-3">{role.description || "—"}</td>
                <td className="px-4 py-3">{role.status}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(role)}
                      className="rounded p-2 text-blue-600 hover:bg-blue-50"
                      title="Edit role"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="rounded p-2 text-red-600 hover:bg-red-50"
                      title="Delete role"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RoleFormModal
        open={isModalOpen}
        editingRole={editingRole}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRole(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingRole(null);
          loadRoles();
        }}
      />
    </div>
  );
}
