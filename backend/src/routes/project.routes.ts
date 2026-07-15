import { Router } from "express";
import { z } from "zod";
import * as projectController from "../controllers/project.controller";
import { validate } from "../middleware/validate";

const router = Router();

const createProjectSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  description: z.string().trim().optional(),
});

router.post("/", validate(createProjectSchema), projectController.createProject);
router.get("/", projectController.listProjects);
router.get("/:id", projectController.getProject);
router.delete("/:id", projectController.deleteProject);

export default router;
