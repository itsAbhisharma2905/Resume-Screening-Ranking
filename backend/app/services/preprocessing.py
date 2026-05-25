import re
from functools import lru_cache

import spacy
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize

from app.services.bias import remove_bias_signals


try:
    STOPWORDS = set(stopwords.words("english"))
except LookupError:
    import nltk

    nltk.download("stopwords", quiet=True)
    nltk.download("punkt", quiet=True)
    nltk.download("punkt_tab", quiet=True)
    STOPWORDS = set(stopwords.words("english"))


@lru_cache
def load_spacy():
    try:
        nlp = spacy.load("en_core_web_sm", disable=["ner"])
    except OSError:
        nlp = spacy.blank("en")
    if "sentencizer" not in nlp.pipe_names:
        nlp.add_pipe("sentencizer")
    return nlp


def clean_noise(text: str) -> str:
    text = remove_bias_signals(text)
    text = text.replace("\x00", " ")
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"[^A-Za-z0-9+#. /,\n-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def preprocess_text(text: str) -> dict:
    normalized = clean_noise(text).lower()
    nlp = load_spacy()
    doc = nlp(normalized)
    tokens = []
    for token in doc:
        if token.is_space or token.is_punct:
            continue
        value = token.lemma_.strip() if token.lemma_ else token.text.strip()
        if len(value) < 2 or value in STOPWORDS:
            continue
        tokens.append(value)

    try:
        sentences = sent_tokenize(text)
    except LookupError:
        sentences = [part.strip() for part in re.split(r"[.!?]\s+", text) if part.strip()]

    return {
        "clean_text": " ".join(tokens),
        "normalized_text": normalized,
        "tokens": tokens,
        "sentences": sentences,
    }
