

/* src/app/(marketing)/exchange/page.tsx */
import Link from "next/link";

/**
 * Metadata for the /exchange route
 * - Adjust title/description for SEO as needed
 */
export const metadata = {
  title: "FedMCP Exchange – Reusable Compliance & AI Building‑Blocks",
  description:
    "Learn how the FedMCP Exchange accelerates FedRAMP workflows with shareable compliance artifacts, signed agent recipes, and turnkey deployment.",
};

export default function ExchangeMarketingPage() {
  return (
    <div className="bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100">
          FedMCP&nbsp;Exchange
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-700 dark:text-slate-300">
          Discover, share, and deploy <span className="font-semibold">auditable AI components</span> and{" "}
          <span className="font-semibold">compliance artifacts</span>—all vetted for FedRAMP and DoD IL workloads.
        </p>

        {/* Primary actions */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/exchange/login" /* TODO: replace with real auth route */
            className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-blue-600 px-6 py-3 text-lg font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24 grid gap-12 md:grid-cols-3">
        {[
          {
            title: "Reusable Artifacts",
            desc: "Import package‑signed SSP fragments, POA&Ms, and baselines instead of reinventing them.",
          },
          {
            title: "Auditable Agents",
            desc: "Deploy JWS‑signed agent recipes; every inference is traced & tamper‑evident.",
          },
          {
            title: "One‑Click Deploy",
            desc: "Spin up reference stacks in GovCloud or IL‑compliant regions—no glue code needed.",
          },
        ].map(({ title, desc }) => (
          <div key={title}>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{desc}</p>
          </div>
        ))}
      </section>

      {/* RootLayout will automatically append the global <ExchangeCTA /> here */}
    </div>
  );
}