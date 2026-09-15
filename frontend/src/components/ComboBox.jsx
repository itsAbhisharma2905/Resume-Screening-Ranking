import { Check, ChevronDown } from "lucide-react";
import { useId, useMemo, useState } from "react";

export default function ComboBox({ label, value, onChange, options = [], placeholder = "Select or type" }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const id = useId();
  const inputId = `${id}-input`;
  const listId = `${id}-listbox`;

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase();
    return options
      .filter((option) => !query || option.toLowerCase().includes(query))
      .slice(0, 12);
  }, [options, value]);

  const customOption = value.trim() && !options.some((option) => same(option, value)) ? value.trim() : null;
  const optionValues = customOption ? [customOption, ...matches] : matches;

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, optionValues.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && open && activeIndex >= 0 && optionValues[activeIndex]) {
      event.preventDefault();
      choose(optionValues[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <label className="combo-field mt-5 block" htmlFor={inputId}>
      <span className="field-label" id={`${inputId}-label`}>{label}</span>
      <div className="relative mt-1">
        <input
          id={inputId}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => { setOpen(true); setActiveIndex(-1); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={open ? listId : undefined}
          aria-expanded={open}
          aria-activedescendant={open && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          className="ui-input soft-input mt-2 w-full rounded-xl border bg-white/[0.035] px-3.5 py-2.5 pr-10 text-sm text-slate-200 outline-none"
        />
        <button type="button" onClick={() => { setOpen(!open); setActiveIndex(-1); }} className="absolute right-2 top-2 rounded p-1 text-slate-500 hover:bg-white/[0.06]" aria-label={`Open ${label} options`} aria-expanded={open} title={`Open ${label} options`} data-tooltip={`Open ${label} options`}>
          <ChevronDown size={16} />
        </button>
        {open && (
          <div id={listId} className="ui-menu absolute z-30 mt-2 max-h-64 w-full overflow-auto p-1" role="listbox" aria-label={`${label} suggestions`}>
            {optionValues.map((option, index) => (
              <button id={`${listId}-option-${index}`} key={`${option}-${index}`} type="button" role="option" aria-selected={activeIndex === index} onMouseDown={() => choose(option)} onMouseEnter={() => setActiveIndex(index)} className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-slate-300 hover:bg-white/[0.06] ${activeIndex === index ? "bg-white/[0.06]" : ""}`}>
                <span>{index === 0 && customOption ? `Use "${option}"` : option}</span>
                <Check size={14} className="text-teal opacity-70" />
              </button>
            ))}
            {!optionValues.length && <p className="px-2 py-2 text-sm text-slate-500" role="status">No matching roles.</p>}
          </div>
        )}
      </div>
    </label>
  );

  function choose(option) {
    onChange(option.trim());
    setOpen(false);
    setActiveIndex(-1);
  }
}

function same(left, right) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}
