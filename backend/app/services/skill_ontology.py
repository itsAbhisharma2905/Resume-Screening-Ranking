SKILL_ONTOLOGY = {
    "programming_languages": {
        "python": ["python", "py"],
        "java": ["java"],
        "javascript": ["javascript", "js", "ecmascript"],
        "typescript": ["typescript", "ts"],
        "c++": ["c++", "cpp"],
        "c#": ["c#", "c sharp"],
        "sql": ["sql", "pl/sql", "postgresql sql"],
        "r": [" r programming ", " r language "],
        "go": ["golang", " go "],
        "rust": ["rust"],
    },
    "frameworks": {
        "react": ["react", "react.js", "reactjs"],
        "next.js": ["next.js", "nextjs"],
        "fastapi": ["fastapi"],
        "flask": ["flask"],
        "django": ["django"],
        "spring boot": ["spring boot"],
        "node.js": ["node.js", "nodejs", "node js"],
        "pytorch": ["pytorch", "torch"],
        "tensorflow": ["tensorflow"],
        "scikit-learn": ["scikit-learn", "sklearn", "scikit learn"],
        "spacy": ["spacy", "spaCy"],
    },
    "databases": {
        "postgresql": ["postgresql", "postgres"],
        "mongodb": ["mongodb", "mongo"],
        "mysql": ["mysql"],
        "redis": ["redis"],
        "elasticsearch": ["elasticsearch", "elastic search"],
        "snowflake": ["snowflake"],
    },
    "cloud_tools": {
        "aws": ["aws", "amazon web services", "ec2", "s3", "lambda"],
        "azure": ["azure", "microsoft azure"],
        "gcp": ["gcp", "google cloud"],
        "docker": ["docker", "containerization"],
        "kubernetes": ["kubernetes", "k8s"],
        "terraform": ["terraform"],
        "airflow": ["airflow", "apache airflow"],
    },
    "ai_ml": {
        "nlp": ["nlp", "natural language processing"],
        "machine learning": ["machine learning", "ml"],
        "deep learning": ["deep learning"],
        "transformers": ["transformers", "bert", "sentence-bert", "sbert"],
        "llm": ["llm", "large language model", "generative ai"],
        "computer vision": ["computer vision", "opencv"],
    },
    "soft_skills": {
        "communication": ["communication", "stakeholder communication"],
        "leadership": ["leadership", "team lead"],
        "problem solving": ["problem solving", "analytical thinking"],
        "collaboration": ["collaboration", "cross-functional"],
    },
    "certifications": {
        "aws certified": ["aws certified", "aws solutions architect"],
        "azure certified": ["azure certified", "az-"],
        "pmp": ["pmp", "project management professional"],
        "scrum master": ["scrum master", "csm"],
    },
}


def all_skill_aliases() -> dict[str, list[str]]:
    skills: dict[str, list[str]] = {}
    for group in SKILL_ONTOLOGY.values():
        skills.update(group)
    return skills
