"use client";

import Link from "next/link";

import BrasaLogo from "@/components/BrasaLogo";
import SettingsMenu from "@/components/SettingsMenu";
import { getCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export default function Header({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <BrasaLogo size={30} />
          <span className="font-sans text-2xl font-semibold leading-none tracking-tight text-fg">brasa</span>
        </Link>
        <p className="hidden text-sm text-muted sm:block">
          {t.tagline}
        </p>
      </div>
      <nav aria-label={t.mainNav} className="flex items-center gap-4">
        <Link
          href="/how-it-works"
          className="rounded-sm text-sm font-medium text-fg/85 underline underline-offset-4 transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t.howItWorks}
        </Link>
        <SettingsMenu locale={locale} />
      </nav>
    </header>
  );
}