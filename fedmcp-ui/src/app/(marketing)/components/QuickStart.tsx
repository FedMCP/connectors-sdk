'use client';

import React from 'react';

const cloneCmd = `git clone https://github.com/FedMCP/fedmcp-reference.git
cd fedmcp-reference
make run   # starts the FastAPI dev server on :8080
`;
/**
 * QuickStart – installation snippet & links
 *
 * Renders a highlighted code‑block plus buttons that jump to the spec &
 * live Swagger docs.  Section id is used by the in‑page navbar anchor.
 */
export default function QuickStart() {
  return (
    <section
      id="quick-start"
      className="relative isolate overflow-hidden bg-slate-50 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* decorative gradient blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-teal-500/20 blur-xl"
        />

        <h2 className="text-center text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Quick&nbsp;Start
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-center text-gray-600">
          Spin up the reference implementation locally in seconds.
        </p>

        <pre className="mt-10 whitespace-pre rounded-xl bg-[#0d1117] p-6 text-sm leading-relaxed text-gray-100 ring-1 ring-inset ring-gray-800">
{cloneCmd}
        </pre>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="https://github.com/FedMCP/fedmcp-reference"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/30 transition hover:translate-y-px hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            View&nbsp;Repo
          </a>
          <a
            href="https://fedmcp.org/spec/fedmcp.schema.json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-indigo-600 px-6 py-3 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Download&nbsp;Schema
          </a>
        </div>
      </div>
    </section>
  );
}