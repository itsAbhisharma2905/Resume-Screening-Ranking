import { Activity, Database, FileCheck2, FileText, Loader2, PanelLeft, PanelRight, Play, Rows3, ShieldCheck, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";
import { rankFiles, rankTextPayload } from "../api/client.js";
import Analytics from "../components/Analytics.jsx";
import ComboBox from "../components/ComboBox.jsx";
import CandidateTable from "../components/CandidateTable.jsx";
import TagPicker from "../components/TagPicker.jsx";
import {
  certificationOptions,
  educationOptions,
  roleOptions,
  roleSuggestions,
  skillOptions
} from "../data/suggestions.js";

const MAX_RESUME_FILES = 10;
const ALLOWED_RESUME_TYPES = [".pdf", ".docx", ".txt"];

const samplePayload = {
  job: {
    title: "Senior NLP Engineer",
    description: "We need a Senior NLP Engineer with Python, spaCy, FastAPI, transformers, PostgreSQL, Docker, AWS, semantic search, and 5+ years of experience building production ML systems.",
    required_skills: ["python", "spacy", "fastapi", "transformers", "postgresql"],
    preferred_skills: ["docker", "aws", "nlp", "machine learning"],
    min_experience_years: 5,
    education_keywords: ["computer science", "engineering", "masters", "bachelor"],
    certification_keywords: ["aws certified"]
  },
  resumes: [
    {
      candidate_id: "candidate-a",
      category: "Data Science",
      text: "Senior machine learning engineer with 6 years of experience. Built NLP platforms using Python, FastAPI, spaCy, transformers, PostgreSQL, Docker and AWS. Bachelor in Computer Science."
    },
    {
      candidate_id: "candidate-b",
      category: "Frontend",
      text: "Frontend developer with 4 years of experience using React, Next.js, JavaScript, CSS and design systems. Worked with REST APIs and collaboration."
    }
  ]
};

export default function App() {
  const [job, setJob] = useState(samplePayload.job);
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [layoutMode, setLayoutMode] = useState("left");
  const smartSuggestions = useSmartSuggestions(job);
  const workspaceClass = layoutMode === "top"
    ? "mx-auto grid max-w-7xl items-start gap-5 px-4 py-5 sm:px-5"
    : "mx-auto grid max-w-7xl items-start gap-5 px-4 py-5 sm:px-5 lg:grid-cols-[400px_minmax(0,1fr)]";
  const formClass = layoutMode === "right"
    ? "panel h-fit rounded-lg p-4 sm:p-5 lg:order-2"
    : "panel h-fit rounded-lg p-4 sm:p-5";
  const resultsClass = layoutMode === "right" ? "space-y-5 lg:order-1" : "space-y-5";

  async function runSample() {
    setLoading(true);
    setError("");
    try {
      setResult(await rankTextPayload(samplePayload));
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function uploadAndRank(event) {
    event.preventDefault();
    if (!files.length) return setError("Choose at least one PDF, DOCX, or TXT resume.");
    if (files.length > MAX_RESUME_FILES) return setError(`Upload up to ${MAX_RESUME_FILES} resumes at once.`);
    setLoading(true);
    setError("");
    const form = new FormData();
    form.append("job_title", job.title);
    form.append("job_description", job.description);
    form.append("required_skills", job.required_skills.join(","));
    form.append("preferred_skills", job.preferred_skills.join(","));
    form.append("min_experience_years", job.min_experience_years || "");
    form.append("education_keywords", job.education_keywords.join(","));
    form.append("certification_keywords", job.certification_keywords.join(","));
    files.forEach((file) => form.append("files", file));
    try {
      setResult(await rankFiles(form));
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-line bg-white/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal text-white shadow-sm">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Resume Screening & Ranking</h1>
              <p className="text-sm text-slate-500">Semantic scoring, skill gaps, and recruiter-ready analytics</p>
            </div>
          </div>
          <button
            onClick={runSample}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
            Run sample
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Feature icon={<ShieldCheck size={18} />} title="Bias-aware scoring" text="Contact, name, gender, and location cues are ignored before ranking." />
          <Feature icon={<Database size={18} />} title="Dataset ready" text="Works with uploaded resumes or the Kaggle resume CSV importer." />
          <Feature icon={<Activity size={18} />} title="Explainable output" text="Scores include skills, missing skills, experience, and similarity signals." />
        </div>
      </section>

      <div className={workspaceClass}>
        <form onSubmit={uploadAndRank} className={formClass}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal">Input workspace</p>
              <h2 className="mt-1 text-lg font-semibold">Screening Setup</h2>
            </div>
            <div className="flex items-center gap-2">
              <LayoutButton active={layoutMode === "left"} label="Dock left" onClick={() => setLayoutMode("left")}>
                <PanelLeft size={16} />
              </LayoutButton>
              <LayoutButton active={layoutMode === "top"} label="Top" onClick={() => setLayoutMode("top")}>
                <Rows3 size={16} />
              </LayoutButton>
              <LayoutButton active={layoutMode === "right"} label="Dock right" onClick={() => setLayoutMode("right")}>
                <PanelRight size={16} />
              </LayoutButton>
              <div className="ml-1 hidden h-8 w-8 items-center justify-center rounded bg-teal/10 text-teal sm:flex">
                <FileCheck2 size={18} />
              </div>
            </div>
          </div>
          <ComboBox
            label="Role title"
            value={job.title}
            onChange={(title) => setJob({ ...job, title })}
            options={roleOptions}
            placeholder="Select or type a job role"
          />
          <label className="mt-4 block">
            <span className="text-sm font-medium">Job description</span>
            <textarea
              value={job.description}
              onChange={(event) => setJob({ ...job, description: event.target.value })}
              className="soft-input mt-1 h-40 w-full resize-none rounded border border-line bg-white/85 p-3 text-sm outline-none"
            />
          </label>
          <TagPicker
            label="Required skills"
            value={job.required_skills}
            onChange={(required_skills) => setJob({ ...job, required_skills })}
            options={smartSuggestions.required}
            placeholder="Select or type required skills"
          />
          <TagPicker
            label="Preferred skills"
            value={job.preferred_skills}
            onChange={(preferred_skills) => setJob({ ...job, preferred_skills })}
            options={smartSuggestions.preferred}
            placeholder="Select or type preferred skills"
          />
          <TagPicker
            label="Education keywords"
            value={job.education_keywords}
            onChange={(education_keywords) => setJob({ ...job, education_keywords })}
            options={smartSuggestions.education}
            placeholder="Select or type education keywords"
          />
          <TagPicker
            label="Certifications"
            value={job.certification_keywords}
            onChange={(certification_keywords) => setJob({ ...job, certification_keywords })}
            options={smartSuggestions.certifications}
            placeholder="Select or type certifications"
          />
          <Field label="Minimum years" type="number" value={job.min_experience_years} onChange={(value) => setJob({ ...job, min_experience_years: Number(value) })} />
          <label className="mt-4 block cursor-pointer rounded-lg border border-dashed border-line bg-mist p-4 transition hover:border-teal hover:bg-white">
            <span className="flex items-center gap-2 text-sm font-semibold"><Upload size={16} /> Resume files</span>
            <span className="mt-1 block text-xs text-slate-500">Upload 1 to {MAX_RESUME_FILES} resumes. Supported: PDF, DOCX, TXT.</span>
            <input
              type="file"
              multiple
              accept={ALLOWED_RESUME_TYPES.join(",")}
              onChange={(event) => handleFileSelection(event.target.files)}
              className="mt-3 w-full text-sm"
            />
          </label>
          <FileTray files={files} onClear={() => setFiles([])} />
          {error && <p className="fade-up mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button
            disabled={loading}
            className={`mt-4 w-full rounded px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60 ${loading ? "pulse-track bg-teal" : "bg-teal hover:bg-teal/90"}`}
          >
            <span className="relative z-10 inline-flex items-center justify-center gap-2">
              {loading && <Loader2 className="animate-spin" size={16} />}
              {loading ? "Processing resumes..." : "Rank resumes"}
            </span>
          </button>
        </form>

        <section className={resultsClass}>
          {loading && <ProcessingPanel />}
          <Analytics analytics={result?.analytics} />
          <CandidateTable candidates={result?.ranked_candidates} />
        </section>
      </div>
    </main>
  );

  function handleFileSelection(fileList) {
    const selected = Array.from(fileList || []);
    const validFiles = selected.filter((file) => {
      const name = file.name.toLowerCase();
      return ALLOWED_RESUME_TYPES.some((extension) => name.endsWith(extension));
    });

    if (selected.length !== validFiles.length) {
      setError("Only PDF, DOCX, and TXT resumes are supported.");
    } else if (validFiles.length > MAX_RESUME_FILES) {
      setError(`You selected ${validFiles.length} files. Please keep it to ${MAX_RESUME_FILES} resumes or fewer.`);
    } else {
      setError("");
    }
    setFiles(validFiles.slice(0, MAX_RESUME_FILES));
  }
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="soft-input mt-1 w-full rounded border border-line bg-white/85 px-3 py-2 text-sm outline-none"
      />
    </label>
  );
}

function LayoutButton({ active, label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded border text-sm transition ${
        active
          ? "border-teal bg-teal text-white shadow-sm"
          : "border-line bg-white text-slate-600 hover:border-teal hover:text-teal"
      }`}
      aria-label={label}
    >
      {children}
    </button>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="panel fade-up rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-teal/10 text-teal">{icon}</div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
        </div>
      </div>
    </div>
  );
}

function FileTray({ files, onClear }) {
  if (!files.length) return null;

  return (
    <div className="fade-up mt-3 rounded-lg border border-line bg-white/80 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{files.length} file{files.length > 1 ? "s" : ""} selected</p>
        <button type="button" onClick={onClear} className="rounded p-1 text-slate-500 hover:bg-mist hover:text-coral" aria-label="Clear selected files">
          <X size={16} />
        </button>
      </div>
      <div className="mt-2 max-h-28 space-y-1 overflow-auto">
        {files.map((file) => (
          <p key={`${file.name}-${file.size}`} className="truncate rounded bg-mist px-2 py-1 text-xs text-slate-600">
            {file.name}
          </p>
        ))}
      </div>
    </div>
  );
}

function ProcessingPanel() {
  return (
    <div className="panel fade-up rounded-lg p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-teal/10 text-teal">
          <Loader2 className="animate-spin" size={20} />
        </div>
        <div>
          <h2 className="font-semibold">Analyzing candidate evidence</h2>
          <p className="text-sm text-slate-600">Extracting text, normalizing skills, and calculating ranking signals.</p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded bg-mist">
        <div className="pulse-track h-full w-2/3 rounded bg-teal" />
      </div>
    </div>
  );
}

function useSmartSuggestions(job) {
  return useMemo(() => {
    const text = [
      job.title,
      job.description,
      ...(job.required_skills || []),
      ...(job.preferred_skills || [])
    ].join(" ").toLowerCase();

    const roleKey = roleOptions.find((role) => role.toLowerCase() === job.title.toLowerCase())?.toLowerCase() || job.title.toLowerCase();
    const roleBased = roleSuggestions[roleKey] || [];
    const detected = skillOptions.filter((skill) => text.includes(skill.toLowerCase()));
    const related = new Set([...roleBased, ...detected]);
    [...(job.required_skills || []), ...(job.preferred_skills || []), ...detected].forEach((skill) => {
      (roleSuggestions[skill.toLowerCase()] || []).forEach((item) => related.add(item));
    });

    const required = unique([...roleBased, ...detected, ...skillOptions]);
    const preferred = unique([...related, ...skillOptions]).filter((skill) => !contains(job.required_skills, skill));
    const certifications = unique([
      ...certificationOptions.filter((certification) => text.includes(certification.split(" ")[0])),
      ...(text.includes("aws") ? ["aws certified", "aws solutions architect"] : []),
      ...(text.includes("azure") ? ["azure certified"] : []),
      ...(text.includes("gcp") || text.includes("google cloud") ? ["google cloud certified"] : []),
      ...(text.includes("kubernetes") ? ["kubernetes certified"] : []),
      ...certificationOptions
    ]);
    const education = unique([
      ...educationOptions.filter((item) => text.includes(item)),
      ...(text.includes("data") || text.includes("machine learning") || text.includes("nlp") ? ["computer science", "data science", "artificial intelligence"] : []),
      ...educationOptions
    ]);

    return { required, preferred, education, certifications };
  }, [job]);
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function contains(items = [], value) {
  return items.some((item) => item.trim().toLowerCase() === value.trim().toLowerCase());
}
