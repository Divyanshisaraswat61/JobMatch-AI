from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="JobMatch AI ML Service", version="1.0.0")

class Job(BaseModel):
    id: str
    title: str
    company: str
    description: str
    skills: List[str] = []
    location: str = "Remote"
    experience: str = "0-2 years"
    type: str = "Full-time"

class MatchRequest(BaseModel):
    resume_text: str
    jobs: List[Job]

@app.get("/health")
def health():
    return {"status": "ok", "service": "JobMatch AI ML"}

@app.post("/match")
def match(payload: MatchRequest):
    if not payload.resume_text.strip() or not payload.jobs:
        return []

    documents = [payload.resume_text] + [
        " ".join([job.title, job.description, " ".join(job.skills)])
        for job in payload.jobs
    ]

    matrix = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=8000
    ).fit_transform(documents)

    scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
    resume = payload.resume_text.lower()
    results = []

    for job, score in zip(payload.jobs, scores):
        matched = [s for s in job.skills if s.lower() in resume]
        missing = [s for s in job.skills if s.lower() not in resume]

        results.append({
            **job.model_dump(),
            "matchScore": round(float(score) * 100, 1),
            "matchedSkills": matched,
            "missingSkills": missing
        })

    return sorted(results, key=lambda item: item["matchScore"], reverse=True)
