import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { createUser, updateUser } from "../../api/user.api";
import { getRoles } from "../../api/role.api";
import type { User } from "../../types/user";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUser?: User | null;
};

export default function UserFormModal({
  open,
  onClose,
  onSuccess,
  editingUser,
}: Props) {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    phone: string;
    gender: "MALE" | "FEMALE" | "OTHER" | "";
    roleId: string;
  }>({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    roleId: "",
  });

  useEffect(() => {
    if (!open) return;

    const loadRoles = async () => {
      try {
        const res = await getRoles();
        setRoles(res ?? []);
      } catch {
        setError("Failed to load roles");
      }
    };

    loadRoles();

    if (editingUser) {
      const normalizedGender =
        editingUser.gender === "MALE" ||
        editingUser.gender === "FEMALE" ||
        editingUser.gender === "OTHER"
          ? editingUser.gender
          : "";

      setForm({
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        phone: editingUser.phone ?? "",
        gender: normalizedGender,
        roleId: editingUser.roleId,
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        gender: "",
        roleId: "",
      });
    }
  }, [open, editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        gender: (form.gender || undefined) as
          | "MALE"
          | "FEMALE"
          | "OTHER"
          | undefined,
        roleId: form.roleId,
      };

      if (editingUser) {
        await updateUser(editingUser.id, {
          name: form.name,
          phone: form.phone || undefined,
          gender: (form.gender || undefined) as
            | "MALE"
            | "FEMALE"
            | "OTHER"
            | undefined,
          roleId: form.roleId,
        });
      } else {
        await createUser(payload);
      }

      toast.success(
        editingUser ? "User updated successfully" : "User created successfully",
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-semibold">
          {editingUser ? "Edit User" : "Create User"}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                disabled={!!editingUser}
                required={!editingUser}
              />
            </div>
          </div>

          {!editingUser && (
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Gender</label>
              <select
                value={form.gender}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gender: e.target.value as
                      | "MALE"
                      | "FEMALE"
                      | "OTHER"
                      | "",
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Role</label>
            <select
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : editingUser ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
