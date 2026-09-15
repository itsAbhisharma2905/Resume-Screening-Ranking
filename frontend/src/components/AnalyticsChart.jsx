import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const bandColors = ["#69ebe4", "#9d8cff", "#f2b36f", "#ef7185"];

export default function AnalyticsChart({ data, mode, reduceMotion }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 2 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.07)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#71808f" }} axisLine={false} tickLine={false} />
        <YAxis domain={mode === "candidate" ? [0, 100] : [0, "auto"]} allowDecimals={false} tick={{ fontSize: 10, fill: "#71808f" }} axisLine={false} tickLine={false} width={28} />
        <Tooltip cursor={{ fill: "rgba(105,235,228,.04)" }} content={<ScoreTooltip mode={mode} />} />
        <Bar dataKey="score" radius={[6, 6, 2, 2]} animationDuration={reduceMotion ? 0 : 850} isAnimationActive={!reduceMotion} animationEasing="ease-out">
          {data.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={mode === "candidate" ? (index === 0 ? "#69ebe4" : "#3e9495") : bandColors[index % bandColors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ScoreTooltip({ active, payload, mode }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return <div className="analytics-tooltip"><p>{mode === "candidate" ? item.candidate : item.name}</p><strong>{mode === "candidate" ? `${item.score}% score` : `${item.score} candidates`}</strong>{mode === "candidate" && <small>Rank #{item.rank}</small>}</div>;
}
