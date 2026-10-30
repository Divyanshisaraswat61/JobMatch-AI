import { Router } from "express";
import multer from "multer";
import pdf from "pdf-parse";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed."));
    }
    cb(null, true);
  }
});

router.post("/upload", requireAuth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Select a PDF resume." });
    }

    const parsed = await pdf(req.file.buffer);
    const text = (parsed.text || "").trim();

    if (text.length < 30) {
      return res.status(400).json({
        message: "Could not extract enough text. Upload a text-based PDF."
      });
    }

    await User.findByIdAndUpdate(req.userId, {
      resumeText: text,
      resumeFileName: req.file.originalname
    });

    res.json({
      message: "Resume uploaded and processed successfully.",
      fileName: req.file.originalname,
      charactersExtracted: text.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/status", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("resumeText resumeFileName");

  res.json({
    uploaded: Boolean(user?.resumeText),
    fileName: user?.resumeFileName || "",
    charactersExtracted: user?.resumeText?.length || 0
  });
});

export default router;
