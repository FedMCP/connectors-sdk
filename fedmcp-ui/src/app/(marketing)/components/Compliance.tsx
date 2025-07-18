/**
 * Compliance section – maps FedMCP features to NIST 800‑53 controls.
 *
 * Rendered on the marketing one‑pager.
 */
'use client';

import React from 'react';

const rows: { feature: string; purpose: string; controls: string }[] = [
  {
    feature: 'audit_log',
    purpose:
      'Immutable log of agent/tool calls, timestamp, request & response hashes',
    controls: 'AU‑2, AU‑3, AU‑12, SI‑11',
  },
  {
    feature: 'signed_response (JWS)',
    purpose:
      'Cryptographic integrity & non‑repudiation of tool output (detached JWS)',
    controls: 'AU‑10, SC‑12, PE‑20',
  },
  {
    feature: 'pii_tag',
    purpose: 'Flags payloads containing PII/PHI/FISMA; drives redaction',
    controls: 'AC‑19, SI‑12, SC‑28',
  },
  {
    feature: 'impact_level',
    purpose:
      'Marks IL2–IL6 sensitivity for cross‑domain enforcement & hosting',
    controls: 'AC‑4, SC‑8, SC‑51',
  },
  {
    feature: 'tool_perms',
    purpose: 'Least‑privilege scope list for each tool action',
    controls: 'AC‑2, AC‑6, IA‑3',
  },
  {
    feature: 'controls',
    purpose: 'Explicit list of NIST controls asserted by the response',
    controls: 'PL‑2, RA‑3',
  },
  {
    feature: 'spec_version',
    purpose: 'Explicit schema version driving validation & drift detection',
    controls: 'CM‑3, CM‑9',
  },
  {
    feature: 'issuer',
    purpose: 'URI identifying the sending tenant / system',
    controls: 'IA‑2, IA‑5',
  },
  {
    feature: 'request_id',
    purpose: 'Globally‑unique UUID for full traceability across services',
    controls: 'AU‑6, SI‑11',
  },
  {
    feature: 'timestamp',
    purpose: 'RFC 3339 timestamp of the request or event',
    controls: 'AU‑8',
  },
  {
    feature: 'data_tags',
    purpose: 'Fine‑grained content markings (PII, PHI, PCI, etc.)',
    controls: 'AC‑16, SC‑28, SI‑12',
  },
  {
    feature: 'is_signed',
    purpose: 'Boolean hint indicating presence of a JWS signature',
    controls: 'AU‑10, SC‑12',
  },
  {
    feature: 'jws',
    purpose: 'Detached JSON Web Signature over the response payload',
    controls: 'AU‑10, SC‑12, SC‑17',
  },
  {
    feature: 'impact_justification',
    purpose:
      'Human rationale supporting the selected impact_level decision',
    controls: 'RA‑3, PL‑2',
  },
];

export default function Compliance() {
  return (
    <section
      id="compliance"
      className="bg-gradient-to-b from-gray-50 via-white to-white py-24 sm:py-32"
    >
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Built for FedRAMP&nbsp;&amp; DoD IL 5
        </h2>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Every envelope field maps directly to NIST&nbsp;800‑53 Rev&nbsp;5
          controls, simplifying your SSP and ATO process.
        </p>

        <div className="mt-16 overflow-x-auto rounded-lg shadow ring-1 ring-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Field / Feature
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Purpose
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  800‑53 Controls
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.map((row) => (
                <tr key={row.feature}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    <code>{row.feature}</code>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.purpose}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.controls.split(', ').map((c) => (
                      <span
                        key={c}
                        className="mr-1 inline-block rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600"
                      >
                        {c}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <hr className="mx-auto mt-24 h-px w-40 border-0 bg-indigo-100" />
    </section>
  );
}