import Hero from "@/app/(marketing)/components/Hero";
import Features from "@/app/(marketing)/components/Features";
import Compliance from "@/app/(marketing)/components/Compliance";
import QuickStart from "@/app/(marketing)/components/QuickStart";
import Contribute from "@/app/(marketing)/components/Contribute";
import Footer from "@/components/Footer";

/**
 * Landing‑page composition – one section per component.
 * Each top‑level component includes its own <section id="…"> tag so that
 * the sticky navbar links can smooth‑scroll to the correct anchor.
 */
export default function Home() {
  return (
    <main className="flex flex-col gap-24 scroll-smooth px-4 md:px-8 lg:px-12">
      {/* Hero banner */}
      <Hero />

      {/* Feature grid */}
      <Features />

      {/* Compliance call‑outs */}
      <Compliance />

      {/* Quick‑start snippet */}
      <QuickStart />

      {/* Community & contribution */}
      <Contribute />

      {/* Site footer */}
      <Footer />
    </main>
  );
}
