from app.schemas.resume import JobDescription, ResumeInput
from app.services.ranking_service import rank_resumes


def rank_batch_task(job_payload: dict, resume_payloads: list[dict]) -> dict:
    job = JobDescription(**job_payload)
    resumes = [ResumeInput(**item) for item in resume_payloads]
    return rank_resumes(job, resumes).model_dump()
