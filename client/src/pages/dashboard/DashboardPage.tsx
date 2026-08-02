import { useEffect, useState } from "react";
import {
  Boxes,
  FolderTree,
  Package,
  Shapes,
  ShieldCheck,
  Sparkles,
  Tags,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import { getDashboard } from "../../api/dashboard.api";
import StatCard from "../../components/common/StatCard";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await getDashboard();
      const payload = res?.data?.data ?? res?.data ?? {};

      setDashboard(payload);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-500 shadow-sm">
        Loading Dashboard...
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-500 shadow-sm">
        Dashboard data unavailable.
      </div>
    );
  }

  const stats = [
    {
      title: "Users",
      value: dashboard.users?.total ?? 0,
      description: `${dashboard.users?.active ?? 0} active accounts`,
      icon: Users,
      accent: "from-blue-100 to-cyan-100",
    },
    {
      title: "Roles",
      value: dashboard.roles ?? 0,
      description: "Configured access levels",
      icon: ShieldCheck,
      accent: "from-violet-100 to-fuchsia-100",
    },
    {
      title: "Permission Groups",
      value: dashboard.permissionGroups ?? 0,
      description: "Grouped permissions",
      icon: FolderTree,
      accent: "from-amber-100 to-orange-100",
    },
    {
      title: "Permissions",
      value: dashboard.permissions ?? 0,
      description: "Fine-grained rights",
      icon: Sparkles,
      accent: "from-emerald-100 to-green-100",
    },
    {
      title: "Categories",
      value: dashboard.categories ?? 0,
      description: "Catalog sections",
      icon: Boxes,
      accent: "from-sky-100 to-indigo-100",
    },
    {
      title: "Brands",
      value: dashboard.brands ?? 0,
      description: "Registered brands",
      icon: Tags,
      accent: "from-pink-100 to-rose-100",
    },
    {
      title: "Attributes",
      value: dashboard.attributes ?? 0,
      description: "Custom product fields",
      icon: Shapes,
      accent: "from-lime-100 to-yellow-100",
    },
    {
      title: "Products",
      value: dashboard.products?.total ?? 0,
      description: `${dashboard.products?.active ?? 0} active / ${dashboard.products?.featured ?? 0} featured`,
      icon: Package,
      accent: "from-slate-100 to-slate-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-linear-to-br from-slate-900 via-blue-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-200">
              Admin Overview
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Welcome back to your dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Track your catalog, users, roles, and permissions from one
              polished control center.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-sm text-slate-300">System health</p>
            <p className="text-lg font-semibold">All modules online</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            description={item.description}
            icon={item.icon}
            accent={item.accent}
          />
        ))}
      </div>
    </div>
  );
}
