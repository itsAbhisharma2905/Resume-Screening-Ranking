import re
from functools import lru_cache

from app.services.bias import remove_bias_signals


STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for",
    "from", "has", "have", "he", "her", "his", "i", "in",
    "is", "it", "its", "me", "my", "of", "on", "or", "our",
    "she", "that", "the", "their", "them", "they", "this",
    "to", "was", "we", "were", "will", "with", "you", "your",
}


def clean_noise(text: str) -> str:
    text = remove_bias_signals(text)
    text = text.replace("\x00", " ")
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"[^A-Za-z0-9+#. /,\n-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def split_sentences(text: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    return [sentence.strip() for sentence in sentences if sentence.strip()]


@lru_cache
def load_spacy():
    return None


def preprocess_text(text: str) -> dict:
    normalized = clean_noise(text).lower()

    words = re.findall(r"[A-Za-z0-9+#.]+", normalized)

    tokens = [
        word
        for word in words
        if len(word) >= 2 and word not in STOPWORDS
    ]

    sentences = split_sentences(text)

    return {
        "clean_text": " ".join(tokens),
        "normalized_text": normalized,
        "tokens": tokens,
        "sentences": sentences,
    }