import { Router } from "express";
import Job from "../models/Job.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    const filter = q ? {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
        { skills: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ]
    } : {};

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
