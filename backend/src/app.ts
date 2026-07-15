import express from "express";
import cors from "cors";
import projectRoutes from "./routes/project.routes";
import taskRoutes, { taskCollectionRouter } from "./routes/task.routes";
import { errorHandler } from "./middleware/errorHandler";
import { AppError } from "./utils/AppError";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/projects", projectRoutes);
app.use("/projects", taskRoutes);
app.use("/tasks", taskCollectionRouter);

app.use((_req, _res, next) => {
  next(new AppError("Route not found", 404, "NOT_FOUND"));
});

app.use(errorHandler);

export default app;
