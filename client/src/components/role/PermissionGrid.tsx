import type { PermissionGroup } from "../../types/role";

type Props = {
  groups: PermissionGroup[];

  selected: string[];

  onChange: (ids: string[]) => void;
};

export default function PermissionGrid({
  groups,
  selected,
  onChange,
}: Props) {
  const togglePermission = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const toggleModule = (group: PermissionGroup) => {
    const ids = group.permissions.map((p) => p.id);

    const alreadySelected = ids.every((id) =>
      selected.includes(id)
    );

    if (alreadySelected) {
      onChange(
        selected.filter((x) => !ids.includes(x))
      );
    } else {
      const merged = [
        ...new Set([...selected, ...ids]),
      ];

      onChange(merged);
    }
  };

  return (
    <div className="space-y-6">

      {groups.map((group) => {

        const moduleIds =
          group.permissions.map((p) => p.id);

        const checked =
          moduleIds.every((id) =>
            selected.includes(id)
          );

        return (
          <div
            key={group.id}
            className="rounded-lg border"
          >
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3">

              <div>

                <h3 className="font-semibold">
                  {group.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {group.description}
                </p>

              </div>

              <label className="flex items-center gap-2">

                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    toggleModule(group)
                  }
                />

                Select All

              </label>

            </div>

            <div className="grid grid-cols-5 gap-3 p-4">

              {group.permissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(
                      permission.id
                    )}
                    onChange={() =>
                      togglePermission(
                        permission.id
                      )
                    }
                  />

                  {permission.name.split(":")[1]}
                </label>
              ))}

            </div>

          </div>
        );
      })}
    </div>
  );
}