import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { Locale } from "@/lib/types";

export default function Home() {
  return <LocalizedHome locale="en" />;
}

export function LocalizedHome({ locale }: { locale: Locale }) {
  return (
    <div lang={locale} className="flex flex-1 flex-col lg:h-dvh">
      <Header locale={locale} />
      <Dashboard locale={locale} />
      <Footer locale={locale} />
    </div>
  );
}
