// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import { useEffect, useRef, useState } from "react";

import { downloadCsv } from "@/lib/api";
import type { AreaQuery } from "@/lib/types";

export default function ExportButton({ query }: { query: AreaQuery }) {
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
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[#1C1A17] px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-black active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4501C] disabled:cursor-wait disabled:opacity-60"
      >
        {busy && (
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
          />
        )}
        {busy ? "Preparing CSV…" : downloaded ? "✓ CSV downloaded" : "Download hotspots (CSV)"}
      </button>
      <p className="mt-1 text-xs text-stone-600">
        Original NASA FIRMS detections in the area and period, with the harmonization factor.
      </p>
      {error && <p role="alert" className="animate-fade-in mt-1 text-xs text-[#B4441B]">{error}</p>}
    </div>
  );
}
