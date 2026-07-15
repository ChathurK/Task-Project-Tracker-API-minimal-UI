import { Schema, model, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  description?: string;
  createdAt: Date;
}

const projectSchema = new Schema<IProject>({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export const Project = model<IProject>("Project", projectSchema);
