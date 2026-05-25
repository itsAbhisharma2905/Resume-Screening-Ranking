export default function ScoreBadge({ score }) {
  const tone =
    score >= 85 ? "bg-teal text-white shadow-sm shadow-teal/20" :
    score >= 70 ? "bg-emerald-100 text-emerald-800" :
    score >= 50 ? "bg-amber-100 text-amber-800" :
    "bg-red-100 text-red-800";

  return (
    <span className={`inline-flex h-9 min-w-16 items-center justify-center rounded px-3 text-sm font-semibold pop-in ${tone}`}>
      {score.toFixed(1)}
    </span>
  );
}
