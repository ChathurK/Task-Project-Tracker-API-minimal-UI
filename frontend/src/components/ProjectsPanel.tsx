import { useState } from "react";
import type { Project } from "../types";
import { ApiError, createProject, deleteProject } from "../api";

interface Props {
  projects: Project[];
  loading: boolean;
  error: string | null;
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onProjectsChanged: () => void;
}

export default function ProjectsPanel({
  projects,
  loading,
  error,
  selectedProjectId,
  onSelectProject,
  onProjectsChanged,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError("Name is required");
      return;
    }
    setSubmitting(true);
    try {
      await createProject({ name: name.trim(), description: description.trim() || undefined });
      setName("");
      setDescription("");
      onProjectsChanged();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await deleteProject(id);
      if (selectedProjectId === id) onSelectProject("");
      onProjectsChanged();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete project");
    }
  }

  return (
    <div className="panel">
      <h2>Projects</h2>

      <form onSubmit={handleCreate} className="stacked-form">
        <input
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {formError && <div className="error-text">{formError}</div>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Add project"}
        </button>
      </form>

      {loading && <p>Loading projects...</p>}
      {error && <p className="error-text">{error}</p>}

      <ul className="project-list">
        <li
          className={selectedProjectId === "" ? "active" : ""}
          onClick={() => onSelectProject("")}
        >
          All projects
        </li>
        {projects.map((p) => (
          <li
            key={p._id}
            className={selectedProjectId === p._id ? "active" : ""}
            onClick={() => onSelectProject(p._id)}
          >
            <span>
              {p.name} <small>({p.taskCount ?? 0} tasks)</small>
            </span>
            <button
              className="link-button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(p._id);
              }}
            >
              delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
