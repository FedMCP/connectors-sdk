/* Exchange · Overview page
   Route: /overview (wrapped by internal (app) layout)
*/

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview – FedMCP Exchange",
  description:
    "Project status and onboarding checklist for your FedMCP Exchange workspace.",
};

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Intro */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
        <p className="mt-2 text-slate-700">
          Welcome! Here’s a snapshot of your workspace and next‑step guidance.
        </p>
      </section>

      {/* Getting‑started checklist (static placeholder) */}
      <section className="grid gap-6 md:grid-cols-2">
        {[
          { step: "Connect your GovCloud account", done: false },
          { step: "Import an SSP fragment", done: false },
          { step: "Deploy a reference agent", done: false },
          { step: "Invite a teammate", done: false },
        ].map(({ step, done }) => (
          <div
            key={step}
            className={`rounded border p-4 ${
              done
                ? "border-green-500 bg-green-50 text-green-800"
                : "border-slate-200"
            }`}
          >
            <p className="font-medium">{step}</p>
            <p className="text-sm mt-1">
              {done ? "Completed" : "Pending"}
            </p>
          </div>
        ))}
      </section>

      {/* Recent activity placeholder */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          Recent Activity
        </h2>
        <p className="mt-2 text-slate-600">
          No activity yet—complete a checklist item to see events here.
        </p>
      </section>
    </div>
  );
}
