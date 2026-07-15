import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/task.service';
import { ListTasksQuery } from '../dto/task.dto';

type QueryRequest<T> = Request & { validatedQuery: T };

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.createTaskUnderProject(req.params.id as string, req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (req as QueryRequest<ListTasksQuery>).validatedQuery;
    const result = await taskService.listTasks(query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.updateTask(req.params.id as string, req.body);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    await taskService.deleteTask(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}