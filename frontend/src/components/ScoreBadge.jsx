export default function ScoreBadge({ score }) {
  const tone =
    score >= 85 ? "border-cyan/30 bg-cyan/15 text-cyan shadow-sm shadow-cyan/10" :
    score >= 70 ? "ui-badge-success" :
    score >= 50 ? "ui-badge-warning" :
    "ui-badge-error";

  return (
    <span className={`type-score inline-flex h-9 min-w-16 items-center justify-center rounded-lg border px-3 pop-in ${tone}`}>
      {score.toFixed(1)}
    </span>
  );
}
