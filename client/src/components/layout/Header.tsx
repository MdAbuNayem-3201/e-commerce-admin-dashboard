import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { logout } from "../../api/auth.api";
import { removeAccessToken } from "../../utils/token";

type Props = {
  name: string;
  role: string;
};

export default function Header({ name, role }: Props) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}

    removeAccessToken();

    toast.success("Logged out");

    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-slate-500">Logged in as</p>
        <h2 className="font-semibold text-slate-900">{name}</h2>
        <p className="text-sm text-slate-500">{role}</p>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
      >
        <LogOut size={18} />
        Logout
      </button>
    </header>
  );
}
