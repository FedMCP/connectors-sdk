

/* Exchange Dashboard – routes to /exchange/dashboard */

import Link from "next/link";

/**
 * Metadata for /exchange/dashboard
 * Adjust as needed once analytics or SEO is in place.
 */
export const metadata = {
  title: "Exchange Dashboard – FedMCP",
  description: "Quick view of your compliance artifacts, connectors, and account settings.",
};

const cards: { title: string; href: string; desc: string }[] = [
  {
    title: "Overview",
    href: "/exchange/overview",
    desc: "Project status, recent activity, and helpful tips.",
  },
  {
    title: "Catalog",
    href: "/exchange/catalog",
    desc: "Browse reusable compliance artifacts & AI building‑blocks.",
  },
  {
    title: "Connectors",
    href: "/exchange/connector",
    desc: "Manage GovCloud, IL‑compliant, and on‑prem connectors.",
  },
  {
    title: "Settings",
    href: "/exchange/settings",
    desc: "Profile, team access, and billing preferences.",
  },
];

export default function ExchangeDashboard() {
  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen">
      <header className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="mt-2 text-slate-700 dark:text-slate-300">
          Welcome to FedMCP&nbsp;Exchange. Jump into a section below to get started.
        </p>
      </header>

      {/* Quick‑link cards */}
      <section className="mx-auto max-w-6xl px-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4 pb-24">
        {cards.map(({ title, href, desc }) => (
          <Link
            key={title}
            href={href}
            className="rounded-lg border border-slate-200 dark:border-neutral-800 p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}