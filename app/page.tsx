import Dashboard from "@/components/Dashboard";
import DocumentLanguage from "@/components/DocumentLanguage";
import Header from "@/components/Header";
import RootLocaleRedirect from "@/components/RootLocaleRedirect";
import type { Locale } from "@/lib/types";

export default function Home() {
  return <><RootLocaleRedirect /><LocalizedHome locale="en" /></>;
}

export function LocalizedHome({ locale }: { locale: Locale }) {
  return (
    <>
      <DocumentLanguage locale={locale === "pt-BR" ? "pt-BR" : locale} />
      <div lang={locale} className="flex min-h-dvh flex-1 flex-col">
        <Header locale={locale} />
        <Dashboard locale={locale} />
      </div>
    </>
  );
}
