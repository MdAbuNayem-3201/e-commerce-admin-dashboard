import { useEffect, useState } from "react";
import type { PermissionGroup, Role } from "../../types/role";

import { createRole, updateRole } from "../../api/role.api";
import { getPermissionGroups } from "../../api/permissionGroup.api";

import PermissionGrid from "./PermissionGrid";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingRole?: Role | null;
};

export default function RoleFormModal({
  open,
  onClose,
  onSuccess,
  editingRole,
}: Props) {
  const [groups, setGroups] = useState<PermissionGroup[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;

    loadPermissionGroups();

    if (editingRole) {
      setForm({
        name: editingRole.name,
        description: editingRole.description ?? "",
        status: editingRole.status,
      });

      setSelectedPermissions(
        editingRole.permissions.map((p) => p.permission.id),
      );
    } else {
      setForm({
        name: "",
        description: "",
        status: "ACTIVE",
      });

      setSelectedPermissions([]);
    }
  }, [open, editingRole]);

  const loadPermissionGroups = async () => {
    try {
      const res = await getPermissionGroups();
      setGroups(res.data?.data ?? []);
    } catch {
      setError("Failed to load permission groups.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        permissionIds: selectedPermissions,
      };

      if (editingRole) {
        await updateRole(editingRole.id, payload);
      } else {
        await createRole(payload);
      }

      onSuccess();

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-8">
        <h2 className="mb-6 text-2xl font-bold">
          {editingRole ? "Edit Role" : "Create Role"}
        </h2>

        {error && (
          <div className="mb-5 rounded-lg border border-red-300 bg-red-50 p-3 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block font-medium">Role Name</label>

              <input
                className="w-full rounded-lg border p-3"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Status</label>

              <select
                className="w-full rounded-lg border p-3"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >
                <option value="ACTIVE">ACTIVE</option>

                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block font-medium">Description</label>

            <textarea
              rows={3}
              className="w-full rounded-lg border p-3"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Permissions</h3>

            <PermissionGrid
              groups={groups}
              selected={selectedPermissions}
              onChange={setSelectedPermissions}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-6 py-2"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingRole
                  ? "Update Role"
                  : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
