import type { PaginatedTasks, Project, Task, TaskPriority, TaskStatus } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.error?.message || "Request failed";
    const code = body?.error?.code || "UNKNOWN_ERROR";
    throw new ApiError(message, code);
  }

  return body as T;
}

export function listProjects(): Promise<Project[]> {
  return request<Project[]>("/projects");
}

export function getProject(id: string): Promise<Project> {
  return request<Project>(`/projects/${id}`);
}

export function createProject(data: { name: string; description?: string }): Promise<Project> {
  return request<Project>("/projects", { method: "POST", body: JSON.stringify(data) });
}

export function updateProject(
  id: string,
  data: { name?: string; description?: string }
): Promise<Project> {
  return request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteProject(id: string): Promise<void> {
  return request<void>(`/projects/${id}`, { method: "DELETE" });
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export function createTask(projectId: string, data: CreateTaskInput): Promise<Task> {
  return request<Task>(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface ListTasksParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  page?: number;
  limit?: number;
}

export function listTasks(params: ListTasksParams): Promise<PaginatedTasks> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.priority) query.set("priority", params.priority);
  if (params.projectId) query.set("projectId", params.projectId);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return request<PaginatedTasks>(`/tasks${qs ? `?${qs}` : ""}`);
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export function updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
  return request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteTask(id: string): Promise<void> {
  return request<void>(`/tasks/${id}`, { method: "DELETE" });
}
