// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import { useEffect, useRef, useState } from "react";

import { downloadCsv } from "@/lib/api";
import { getCopy } from "@/lib/i18n";
import type { AreaQuery, Locale } from "@/lib/types";

export default function ExportButton({ query, locale }: { query: AreaQuery; locale: Locale }) {
  const t = getCopy(locale);
  const [busy, setBusy] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function onClick() {
    setBusy(true);
    setDownloaded(false);
    setError(null);
    try {
      await downloadCsv(query);
      setDownloaded(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setDownloaded(false), 2500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-live="polite"
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-text transition-all duration-150 hover:opacity-90 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60"
      >
        {busy && (
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current"
          />
        )}
        {busy ? t.preparing : downloaded ? `✓ ${t.downloaded}` : t.export}
      </button>
      <p className="mt-1 text-xs text-muted">
        {t.exportHelp}
      </p>
      {error && <p role="alert" className="animate-fade-in mt-1 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}