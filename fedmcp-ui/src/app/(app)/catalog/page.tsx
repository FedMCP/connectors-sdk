/* Exchange · Catalog page
   Route: /catalog  (wrapped by internal (app) layout)
*/

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catalog – FedMCP Exchange",
  description:
    "Browse reusable compliance artifacts and auditable AI building‑blocks.",
};

export default function CatalogPage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Catalog</h1>
        <p className="mt-2 text-slate-700">
          Explore community‑contributed packages vetted for FedRAMP and DoD IL
          workloads.
        </p>
      </section>

      {/* Artifact categories (placeholder) */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: "SSP Fragments",
            desc: "Pre‑auth system security plan sections you can reuse.",
            href: "#ssp-fragments",
          },
          {
            name: "POA&M Templates",
            desc: "Standardized plan‑of‑action & milestone docs.",
            href: "#poam-templates",
          },
          {
            name: "Agent Recipes",
            desc: "JWS‑signed prompts and orchestration configs.",
            href: "#agent-recipes",
          },
          {
            name: "Baseline Modules",
            desc: "Infrastructure as Code snippets with STIG hardening.",
            href: "#baseline-modules",
          },
          {
            name: "Reference Architectures",
            desc: "End‑to‑end blueprints for IL‑compliant deployments.",
            href: "#reference-arch",
          },
          {
            name: "Audit Scripts",
            desc: "Automated controls verification for CI pipelines.",
            href: "#audit-scripts",
          },
        ].map(({ name, desc, href }) => (
          <Link
            key={name}
            href={href}
            className="rounded border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-slate-900">{name}</h2>
            <p className="mt-2 text-slate-600">{desc}</p>
          </Link>
        ))}
      </section>

      {/* Placeholder sections for each category */}
      <section id="ssp-fragments" className="hidden" />
      <section id="poam-templates" className="hidden" />
      <section id="agent-recipes" className="hidden" />
      <section id="baseline-modules" className="hidden" />
      <section id="reference-arch" className="hidden" />
      <section id="audit-scripts" className="hidden" />
    </div>
  );
}