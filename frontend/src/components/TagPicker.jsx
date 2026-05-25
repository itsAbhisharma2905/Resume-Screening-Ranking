import { Check, ChevronDown, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

export default function TagPicker({ label, value, onChange, options = [], placeholder = "Type and press Enter" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = value || [];
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return options
      .filter((option) => !selected.some((item) => same(item, option)))
      .filter((option) => !normalized || option.toLowerCase().includes(normalized))
      .slice(0, 10);
  }, [options, query, selected]);

  function addTag(tag) {
    const clean = tag.trim();
    if (!clean || selected.some((item) => same(item, clean))) return;
    onChange([...selected, clean]);
    setQuery("");
    setOpen(false);
  }

  function removeTag(tag) {
    onChange(selected.filter((item) => !same(item, tag)));
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag(query || matches[0] || "");
    }
    if (event.key === "Backspace" && !query && selected.length) {
      removeTag(selected[selected.length - 1]);
    }
  }

  return (
    <div className="mt-4 block">
      <p className="text-sm font-medium">{label}</p>
      <div className="soft-input mt-1 rounded border border-line bg-white/85 p-2">
        <div className="flex min-h-9 flex-wrap items-center gap-2">
          {selected.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded bg-teal/10 px-2 py-1 text-xs font-medium text-teal">
              {item}
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => removeTag(item)} className="rounded hover:bg-teal/10" aria-label={`Remove ${item}`}>
                <X size={13} />
              </button>
            </span>
          ))}
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selected.length ? "" : placeholder}
            className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm outline-none"
          />
          <button type="button" onClick={() => setOpen(!open)} className="rounded p-1 text-slate-500 hover:bg-mist" aria-label={`Open ${label} options`}>
            <ChevronDown size={16} />
          </button>
        </div>
        {open && (
          <div className="mt-2 max-h-52 overflow-auto rounded border border-line bg-white p-1 shadow-panel">
            {query.trim() && !selected.some((item) => same(item, query)) && (
              <button type="button" onMouseDown={(event) => { event.preventDefault(); addTag(query); }} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-mist">
                <Plus size={15} className="text-teal" />
                Add "{query.trim()}"
              </button>
            )}
            {matches.map((option) => (
              <button key={option} type="button" onMouseDown={(event) => { event.preventDefault(); addTag(option); }} className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm hover:bg-mist">
                <span>{option}</span>
                <Check size={14} className="text-teal opacity-70" />
              </button>
            ))}
            {!matches.length && !query.trim() && (
              <p className="px-2 py-2 text-sm text-slate-500">No more suggestions available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function same(left, right) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}
