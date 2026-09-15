import {
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileSearch,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { memo, useEffect, useState } from "react";
import { scrollReveal, scrollStagger, scrollViewport, tableRowReveal } from "./motion.js";

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function clampScore(value) {
  const score = Number(value);
  return Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
}

function shortId(value) {
  const text = String(value || "Candidate");
  return text.length > 28 ? `${text.slice(0, 25)}…` : text;
}

function getRecommendation(score) {
  if (score >= 85) return { label: "Top match", tone: "success", Icon: Sparkles };
  if (score >= 70) return { label: "Strong match", tone: "success", Icon: CheckCircle2 };
  if (score >= 50) return { label: "Review", tone: "warning", Icon: CircleAlert };
  return { label: "Low fit", tone: "error", Icon: CircleAlert };
}

function ScoreGauge({ score }) {
  const normalized = clampScore(score);
  return (
    <span
      className="candidate-score-gauge"
      style={{ "--score-angle": `${normalized * 3.6}deg` }}
      role="img"
      aria-label={`Score ${normalized.toFixed(1)} out of 100`}
    >
      <span>{normalized.toFixed(1)}</span>
    </span>
  );
}

function RankBadge({ rank }) {
  const number = Number(rank) || 0;
  return (
    <span className={`candidate-rank-badge candidate-rank-${number <= 3 ? number : "other"}`}>
      {number === 1 && <Award size={13} aria-hidden="true" />}
      <span>#{number || "—"}</span>
    </span>
  );
}

function SkillChips({ skills, emptyLabel = "None identified", missing = false }) {
  const visibleSkills = asArray(skills).slice(0, 4);
  const remaining = asArray(skills).length - visibleSkills.length;

  if (!visibleSkills.length) return <span className="candidate-muted-value">{emptyLabel}</span>;

  return (
    <div className="candidate-skill-chips" aria-label={`${missing ? "Missing" : "Matched"} skills`}>
      {visibleSkills.map((skill) => <span className={`candidate-skill-chip${missing ? " is-missing" : ""}`} key={skill}>{skill}</span>)}
      {remaining > 0 && <span className="candidate-skill-chip is-more">+{remaining}</span>}
    </div>
  );
}

function MatchCell({ candidate }) {
  const matched = asArray(candidate.matched_skills).length;
  const percentage = Number(candidate.match_percentage);
  const value = Number.isFinite(percentage) ? clampScore(percentage) : null;

  return (
    <div className="candidate-match-cell">
      <div className="candidate-match-label"><Target size={14} aria-hidden="true" /><strong>{value !== null ? `${value.toFixed(0)}% fit` : `${matched} matched`}</strong></div>
      <div className="candidate-match-track" aria-hidden="true"><span style={{ width: `${value !== null ? value : Math.min(matched * 20, 100)}%` }} /></div>
      <span className="candidate-cell-note">{matched} matched skill{matched === 1 ? "" : "s"}</span>
    </div>
  );
}

function SimilarityCell({ candidate }) {
  const semantic = Number(candidate.semantic_similarity);
  const tfidf = Number(candidate.tfidf_similarity);
  const format = (value) => Number.isFinite(value) ? `${(value <= 1 ? value * 100 : value).toFixed(0)}%` : "—";

  return (
    <div className="candidate-similarity-cell">
      <span><b>Semantic</b>{format(semantic)}</span>
      <span><b>Keyword</b>{format(tfidf)}</span>
    </div>
  );
}

function Recommendation({ score }) {
  const recommendation = getRecommendation(clampScore(score));
  const Icon = recommendation.Icon;
  return <span className={`candidate-recommendation is-${recommendation.tone}`}><Icon size={13} aria-hidden="true" />{recommendation.label}</span>;
}

function CandidateIdentity({ candidate }) {
  return (
    <div className="candidate-identity">
      <span className="candidate-avatar" aria-hidden="true"><UserRound size={16} /></span>
      <div>
        <strong title={candidate.candidate_id}>{shortId(candidate.candidate_id)}</strong>
        <p title={candidate.resume_summary || undefined}>{candidate.resume_summary || "Resume profile ready for review."}</p>
      </div>
    </div>
  );
}

const CandidateRow = memo(function CandidateRow({ candidate }) {
  const score = clampScore(candidate.score);
  const missingSkills = asArray(candidate.missing_skills);

  return (
    <motion.tr className={`candidate-row${Number(candidate.rank) === 1 ? " is-top-candidate" : ""}`} variants={tableRowReveal}>
      <td><RankBadge rank={candidate.rank} /></td>
      <th scope="row"><CandidateIdentity candidate={candidate} /></th>
      <td><div className="candidate-score-cell"><ScoreGauge score={score} /><span className="candidate-cell-note">match score</span></div></td>
      <td><span className="candidate-category"><BriefcaseBusiness size={14} aria-hidden="true" />{candidate.category || "Uncategorized"}</span></td>
      <td><MatchCell candidate={candidate} /></td>
      <td><span className="candidate-experience"><Clock3 size={14} aria-hidden="true" />{candidate.experience_years ?? 0} yrs</span></td>
      <td><SkillChips skills={missingSkills} missing /></td>
      <td><Recommendation score={score} /></td>
      <td><SimilarityCell candidate={candidate} /></td>
    </motion.tr>
  );
});

const CandidateCard = memo(function CandidateCard({ candidate }) {
  const score = clampScore(candidate.score);
  const matchedSkills = asArray(candidate.matched_skills);
  const missingSkills = asArray(candidate.missing_skills);
  return (
    <motion.article className={`candidate-mobile-card${Number(candidate.rank) === 1 ? " is-top-candidate" : ""}`} variants={tableRowReveal}>
      <div className="candidate-mobile-card-header">
        <div className="candidate-mobile-rank"><RankBadge rank={candidate.rank} /><span>Candidate profile</span></div>
        <ScoreGauge score={score} />
      </div>
      <CandidateIdentity candidate={candidate} />
      <div className="candidate-mobile-meta">
        <span><BriefcaseBusiness size={13} aria-hidden="true" />{candidate.category || "Uncategorized"}</span>
        <span><Clock3 size={13} aria-hidden="true" />{candidate.experience_years ?? 0} yrs experience</span>
        <Recommendation score={score} />
      </div>
      <div className="candidate-mobile-skills">
        <div><span className="candidate-mobile-label">Matched skills</span><SkillChips skills={matchedSkills} /></div>
        <div><span className="candidate-mobile-label">Missing skills</span><SkillChips skills={missingSkills} missing /></div>
      </div>
      <div className="candidate-mobile-footer"><SimilarityCell candidate={candidate} /><span className="candidate-cell-note">{matchedSkills.length} matched · {missingSkills.length} gap{missingSkills.length === 1 ? "" : "s"}</span></div>
    </motion.article>
  );
});

function CandidateTableSkeleton() {
  return (
    <section className="candidate-results ui-card surface" role="status" aria-busy="true" aria-label="Loading candidate results">
      <div className="candidate-results-heading"><div><span className="skeleton-block candidate-skeleton-kicker" /><span className="skeleton-block candidate-skeleton-title" /></div><span className="skeleton-block candidate-skeleton-action" /></div>
      <div className="candidate-skeleton-list">{[1, 2, 3, 4].map((item) => <div className="candidate-skeleton-row" key={item}><span className="skeleton-block candidate-skeleton-rank" /><span className="skeleton-block candidate-skeleton-name" /><span className="skeleton-block candidate-skeleton-score" /><span className="skeleton-block candidate-skeleton-wide" /></div>)}</div>
    </section>
  );
}

function CandidateEmptyState() {
  return (
    <section className="candidate-results candidate-empty ui-card surface" aria-live="polite">
      <span className="candidate-empty-icon"><FileSearch size={22} aria-hidden="true" /></span>
      <div><h3>No ranked candidates yet</h3><p>Run a screening pass to compare resume evidence against your configured role.</p></div>
    </section>
  );
}

function useMobileResults() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 820px)").matches);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 820px)");
    const update = () => setIsMobile(query.matches);
    update();
    if (query.addEventListener) query.addEventListener("change", update);
    else query.addListener?.(update);
    return () => {
      if (query.removeEventListener) query.removeEventListener("change", update);
      else query.removeListener?.(update);
    };
  }, []);

  return isMobile;
}

export default function CandidateTable({ candidates, loading = false }) {
  const reduceMotion = useReducedMotion();
  const isMobile = useMobileResults();
  if (loading) return <CandidateTableSkeleton />;
  if (!Array.isArray(candidates) || !candidates.length) return <CandidateEmptyState />;

  return (
    <motion.section className="candidate-results ui-card surface" aria-labelledby="candidate-results-title" initial={reduceMotion ? false : "hidden"} whileInView="visible" viewport={scrollViewport} variants={scrollReveal}>
      <div className="candidate-results-heading">
        <div><span className="eyebrow">CANDIDATE INTELLIGENCE</span><h2 id="candidate-results-title">Ranked candidate profiles</h2><p>Compare fit signals, evidence, and skill gaps at a glance.</p></div>
        <span className="candidate-result-count"><strong>{candidates.length}</strong> profiles ranked</span>
      </div>
      {!isMobile && <div className="candidate-table-scroll">
        <table className="candidate-table ui-table">
          <caption className="sr-only">Ranked candidate profiles with fit, experience, skill gaps, and recommendation status</caption>
          <thead><tr><th scope="col">Rank</th><th scope="col">Candidate</th><th scope="col">Score</th><th scope="col">Category</th><th scope="col">Skill fit</th><th scope="col">Experience</th><th scope="col">Missing skills</th><th scope="col">Recommendation</th><th scope="col">Similarity</th></tr></thead>
          <motion.tbody variants={scrollStagger}>{candidates.map((candidate, index) => <CandidateRow candidate={candidate} key={candidate.candidate_id || `${candidate.rank}-${index}`} />)}</motion.tbody>
        </table>
      </div>}
      {isMobile && <motion.div className="candidate-mobile-list" variants={scrollStagger}>{candidates.map((candidate, index) => <CandidateCard candidate={candidate} key={candidate.candidate_id || `${candidate.rank}-${index}`} />)}</motion.div>}
    </motion.section>
  );
}
