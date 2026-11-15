// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import { getCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

interface Props {
  min: string;
  max: string;
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  locale: Locale;
}

export default function PeriodPicker({ min, max, start, end, onChange, locale }: Props) {
  const t = getCopy(locale);
  const invalid = start > end;
  const input =
    "mt-1 w-full rounded-md border border-stone-300 bg-white px-2 py-1.5 text-sm text-[#1C1A17] focus:outline-2 focus:outline-[#A63C16]";

  return (
    <fieldset className="grid grid-cols-2 gap-3">
      <legend className="mb-2 text-sm font-semibold text-[#1C1A17]">{t.period}</legend>
      <label className="text-xs text-stone-600">
        {t.from}
        <input type="date" className={input} min={min} max={max} value={start}
               onChange={(e) => onChange(e.target.value, end)} />
      </label>
      <label className="text-xs text-stone-600">
        {t.to}
        <input type="date" className={input} min={min} max={max} value={end}
               onChange={(e) => onChange(start, e.target.value)} />
      </label>
      {invalid && (
        <p role="alert" className="col-span-2 text-xs text-[#B4441B]">
          {t.invalidDate}
        </p>
      )}
    </fieldset>
  );
}
