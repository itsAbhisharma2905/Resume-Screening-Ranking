from app.schemas.resume import CandidateScore, JobDescription, RankResponse, ResumeInput
from app.services.preprocessing import preprocess_text
from app.services.scoring import score_candidate
from app.services.similarity import semantic_scores, tfidf_scores


def rank_resumes(job: JobDescription, resumes: list[ResumeInput]) -> RankResponse:
    job_processed = preprocess_text(job.description)
    processed_resumes = [preprocess_text(resume.text) for resume in resumes]
    resume_clean_texts = [item["clean_text"] for item in processed_resumes]

    tfidf = tfidf_scores(job_processed["clean_text"], resume_clean_texts)
    semantic = semantic_scores(job.description, [resume.text for resume in resumes], tfidf)

    candidates: list[CandidateScore] = []
    for idx, resume in enumerate(resumes):
        scored = score_candidate(
            job_text=job.description,
            job_required_skills=job.required_skills,
            job_preferred_skills=job.preferred_skills,
            min_experience_years=job.min_experience_years,
            education_keywords=job.education_keywords,
            certification_keywords=job.certification_keywords,
            resume_text=resume.text,
            resume_sentences=processed_resumes[idx]["sentences"],
            semantic_similarity=semantic[idx],
            tfidf_similarity=tfidf[idx],
        )
        candidates.append(
            CandidateScore(
                rank=0,
                candidate_id=resume.candidate_id,
                category=resume.category,
                **scored,
            )
        )

    ranked = sorted(candidates, key=lambda item: item.score, reverse=True)
    for position, candidate in enumerate(ranked, start=1):
        candidate.rank = position

    score_values = [candidate.score for candidate in ranked]
    top_skills: dict[str, int] = {}
    for candidate in ranked:
        for skill in candidate.extracted_skills:
            top_skills[skill] = top_skills.get(skill, 0) + 1

    analytics = {
        "average_score": round(sum(score_values) / len(score_values), 2) if score_values else 0,
        "top_score": max(score_values) if score_values else 0,
        "qualified_count": sum(score >= 70 for score in score_values),
        "top_skills": sorted(top_skills.items(), key=lambda item: item[1], reverse=True)[:12],
        "score_bands": {
            "excellent_85_plus": sum(score >= 85 for score in score_values),
            "strong_70_84": sum(70 <= score < 85 for score in score_values),
            "review_50_69": sum(50 <= score < 70 for score in score_values),
            "low_under_50": sum(score < 50 for score in score_values),
        },
    }
    return RankResponse(
        job_title=job.title,
        total_candidates=len(ranked),
        ranked_candidates=ranked,
        analytics=analytics,
    )
