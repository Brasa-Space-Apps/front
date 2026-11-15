// AI-assisted: generated with Claude (Anthropic) and reviewed by the Brasa team.
"use client";

import { useState } from "react";

import { downloadCsv } from "@/lib/api";
import type { AreaQuery } from "@/lib/types";
import { getCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export default function ExportButton({ query, locale }: { query: AreaQuery; locale: Locale }) {
  const t = getCopy(locale);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setError(null);
    try {
      await downloadCsv(query);
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
        className="w-full rounded-md bg-[#1C1A17] px-4 py-2.5 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
      >
        {busy ? t.preparing : t.export}
      </button>
      <p className="mt-1 text-xs text-stone-600">
        {t.exportHelp}
      </p>
      {error && <p role="alert" className="mt-1 text-xs text-[#B4441B]">{error}</p>}
    </div>
  );
}
