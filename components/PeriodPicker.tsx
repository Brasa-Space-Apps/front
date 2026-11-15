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
  const isCustom = Boolean(min && max && (start !== min || end !== max));
  const input = `mt-1 w-full rounded-md border bg-surface px-2 py-1.5 text-sm text-fg transition-colors focus:outline-2 focus:outline-accent ${
    invalid ? "border-[var(--danger)]" : "border-line hover:border-fg/40"
  }`;

  return (
    <fieldset className="grid grid-cols-2 gap-3">
      <legend className="sr-only">{t.period}</legend>
      <div className="col-span-2 flex items-center justify-between">
        <span aria-hidden="true" className="text-xs font-semibold uppercase tracking-[0.12em] text-fg">{t.period}</span>
        {isCustom && (
          <button
            type="button"
            onClick={() => onChange(min, max)}
            className="animate-fade-in cursor-pointer rounded-sm text-xs text-muted underline-offset-2 transition-colors hover:text-fg hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t.resetPeriod}
          </button>
        )}
      </div>
      <label className="text-xs text-muted">
        {t.from}
        <input type="date" className={input} aria-invalid={invalid}
               min={min} max={end && end <= max ? end : max} value={start}
               onChange={(e) => onChange(e.target.value, end)} />
      </label>
      <label className="text-xs text-muted">
        {t.to}
        <input type="date" className={input} aria-invalid={invalid}
               min={start && start >= min ? start : min} max={max} value={end}
               onChange={(e) => onChange(start, e.target.value)} />
      </label>
      {invalid && (
        <p role="alert" className="animate-fade-in col-span-2 text-xs text-[var(--danger)]">
          {t.invalidDate}
        </p>
      )}
    </fieldset>
  );
}