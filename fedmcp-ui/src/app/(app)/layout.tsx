

/* Internal App Layout – wraps /dashboard, /catalog, etc. */
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

/* Simple side‑nav config */
const links: { label: string; href: string }[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Overview", href: "/overview" },
  { label: "Catalog", href: "/catalog" },
  { label: "Connectors", href: "/connector" },
  { label: "Settings", href: "/settings" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-white">
      {/* Side navigation */}
      <aside className="w-56 border-r border-slate-200 p-4 space-y-2">
        <Link href="/">
          <Image
            src="/fedmcp-logo.png"
            alt="FedMCP logo"
            width={120}
            height={28}
            priority
            className="mb-6"
          />
        </Link>
        {links.map(({ label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`block rounded px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}