"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Trash2, Calendar, User, ChevronDown } from "lucide-react";
import type { Task, TaskStatus } from "@/types";
import clsx from "clsx";

interface TaskCardProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => Promise<void>;
  onDelete: () => Promise<void>;
  currentUserId: string;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const PRIORITY_STYLES: Record<string, string> = {
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "status-pending",
  in_progress: "status-in_progress",
  completed: "status-completed",
};

export function TaskCard({
  task,
  onStatusChange,
  onDelete,
  currentUserId,
}: TaskCardProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = task.created_by === currentUserId;
  const isAssignee = task.assigned_to === currentUserId;
  const canEdit = isOwner || isAssignee;

  const handleStatusChange = async (status: TaskStatus) => {
    if (!canEdit || status === task.status) return;
    setUpdating(true);
    setStatusOpen(false);
    try {
      await onStatusChange(status);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    if (!confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={clsx(
        "glass-card p-5 flex flex-col gap-3 h-full transition-all duration-200 hover:border-gold-400/25 hover:shadow-lg hover:shadow-gold-400/5",
        task.status === "completed" && "opacity-70"
      )}
    >
      {/* Priority badge + Delete button */}
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            PRIORITY_STYLES[task.priority]
          }`}
        >
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-lg hover:bg-red-400/10 text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Title */}
      <h3
        className={clsx(
          "font-semibold text-white leading-snug",
          task.status === "completed" && "line-through text-white/50"
        )}
      >
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-white/40 text-sm leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Due date + Creator */}
      <div className="flex flex-wrap gap-2 text-xs text-white/40">
        {task.due_date && (
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {format(new Date(task.due_date), "MMM d, yyyy")}
          </span>
        )}
        {task.creator && (
          <span className="flex items-center gap-1">
            <User size={12} />
            {task.creator.full_name || task.creator.email}
          </span>
        )}
      </div>

      {/* Footer: Assignee + Status dropdown */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5 gap-2">
        {/* Assignee */}
        {task.assignee ? (
          <div
            className="flex items-center gap-1.5"
            title={task.assignee.full_name || task.assignee.email}
          >
            {task.assignee.avatar_url ? (
              <Image
                src={task.assignee.avatar_url}
                alt={task.assignee.full_name || "Assignee"}
                width={22}
                height={22}
                className="rounded-full ring-1 ring-gold-400/20"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gold-400/20 flex items-center justify-center text-[10px] font-bold text-gold-400">
                {(task.assignee.full_name || task.assignee.email)?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-xs text-white/40 truncate max-w-[80px]">
              {task.assignee.full_name || task.assignee.email}
            </span>
          </div>
        ) : (
          <span className="text-xs text-white/20 italic">Unassigned</span>
        )}

        {/* Status dropdown */}
        <div className="relative">
          <button
            disabled={!canEdit || updating}
            onClick={() => canEdit && setStatusOpen(!statusOpen)}
            className={clsx(
              "text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all",
              STATUS_STYLES[task.status],
              canEdit && "cursor-pointer hover:opacity-90",
              !canEdit && "cursor-default"
            )}
          >
            {updating ? "..." : task.status.replace("_", " ")}
            {canEdit && (
              <ChevronDown
                size={10}
                className={statusOpen ? "rotate-180" : ""}
              />
            )}
          </button>

          {statusOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setStatusOpen(false)}
              />
              <div className="absolute right-0 bottom-full mb-1 glass-card py-1 z-30 min-w-[130px] shadow-xl shadow-black/40">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className={clsx(
                      "w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors",
                      opt.value === task.status
                        ? "text-gold-400 font-medium"
                        : "text-white/70"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}