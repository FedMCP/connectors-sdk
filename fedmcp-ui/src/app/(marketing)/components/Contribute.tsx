'use client';

import React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { getStars } from '../../lib/github';

export default function Contribute() {
  // `use()` lets us await a Promise inside a Client Component
  const stars = use(getStars()) as number;

  return (
    <section id="contribute" className="py-24 bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Contribute&nbsp;<span className="text-indigo-600">to FedMCP</span>
        </h2>
        <p className="mt-4 text-lg leading-7 text-slate-700">
          FedMCP is 100% open‑source and needs your expertise&mdash;from security 
          hardening to new connector templates. Open an issue, file a pull request, 
          or join the discussion on Slack.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="https://github.com/FedMCP"
            className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus-visible:ring focus-visible:ring-indigo-300"
          >
            ★ Star&nbsp;({stars})
          </Link>

          <Link
            href="https://github.com/FedMCP/fedmcp-spec/issues"
            className="inline-flex items-center rounded-md border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-300"
          >
            View&nbsp;Open&nbsp;Issues
          </Link>
        </div>
      </div>
    </section>
  );
}