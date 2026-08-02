import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  createPermission,
  deletePermission,
  getPermissions,
  getPermissionWatch,
  updatePermission,
} from "../../api/permission.api";
import {
  deletePermissionGroup,
  getPermissionGroups,
} from "../../api/permissionGroup.api";

import PermissionGroupModal from "../permission-group/PermissionGroupModal";

import type { Permission, PermissionWatchGroup } from "../../types/permission";

export default function PermissionPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [groups, setGroups] = useState<PermissionWatchGroup[]>([]);

  const [permissionGroups, setPermissionGroups] = useState<any[]>([]);

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null,
  );

  const [editingGroup, setEditingGroup] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    groupId: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const [permissionData, watchData, groupData] = await Promise.all([
        getPermissions(),
        getPermissionWatch(),
        getPermissionGroups(),
      ]);

      setPermissions(permissionData);

      setGroups(watchData);

      setPermissionGroups(groupData);

      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to load permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      groupId: "",
    });

    setEditingPermission(null);
  };

  const openCreateModal = () => {
    resetForm();

    setIsModalOpen(true);
  };

  const openEditModal = (permission: Permission) => {
    setEditingPermission(permission);

    setForm({
      name: permission.name,
      description: permission.description ?? "",
      groupId: permission.groupId,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    resetForm();

    setIsModalOpen(false);

    setError("");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this permission?");

    if (!confirmed) return;

    try {
      await deletePermission(id);

      setSuccess("Permission deleted successfully.");

      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Delete failed.");
      toast.error(err.response?.data?.message ?? "Delete failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      if (editingPermission) {
        await updatePermission(editingPermission.id, {
          name: form.name,
          description: form.description,
          groupId: form.groupId,
        });

        setSuccess("Permission updated successfully.");
      } else {
        await createPermission({
          name: form.name,
          description: form.description,
          groupId: form.groupId,
        });

        setSuccess("Permission created successfully.");
      }

      closeModal();

      await loadData();
    } catch (err: any) {
      const response = err.response?.data;

      if (response?.errors) {
        const firstError = Object.values(response.errors)[0];

        setError(String(firstError));
      } else {
        setError(response?.message ?? "Something went wrong.");
      }

      toast.error(response?.message ?? "Something went wrong.");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    const confirmed = window.confirm("Delete this permission group?");

    if (!confirmed) return;

    try {
      await deletePermissionGroup(groupId);

      toast.success("Permission group deleted successfully.");

      await loadData();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ?? "Failed to delete permission group",
      );
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-8 shadow">
        Loading permissions...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Permissions</h1>

          <p className="text-gray-500">Manage system permissions and groups</p>
        </div>

        <button
          onClick={openCreateModal}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          + Create Permission
        </button>
      </div>

      {success && (
        <div className="rounded-lg border border-green-300 bg-green-100 p-3 text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white p-5 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Permission Groups</h2>

          <button
            onClick={() => {
              setEditingGroup(null);
              setGroupModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
          >
            <Plus size={16} />
            Add Group
          </button>
        </div>

        {permissionGroups.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-gray-500">
            No permission groups found.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {permissionGroups.map((group) => {
              const isExpanded = expandedGroupId === group.id;
              const permissions = Array.isArray(group.permissions)
                ? group.permissions
                : [];

              return (
                <div
                  key={group.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div
                    className="mb-2 flex cursor-pointer items-start justify-between gap-3"
                    onClick={() =>
                      setExpandedGroupId((prev) =>
                        prev === group.id ? null : group.id,
                      )
                    }
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {group.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {permissions.length} permissions
                      </p>
                    </div>

                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGroup(group);
                          setGroupModalOpen(true);
                        }}
                        className="rounded p-2 text-blue-600 hover:bg-blue-100"
                        title="Edit group"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteGroup(group.id)}
                        className="rounded p-2 text-red-600 hover:bg-red-100"
                        title="Delete group"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600">
                    {group.description || "No description provided"}
                  </p>

                  {isExpanded && (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Permissions
                      </p>

                      {permissions.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          No permissions in this group.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {permissions.map((permission: any) => (
                            <span
                              key={permission.id || permission.name}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                            >
                              {String(permission.name || "permission").split(
                                ":",
                              )[1] || String(permission.name || "permission")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-3 text-left">Name</th>

              <th className="px-5 py-3 text-left">Module</th>

              <th className="px-5 py-3 text-left">Description</th>

              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {permissions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-500">
                  No permissions found.
                </td>
              </tr>
            ) : (
              permissions.map((permission) => (
                <tr key={permission.id} className="border-t">
                  <td className="px-5 py-4 font-medium">{permission.name}</td>

                  <td className="px-5 py-4">
                    <span className="rounded bg-gray-100 px-3 py-1 text-sm">
                      {permission.group.name}
                    </span>
                  </td>

                  <td className="px-5 py-4">{permission.description || "-"}</td>

                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(permission)}
                        className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(permission.id)}
                        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-6 text-xl font-semibold">
              {editingPermission ? "Edit Permission" : "Create Permission"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block font-medium">
                  Permission Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="order:export"
                  className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Description</label>

                <textarea
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Export orders to CSV"
                  className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Permission Group
                </label>

                <select
                  name="groupId"
                  value={form.groupId}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3"
                >
                  <option value="">Select Group</option>

                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border px-5 py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-white"
                >
                  {editingPermission ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PermissionGroupModal
        open={groupModalOpen}
        onClose={() => {
          setGroupModalOpen(false);
          setEditingGroup(null);
        }}
        editing={editingGroup}
        refresh={loadData}
      />
    </div>
  );
}
