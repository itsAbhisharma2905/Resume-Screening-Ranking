import { Check, ChevronDown, Plus, X } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function TagPicker({ label, value, onChange, options = [], placeholder = "Type and press Enter" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const reduceMotion = useReducedMotion();
  const id = useId();
  const inputId = `${id}-input`;
  const listId = `${id}-listbox`;

  const selected = value || [];
  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return options
      .filter((option) => !selected.some((item) => same(item, option)))
      .filter((option) => !normalized || option.toLowerCase().includes(normalized))
      .slice(0, 10);
  }, [options, query, selected]);

  const customOption = query.trim() && !selected.some((item) => same(item, query)) ? query.trim() : null;
  const optionValues = customOption ? [customOption, ...matches] : matches;

  function addTag(tag) {
    const clean = tag.trim();
    if (!clean || selected.some((item) => same(item, clean))) return;
    onChange([...selected, clean]);
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
  }

  function removeTag(tag) {
    onChange(selected.filter((item) => !same(item, tag)));
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, optionValues.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      addTag(optionValues[activeIndex] || query || matches[0] || "");
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (event.key === "Backspace" && !query && selected.length) {
      removeTag(selected[selected.length - 1]);
    }
  }

  return (
    <div className="tag-picker mt-4 block">
      <label className="field-label" htmlFor={inputId} id={`${inputId}-label`}>{label}</label>
      <div className="ui-input soft-input mt-2 rounded-xl border bg-white/[0.035] p-2">
        <div className="flex min-h-9 flex-wrap items-center gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {selected.map((item) => (
            <motion.span key={item} layout={!reduceMotion} initial={reduceMotion ? false : { opacity: 0, scale: .88, y: -3 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, scale: .84, x: -4 }} transition={{ duration: .16, ease: "easeOut" }} className="ui-chip tag-chip rounded-md px-2 py-1">
              {item}
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => removeTag(item)} className="rounded hover:bg-cyan/10" aria-label={`Remove ${item}`} title={`Remove ${item}`} data-tooltip={`Remove ${item}`}>
                <X size={13} />
              </button>
            </motion.span>
            ))}
          </AnimatePresence>
          <input
            id={inputId}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => { setOpen(true); setActiveIndex(-1); }}
            onKeyDown={handleKeyDown}
            placeholder={selected.length ? "" : placeholder}
            aria-label={label}
            aria-autocomplete="list"
            aria-controls={open ? listId : undefined}
            aria-expanded={open}
            aria-activedescendant={open && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
            className="tag-picker-input min-w-32 flex-1 bg-transparent px-1 py-1 text-sm text-slate-200 outline-none"
          />
          <button type="button" onClick={() => { setOpen(!open); setActiveIndex(-1); }} className="rounded p-1 text-slate-500 hover:bg-white/[0.06]" aria-label={`Open ${label} options`} aria-expanded={open} title={`Open ${label} options`} data-tooltip={`Open ${label} options`}>
            <ChevronDown size={16} />
          </button>
        </div>
        {open && (
          <div id={listId} className="ui-menu mt-2 max-h-52 overflow-auto p-1" role="listbox" aria-label={`${label} suggestions`}>
            {optionValues.map((option, index) => (
              <button id={`${listId}-option-${index}`} key={`${option}-${index}`} type="button" role="option" aria-selected={activeIndex === index} onMouseDown={(event) => { event.preventDefault(); addTag(option); }} onMouseEnter={() => setActiveIndex(index)} className={`flex w-full items-center ${index === 0 && customOption ? "gap-2" : "justify-between"} rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-white/[0.06] ${activeIndex === index ? "bg-white/[0.06]" : ""}`}>
                {index === 0 && customOption ? <><Plus size={15} className="text-teal" />Add "{option}"</> : <><span>{option}</span><Check size={14} className="text-teal opacity-70" /></>}
              </button>
            ))}
            {!optionValues.length && <p className="px-2 py-2 text-sm text-slate-500" role="status">No more suggestions available.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function same(left, right) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}
