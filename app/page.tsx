import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col lg:h-dvh lg:flex-none lg:overflow-hidden">
      <Header />
      <Dashboard />
      <Footer />
    </div>
  );
}
