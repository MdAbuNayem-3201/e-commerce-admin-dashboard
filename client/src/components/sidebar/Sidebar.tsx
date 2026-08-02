import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Shield,
  Users,
  Package,
  Image,
  FolderTree,
  Shapes,
  Tags,
  UserCog,
} from "lucide-react";

type Props = {
  permissions: string[];
};

export default function Sidebar({ permissions }: Props) {
  const menuClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-all ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <aside className="hidden h-screen w-72 border-r border-slate-200 bg-white/90 px-4 py-5 shadow-sm lg:flex lg:flex-col">
      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-semibold">
            TB
          </div>
          <div>
            <h1 className="text-lg font-semibold">Trends Bird</h1>
            <p className="text-sm text-slate-300">Admin Center</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 space-y-1">
        {permissions.includes("dashboard:watch") && (
          <NavLink to="/" end className={menuClass}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
        )}

        {permissions.includes("permission-group:watch") && (
          <NavLink to="/permission-groups" className={menuClass}>
            <Shield size={18} />
            Permission Groups
          </NavLink>
        )}

        {permissions.includes("permission:watch") && (
          <NavLink to="/permissions" className={menuClass}>
            <Shield size={18} />
            Permissions
          </NavLink>
        )}

        {permissions.includes("role:watch") && (
          <NavLink to="/roles" className={menuClass}>
            <UserCog size={18} />
            Roles
          </NavLink>
        )}

        {permissions.includes("user:watch") && (
          <NavLink to="/users" className={menuClass}>
            <Users size={18} />
            Users
          </NavLink>
        )}

        {permissions.includes("media:watch") && (
          <NavLink to="/media" className={menuClass}>
            <Image size={18} />
            Media
          </NavLink>
        )}

        {permissions.includes("category:watch") && (
          <NavLink to="/categories" className={menuClass}>
            <FolderTree size={18} />
            Categories
          </NavLink>
        )}

        {permissions.includes("brand:watch") && (
          <NavLink to="/brands" className={menuClass}>
            <Tags size={18} />
            Brands
          </NavLink>
        )}

        {permissions.includes("attribute:watch") && (
          <NavLink to="/attributes" className={menuClass}>
            <Shapes size={18} />
            Attributes
          </NavLink>
        )}

        {permissions.includes("product:watch") && (
          <NavLink to="/products" className={menuClass}>
            <Package size={18} />
            Products
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
