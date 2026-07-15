import { Types } from "mongoose";
import { Project } from "../models/Project";
import { Task } from "../models/Task";
import { AppError } from "../utils/AppError";

export async function createProject(data: { name: string; description?: string }) {
  return Project.create(data);
}

export async function listProjects() {
  const projects = await Project.find().sort({ createdAt: -1 }).lean();
  const counts = await Task.aggregate([
    { $group: { _id: "$projectId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

  return projects.map((p) => ({
    ...p,
    taskCount: countMap.get(p._id.toString()) ?? 0,
  }));
}

export async function getProjectWithTasks(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid project id", 400, "INVALID_ID");
  }

  const project = await Project.findById(id).lean();
  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  const tasks = await Task.find({ projectId: id }).sort({ createdAt: -1 }).lean();
  return { ...project, tasks };
}

export async function updateProject(
  id: string,
  data: { name?: string; description?: string }
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid project id", 400, "INVALID_ID");
  }

  const project = await Project.findById(id);
  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  if (data.name !== undefined) project.name = data.name;
  if (data.description !== undefined) project.description = data.description;

  await project.save();
  return project;
}

export async function deleteProject(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid project id", 400, "INVALID_ID");
  }

  const project = await Project.findByIdAndDelete(id);
  if (!project) {
    throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
  }

  await Task.deleteMany({ projectId: id });
}
