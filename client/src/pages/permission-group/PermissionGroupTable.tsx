import {
  Pencil,
  Trash2,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  deletePermissionGroup,
} from "../../api/permissionGroup.api";

type Props = {
  loading: boolean;
  groups: any[];
  refresh: () => void;
  onEdit: (item: any) => void;
};

export default function PermissionGroupTable({
  loading,
  groups,
  refresh,
  onEdit,
}: Props) {

  const handleDelete = async (
    id: string
  ) => {
    if (
      !confirm(
        "Delete this permission group?"
      )
    )
      return;

    try {
      await deletePermissionGroup(id);

      toast.success(
        "Deleted successfully"
      );

      refresh();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message
      );
    }
  };

  if (loading)
    return <p>Loading...</p>;

  if (!groups.length)
    return (
      <p>No Permission Groups Found</p>
    );

  return (
    <table className="w-full rounded bg-white shadow">

      <thead>

        <tr className="border-b">

          <th className="p-4 text-left">
            Name
          </th>

          <th className="p-4 text-left">
            Description
          </th>

          <th className="p-4">
            Actions
          </th>

        </tr>

      </thead>

      <tbody>

        {groups.map((group) => (

          <tr
            key={group.id}
            className="border-b"
          >

            <td className="p-4">
              {group.name}
            </td>

            <td className="p-4">
              {group.description}
            </td>

            <td className="flex justify-center gap-3 p-4">

              <button
                onClick={() =>
                  onEdit(group)
                }
              >
                <Pencil size={18} />
              </button>

              <button
                onClick={() =>
                  handleDelete(group.id)
                }
              >
                <Trash2
                  size={18}
                  className="text-red-500"
                />
              </button>

            </td>

          </tr>

        ))}

      </tbody>

    </table>
  );
}