from pydantic import BaseModel, Field


class JobDescription(BaseModel):
    title: str = Field(default="Untitled role", max_length=160)
    description: str = Field(..., min_length=30)
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    min_experience_years: float | None = Field(default=None, ge=0)
    education_keywords: list[str] = Field(default_factory=list)
    certification_keywords: list[str] = Field(default_factory=list)


class ResumeInput(BaseModel):
    candidate_id: str
    text: str
    category: str | None = None


class RankRequest(BaseModel):
    job: JobDescription
    resumes: list[ResumeInput] = Field(default_factory=list)


class CandidateScore(BaseModel):
    rank: int
    candidate_id: str
    score: float
    match_percentage: float
    extracted_skills: list[str]
    missing_skills: list[str]
    matched_skills: list[str]
    experience_years: float
    semantic_similarity: float
    tfidf_similarity: float
    keyword_score: float
    resume_summary: str
    category: str | None = None


class RankResponse(BaseModel):
    job_title: str
    total_candidates: int
    ranked_candidates: list[CandidateScore]
    analytics: dict
