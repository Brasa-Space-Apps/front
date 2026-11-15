"use client";

import type { Locale } from "@/lib/types";
import { getCopy } from "@/lib/i18n";
import SettingsMenu from "@/components/SettingsMenu";

export default function Header({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-green">brasa</span>
        <p className="text-sm text-muted">
          {t.tagline}
        </p>
      </div>
      <SettingsMenu locale={locale} />
    </header>
  );
}