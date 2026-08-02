import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  accent: string;
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
}: Props) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md`}
    >
      <div
        className={`mb-4 inline-flex rounded-2xl bg-linear-to-br ${accent} p-3 text-slate-700`}
      >
        <Icon size={20} />
      </div>

      <p className="text-sm font-medium text-slate-500">{title}</p>

      <h2 className="mt-2 text-3xl font-semibold text-slate-900">{value}</h2>

      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
