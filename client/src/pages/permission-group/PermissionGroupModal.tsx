import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  createPermissionGroup,
  updatePermissionGroup,
  watchPermissionGroups,
} from "../../api/permissionGroup.api";

type Props = {
  open: boolean;
  onClose: () => void;
  editing: any;
  refresh: () => void;
};

export default function PermissionGroupModal({
  open,
  onClose,
  editing,
  refresh,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [actions, setActions] = useState<string[]>([]);

  const [availableGroups, setAvailableGroups] = useState<any[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    fetchPermissionGroups();

    if (editing) {
      setName(editing.name || "");
      setDescription(editing.description || "");

      const permissionNames = Array.isArray(editing.permissions)
        ? editing.permissions
            .map((item: any) => item?.permission?.name ?? item?.name ?? null)
            .filter(Boolean)
        : [];

      setActions(permissionNames);
    } else {
      setName("");
      setDescription("");
      setActions([]);
      setErrors({});
    }
  }, [open, editing]);

  const fetchPermissionGroups = async () => {
    try {
      const res = await watchPermissionGroups();

      setAvailableGroups(res ?? []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load permission groups",
      );
    }
  };

  const toggleAction = (permissionName: string) => {
    setActions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((item) => item !== permissionName)
        : [...prev, permissionName],
    );
  };

  const toggleGroup = (permissions: any[], checked: boolean) => {
    if (checked) {
      setActions((prev) => [
        ...new Set([...prev, ...permissions.map((p: any) => p.name)]),
      ]);
    } else {
      setActions((prev) =>
        prev.filter(
          (action) => !permissions.some((p: any) => p.name === action),
        ),
      );
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      setErrors({});

      const payload = {
        name,
        description,
        actions,
      };

      if (editing) {
        await updatePermissionGroup(editing.id, payload);

        toast.success("Permission group updated successfully");
      } else {
        await createPermissionGroup(payload);

        toast.success("Permission group created successfully");
      }

      refresh();
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }

      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold">
          {editing ? "Edit Permission Group" : "Create Permission Group"}
        </h2>

        {/* Name */}

        <div className="mb-5">
          <label className="mb-2 block font-medium">Group Name</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border p-2"
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Description */}

        <div className="mb-6">
          <label className="mb-2 block font-medium">Description</label>

          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border p-2"
          />
        </div>

        {/* Permissions */}

        <div className="space-y-6">
          {availableGroups.map((group: any) => {
            const permissions = Array.isArray(group.permissions)
              ? group.permissions
              : [];

            return (
              <div key={group.id} className="rounded-lg border">
                <div className="flex items-center justify-between border-b bg-gray-100 px-4 py-3">
                  <h3 className="font-semibold text-lg">{group.name}</h3>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        permissions.length > 0 &&
                        permissions.every((permission: any) =>
                          actions.includes(permission?.name),
                        )
                      }
                      disabled={permissions.length === 0}
                      onChange={(e) =>
                        toggleGroup(permissions, e.target.checked)
                      }
                    />

                    <span className="font-medium">Select All</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3">
                  {permissions.length === 0 ? (
                    <p className="col-span-full text-sm text-gray-500">
                      No permissions in this group.
                    </p>
                  ) : (
                    permissions.map((permission: any) => (
                      <label
                        key={permission.id || permission.name}
                        className="flex items-center gap-2 rounded border p-2 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={actions.includes(permission.name)}
                          onChange={() => toggleAction(permission.name)}
                        />

                        <span className="capitalize">
                          {String(permission.name || "permission").split(
                            ":",
                          )[1] || String(permission.name || "permission")}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {errors.actions && (
          <p className="mt-4 text-sm text-red-500">{errors.actions}</p>
        )}

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="rounded border px-5 py-2">
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : editing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
