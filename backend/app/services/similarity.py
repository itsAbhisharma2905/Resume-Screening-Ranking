from functools import lru_cache

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import get_settings


def tfidf_scores(job_text: str, resume_texts: list[str]) -> list[float]:
    if not resume_texts:
        return []
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=12000)
    matrix = vectorizer.fit_transform([job_text, *resume_texts])
    sims = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
    return [float(max(0.0, min(1.0, value))) for value in sims]


@lru_cache
def load_sentence_model():
    settings = get_settings()
    if not settings.enable_heavy_models:
        return None
    try:
        from sentence_transformers import SentenceTransformer

        return SentenceTransformer(settings.sentence_model)
    except Exception:
        return None


def semantic_scores(job_text: str, resume_texts: list[str], fallback: list[float]) -> list[float]:
    model = load_sentence_model()
    if model is None or not resume_texts:
        return fallback
    embeddings = model.encode([job_text, *resume_texts], normalize_embeddings=True)
    sims = np.matmul(embeddings[1:], embeddings[0])
    return [float(max(0.0, min(1.0, value))) for value in sims]
