import type { Task } from "@/types";
import { CheckCircle, Clock, Loader2, ListTodo } from "lucide-react";

interface StatsBarProps {
  tasks: Task[];
}

export function StatsBar({ tasks }: StatsBarProps) {
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  const stats = [
    {
      label: "Total Tasks",
      value: total,
      icon: ListTodo,
      color: "text-white/80",
      bg: "bg-white/5",
      border: "border-white/10",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "text-slate-300",
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Loader2,
      color: "text-blue-300",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle,
      color: "text-emerald-300",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className={`${s.bg} border ${s.border} rounded-xl p-4 transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/40 text-xs font-medium uppercase tracking-wide">
                {s.label}
              </span>
              <Icon size={16} className={s.color} />
            </div>
            <p className={`text-2xl font-bold font-display ${s.color}`}>
              {s.value}
            </p>
            {total > 0 && s.label !== "Total Tasks" && (
              <p className="text-xs text-white/30 mt-1">
                {Math.round((s.value / total) * 100)}% of total
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}