import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: "Remote" },
  description: { type: String, required: true },
  skills: [String],
  experience: { type: String, default: "0-2 years" },
  type: { type: String, default: "Full-time" }
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);
