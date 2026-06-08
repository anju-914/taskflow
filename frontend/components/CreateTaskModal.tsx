"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { UserProfile, CreateTaskPayload, TaskPriority } from "@/types";

interface CreateTaskModalProps {
  onClose: () => void;
  onCreate: (payload: CreateTaskPayload) => Promise<unknown>;
}

export function CreateTaskModal({ onClose, onCreate }: CreateTaskModalProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<UserProfile[]>("/api/users").then(setUsers).catch(console.error);
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Task title is required.");
      titleRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onCreate({
        title: trimmedTitle,
        description: description.trim() || undefined,
        priority,
        assigned_to: assignedTo || null,
        due_date: dueDate || null,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal box */}
      <div className="relative z-10 w-full max-w-lg glass-card p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-white">
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design the landing page hero"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-gold-400/60 text-sm transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional — add more context..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-gold-400/60 text-sm resize-none transition-colors"
            />
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold-400/60 text-sm transition-colors cursor-pointer"
              >
                <option value="low" className="bg-navy-800">Low</option>
                <option value="medium" className="bg-navy-800">Medium</option>
                <option value="high" className="bg-navy-800">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold-400/60 text-sm transition-colors [color-scheme:dark] cursor-pointer"
              />
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wide">
              Assign To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold-400/60 text-sm transition-colors cursor-pointer"
            >
              <option value="" className="bg-navy-800">
                — Unassigned —
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-navy-800">
                  {u.full_name || u.email}
                </option>
              ))}
            </select>
            <p className="text-white/30 text-xs mt-1">
              The assignee will receive an email notification.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-400 text-sm px-3 py-2 bg-red-400/10 rounded-lg border border-red-400/20">
              {error}
            </p>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-gold flex-1 justify-center"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating…
              </>
            ) : (
              "Create Task"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}