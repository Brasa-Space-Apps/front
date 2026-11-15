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
  const input =
    "mt-1 w-full rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm text-[#1C1A17] focus:outline-2 focus:outline-[#D4501C]";

  return (
    <fieldset className="grid grid-cols-2 gap-3">
      <legend className="mb-2 text-sm font-semibold text-[#1C1A17]">Period</legend>
      <label className="text-xs text-stone-600">
        From
        <input type="date" className={input} min={min} max={max} value={start}
               onChange={(e) => onChange(e.target.value, end)} />
      </label>
      <label className="text-xs text-stone-600">
        To
        <input type="date" className={input} min={min} max={max} value={end}
               onChange={(e) => onChange(start, e.target.value)} />
      </label>
      {invalid && (
        <p role="alert" className="col-span-2 text-xs text-[#B4441B]">
          The start date must be before the end date.
        </p>
      )}
    </fieldset>
  );
}
