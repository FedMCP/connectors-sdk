

"use client";

import Link from "next/link";
import React from "react";

/**
 * Top‑of‑page hero section.
 *
 * Renders the headline, sub‑copy, and the two primary calls‑to‑action that
 * anchor the FedMCP landing page.  Tailwind CSS utility classes keep the
 * markup terse while allowing dark‑system themes to look good.
 */
export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white pb-24 pt-32 sm:pt-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Secure&nbsp;AI&nbsp;— Ready&nbsp;for&nbsp;FedRAMP
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            FedMCP extends Anthropic’s Model&nbsp;Context&nbsp;Protocol with NIST&nbsp;800‑53
            control hooks, PII protection, and auditable JWS signatures.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="https://github.com/FedMCP"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              View on GitHub
            </Link>
            <a
              href="#quick-start"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600"
            >
              Quick&nbsp;start <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}