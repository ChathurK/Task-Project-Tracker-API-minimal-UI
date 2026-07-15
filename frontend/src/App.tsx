import { useCallback, useEffect, useState } from "react";
import "./App.css";
import type { PaginatedTasks, Project, Task, TaskPriority, TaskStatus } from "./types";
import { ApiError, listProjects, listTasks } from "./api";
import ProjectsPanel from "./components/ProjectsPanel";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

const PAGE_LIMIT = 10;

type View = "projects" | "tasks";

function App() {
  const [view, setView] = useState<View>("projects");

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "">("");
  const [page, setPage] = useState(1);

  const [tasksResult, setTasksResult] = useState<PaginatedTasks | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const refreshProjects = useCallback(async () => {
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const data = await listProjects();
      setProjects(data);
    } catch (err) {
      setProjectsError(err instanceof ApiError ? err.message : "Failed to load projects");
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    if (view !== "tasks") return;
    setTasksLoading(true);
    setTasksError(null);
    try {
      const data = await listTasks({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        projectId: selectedProjectId || undefined,
        page,
        limit: PAGE_LIMIT,
      });
      setTasksResult(data);
    } catch (err) {
      setTasksError(err instanceof ApiError ? err.message : "Failed to load tasks");
    } finally {
      setTasksLoading(false);
    }
  }, [view, statusFilter, priorityFilter, selectedProjectId, page]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  function handleTaskMutated() {
    setEditingTask(null);
    refreshTasks();
    refreshProjects();
  }

  function openProject(id: string) {
    setSelectedProjectId(id);
    setStatusFilter("");
    setPriorityFilter("");
    setPage(1);
    setEditingTask(null);
    setView("tasks");
  }

  const activeProject = projects.find((p) => p._id === selectedProjectId);

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Task &amp; Project Tracker</h1>
        {view === "tasks" && (
          <button className="back-button" onClick={() => setView("projects")}>
            &larr; Back to projects
          </button>
        )}
      </header>

      <main className="app-main">
        {view === "projects" ? (
          <ProjectsPanel
            projects={projects}
            loading={projectsLoading}
            error={projectsError}
            onProjectsChanged={refreshProjects}
            onOpenProject={openProject}
          />
        ) : (
          <>
            <aside className="sidebar">
              <div className="panel">
                <h2>{activeProject?.name || "Project"}</h2>
                {activeProject?.description && <p className="task-desc">{activeProject.description}</p>}
              </div>

              <TaskForm
                projects={projects}
                editingTask={editingTask}
                defaultProjectId={selectedProjectId}
                onDone={handleTaskMutated}
                onCancelEdit={() => setEditingTask(null)}
              />
            </aside>

            <section className="content">
              <TaskList
                result={tasksResult}
                loading={tasksLoading}
                error={tasksError}
                projects={projects}
                status={statusFilter}
                priority={priorityFilter}
                projectId={selectedProjectId}
                page={page}
                onStatusChange={(v) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
                onPriorityChange={(v) => {
                  setPriorityFilter(v);
                  setPage(1);
                }}
                onProjectChange={(v) => {
                  setSelectedProjectId(v);
                  setPage(1);
                }}
                onPageChange={setPage}
                onEdit={setEditingTask}
                onChanged={() => {
                  refreshTasks();
                  refreshProjects();
                }}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
