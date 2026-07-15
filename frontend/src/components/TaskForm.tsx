import { useEffect, useState } from "react";
import type { Project, Task, TaskPriority } from "../types";
import { ApiError, createTask, updateTask } from "../api";

interface Props {
  projects: Project[];
  editingTask: Task | null;
  defaultProjectId: string;
  onDone: () => void;
  onCancelEdit: () => void;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function TaskForm({ projects, editingTask, defaultProjectId, onDone, onCancelEdit }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("med");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || "");
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : "");
      setProjectId(editingTask.projectId);
    } else {
      setTitle("");
      setDescription("");
      setPriority("med");
      setDueDate("");
      setProjectId(defaultProjectId);
    }
    setError(null);
  }, [editingTask, defaultProjectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!editingTask && !projectId) {
      setError("Select a project");
      return;
    }

    setSubmitting(true);
    try {
      if (editingTask) {
        await updateTask(editingTask._id, {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate || undefined,
        });
      } else {
        await createTask(projectId, {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate || undefined,
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="stacked-form task-form">
      <h3>{editingTask ? "Edit task" : "New task"}</h3>

      {!editingTask && (
        <label>
          Project
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Select project...</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label>
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </label>

      <label>
        Priority
        <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
          <option value="low">Low</option>
          <option value="med">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <label>
        Due date
        <input type="date" min={todayISO()} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </label>

      {error && <div className="error-text">{error}</div>}

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : editingTask ? "Save changes" : "Create task"}
        </button>
        {editingTask && (
          <button type="button" className="secondary" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
