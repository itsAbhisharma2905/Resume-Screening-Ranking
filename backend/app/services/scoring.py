import re

from app.services.skill_extractor import extract_skills, normalize_skill


WEIGHTS = {
    "skills": 0.40,
    "experience": 0.25,
    "education": 0.15,
    "certifications": 0.10,
    "semantic": 0.10,
}


def extract_years_experience(text: str) -> float:
    patterns = [
        r"(\d+(?:\.\d+)?)\+?\s*(?:years|yrs)\s+(?:of\s+)?experience",
        r"experience\s*(?:of|:)?\s*(\d+(?:\.\d+)?)\+?\s*(?:years|yrs)",
    ]
    values: list[float] = []
    for pattern in patterns:
        values.extend(float(match) for match in re.findall(pattern, text.lower()))
    return max(values) if values else 0.0


def contains_any(text: str, terms: list[str]) -> float:
    if not terms:
        return 1.0
    lowered = text.lower()
    hits = sum(1 for term in terms if term.lower() in lowered)
    return hits / len(terms)


def summarize_resume(sentences: list[str], skills: list[str], years: float) -> str:
    lead = next((s.strip() for s in sentences if len(s.split()) >= 8), "").strip()
    skill_text = ", ".join(skills[:8]) if skills else "no mapped skills found"
    years_text = f"{years:g} years" if years else "experience not explicitly stated"
    if lead:
        return f"{lead[:220]} Skills: {skill_text}. Experience: {years_text}."
    return f"Skills: {skill_text}. Experience: {years_text}."


def score_candidate(
    *,
    job_text: str,
    job_required_skills: list[str],
    job_preferred_skills: list[str],
    min_experience_years: float | None,
    education_keywords: list[str],
    certification_keywords: list[str],
    resume_text: str,
    resume_sentences: list[str],
    semantic_similarity: float,
    tfidf_similarity: float,
) -> dict:
    extracted_skills = extract_skills(resume_text)
    required = {normalize_skill(skill) for skill in job_required_skills}
    preferred = {normalize_skill(skill) for skill in job_preferred_skills}
    if not required:
        required = set(extract_skills(job_text))
    expected = required | preferred

    matched_required = required & set(extracted_skills)
    matched_preferred = preferred & set(extracted_skills)
    missing = sorted(required - set(extracted_skills))

    required_score = len(matched_required) / len(required) if required else 1.0
    preferred_score = len(matched_preferred) / len(preferred) if preferred else 1.0
    skill_score = (required_score * 0.8) + (preferred_score * 0.2)

    years = extract_years_experience(resume_text)
    if min_experience_years is None or min_experience_years == 0:
        experience_score = 1.0 if years > 0 else 0.65
    else:
        experience_score = min(1.0, years / min_experience_years)

    education_score = contains_any(resume_text, education_keywords)
    certification_score = contains_any(resume_text, certification_keywords)

    final = (
        WEIGHTS["skills"] * skill_score
        + WEIGHTS["experience"] * experience_score
        + WEIGHTS["education"] * education_score
        + WEIGHTS["certifications"] * certification_score
        + WEIGHTS["semantic"] * semantic_similarity
    )

    return {
        "score": round(final * 100, 2),
        "match_percentage": round(((skill_score + semantic_similarity + tfidf_similarity) / 3) * 100, 2),
        "extracted_skills": extracted_skills,
        "missing_skills": missing,
        "matched_skills": sorted((matched_required | matched_preferred) or (expected & set(extracted_skills))),
        "experience_years": years,
        "semantic_similarity": round(semantic_similarity, 4),
        "tfidf_similarity": round(tfidf_similarity, 4),
        "keyword_score": round(skill_score, 4),
        "resume_summary": summarize_resume(resume_sentences, extracted_skills, years),
    }
