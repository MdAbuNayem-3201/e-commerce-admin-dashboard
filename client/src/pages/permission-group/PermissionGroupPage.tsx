import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getPermissionGroups } from "../../api/permissionGroup.api";

import PermissionGroupTable from "./PermissionGroupTable";
import PermissionGroupModal from "./PermissionGroupModal";

export default function PermissionGroupPage() {
  const [groups, setGroups] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);

  const [editing, setEditing] = useState<any>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);

      const res = await getPermissionGroups();

      setGroups(res ?? []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load permission groups",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <h1 className="text-3xl font-bold">Permission Groups</h1>

        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="rounded bg-blue-600 px-5 py-2 text-white"
        >
          Create
        </button>
      </div>

      <PermissionGroupTable
        loading={loading}
        groups={groups}
        onEdit={(item) => {
          setEditing(item);
          setOpen(true);
        }}
        refresh={fetchGroups}
      />

      <PermissionGroupModal
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
        refresh={fetchGroups}
      />
    </div>
  );
}
