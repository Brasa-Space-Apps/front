import type { Locale } from "@/lib/types";
import { getCopy } from "@/lib/i18n";
import { formatDate } from "@/lib/format";

export default function Footer({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  return (
    <footer className="border-t border-foreground/10 px-4 py-3 text-xs text-foreground/80">
      {t.dataUpTo} {formatDate("2025-12-31", locale)} · {t.unit} · {t.source}:
      NASA FIRMS (MODIS Aqua and VIIRS S-NPP), {t.harmonized}
    </footer>
  );
}