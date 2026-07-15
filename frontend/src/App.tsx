import { useCallback, useEffect, useState } from "react";
import "./App.css";
import type { PaginatedTasks, Project, Task, TaskPriority, TaskStatus } from "./types";
import { ApiError, listProjects, listTasks } from "./api";
import ProjectsPanel from "./components/ProjectsPanel";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

const PAGE_LIMIT = 10;

function App() {
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
  }, [statusFilter, priorityFilter, selectedProjectId, page]);

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

  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Task &amp; Project Tracker</h1>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <ProjectsPanel
            projects={projects}
            loading={projectsLoading}
            error={projectsError}
            selectedProjectId={selectedProjectId}
            onSelectProject={(id) => {
              setSelectedProjectId(id);
              setPage(1);
            }}
            onProjectsChanged={() => {
              refreshProjects();
              refreshTasks();
            }}
          />

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
      </main>
    </div>
  );
}

export default App;
