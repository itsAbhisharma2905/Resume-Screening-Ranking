from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.resume import JobDescription, RankRequest, RankResponse, ResumeInput
from app.services.dataset_loader import load_kaggle_resume_csv
from app.services.ranking_service import rank_resumes
from app.services.text_extractor import extract_text


router = APIRouter()
MAX_RESUME_FILES = 10


@router.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "resume-ranker"}


@router.post("/rank", response_model=RankResponse)
def rank_candidates(payload: RankRequest) -> RankResponse:
    if not payload.resumes:
        raise HTTPException(status_code=400, detail="At least one resume is required.")
    return rank_resumes(payload.job, payload.resumes)


@router.post("/rank/files", response_model=RankResponse)
async def rank_uploaded_files(
    job_title: str = Form(...),
    job_description: str = Form(...),
    required_skills: str = Form(""),
    preferred_skills: str = Form(""),
    min_experience_years: float | None = Form(None),
    education_keywords: str = Form(""),
    certification_keywords: str = Form(""),
    files: list[UploadFile] = File(...),
) -> RankResponse:
    if len(files) > MAX_RESUME_FILES:
        raise HTTPException(status_code=400, detail=f"Upload up to {MAX_RESUME_FILES} resumes at once.")

    resumes: list[ResumeInput] = []
    for file in files:
        content = await file.read()
        try:
            text = extract_text(file.filename or "resume.txt", content)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        resumes.append(ResumeInput(candidate_id=file.filename or "candidate", text=text))

    job = JobDescription(
        title=job_title,
        description=job_description,
        required_skills=[item.strip() for item in required_skills.split(",") if item.strip()],
        preferred_skills=[item.strip() for item in preferred_skills.split(",") if item.strip()],
        min_experience_years=min_experience_years,
        education_keywords=[item.strip() for item in education_keywords.split(",") if item.strip()],
        certification_keywords=[item.strip() for item in certification_keywords.split(",") if item.strip()],
    )
    return rank_resumes(job, resumes)


@router.post("/rank/kaggle-csv", response_model=RankResponse)
def rank_kaggle_csv(csv_path: str, payload: JobDescription, limit: int | None = 500) -> RankResponse:
    resumes = load_kaggle_resume_csv(csv_path, limit=limit)
    return rank_resumes(payload, resumes)
