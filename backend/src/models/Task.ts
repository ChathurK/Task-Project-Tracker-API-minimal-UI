import { Schema, model, Document, Types } from "mongoose";

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "med" | "high";

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  projectId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "med", "high"],
      default: "med",
    },
    dueDate: { type: Date },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", taskSchema);
