import type { Locale } from "@/lib/types";
import { getCopy } from "@/lib/i18n";

export default function Header({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-foreground/10 px-4 py-3">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-green">brasa</span>
        <p className="text-sm text-foreground/80">
          {t.tagline}
        </p>
      </div>
      <a href={locale === "en" ? "/pt-br" : "/en"} className="text-sm font-medium underline">
        {locale === "en" ? "Português (Brasil)" : "English"}
      </a>
    </header>
  );
}