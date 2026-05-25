import { Check, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

export default function ComboBox({ label, value, onChange, options = [], placeholder = "Select or type" }) {
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    return options
      .filter((option) => !query || option.toLowerCase().includes(query))
      .slice(0, 12);
  }, [options, value]);

  return (
    <label className="mt-4 block">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative mt-1">
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="soft-input w-full rounded border border-line bg-white/85 px-3 py-2 pr-10 text-sm outline-none"
        />
        <button type="button" onClick={() => setOpen(!open)} className="absolute right-2 top-1.5 rounded p-1 text-slate-500 hover:bg-mist" aria-label={`Open ${label} options`}>
          <ChevronDown size={16} />
        </button>
        {open && (
          <div className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded border border-line bg-white p-1 shadow-panel">
            {value.trim() && !options.some((option) => same(option, value)) && (
              <button type="button" onMouseDown={() => choose(value)} className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm hover:bg-mist">
                <span>Use "{value.trim()}"</span>
                <Check size={14} className="text-teal" />
              </button>
            )}
            {matches.map((option) => (
              <button key={option} type="button" onMouseDown={() => choose(option)} className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm hover:bg-mist">
                <span>{option}</span>
                <Check size={14} className="text-teal opacity-70" />
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );

  function choose(option) {
    onChange(option.trim());
    setOpen(false);
  }
}

function same(left, right) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}
