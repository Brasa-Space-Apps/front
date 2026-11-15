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
      <DocumentLanguage locale={locale} />
      <div
        lang={locale}
        className="flex min-h-dvh flex-1 flex-col lg:h-dvh lg:min-h-0 lg:flex-none lg:overflow-hidden"
      >
        <Header locale={locale} />
        <Dashboard locale={locale} />
      </div>
    </>
  );
}