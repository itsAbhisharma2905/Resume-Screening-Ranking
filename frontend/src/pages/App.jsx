import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  FileText,
  FolderOpen,
  GraduationCap,
  ListChecks,
  LayoutDashboard,
  Loader2,
  PanelLeft,
  PanelRight,
  Play,
  Rows3,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRoundCheck,
  X,
  Zap
} from "lucide-react";
import { Component, lazy, Suspense, useMemo, useState } from "react";
import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { rankFiles, rankTextPayload } from "../api/client.js";
import ComboBox from "../components/ComboBox.jsx";
import CandidateTable from "../components/CandidateTable.jsx";
import RankingEngineVisual from "../components/RankingEngineVisual.jsx";
import TagPicker from "../components/TagPicker.jsx";
import { heroReveal, heroStagger, scrollReveal, scrollStagger, scrollViewport, usePointerDepth } from "../components/motion.js";
import { certificationOptions, educationOptions, roleOptions, roleSuggestions, skillOptions } from "../data/suggestions.js";

const Analytics = lazy(() => import("../components/Analytics.jsx"));

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
    { candidate_id: "candidate-a", category: "Data Science", text: "Senior machine learning engineer with 6 years of experience. Built NLP platforms using Python, FastAPI, spaCy, transformers, PostgreSQL, Docker and AWS. Bachelor in Computer Science." },
    { candidate_id: "candidate-b", category: "Frontend", text: "Frontend developer with 4 years of experience using React, Next.js, JavaScript, CSS and design systems. Worked with REST APIs and collaboration." }
  ]
};

export default function App() {
  const [job, setJob] = useState(samplePayload.job);
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [layoutMode, setLayoutMode] = useState("left");
  const [isDragging, setIsDragging] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");
  const reduceMotion = useReducedMotion();
  const smartSuggestions = useSmartSuggestions(job);

  const workspaceClass = layoutMode === "top"
    ? "workspace-grid mx-auto grid max-w-[1500px] items-start gap-6 px-4 py-7 sm:px-6"
    : "workspace-grid mx-auto grid max-w-[1500px] items-start gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(360px,0.7fr)_minmax(0,1.3fr)]";
  const formClass = layoutMode === "right" ? "ui-card surface order-2 h-fit rounded-2xl p-5 sm:p-6 lg:order-2" : "ui-card surface h-fit rounded-2xl p-5 sm:p-6";
  const resultsClass = layoutMode === "right" ? "order-1 space-y-6 lg:order-1" : "space-y-6";

  async function runSample() {
    setLoading(true); setError("");
    try { setResult(await rankTextPayload(samplePayload)); } catch (err) { setError(getRequestError(err)); } finally { setLoading(false); }
  }

  async function uploadAndRank(event) {
    event.preventDefault();
    if (!files.length) return setError("Choose at least one PDF, DOCX, or TXT resume.");
    if (files.length > MAX_RESUME_FILES) return setError(`Upload up to ${MAX_RESUME_FILES} resumes at once.`);
    setLoading(true); setError("");
    const form = new FormData();
    form.append("job_title", job.title); form.append("job_description", job.description);
    form.append("required_skills", job.required_skills.join(",")); form.append("preferred_skills", job.preferred_skills.join(","));
    form.append("min_experience_years", job.min_experience_years || ""); form.append("education_keywords", job.education_keywords.join(","));
    form.append("certification_keywords", job.certification_keywords.join(",")); files.forEach((file) => form.append("files", file));
    try { setResult(await rankFiles(form)); } catch (err) { setError(getRequestError(err)); } finally { setLoading(false); }
  }

  function handleStartScreening() {
    document.getElementById("screening-setup")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  function handleStartUpload() {
    const input = document.querySelector(".upload-dropzone input[type=\"file\"]");
    input?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    input?.click();
  }

  function scrollToSection(id) {
    const target = document.getElementById(id) || document.getElementById("candidate-pool");
    target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  useEffect(() => {
    const targets = ["candidate-pool", "insights"].map((id) => document.getElementById(id)).filter(Boolean);
    if (!targets.length) return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top));
      if (visible[0]) setActiveNav(visible[0].target.id);
    }, { rootMargin: "-84px 0px -58% 0px", threshold: [0, 0.15, 0.5] });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [loading, Boolean(result?.analytics), Boolean(result?.ranked_candidates?.length)]);

  return (
    <main className="app-shell grain min-h-screen">
      <AmbientGlow />
      <aside className="sidebar hidden lg:flex">
        <div className="brand-lockup"><div className="brand-mark"><Sparkles size={18} strokeWidth={2.5} /></div><span>shortlist<span className="text-cyan">.ai</span></span></div>
        <div className="mt-12"><p className="eyebrow px-3">Workspace</p><nav className="mt-3 space-y-1" aria-label="Primary navigation"><NavItem icon={<LayoutDashboard size={17} />} label="Screening overview" active={activeNav === "overview"} onClick={() => { setActiveNav("overview"); scrollToSection("screening-setup"); }} /><NavItem icon={<FolderOpen size={17} />} label="Candidate pool" active={activeNav === "candidate-pool"} onClick={() => scrollToSection("candidate-pool")} /><NavItem icon={<BarChart3 size={17} />} label="Insights" active={activeNav === "insights"} onClick={() => scrollToSection("insights")} /></nav></div>
        <div className="mt-auto space-y-5"><div className="sidebar-tip"><div className="mb-3 flex items-center justify-between"><span className="status-dot" /><span className="text-[11px] font-medium text-cyan">ENGINE ONLINE</span></div><p className="text-sm font-medium text-white">Your matching model is ready.</p><p className="mt-1 text-xs leading-5 text-slate-500">Configure a role and add resumes to begin.</p></div><nav className="space-y-1" aria-label="Settings navigation"><NavItem icon={<Settings2 size={17} />} label="Workspace settings" /><NavItem icon={<ShieldCheck size={17} />} label="Privacy & bias" /></nav><div className="user-chip"><span className="avatar">NS</span><span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-200">Nehar Sharma</span><span className="block text-xs text-slate-500">Talent team</span></span><ArrowUpRight className="ml-auto text-slate-600" size={14} /></div></div>
      </aside>

      <div className="app-content">
        <header className="topbar" aria-label="Primary navigation"><div className="topbar-inner"><div className="topbar-brand"><div className="brand-mark"><Sparkles size={16} strokeWidth={2.5} /></div><div className="min-w-0"><div className="topbar-product">shortlist<span className="text-cyan">.ai</span></div><div className="topbar-descriptor">AI Recruitment Intelligence</div></div></div><div className="topbar-context hidden items-center gap-2 text-xs lg:flex"><span>Workspace</span><span className="topbar-separator">/</span><span className="topbar-context-current">Screening overview</span></div><div className="topbar-actions"><div className="status-chip"><span className="status-dot" /><span className="hidden sm:inline">Ready to screen</span><span className="sm:hidden">Ready</span></div><button onClick={runSample} disabled={loading} aria-busy={loading} className={`ui-button ui-button-secondary button-secondary run-sample-button rounded-lg px-3 py-2 text-slate-200 ${loading ? "is-loading" : ""}`}>{loading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} fill="currentColor" />}<span className="hidden sm:inline">Run sample</span><span className="sm:hidden">Sample</span></button></div></div><nav className="mobile-nav-strip" aria-label="Workspace sections"><NavItem icon={<LayoutDashboard size={14} />} label="Overview" active={activeNav === "overview"} onClick={() => { setActiveNav("overview"); scrollToSection("screening-setup"); }} /><NavItem icon={<FolderOpen size={14} />} label="Candidate pool" active={activeNav === "candidate-pool"} onClick={() => scrollToSection("candidate-pool")} /><NavItem icon={<BarChart3 size={14} />} label="Insights" active={activeNav === "insights"} onClick={() => scrollToSection("insights")} /></nav></header>

        <motion.section className="hero hero-intelligence mx-auto max-w-[1500px] px-4 pb-4 pt-8 sm:px-6 sm:pt-12" initial={false} whileInView="visible" viewport={scrollViewport} variants={scrollStagger}><motion.div className="hero-copy hero-intelligence-copy" initial={reduceMotion ? false : "hidden"} whileInView="visible" viewport={scrollViewport} variants={heroStagger}><motion.div className="eyebrow flex items-center gap-2" variants={heroReveal}><span className="status-dot" />AI recruiting intelligence</motion.div><motion.h1 className="type-display mt-4 max-w-2xl text-white" variants={heroReveal}>Find the strongest candidates faster.</motion.h1><motion.p className="type-body mt-5 max-w-xl" variants={heroReveal}>Semantic ranking connects skills, experience, and context so your team can move from resume volume to confident shortlists—without losing the why behind every match.</motion.p><motion.div className="hero-actions" variants={heroReveal}><button type="button" onClick={handleStartScreening} className="ui-button ui-button-primary button-primary rounded-lg px-4 py-3 text-sm text-white">Start screening <ArrowUpRight size={15} /></button><button type="button" onClick={runSample} disabled={loading} aria-busy={loading} className={`ui-button ui-button-secondary button-secondary rounded-lg px-4 py-3 text-slate-200 ${loading ? "is-loading" : ""}`}>{loading ? <Loader2 className="animate-spin" size={15} /> : <Play size={15} fill="currentColor" />} Try sample</button></motion.div><motion.div className="hero-proof" variants={heroReveal}><span><ShieldCheck size={13} /> Bias-aware screening</span><span><Sparkles size={13} /> Explainable ranking</span></motion.div></motion.div><ErrorBoundary fallback={<div className="ranking-engine-fallback" aria-label="Resume ranking visualization unavailable" role="img" />}><RankingEngineVisual /></ErrorBoundary><div className="scroll-indicator" aria-hidden="true"><span>Configure your role</span><i /></div></motion.section>

        <motion.section className="feature-strip mx-auto grid max-w-[1500px] gap-3 px-4 pt-8 sm:grid-cols-3 sm:px-6" initial={reduceMotion ? false : "hidden"} whileInView="visible" viewport={scrollViewport} variants={scrollStagger}><Feature icon={<ShieldCheck size={17} />} title="Bias-aware by design" text="Personal identifiers stay out of the score." reduceMotion={reduceMotion} /><Feature icon={<Zap size={17} />} title="Semantic matching" text="Skills and context, not just keywords." reduceMotion={reduceMotion} /><Feature icon={<Activity size={17} />} title="Explainable output" text="See why every candidate ranks." reduceMotion={reduceMotion} /></motion.section>

        <div className={workspaceClass}>
          <motion.form id="screening-setup" onSubmit={uploadAndRank} className={formClass} initial={reduceMotion ? false : "hidden"} whileInView="visible" viewport={scrollViewport} variants={scrollReveal}>
            <div className="setup-form-header"><div><p className="eyebrow text-cyan">Screening workspace</p><h2 className="type-section mt-2 text-white">Screening setup</h2><p className="type-caption mt-1">Build a focused brief, then add the evidence your model should rank.</p></div><div className="layout-controls"><span className="layout-label">View</span><LayoutButton reduceMotion={reduceMotion} active={layoutMode === "left"} label="Dock left" onClick={() => setLayoutMode("left")}><PanelLeft size={15} /></LayoutButton><LayoutButton reduceMotion={reduceMotion} active={layoutMode === "top"} label="Stack sections" onClick={() => setLayoutMode("top")}><Rows3 size={15} /></LayoutButton><LayoutButton reduceMotion={reduceMotion} active={layoutMode === "right"} label="Dock right" onClick={() => setLayoutMode("right")}><PanelRight size={15} /></LayoutButton></div></div>

            <SetupSection number="01" icon={<BriefcaseBusiness size={16} />} title="Job profile" description="Anchor the screening model to the role you are hiring for."><ComboBox label="Role title" value={job.title} onChange={(title) => setJob({ ...job, title })} options={roleOptions} placeholder="Select or type a job role" /><label className="mt-5 block"><span className="field-label">Job description</span><textarea value={job.description} onChange={(event) => setJob({ ...job, description: event.target.value })} className="ui-input soft-input mt-2 h-32 w-full resize-none rounded-xl border p-3.5 text-sm leading-6 text-slate-200 outline-none" /></label></SetupSection>

            <SetupSection number="02" icon={<ListChecks size={16} />} title="Skill requirements" description="Separate the must-have signal from the signal that helps a candidate stand out."><TagPicker label="Required skills" value={job.required_skills} onChange={(required_skills) => setJob({ ...job, required_skills })} options={smartSuggestions.required} placeholder="Add required skills" /><TagPicker label="Preferred skills" value={job.preferred_skills} onChange={(preferred_skills) => setJob({ ...job, preferred_skills })} options={smartSuggestions.preferred} placeholder="Add preferred skills" /></SetupSection>

            <SetupSection number="03" icon={<GraduationCap size={16} />} title="Candidate requirements" description="Add the experience, education, and credentials that shape fit."><TagPicker label="Education" value={job.education_keywords} onChange={(education_keywords) => setJob({ ...job, education_keywords })} options={smartSuggestions.education} placeholder="Add education keywords" /><TagPicker label="Certifications" value={job.certification_keywords} onChange={(certification_keywords) => setJob({ ...job, certification_keywords })} options={smartSuggestions.certifications} placeholder="Add certifications" /><div className="setup-min-experience"><Field label="Minimum experience" helper="Used as a minimum ranking signal." type="number" value={job.min_experience_years} onChange={(value) => setJob({ ...job, min_experience_years: Number(value) })} /></div></SetupSection>

            <SetupSection number="04" icon={<UserRoundCheck size={16} />} title="Resume input" description="Add a batch of resumes and let the engine extract comparable evidence."><label className={`ui-upload upload-zone upload-dropzone mt-4 block cursor-pointer rounded-xl p-4 ${isDragging ? "is-dragging" : ""} ${files.length ? "has-files" : ""}`} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}><span className="upload-zone-content"><span className="upload-icon"><Upload size={19} /></span><span className="upload-copy"><span className="upload-title">{files.length ? "Resumes ready to rank" : "Drop resumes here"}</span><span className="upload-helper">or browse files from your device</span></span></span><input type="file" multiple accept={ALLOWED_RESUME_TYPES.join(",")} onChange={(event) => handleFileSelection(event.target.files)} className="sr-only" /><span className="upload-action"><FolderOpen size={13} /> Browse files</span><span className="upload-meta">PDF · DOCX · TXT <b>·</b> up to {MAX_RESUME_FILES} files</span>{files.length > 0 && <span className="upload-count">{files.length}/{MAX_RESUME_FILES} selected</span>}{loading && <span className="upload-progress"><i /></span>}</label><FileTray files={files} onClear={() => setFiles([])} onRemove={removeFile} /></SetupSection>

            {error && <p className="setup-error fade-up mt-4 rounded-xl p-3 text-sm leading-5" role="alert">{error}</p>}
            <button disabled={loading} aria-busy={loading} className={`ui-button ui-button-primary button-primary mt-5 w-full rounded-xl px-4 py-3 text-sm text-white disabled:opacity-60 ${loading ? "pulse-track is-loading" : ""}`}><span className="relative z-10 inline-flex items-center justify-center gap-2">{loading && <Loader2 className="animate-spin" size={16} />}{loading ? "Processing resumes..." : "Rank candidates"}<ArrowUpRight size={15} /></span></button><p className="type-caption mt-3 flex items-center justify-center gap-1.5 text-center"><ShieldCheck size={12} /> Private by default · no personal identifiers in scoring</p>
          </motion.form>
          <section className={resultsClass}><AnimatePresence mode="wait" initial={false}>{loading && <motion.div key="processing" initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}><ProcessingPanel /></motion.div>}{!result?.analytics && !loading && <motion.div id="candidate-pool" key="empty" initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}><EmptyState onRunSample={runSample} onStartUpload={handleStartUpload} /></motion.div>}</AnimatePresence>{(result?.analytics || loading) && <div id="insights" className="nav-target"><Suspense fallback={<ChartFallback />}><Analytics analytics={result?.analytics} rankedCandidates={result?.ranked_candidates} totalCandidates={result?.total_candidates} loading={loading} hasResult={Boolean(result)} onRunSample={runSample} /></Suspense></div>}{(result?.analytics || loading) && <div id="candidate-pool" className="nav-target"><CandidateTable candidates={result?.ranked_candidates} loading={loading} /></div>}</section>
        </div>
        <footer className="mx-auto flex max-w-[1500px] items-center justify-between px-4 pb-8 text-[11px] text-slate-600 sm:px-6"><span>shortlist.ai · candidate intelligence</span><span className="hidden sm:inline">Built for thoughtful hiring teams</span></footer>
      </div>
    </main>
  );

  function handleFileSelection(fileList) {
    setIsDragging(false);
    const selected = Array.from(fileList || []);
    const validFiles = selected.filter((file) => ALLOWED_RESUME_TYPES.some((extension) => file.name.toLowerCase().endsWith(extension)));
    if (selected.length !== validFiles.length) setError("Only PDF, DOCX, and TXT resumes are supported."); else if (validFiles.length > MAX_RESUME_FILES) setError(`You selected ${validFiles.length} files. Please keep it to ${MAX_RESUME_FILES} resumes or fewer.`); else setError("");
    setFiles(validFiles.slice(0, MAX_RESUME_FILES));
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelection(event.dataTransfer.files);
  }

  function removeFile(fileToRemove) {
    setFiles((currentFiles) => currentFiles.filter((file) => file !== fileToRemove));
    setError("");
  }
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error("Non-critical visual failed to render:", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function AmbientGlow() { return <div className="ambient-glow" aria-hidden="true"><div className="ambient-depth" /><div className="ambient-grid" /><div className="ambient-light" /><div className="ambient-noise" /><span /><span /><span /></div>; }
function NavItem({ icon, label, active = false, onClick }) { return <button type="button" onClick={onClick} className={`ui-nav-item nav-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>{icon}<span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan" />}</button>; }
function SetupSection({ number, icon, title, description, children }) { return <section className="setup-section"><div className="setup-section-header"><span className="setup-section-icon">{icon}</span><div className="setup-section-copy"><div className="setup-section-kicker">{number} / control group</div><h3 className="setup-section-title">{title}</h3><p className="setup-section-description">{description}</p></div></div><div className="setup-section-body">{children}</div></section>; }
function Field({ label, value, onChange, type = "text", helper }) { const fieldId = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`; return <label className="mt-4 block" htmlFor={fieldId}><span className="field-label">{label}</span><input id={fieldId} aria-describedby={helper ? `${fieldId}-help` : undefined} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="ui-input soft-input mt-2 w-full rounded-xl border bg-white/[0.035] px-3.5 py-2.5 text-sm text-slate-200 outline-none" />{helper && <span className="field-helper" id={`${fieldId}-help`}>{helper}</span>}</label>; }
function LayoutButton({ active, label, onClick, children, reduceMotion }) { return <motion.button type="button" onClick={onClick} title={label} data-tooltip={label} className={`ui-button layout-button ${active ? "active" : ""}`} aria-label={label} whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.94 }}>{children}</motion.button>; }
function Feature({ icon, title, text, reduceMotion }) { const depth = usePointerDepth({ maxTilt: 3.5 }); return <motion.div ref={depth.ref} onPointerEnter={depth.onPointerEnter} onPointerMove={depth.onPointerMove} onPointerLeave={depth.onPointerLeave} className="feature-card pointer-depth-surface" variants={scrollReveal} style={depth.style} whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}><div className="feature-icon">{icon}</div><div><h3 className="text-sm font-medium text-slate-200">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div></motion.div>; }
function EmptyState({ onRunSample, onStartUpload }) {
  const steps = [
    ["01", "Define the role", BriefcaseBusiness],
    ["02", "Add requirements", ListChecks],
    ["03", "Upload resumes", Upload],
    ["04", "Run ranking", Zap],
    ["05", "Review candidates", BarChart3]
  ];

  return <div className="ui-empty empty-state empty-state-premium surface rounded-2xl p-6 sm:p-8" aria-labelledby="empty-state-title">
    <div className="empty-state-main">
      <div className="empty-document-visual" aria-hidden="true"><div className="empty-document-back" /><div className="empty-document-front"><div className="empty-document-top"><FileText size={15} /><span>resume.pdf</span><b>ready</b></div><div className="empty-document-highlight"><i /><i /><i /></div><div className="empty-document-lines"><i /><i /><i /><i /></div><div className="empty-document-tags"><span /><span /></div></div><span className="empty-document-orb"><Sparkles size={13} /></span></div>
      <div className="empty-state-copy"><p className="eyebrow text-cyan">Your screening workspace</p><h2 id="empty-state-title" className="mt-2 text-2xl font-semibold tracking-tight text-white">Build your first shortlist.</h2><p className="mt-3 max-w-md text-sm leading-6 text-slate-500">Define the role, add your requirements, and let the ranking engine turn resume volume into a clear next step.</p><div className="empty-state-actions"><button type="button" onClick={onStartUpload} className="ui-button ui-button-primary button-primary rounded-lg px-3.5 py-2.5 text-slate-50"><Upload size={14} /> Upload resumes</button><button type="button" onClick={onRunSample} className="ui-button ui-button-secondary button-secondary rounded-lg px-3.5 py-2.5 text-slate-200"><Play size={13} fill="currentColor" /> Try sample data</button></div><p className="empty-state-note"><ShieldCheck size={12} /> Start with your own resumes or explore the existing sample workflow.</p></div>
    </div>
    <div className="empty-state-steps" aria-label="Screening workflow">{steps.map(([number, label, Icon]) => <div className="empty-state-step" key={number}><span className="empty-step-number">{number}</span><span className="empty-step-icon"><Icon size={14} /></span><span>{label}</span></div>)}</div>
  </div>;
}
function FileTray({ files, onClear, onRemove }) { if (!files.length) return null; return <div className="ui-card-muted file-tray fade-up mt-3 rounded-xl border border-white/[0.08] p-3"><div className="file-tray-header"><p className="text-xs font-medium text-slate-300"><span className="text-cyan">{files.length}</span> file{files.length > 1 ? "s" : ""} selected</p><button type="button" onClick={onClear} className="file-clear-button" aria-label="Clear selected files"><X size={15} /> Clear all</button></div><div className="file-list mt-2 max-h-32 space-y-1 overflow-auto">{files.map((file) => <div key={`${file.name}-${file.size}`} className="file-row"><span className="file-row-icon"><FolderOpen size={13} /></span><span className="file-row-name" title={file.name}>{file.name}</span><span className="file-row-type">{file.name.split(".").pop().toUpperCase()}</span><button type="button" onClick={() => onRemove(file)} className="file-remove-button" aria-label={`Remove ${file.name}`} title={`Remove ${file.name}`} data-tooltip={`Remove ${file.name}`}><X size={13} /></button></div>)}</div></div>; }
function ProcessingPanel() {
  const reducedMotion = useReducedMotion();
  const [messageIndex, setMessageIndex] = useState(0);
  const screeningMessages = ["Parsing resumes...", "Extracting skills...", "Comparing experience...", "Calculating semantic similarity...", "Applying ranking signals...", "Preparing recruiter insights..."];

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setInterval(() => setMessageIndex((current) => (current + 1) % screeningMessages.length), 1800);
    return () => window.clearInterval(timer);
  }, [reducedMotion, screeningMessages.length]);

  return <div className="ui-loading screening-processing surface fade-up rounded-2xl p-5 sm:p-6" aria-busy="true"><div className="screening-processing-layout"><ScreeningVisual reducedMotion={reducedMotion} /><div className="screening-processing-copy"><p className="eyebrow text-cyan">Live AI screening</p><h2 className="mt-2 font-semibold text-white">Reading candidate evidence</h2><p className="mt-1 text-xs leading-5 text-slate-500">The ranking engine is comparing each resume against your role profile.</p><div className="screening-status" role="status" aria-live="polite"><span className="status-dot" />{screeningMessages[messageIndex]}</div><div className="indeterminate-track" aria-label="Screening in progress"><i /></div><p className="screening-note"><ShieldCheck size={12} /> Status is indeterminate while the model is working.</p></div></div></div>;
}

function ScreeningVisual({ reducedMotion }) {
  return <div className={`screening-visual ${reducedMotion ? "is-reduced" : ""}`} aria-hidden="true"><div className="screening-orbit screening-orbit-outer" /><div className="screening-orbit screening-orbit-inner" /><div className="screening-scan" /><div className="screening-doc screening-doc-back"><FileText size={15} /><span /><span /><span /></div><div className="screening-doc screening-doc-front"><FileText size={15} /><span /><span /><span /></div><span className="screening-line screening-line-a" /><span className="screening-line screening-line-b" /><span className="screening-line screening-line-c" /><span className="screening-node screening-node-a" /><span className="screening-node screening-node-b" /><span className="screening-node screening-node-c" /><div className="screening-core"><Sparkles size={17} /></div></div>;
}
function ChartFallback() { return <div className="surface fade-up h-72 rounded-2xl p-6"><div className="h-full animate-pulse rounded-xl bg-white/[0.03]" /></div>; }
function useSmartSuggestions(job) { return useMemo(() => { const text = [job.title, job.description, ...(job.required_skills || []), ...(job.preferred_skills || [])].join(" ").toLowerCase(); const roleKey = roleOptions.find((role) => role.toLowerCase() === job.title.toLowerCase())?.toLowerCase() || job.title.toLowerCase(); const roleBased = roleSuggestions[roleKey] || []; const detected = skillOptions.filter((skill) => text.includes(skill.toLowerCase())); const related = new Set([...roleBased, ...detected]); [...(job.required_skills || []), ...(job.preferred_skills || []), ...detected].forEach((skill) => (roleSuggestions[skill.toLowerCase()] || []).forEach((item) => related.add(item))); const required = unique([...roleBased, ...detected, ...skillOptions]); const preferred = unique([...related, ...skillOptions]).filter((skill) => !contains(job.required_skills, skill)); const certifications = unique([...certificationOptions.filter((certification) => text.includes(certification.split(" ")[0])), ...(text.includes("aws") ? ["aws certified", "aws solutions architect"] : []), ...(text.includes("azure") ? ["azure certified"] : []), ...(text.includes("gcp") || text.includes("google cloud") ? ["google cloud certified"] : []), ...(text.includes("kubernetes") ? ["kubernetes certified"] : []), ...certificationOptions]); const education = unique([...educationOptions.filter((item) => text.includes(item)), ...(text.includes("data") || text.includes("machine learning") || text.includes("nlp") ? ["computer science", "data science", "artificial intelligence"] : []), ...educationOptions]); return { required, preferred, education, certifications }; }, [job]); }
function unique(items) { return [...new Set(items.filter(Boolean))]; }
function contains(items = [], value) { return items.some((item) => item.trim().toLowerCase() === value.trim().toLowerCase()); }
function getRequestError(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((item) => item?.msg || item?.detail || String(item)).join(" ");
  if (typeof detail === "string" && detail.trim()) return detail;
  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") return "The screening request timed out. Please try again.";
  if (!error?.response) return "We couldn't reach the screening service. Check your connection and try again.";
  return "The screening service couldn't complete this request. Please try again.";
}
