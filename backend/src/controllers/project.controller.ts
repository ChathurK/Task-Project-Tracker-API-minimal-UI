import { NextFunction, Request, Response } from "express";
import * as projectService from "../services/project.service";

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

export async function listProjects(_req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await projectService.listProjects();
    res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
}

export async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.getProjectWithTasks(req.params.id as string);
    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.deleteProject(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
