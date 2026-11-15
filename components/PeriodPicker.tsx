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
    "mt-1 w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-fg focus:outline-2 focus:outline-accent";

  return (
    <fieldset className="grid grid-cols-2 gap-3">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-fg">{t.period}</legend>
      <label className="text-xs text-muted">
        {t.from}
        <input type="date" className={input} min={min} max={max} value={start}
               onChange={(e) => onChange(e.target.value, end)} />
      </label>
      <label className="text-xs text-muted">
        {t.to}
        <input type="date" className={input} min={min} max={max} value={end}
               onChange={(e) => onChange(start, e.target.value)} />
      </label>
      {invalid && (
        <p role="alert" className="col-span-2 text-xs text-[var(--danger)]">
          {t.invalidDate}
        </p>
      )}
    </fieldset>
  );
}
