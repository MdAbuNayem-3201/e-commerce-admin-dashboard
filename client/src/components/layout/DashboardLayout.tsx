import { Outlet } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import Sidebar from "../sidebar/Sidebar";
import Header from "./Header";

export default function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const permissions =
    user?.role?.permissions?.map((item) => item.permission.name) ?? [];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar permissions={permissions} />

      <div className="flex flex-1 flex-col">
        <Header name={user.name} role={user.role.name} />

        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
