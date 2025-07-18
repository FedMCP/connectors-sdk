

'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface Feature {
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    title: 'PII & PHI Scanning',
    body: 'Inline Presidio‑powered entity detection lets agents redact sensitive data before it leaves the boundary.'
  },
  {
    title: 'Detached JWS Signatures',
    body: 'Every tool response can be signed with AWS KMS (ES256) to guarantee integrity and non‑repudiation.'
  },
  {
    title: 'Impact‑Level Tags',
    body: 'IL2‑IL6 labels travel with the payload so cross‑domain guards can enforce DoD data handling rules.'
  },
  {
    title: 'JSON‑Schema Validation',
    body: 'Open, versioned schemas keep contracts stable and enable offline governance reviews.'
  },
  {
    title: 'CloudWatch Audit Sink',
    body: 'Structured JSONL logs stream to an immutable, Object‑Lock protected log group.'
  },
  {
    title: 'Plug‑in Connectors',
    body: 'Typer‑based SDK scaffolds new connectors in seconds and publishes them to FedMCP Exchange.'
  }
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Built‑in Superpowers
      </h2>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
        FedMCP bakes critical compliance and security features right into the
        request envelope so your LLM agents don’t have to reinvent them.
      </p>

      <ul
        role="list"
        className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((f) => (
          <li key={f.title} className="flex gap-x-4">
            <CheckCircleIcon
              className="mt-1 h-6 w-6 shrink-0 text-indigo-600"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {f.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-600">{f.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}