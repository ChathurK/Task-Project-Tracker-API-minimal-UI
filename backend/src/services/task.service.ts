import mongoose from 'mongoose';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { AppError } from '../utils/AppError';
import { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from '../dto/task.dto';
import { TaskStatus } from '../models/Task';

const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in-progress'],
  'in-progress': ['done'],
  done: [],
};

export async function createTaskUnderProject(projectId: string, data: CreateTaskInput) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new AppError('Invalid project id', 400, 'INVALID_ID');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }

  const task = await Task.create({
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    projectId,
    status: 'todo',
  });

  return task;
}

export async function listTasks(query: ListTasksQuery) {
  const { status, priority, projectId, page, limit } = query;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (projectId) filter.projectId = projectId;

  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);

  return {
    data: tasks,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

export async function updateTask(taskId: string, data: UpdateTaskInput) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError('Invalid task id', 400, 'INVALID_ID');
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
  }

  if (data.status && data.status !== task.status) {
    const allowed = ALLOWED_TRANSITIONS[task.status];
    if (!allowed.includes(data.status)) {
      throw new AppError(
        `Invalid status transition from '${task.status}' to '${data.status}'`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }
  }

  if (data.title !== undefined) task.title = data.title;
  if (data.description !== undefined) task.description = data.description;
  if (data.priority !== undefined) task.priority = data.priority;
  if (data.dueDate !== undefined) task.dueDate = new Date(data.dueDate);
  if (data.status !== undefined) task.status = data.status;

  await task.save();
  return task;
}

export async function deleteTask(taskId: string) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError('Invalid task id', 400, 'INVALID_ID');
  }

  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
  }
}