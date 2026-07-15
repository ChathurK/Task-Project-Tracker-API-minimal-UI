import { useState } from "react";
import type { Project } from "../types";
import { ApiError, createProject, deleteProject, updateProject } from "../api";

interface Props {
  projects: Project[];
  loading: boolean;
  error: string | null;
  onProjectsChanged: () => void;
  onOpenProject: (id: string) => void;
}

interface EditState {
  name: string;
  description: string;
}

export default function ProjectsPanel({
  projects,
  loading,
  error,
  onProjectsChanged,
  onOpenProject,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: "", description: "" });
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

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

  function startEdit(project: Project, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(project._id);
    setEditState({ name: project.name, description: project.description || "" });
    setEditError(null);
  }

  function cancelEdit(e?: React.MouseEvent) {
    e?.stopPropagation();
    setEditingId(null);
    setEditError(null);
  }

  async function saveEdit(id: string, e: React.MouseEvent | React.FormEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!editState.name.trim()) {
      setEditError("Name is required");
      return;
    }
    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateProject(id, {
        name: editState.name.trim(),
        description: editState.description.trim() || undefined,
      });
      setEditingId(null);
      onProjectsChanged();
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Failed to update project");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await deleteProject(id);
      onProjectsChanged();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete project");
    }
  }

  return (
    <div className="projects-window">
      <div className="panel">
        <h2>New project</h2>
        <form onSubmit={handleCreate} className="stacked-form">
          <input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
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
      </div>

      {loading && <p>Loading projects...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="project-card-grid">
        {projects.map((p) => (
          <div key={p._id} className="project-card" onClick={() => editingId !== p._id && onOpenProject(p._id)}>
            {editingId === p._id ? (
              <form className="stacked-form" onClick={(e) => e.stopPropagation()} onSubmit={(e) => saveEdit(p._id, e)}>
                <input
                  value={editState.name}
                  onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                />
                <textarea
                  rows={2}
                  value={editState.description}
                  onChange={(e) => setEditState((s) => ({ ...s, description: e.target.value }))}
                />
                {editError && <div className="error-text">{editError}</div>}
                <div className="form-actions">
                  <button type="submit" disabled={editSubmitting}>
                    {editSubmitting ? "Saving..." : "Save"}
                  </button>
                  <button type="button" className="secondary" onClick={(e) => cancelEdit(e)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="project-card-header">
                  <h3>{p.name}</h3>
                  <span className="badge">{p.taskCount ?? 0} tasks</span>
                </div>
                <p className="project-card-desc">{p.description || "No description"}</p>
                <div className="task-actions">
                  <button onClick={(e) => startEdit(p, e)}>Edit</button>
                  <button className="danger" onClick={(e) => handleDelete(p._id, e)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {!loading && projects.length === 0 && <p>No projects yet. Create one above.</p>}
      </div>
    </div>
  );
}
