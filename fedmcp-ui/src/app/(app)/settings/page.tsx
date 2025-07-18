

/* Exchange · Settings page
   Route: /settings  (wrapped by internal (app) layout)
*/

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings – FedMCP Exchange",
  description:
    "Manage profile details, team access, and workspace billing preferences.",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-700">
          Update your personal profile, invite teammates, or adjust billing
          options.
        </p>
      </section>

      {/* Profile settings (placeholder form) */}
      <section className="rounded border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
        <p className="mt-2 text-slate-600">Coming soon: name, email, MFA.</p>
      </section>

      {/* Team settings */}
      <section className="rounded border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Team</h2>
        <p className="mt-2 text-slate-600">
          Coming soon: invite collaborators and manage roles.
        </p>
      </section>

      {/* Billing settings */}
      <section className="rounded border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900">Billing</h2>
        <p className="mt-2 text-slate-600">
          Coming soon: payment methods, usage metrics, and plan upgrades.
        </p>
      </section>
    </div>
  );
}