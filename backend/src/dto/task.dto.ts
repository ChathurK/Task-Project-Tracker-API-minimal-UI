import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'med', 'high']).optional(),
  dueDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return date.getTime() >= Date.now();
      },
      { message: 'dueDate cannot be in the past' }
    ),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const listTasksQuerySchema = z.object({
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  priority: z.enum(['low', 'med', 'high']).optional(),
  projectId: z.string().regex(objectIdRegex, 'Invalid projectId').optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  priority: z.enum(['low', 'med', 'high']).optional(),
  dueDate: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return date.getTime() >= Date.now();
      },
      { message: 'dueDate cannot be in the past' }
    ),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;