import { CheckCircle2, CircleAlert, FileSearch, Sparkles } from "lucide-react";
import ScoreBadge from "./ScoreBadge.jsx";

export default function CandidateTable({ candidates }) {
  if (!candidates?.length) {
    return (
      <div className="rounded-lg border border-line bg-white p-8 text-center text-sm text-slate-500">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-mist text-teal">
          <FileSearch size={24} />
        </div>
        Upload resumes or run the sample payload to see ranked candidates.
      </div>
    );
  }

  return (
    <div className="panel fade-up overflow-hidden rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white/70 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal">Ranked shortlist</p>
          <h2 className="text-lg font-semibold">Candidate Results</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded bg-mist px-3 py-1.5 text-sm font-medium text-slate-700">
          <Sparkles size={15} />
          {candidates.length} analyzed
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead className="bg-mist">
            <tr>
              {["Rank", "Candidate", "Score", "Matched Skills", "Missing Skills", "Similarity"].map((heading) => (
                <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {candidates.map((candidate, index) => (
              <tr
                key={candidate.candidate_id}
                className="fade-up align-top transition hover:bg-teal/5"
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <td className="px-4 py-4 text-sm font-semibold">#{candidate.rank}</td>
                <td className="max-w-sm px-4 py-4">
                  <p className="font-semibold">{candidate.candidate_id}</p>
                  <p className="mt-1 text-sm text-slate-600">{candidate.resume_summary}</p>
                </td>
                <td className="px-4 py-4"><ScoreBadge score={candidate.score} /></td>
                <td className="px-4 py-4">
                  <SkillList icon={<CheckCircle2 size={14} />} skills={candidate.matched_skills} tone="text-teal" />
                </td>
                <td className="px-4 py-4">
                  <SkillList icon={<CircleAlert size={14} />} skills={candidate.missing_skills} tone="text-amber" empty="None" />
                </td>
                <td className="px-4 py-4 text-sm">
                  <p>SBERT: {(candidate.semantic_similarity * 100).toFixed(1)}%</p>
                  <p className="text-slate-500">TF-IDF: {(candidate.tfidf_similarity * 100).toFixed(1)}%</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SkillList({ icon, skills, tone, empty = "No matches" }) {
  if (!skills?.length) return <span className="text-sm text-slate-500">{empty}</span>;
  return (
    <div className="flex max-w-xs flex-wrap gap-2">
      {skills.slice(0, 8).map((skill) => (
        <span key={skill} className={`inline-flex items-center gap-1 rounded border border-line px-2 py-1 text-xs ${tone}`}>
          {icon}
          {skill}
        </span>
      ))}
    </div>
  );
}
