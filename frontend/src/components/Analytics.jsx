import { Award, BarChart3, Gauge, UsersRound } from "lucide-react";
import { BarChart, Bar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#0f766e", "#2563eb", "#b45309", "#dc2626"];

export default function Analytics({ analytics }) {
  if (!analytics) return null;

  const bands = Object.entries(analytics.score_bands || {}).map(([name, value]) => ({
    name: name.replaceAll("_", " "),
    value
  }));
  const skills = (analytics.top_skills || []).map(([name, value]) => ({ name, value }));

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <div className="panel fade-up rounded-lg p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">Screening health</p>
            <h2 className="mt-1 text-lg font-semibold">Pipeline Summary</h2>
          </div>
          <Gauge className="text-teal" size={22} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Metric icon={<BarChart3 size={16} />} label="Average" value={`${analytics.average_score}%`} />
          <Metric icon={<Award size={16} />} label="Top score" value={`${analytics.top_score}%`} />
          <Metric icon={<UsersRound size={16} />} label="Qualified" value={analytics.qualified_count} />
        </div>
        <div className="mt-6 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bands}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5edf6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {bands.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel fade-up rounded-lg p-5" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Skill coverage</p>
            <h2 className="mt-1 text-lg font-semibold">Most Frequent Skills</h2>
          </div>
          <BarChart3 className="text-blue-700" size={22} />
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skills} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5edf6" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-line bg-mist p-3 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
      <p className="flex items-center gap-1.5 text-xs text-slate-500">{icon}{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
