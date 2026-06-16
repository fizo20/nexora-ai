// src/models/system-config.model.ts
import { Schema, model } from "mongoose";

const schema = new Schema({
  aiGlobalEnabled: { type: Boolean, default: true },
});

export const SystemConfig = model("SystemConfig", schema);
