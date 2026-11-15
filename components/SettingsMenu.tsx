"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { getCopy } from "@/lib/i18n";
import type { ColorVision, Locale, Theme } from "@/lib/types";

const languagePaths: Record<Locale, string> = {
  en: "/",
  "pt-BR": "/pt-br",
  es: "/es",
};

function subscribe(key: string, onChange: () => void) {
  const handler = (event: Event) => {
    if (event.type === key || event.type === "storage") onChange();
  };
  window.addEventListener(key, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(key, handler);
    window.removeEventListener("storage", handler);
  };
}

function readTheme(): Theme {
  return localStorage.getItem("brasa-theme") === "dark" ? "dark" : "light";
}

function readVision(): ColorVision {
  const value = localStorage.getItem("brasa-color-vision");
  return value === "tritanopia" || value === "protanopia" || value === "deuteranopia" ? value : "normal";
}

export default function SettingsMenu({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const theme = useSyncExternalStore(
    (onChange) => subscribe("brasa-theme", onChange),
    () => readTheme(),
    () => "light",
  );
  const vision = useSyncExternalStore(
    (onChange) => subscribe("brasa-color-vision", onChange),
    () => readVision(),
    () => "normal",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-color-vision", vision);
  }, [theme, vision]);

  function updateTheme(next: Theme) {
    localStorage.setItem("brasa-theme", next);
    document.documentElement.setAttribute("data-theme", next);
    window.dispatchEvent(new Event("brasa-theme"));
  }

  function updateVision(next: ColorVision) {
    localStorage.setItem("brasa-color-vision", next);
    document.documentElement.setAttribute("data-color-vision", next);
    window.dispatchEvent(new Event("brasa-color-vision"));
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t.settings}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-fg hover:bg-surface-2 focus:outline-2 focus:outline-accent"
      >
        <span aria-hidden="true">⚙</span> {t.settings}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-lg border border-line bg-surface p-4">
          <label className="block text-sm font-semibold" htmlFor="language-select">{t.language}</label>
          <select
            id="language-select"
            value={locale}
            onChange={(event) => {
              const nextLocale = event.target.value as Locale;
              localStorage.setItem("brasa-locale", nextLocale);
              router.replace(languagePaths[nextLocale]);
            }}
            className="mt-1 w-full rounded-md border border-line bg-surface px-2 py-2 text-sm text-fg"
          >
            <option value="en">English</option>
            <option value="pt-BR">Português</option>
            <option value="es">Español</option>
          </select>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold">{t.theme}</legend>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(["light", "dark"] as const).map((value) => (
                <label key={value} className="flex items-center gap-2 rounded-md border border-line px-2 py-2 text-sm">
                  <input type="radio" name="theme" checked={theme === value} onChange={() => updateTheme(value)} className="accent-accent" />
                  {value === "light" ? t.light : t.dark}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold">{t.colorVision}</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {([
                ["normal", t.normalVision, "N"],
                ["tritanopia", t.tritanopia, "T"],
                ["protanopia", t.protanopia, "P"],
                ["deuteranopia", t.deuteranopia, "D"],
              ] as const).map(([value, label, mark]) => (
                <label
                  key={value}
                  className={`flex min-w-0 cursor-pointer items-center gap-1.5 rounded-md border px-2 py-2 text-xs transition focus-within:outline-2 focus-within:outline-orange focus-within:outline-offset-1 ${
                    vision === value
                      ? "border-accent bg-accent/10 font-semibold"
                      : "border-line hover:border-fg hover:bg-surface-2"
                  }`}
                >
                  <input
                    type="radio"
                    name="color-vision"
                    value={value}
                    checked={vision === value}
                    onChange={() => updateVision(value)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.7rem] font-semibold ${
                      vision === value ? "bg-accent text-accent-text" : "bg-surface-2 text-fg"
                    }`}
                  >
                    {mark}
                  </span>
                  <span className="min-w-0 truncate">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
