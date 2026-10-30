import "dotenv/config";
import mongoose from "mongoose";
import Job from "./models/Job.js";

const jobs = [
  {
    title: "Frontend Developer Intern",
    company: "BrightWeb Labs",
    location: "Remote",
    type: "Internship",
    experience: "Fresher",
    skills: ["React", "JavaScript", "HTML", "CSS", "Git"],
    description: "Build responsive interfaces using React, JavaScript, HTML and CSS. Integrate REST APIs and reusable components."
  },
  {
    title: "MERN Stack Developer",
    company: "NexaTech Solutions",
    location: "Gurugram, India",
    type: "Full-time",
    experience: "0-2 years",
    skills: ["MongoDB", "Express", "React", "Node.js", "REST API"],
    description: "Develop full stack applications using MongoDB, Express, React and Node.js. Build REST APIs and maintain code."
  },
  {
    title: "Python Machine Learning Intern",
    company: "DataSpring AI",
    location: "Remote",
    type: "Internship",
    experience: "Fresher",
    skills: ["Python", "Machine Learning", "Scikit-learn", "Pandas", "NLP"],
    description: "Work on ML experiments, NLP text processing, model evaluation and Python API integration using Scikit-learn."
  },
  {
    title: "Backend Developer",
    company: "CloudRoute Systems",
    location: "Noida, India",
    type: "Full-time",
    experience: "0-2 years",
    skills: ["Node.js", "Express", "MongoDB", "SQL", "API"],
    description: "Create backend services with Node.js and Express, design database schemas, implement authentication and REST APIs."
  },
  {
    title: "Junior Java Developer",
    company: "CodeCraft",
    location: "Hybrid",
    type: "Full-time",
    experience: "Fresher",
    skills: ["Java", "OOP", "DSA", "SQL", "Git"],
    description: "Develop Java applications using object oriented programming, data structures, algorithms, SQL and Git."
  }
];

try {
  await mongoose.connect(process.env.MONGODB_URI);
  await Job.bulkWrite(jobs.map(job => ({
    updateOne: {
      filter: { title: job.title, company: job.company },
      update: { $set: job },
      upsert: true
    }
  })));
  console.log(`Inserted ${jobs.length} sample jobs.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
