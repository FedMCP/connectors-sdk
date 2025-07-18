// components/Nav.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from "next/navigation";

export default function Nav() {
  const items: [string, string][] = [
    ['What is FedMCP', '#features'],
    ['Compliance',     '#compliance'],
    ['Exchange',       '/dashboard'],
    ['Quick Start',    '#quick-start'],
    ['Contribute',     '#contribute'],
  ];

  const pathname = usePathname();
  // Hide marketing nav on internal app routes
  const hideOnAppRoutes = ["/dashboard", "/overview", "/catalog", "/connector", "/settings"].some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (hideOnAppRoutes) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 backdrop-blur bg-white/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/">
          <Image
            src="/fedmcp-logo.png"
            alt="FedMCP logo"
            width={120}
            height={28}
            priority
            className="h-7 w-auto"
          />
        </Link>
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
              href="/dashboard" /* temporary direct-entry until auth */
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