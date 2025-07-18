import type { Metadata } from "next";
import "@/app/fonts.css";
import "./globals.css";
import Nav from "@/components/Nav";
import ExchangeCTA from "@/app/(marketing)/components/ExchangeCTA";

export const metadata: Metadata = {
  title: "FedMCP – Secure AI for GovCloud",
  description:
    "Open‑source Model Context Protocol extensions that bring NIST‑aligned audit, PII safeguards & JWS signing to LLM agents for FedRAMP / DoD IL workloads.",
  metadataBase: new URL("https://fedmcp.org"),
};

/** Viewport settings (Next.js 15 requires separate export) */
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen flex flex-col bg-white text-slate-900 dark:bg-neutral-950 dark:text-slate-200 m-0"
      >
        {/* sticky top navigation */}
        <Nav />

        {/* page content */}
        <main className="flex-1 w-full">
          {children}
          {/* Marketing call‑to‑action */}
          <ExchangeCTA />
        </main>
      </body>
    </html>
  );
}
