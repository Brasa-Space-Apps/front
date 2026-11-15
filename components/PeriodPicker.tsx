// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

interface Props {
  min: string;
  max: string;
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}

export default function PeriodPicker({ min, max, start, end, onChange }: Props) {
  const invalid = start > end;
  const isCustom = Boolean(min && max && (start !== min || end !== max));
  const input = `mt-1 w-full rounded-md border bg-white px-2 py-1.5 text-sm text-[#1C1A17] transition-colors focus:outline-2 focus:outline-[#D4501C] ${
    invalid ? "border-[#D4501C]" : "border-stone-300 hover:border-stone-400"
  }`;

  return (
    <fieldset className="grid grid-cols-2 gap-3">
      <div className="col-span-2 flex items-center justify-between">
        <legend className="text-sm font-semibold text-[#1C1A17]">Period</legend>
        {isCustom && (
          <button
            type="button"
            onClick={() => onChange(min, max)}
            className="animate-fade-in cursor-pointer rounded-sm text-xs text-stone-600 underline-offset-2 transition-colors hover:text-[#1C1A17] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4501C]"
          >
            Reset to full period
          </button>
        )}
      </div>
      <label className="text-xs text-stone-600">
        From
        <input type="date" className={input} min={min} max={end && end <= max ? end : max} value={start}
               onChange={(e) => onChange(e.target.value, end)} />
      </label>
      <label className="text-xs text-stone-600">
        To
        <input type="date" className={input} min={start && start >= min ? start : min} max={max} value={end}
               onChange={(e) => onChange(start, e.target.value)} />
      </label>
      {invalid && (
        <p role="alert" className="animate-fade-in col-span-2 text-xs text-[#B4441B]">
          The start date must be before the end date.
        </p>
      )}
    </fieldset>
  );
}
