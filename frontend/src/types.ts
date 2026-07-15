export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "med" | "high";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  taskCount?: number;
  tasks?: Task[];
}

export interface PaginatedTasks {
  data: Task[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorBody {
  error: { message: string; code: string };
}
