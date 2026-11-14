import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col lg:h-dvh">
      <Header />

      <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <section
          aria-label="Map of the Brazilian Pantanal"
          className="h-[50vh] bg-foreground/5 lg:h-auto lg:w-3/5"
        >
          {/* issue 4: map */}
        </section>

        <aside
          aria-label="Analysis panel"
          className="p-4 lg:w-2/5 lg:overflow-y-auto"
        >
          <p>Draw an area to see its fire history</p>
          {/* issues 6 to 14: period, indicators, charts... */}
        </aside>
      </main>

      <Footer />
    </div>
  );
}