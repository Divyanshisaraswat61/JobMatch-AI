import { Router } from "express";
import User from "../models/User.js";
import Job from "../models/Job.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("resumeText");

    if (!user?.resumeText) {
      return res.status(400).json({ message: "Upload your resume first." });
    }

    const jobs = await Job.find().lean();

    const response = await fetch(`${process.env.ML_SERVICE_URL}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_text: user.resumeText,
        jobs: jobs.map(job => ({
          id: String(job._id),
          title: job.title,
          company: job.company,
          description: job.description,
          skills: job.skills,
          location: job.location,
          experience: job.experience,
          type: job.type
        }))
      })
    });

    if (!response.ok) {
      throw new Error("ML service returned an error.");
    }

    res.json(await response.json());
  } catch (error) {
    res.status(502).json({
      message: "Recommendation service unavailable.",
      detail: error.message
    });
  }
});

export default router;
