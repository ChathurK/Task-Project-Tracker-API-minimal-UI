import type { PaginatedTasks, Project, Task, TaskPriority, TaskStatus } from "../types";
import { ApiError, deleteTask, updateTask } from "../api";

interface Props {
  result: PaginatedTasks | null;
  loading: boolean;
  error: string | null;
  projects: Project[];
  status: TaskStatus | "";
  priority: TaskPriority | "";
  projectId: string;
  page: number;
  onStatusChange: (v: TaskStatus | "") => void;
  onPriorityChange: (v: TaskPriority | "") => void;
  onProjectChange: (v: string) => void;
  onPageChange: (v: number) => void;
  onEdit: (task: Task) => void;
  onChanged: () => void;
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  todo: "in-progress",
  "in-progress": "done",
  done: null,
};

function projectName(projects: Project[], id: string) {
  return projects.find((p) => p._id === id)?.name || id;
}

export default function TaskList({
  result,
  loading,
  error,
  projects,
  status,
  priority,
  projectId,
  page,
  onStatusChange,
  onPriorityChange,
  onProjectChange,
  onPageChange,
  onEdit,
  onChanged,
}: Props) {
  async function handleAdvance(task: Task) {
    const next = NEXT_STATUS[task.status];
    if (!next) return;
    try {
      await updateTask(task._id, { status: next });
      onChanged();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to update status");
    }
  }

  async function handleDelete(task: Task) {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    try {
      await deleteTask(task._id);
      onChanged();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete task");
    }
  }

  return (
    <div className="panel">
      <h2>Tasks</h2>

      <div className="filters">
        <select value={status} onChange={(e) => onStatusChange(e.target.value as TaskStatus | "")}>
          <option value="">All statuses</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>

        <select value={priority} onChange={(e) => onPriorityChange(e.target.value as TaskPriority | "")}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="med">Medium</option>
          <option value="high">High</option>
        </select>

        <select value={projectId} onChange={(e) => onProjectChange(e.target.value)}>
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading tasks...</p>}
      {error && <p className="error-text">{error}</p>}

      {result && result.data.length === 0 && !loading && <p>No tasks found.</p>}

      <ul className="task-list">
        {result?.data.map((task) => (
          <li key={task._id} className={`task-item priority-${task.priority}`}>
            <div className="task-main">
              <strong>{task.title}</strong>
              <span className={`badge status-${task.status}`}>{task.status}</span>
              <span className={`badge priority-badge-${task.priority}`}>{task.priority}</span>
            </div>
            {task.description && <p className="task-desc">{task.description}</p>}
            <div className="task-meta">
              <span>Project: {projectName(projects, task.projectId)}</span>
              {task.dueDate && <span>Due: {task.dueDate.slice(0, 10)}</span>}
            </div>
            <div className="task-actions">
              {NEXT_STATUS[task.status] && (
                <button onClick={() => handleAdvance(task)}>
                  Mark as {NEXT_STATUS[task.status]}
                </button>
              )}
              <button onClick={() => onEdit(task)}>Edit</button>
              <button className="danger" onClick={() => handleDelete(task)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {result && result.totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Prev
          </button>
          <span>
            Page {result.page} of {result.totalPages} ({result.total} tasks)
          </span>
          <button disabled={page >= result.totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
