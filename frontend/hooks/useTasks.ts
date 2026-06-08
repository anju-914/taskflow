"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Task, CreateTaskPayload, UpdateTaskPayload } from "@/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Task[]>("/api/tasks");
      setTasks(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (payload: CreateTaskPayload) => {
    const newTask = await api.post<Task>("/api/tasks", payload);
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback(
    async (taskId: string, payload: UpdateTaskPayload) => {
      const updated = await api.patch<Task>(`/api/tasks/${taskId}`, payload);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      return updated;
    },
    []
  );

  const deleteTask = useCallback(async (taskId: string) => {
    await api.delete(`/api/tasks/${taskId}`);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}