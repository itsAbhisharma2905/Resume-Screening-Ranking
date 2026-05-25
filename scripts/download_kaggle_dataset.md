# Kaggle Dataset Setup

1. Install Kaggle CLI:

```bash
pip install kaggle
```

2. Add your Kaggle API token to `~/.kaggle/kaggle.json`.

3. Download the dataset:

```bash
kaggle datasets download -d snehaanbhawal/resume-dataset -p backend/data --unzip
```

4. Use the CSV path with:

```bash
curl -X POST "http://localhost:8000/api/rank/kaggle-csv?csv_path=backend/data/Resume.csv&limit=100" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"NLP Engineer\",\"description\":\"Python NLP FastAPI spaCy transformers PostgreSQL\",\"required_skills\":[\"python\",\"nlp\",\"fastapi\"],\"preferred_skills\":[\"spacy\",\"transformers\"],\"min_experience_years\":3}"
```
