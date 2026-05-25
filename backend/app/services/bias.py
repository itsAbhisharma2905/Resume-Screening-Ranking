import re


GENDER_WORDS = {
    "he", "him", "his", "she", "her", "hers", "male", "female", "man", "woman",
    "mr", "mrs", "ms", "miss", "sir", "madam",
}

LOCATION_HINTS = {
    "street", "road", "avenue", "city", "state", "zip", "zipcode", "country",
    "india", "usa", "united states", "canada", "london", "delhi", "mumbai",
    "bangalore", "bengaluru", "hyderabad", "pune", "chennai",
}


def remove_bias_signals(text: str) -> str:
    """Remove common demographic signals while preserving technical evidence."""
    cleaned = re.sub(r"\b[A-Z][a-z]+ [A-Z][a-z]+\b", " candidate ", text)
    cleaned = re.sub(r"[\w.+-]+@[\w-]+\.[\w.-]+", " ", cleaned)
    cleaned = re.sub(r"(\+?\d[\d\s().-]{7,}\d)", " ", cleaned)
    words = []
    for token in cleaned.split():
        low = token.strip(".,:;()[]{}").lower()
        if low in GENDER_WORDS or low in LOCATION_HINTS:
            continue
        words.append(token)
    return " ".join(words)
