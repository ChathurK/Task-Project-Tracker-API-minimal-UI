import { Router } from 'express';
import { validate, validateQuery } from '../middleware/validate';
import { createTaskSchema, listTasksQuerySchema, updateTaskSchema } from '../dto/task.dto';
import * as taskController from '../controllers/task.controller';

const router = Router();

router.post('/:id/tasks', validate(createTaskSchema), taskController.createTask);

export const taskCollectionRouter = Router();
taskCollectionRouter.get('/', validateQuery(listTasksQuerySchema), taskController.listTasks);
taskCollectionRouter.patch('/:id', validate(updateTaskSchema), taskController.updateTask);
taskCollectionRouter.delete('/:id', taskController.deleteTask);

export default router;