// src/app/exchange/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Small wrapper that decorates <Link> with “selected” styles
 * based on the current pathname.
 */
function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "block rounded px-2 py-1 text-sm transition-colors",
        "hover:bg-gray-100 hover:text-indigo-600",
        "dark:hover:bg-gray-800",
        isActive
          ? "bg-gray-100 font-semibold text-indigo-600 dark:bg-gray-800"
          : "text-gray-700 dark:text-gray-300",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function ExchangeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* sidebar */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-8 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          FedMCP&nbsp;Exchange
        </h2>

        <nav className="space-y-1">
          <NavLink href="/exchange/overview">Overview</NavLink>
          <NavLink href="/exchange/catalog">Catalog</NavLink>
          <NavLink href="/exchange/connector">My&nbsp;Connectors</NavLink>
          <NavLink href="/exchange/settings">Settings</NavLink>
        </nav>
      </aside>

      {/* main content */}
      <main className="flex-1 bg-gray-50 p-8 dark:bg-gray-950">{children}</main>
    </div>
  );
}