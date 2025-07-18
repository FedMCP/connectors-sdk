

"use client";

import Link from "next/link";

export default function ExchangeCTA() {
  return (
    <section
      id="exchange-cta"
      className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4 md:px-8"
    >
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to explore the FedMCP&nbsp;Exchange?
        </h2>
        <p className="text-lg md:text-xl">
          Browse reusable compliance artifacts, deploy auditable AI&nbsp;building‑blocks, and accelerate your secure
          SaaS timeline.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/exchange"
            className="rounded-md bg-white/10 hover:bg-white/20 transition-colors px-6 py-3 text-lg font-semibold"
          >
            Browse Exchange
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-white text-blue-700 hover:bg-gray-100 transition-colors px-6 py-3 text-lg font-semibold"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </section>
  );
}