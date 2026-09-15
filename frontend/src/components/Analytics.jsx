import { Award, BarChart3, CheckCircle2, Gauge, Layers3, Sparkles, Target, TrendingUp, UsersRound } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";
import { scrollReveal, scrollStagger, scrollViewport, usePointerDepth } from "./motion.js";

const AnalyticsChart = lazy(() => import("./AnalyticsChart.jsx"));
const bandColors = ["#69ebe4", "#9d8cff", "#f2b36f", "#ef7185"];

export default function Analytics({ analytics, rankedCandidates = [], totalCandidates, loading = false, hasResult = false, onRunSample }) {
  const reduceMotion = useReducedMotion();
  if (loading && !analytics) return <AnalyticsSkeleton />;
  if (!analytics) return hasResult ? <AnalyticsEmptyState onRunSample={onRunSample} /> : null;

  const candidates = rankedCandidates || [];
  const bands = Object.entries(analytics.score_bands || {}).map(([name, value]) => ({ name: prettifyBand(name), value }));
  const skills = (analytics.top_skills || []).map(([name, value]) => ({ name, value }));
  const skillGaps = getSkillGaps(candidates);
  const uniqueSkills = new Set(candidates.flatMap((candidate) => candidate.extracted_skills || []));
  const screenedCount = totalCandidates ?? candidates.length;
  const topCandidate = candidates[0];
  const candidateScoreData = candidates.slice(0, 8).map((candidate) => ({
    name: shorten(candidate.candidate_id),
    candidate: candidate.candidate_id,
    score: candidate.score,
    rank: candidate.rank
  }));
  const scoreData = candidateScoreData.length ? candidateScoreData : bands.map((band) => ({ name: band.name, score: band.value, candidate: band.name }));
  const chartMode = candidateScoreData.length ? "candidate" : "band";
  return (
    <motion.section className="analytics-shell" aria-label="Recruiting analytics" initial={reduceMotion ? false : "hidden"} whileInView="visible" viewport={scrollViewport} variants={scrollStagger}>
      <motion.div className="analytics-heading" variants={scrollReveal}><div><p className="eyebrow text-cyan">02 / Recruiting intelligence</p><h2 className="type-section mt-2 text-white">Signal overview</h2><p className="type-caption mt-1">A transparent read on candidate quality, coverage, and fit.</p></div><div className="analytics-live"><span className="status-dot" />Live from this screening</div></motion.div>

      <motion.div className="analytics-metric-grid" variants={scrollStagger}>
        <MetricCard icon={<UsersRound size={16} />} label="Candidates screened" value={screenedCount} context="returned in this run" accent="cyan" reduceMotion={reduceMotion} />
        <MetricCard icon={<Award size={16} />} label="Top candidate score" value={analytics.top_score} suffix="%" context={topCandidate ? `#${topCandidate.rank} · ${shorten(topCandidate.candidate_id)}` : "No ranked candidate"} accent="violet" reduceMotion={reduceMotion} />
        <MetricCard icon={<Gauge size={16} />} label="Average score" value={analytics.average_score} suffix="%" context="across the returned shortlist" accent="amber" reduceMotion={reduceMotion} />
        <MetricCard icon={<Layers3 size={16} />} label="Skills evaluated" value={uniqueSkills.size} context="unique extracted signals" accent="green" reduceMotion={reduceMotion} />
      </motion.div>

      <motion.div className="analytics-main-panel ui-card surface" variants={scrollReveal}>
        <div className="analytics-panel-heading"><div><p className="eyebrow text-cyan">Score model</p><h3 className="type-section mt-2 text-white">{chartMode === "candidate" ? "Candidate score map" : "Score distribution"}</h3><p className="type-caption mt-1">{chartMode === "candidate" ? "Highest-ranked profiles from this screening run." : "The response did not include ranked candidate rows, so score bands are shown."}</p></div><div className="analytics-chart-legend"><span className="legend-dot" />{chartMode === "candidate" ? "Score / 100" : "Candidates"}</div></div>
        <div className="analytics-chart"><Suspense fallback={<div className="skeleton-block chart-skeleton" role="status" aria-label="Loading score chart" />}><AnalyticsChart data={scoreData} mode={chartMode} reduceMotion={reduceMotion} /></Suspense></div>
      </motion.div>

      <motion.div className="analytics-insight-grid" variants={scrollStagger}>
        <InsightCard icon={<TrendingUp size={16} />} eyebrow="Skill coverage" title="Strongest skills" tone="cyan"><RankedBars items={skills} empty="No extracted skill signals were returned." /></InsightCard>
        <InsightCard icon={<Target size={16} />} eyebrow="Opportunity map" title="Most common skill gaps" tone="amber"><RankedBars items={skillGaps} empty={candidates.length ? "No missing skills were returned." : "Candidate rows are unavailable for gap analysis."} warning /></InsightCard>
        <InsightCard icon={<BarChart3 size={16} />} eyebrow="Quality spread" title="Score distribution" tone="violet"><BandList bands={bands} /></InsightCard>
        <InsightCard icon={<Sparkles size={16} />} eyebrow="Recruiter readout" title="Candidate quality signals" tone="green"><QualitySignals topCandidate={topCandidate} qualifiedCount={analytics.qualified_count} /></InsightCard>
      </motion.div>
    </motion.section>
  );
}

function MetricCard({ icon, label, value, suffix = "", context, accent, reduceMotion }) {
  const depth = usePointerDepth({ maxTilt: 3.2 });
  return <motion.div ref={depth.ref} onPointerEnter={depth.onPointerEnter} onPointerMove={depth.onPointerMove} onPointerLeave={depth.onPointerLeave} className={`analytics-metric-card metric-${accent} pointer-depth-surface`} variants={scrollReveal} style={depth.style} whileHover={reduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }}><div className="metric-card-top"><span className="metric-icon">{icon}</span><span className="metric-context">{context}</span></div><p className="metric-card-label">{label}</p><p className="metric-card-value"><AnimatedNumber value={value} suffix={suffix} reduceMotion={reduceMotion} /></p></motion.div>;
}

function AnimatedNumber({ value, suffix, reduceMotion }) {
  const numericValue = Number(value);
  const hasValue = value !== null && value !== undefined && value !== "" && Number.isFinite(numericValue);
  const [displayValue, setDisplayValue] = useState(reduceMotion || !hasValue ? (hasValue ? numericValue : 0) : 0);
  useEffect(() => {
    if (!hasValue || reduceMotion) { setDisplayValue(hasValue ? numericValue : 0); return undefined; }
    const startedAt = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min((now - startedAt) / 650, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(numericValue * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hasValue, numericValue, reduceMotion]);
  if (!hasValue) return <span aria-label="Not available">—</span>;
  const formatted = numericValue % 1 === 0 ? Math.round(displayValue) : displayValue.toFixed(1);
  return <motion.span key={`${numericValue}-${suffix}`} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }}>{formatted}{suffix}</motion.span>;
}

function InsightCard({ icon, eyebrow, title, tone, children }) { const depth = usePointerDepth({ maxTilt: 3.2 }); return <motion.article ref={depth.ref} onPointerEnter={depth.onPointerEnter} onPointerMove={depth.onPointerMove} onPointerLeave={depth.onPointerLeave} className={`analytics-insight-card insight-${tone} pointer-depth-surface`} variants={scrollReveal} style={depth.style}><div className="insight-heading"><span className="insight-icon">{icon}</span><div><p className="eyebrow">{eyebrow}</p><h3 className="mt-1 text-sm font-semibold text-white">{title}</h3></div></div><div className="mt-4">{children}</div></motion.article>; }

function RankedBars({ items, empty, warning = false }) {
  if (!items.length) return <p className="analytics-empty-copy">{empty}</p>;
  const max = Math.max(...items.map((item) => item.value), 1);
  return <div className="ranked-bars">{items.slice(0, 6).map((item) => <div className="ranked-bar-row" key={item.name}><div className="ranked-bar-meta"><span>{item.name}</span><b>{item.value}</b></div><div className="ranked-bar-track"><i className={warning ? "is-warning" : ""} style={{ width: `${(item.value / max) * 100}%` }} /></div></div>)}</div>;
}

function BandList({ bands }) { if (!bands.length) return <p className="analytics-empty-copy">No score bands were returned.</p>; return <div className="band-list">{bands.map((band, index) => <div className="band-row" key={band.name}><span className="legend-dot" style={{ background: bandColors[index % bandColors.length] }} /><span>{band.name}</span><b>{band.value}</b></div>)}</div>; }

function QualitySignals({ topCandidate, qualifiedCount }) { if (!topCandidate) return <p className="analytics-empty-copy">No candidate quality signals were returned.</p>; return <div className="quality-list"><div><span><CheckCircle2 size={14} />Qualified matches</span><b>{qualifiedCount ?? "—"}</b></div><div><span><Award size={14} />Strongest profile</span><b title={topCandidate.candidate_id}>{shorten(topCandidate.candidate_id) || "—"}</b></div><div><span><TrendingUp size={14} />Matched skills</span><b>{topCandidate.matched_skills?.length ?? "—"}</b></div><div><span><Layers3 size={14} />Experience detected</span><b>{topCandidate.experience_years == null ? "—" : `${topCandidate.experience_years} yrs`}</b></div></div>; }

function AnalyticsSkeleton() { return <section className="analytics-shell analytics-skeleton" role="status" aria-label="Loading analytics" aria-busy="true"><div className="analytics-skeleton-heading"><span /><i /></div><div className="analytics-metric-grid">{[1, 2, 3, 4].map((item) => <div className="skeleton-block metric-skeleton" key={item} />)}</div><div className="skeleton-block chart-skeleton" /><div className="analytics-insight-grid">{[1, 2, 3, 4].map((item) => <div className="skeleton-block insight-skeleton" key={item} />)}</div></section>; }
function AnalyticsEmptyState({ onRunSample }) { return <section className="analytics-empty-state ui-card surface" aria-labelledby="analytics-empty-title"><div className="analytics-empty-orb" aria-hidden="true"><Sparkles size={20} /></div><p className="eyebrow text-cyan">Analytics unavailable</p><h2 id="analytics-empty-title" className="type-section mt-2 text-white">No screening signals yet.</h2><p className="type-caption mt-2 max-w-sm">Run a screening pass to see score quality, skill coverage, and recruiter-ready insights.</p>{onRunSample && <button type="button" onClick={onRunSample} className="ui-button ui-button-secondary button-secondary mt-5 rounded-lg px-3 py-2 text-slate-200">Run sample</button>}</section>; }

function getSkillGaps(candidates) { const counts = new Map(); candidates.forEach((candidate) => (candidate.missing_skills || []).forEach((skill) => counts.set(skill, (counts.get(skill) || 0) + 1))); return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })); }
function prettifyBand(value) { return value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "); }
function shorten(value = "") { return value.length > 17 ? `${value.slice(0, 15)}…` : value; }
