# JobMatch AI - Project Overview

## Problem
Candidates may spend time applying to jobs that do not match their skills.

## Solution
The application extracts resume text and compares it with job descriptions using TF-IDF and cosine similarity.

## Workflow
1. Candidate registers or logs in.
2. Candidate uploads a PDF resume.
3. Backend extracts the resume text.
4. Backend sends resume text and job details to the Python ML service.
5. ML service ranks jobs using cosine similarity.
6. Frontend displays match scores and missing listed skills.

## Limitations
The score is a text-similarity indicator, not a validated hiring score. Sample jobs are included for demonstration.
