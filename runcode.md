# Resume Screening & Ranking — Run Guide

This project has a FastAPI backend and a Vite React frontend.

## Option 1: Run locally

Use two terminals from the repository root.

### Terminal 1 — backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8002
```

The API will be available at:

```text
http://127.0.0.1:8002/api
```

Health check:

```text
http://127.0.0.1:8002/api/health
```

### Terminal 2 — frontend

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The Vite development proxy forwards `/api` requests to `127.0.0.1:8002`.

## Run the frontend against a backend on port 8000

If you start FastAPI with its usual port `8000`, set the proxy target before starting Vite:

```powershell
cd frontend
$env:VITE_API_PROXY_TARGET = "http://127.0.0.1:8000"
npm run dev
```

## Option 2: Run with Docker Compose

The Compose file uses container networking, so point the Vite proxy at the
`backend` service rather than `127.0.0.1`:

```powershell
docker compose run --build --rm --service-ports -e VITE_API_PROXY_TARGET=http://backend:8000 frontend
```

This starts the required services and runs the frontend on port `5173`.

Open:

```text
http://localhost:5173
```

Stop the services with:

```powershell
docker compose down
```

## Production frontend build

```powershell
cd frontend
npm ci
npm run build
npm run preview
```

The production files are generated in `frontend/dist/`.

## Vercel settings

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js Version: `22.x`
- Environment Variable: `VITE_API_BASE_URL=<verified backend API base URL>`

Use `VITE_API_BASE_URL=/api` only when `/api` is available through the same origin. Never put secrets in `VITE_*` variables.

## Troubleshooting

- `Network Error`: confirm the backend is running and the frontend proxy port matches it.
- Missing spaCy model: run `python -m spacy download en_core_web_sm` again.
- Dependency changes: remove `frontend/node_modules` and run `npm ci`.
- Port already in use: stop the existing process or change the backend/frontend port and proxy target together.
