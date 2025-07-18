/* Exchange · Connectors page
   Route: /connector  (wrapped by internal (app) layout)
*/

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Connectors – FedMCP Exchange",
  description:
    "Configure and manage environment connectors for GovCloud, DoD IL regions, and on‑prem deployments.",
};

export default function ConnectorsPage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Connectors</h1>
        <p className="mt-2 text-slate-700">
          Link your infrastructure so FedMCP Exchange can deploy and audit
          resources in your target environments.
        </p>
      </section>

      {/* Connector grid (placeholder) */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            name: "AWS GovCloud",
            desc: "Deploy artifacts directly into your GovCloud account.",
            href: "#aws-govcloud",
          },
          {
            name: "DoD IL Zone",
            desc: "Run workloads in IL‑4 or IL‑5 regions with STIG baselines.",
            href: "#dod-il",
          },
          {
            name: "On‑Prem",
            desc: "Self‑host FedMCP agents inside your secure enclave.",
            href: "#on-prem",
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

      {/* Placeholder for future connection details */}
      <section id="aws-govcloud" className="hidden">
        {/* TODO: Build out GovCloud connection form */}
      </section>
    </div>
  );
}
