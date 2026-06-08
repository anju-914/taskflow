"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/TaskCard";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { Navbar } from "@/components/Navbar";
import { StatsBar } from "@/components/StatsBar";
import type { TaskStatus } from "@/types";
import { Plus, Filter } from "lucide-react";

type FilterType = "all" | TaskStatus;

export default function DashboardPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    tasks,
    loading: tasksLoading,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !session) {
      router.replace("/login");
    }
  }, [authLoading, session, router]);

  if (authLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "all" || task.status === filter;
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              Dashboard
            </h1>
            <p className="text-white/40 text-sm mt-1">
               Manage and track your team&#39;s tasks
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-gold">
            <Plus size={18} />
            New Task
          </button>
        </div>

        {/* Stats Row */}
        <StatsBar tasks={tasks} />

        {/* Filter + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 mt-6">
          {/* Search input */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold-400/50 text-sm transition-colors"
            />
          </div>

          {/* Status filter buttons */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-white/40" />
            <div className="flex gap-1">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                    filter === opt.value
                      ? "bg-gold-400 text-navy-900"
                      : "bg-surface border border-white/10 text-white/50 hover:text-white hover:border-white/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task Grid */}
        {tasksLoading ? (
          /* Skeleton loader */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-3/4 mb-3" />
                <div className="h-3 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-2/3 mb-4" />
                <div className="flex gap-2">
                  <div className="h-6 bg-white/5 rounded-full w-16" />
                  <div className="h-6 bg-white/5 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gold-400/10 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gold-400/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl font-semibold text-white mb-2">
              {searchQuery ? "No matching tasks" : "No tasks yet"}
            </h3>
            <p className="text-white/40 text-sm mb-6">
              {searchQuery
                ? "Try a different search term."
                : "Create your first task to get started."}
            </p>
            {!searchQuery && (
              <button onClick={() => setShowModal(true)} className="btn-gold">
                <Plus size={16} />
                Create Task
              </button>
            )}
          </div>
        ) : (
          /* Task cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={async (status) => {
                  await updateTask(task.id, { status });
                }}
                onDelete={async () => {
                  await deleteTask(task.id);
                }}
                currentUserId={session.user.id}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onCreate={createTask}
        />
      )}
    </div>
  );
}