import pandas as pd
from bs4 import BeautifulSoup

from app.schemas.resume import ResumeInput


TEXT_COLUMNS = ["Resume_str", "resume_str", "Resume", "resume", "text", "Text"]
HTML_COLUMNS = ["Resume_html", "resume_html", "html"]
ID_COLUMNS = ["ID", "id", "candidate_id", "CandidateID"]
CATEGORY_COLUMNS = ["Category", "category", "label", "role"]


def _first_existing(columns: list[str], candidates: list[str]) -> str | None:
    available = set(columns)
    return next((column for column in candidates if column in available), None)


def load_kaggle_resume_csv(path: str, limit: int | None = None) -> list[ResumeInput]:
    df = pd.read_csv(path)
    if limit:
        df = df.head(limit)

    text_column = _first_existing(list(df.columns), TEXT_COLUMNS)
    html_column = _first_existing(list(df.columns), HTML_COLUMNS)
    id_column = _first_existing(list(df.columns), ID_COLUMNS)
    category_column = _first_existing(list(df.columns), CATEGORY_COLUMNS)
    if not text_column and not html_column:
        raise ValueError("CSV must include a resume text or HTML column.")

    resumes: list[ResumeInput] = []
    for index, row in df.iterrows():
        if text_column and isinstance(row.get(text_column), str):
            text = row[text_column]
        else:
            text = BeautifulSoup(str(row.get(html_column, "")), "html.parser").get_text(" ")
        candidate_id = str(row.get(id_column, f"candidate-{index + 1}")) if id_column else f"candidate-{index + 1}"
        category = str(row.get(category_column)) if category_column else None
        resumes.append(ResumeInput(candidate_id=candidate_id, text=text, category=category))
    return resumes
