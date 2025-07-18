// components/Nav.tsx
'use client';
import React from 'react';
import Link from 'next/link';

export default function Nav() {
  const items: [string, string][] = [
    ['What is FedMCP', '#features'],
    ['Compliance',     '#compliance'],
    ['Exchange',       '/exchange'],
    ['Quick Start',    '#quick-start'],
    ['Contribute',     '#contribute'],
  ];
  return (
    <nav className="fixed inset-x-0 top-0 z-50 backdrop-blur bg-white/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <span className="font-bold">FedMCP</span>
        <ul className="flex gap-6 text-sm">
          {items.map(([label, href]) => (
            <li key={href}>
              <Link href={href} className="hover:text-indigo-600">
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="https://github.com/FedMCP"
              className="rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
          </li>
          <li>
            <Link
              href="/exchange/login" /* TODO: adjust when auth route is finalized */
              className="rounded border border-indigo-600 px-3 py-1 text-indigo-600 hover:bg-indigo-600 hover:text-white"
            >
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}