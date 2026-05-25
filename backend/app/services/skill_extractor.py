import re
from collections import Counter

from app.services.preprocessing import load_spacy
from app.services.skill_ontology import all_skill_aliases


ALIASES = all_skill_aliases()


def normalize_skill(skill: str) -> str:
    lowered = skill.strip().lower()
    for canonical, aliases in ALIASES.items():
        if lowered == canonical or lowered in [alias.lower().strip() for alias in aliases]:
            return canonical
    return lowered


def extract_rule_based_skills(text: str) -> list[str]:
    padded = f" {text.lower()} "
    found: set[str] = set()
    for canonical, aliases in ALIASES.items():
        candidates = {canonical, *aliases}
        for alias in candidates:
            pattern = re.escape(alias.lower())
            if re.search(rf"(?<![a-z0-9+#.]){pattern}(?![a-z0-9+#.])", padded):
                found.add(canonical)
                break
    return sorted(found)


def extract_context_skills(text: str) -> list[str]:
    nlp = load_spacy()
    doc = nlp(text[:100000])
    signals = {"skill", "skills", "experience", "tools", "technologies", "stack", "certified"}
    candidates: Counter[str] = Counter()
    for sent in doc.sents if doc.has_annotation("SENT_START") else []:
        sentence = sent.text.lower()
        if any(signal in sentence for signal in signals):
            for skill in extract_rule_based_skills(sentence):
                candidates[skill] += 2
    for ent in getattr(doc, "ents", []):
        if ent.label_ in {"ORG", "PRODUCT", "WORK_OF_ART"}:
            norm = normalize_skill(ent.text)
            if norm in ALIASES:
                candidates[norm] += 1
    return sorted(candidates)


def extract_skills(text: str) -> list[str]:
    rule_skills = set(extract_rule_based_skills(text))
    context_skills = set(extract_context_skills(text))
    return sorted(rule_skills | context_skills)
