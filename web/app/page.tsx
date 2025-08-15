"use client";

import { ModeToggle } from "@/components/molecules/toggle-theme";
import { useApp } from "@/lib/store";
import { companies as seedCompanies, users as seedUsers } from "@/lib/seed";
import Link from "next/link";
import { clsx } from "clsx";

export default function Home() {
  const { currentUserId, setCurrentUser, companies, users } = useApp();

  const user = users.find((u) => u.id === currentUserId);
  const defaultCompanyId = companies.find((c) =>
    c.defaultForUserIds.includes(user?.id ?? "")
  )?.id;

  return (
    <>
      <div>
        <ModeToggle />
      </div>
      <main className="grid md:grid-cols-2 gap-6">
        <section className="card p-6">
          <h2 className="text-slate-900 text-xl font-semibold mb-2">
            Sign in as
          </h2>
          <div className="flex flex-col gap-2">
            {seedUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => setCurrentUser(u.id)}
                className={clsx(
                  "px-4 py-2 rounded border text-left",
                  u.id === currentUserId
                    ? "bg-blue-50 border-blue-300"
                    : "bg-white border-slate-200"
                )}
              >
                <div className="font-medium text-slate-900">{u.name}</div>
                <div className="text-xs text-slate-500">
                  {u.role.toUpperCase()}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <Link
              href="/dashboard"
              className="inline-block mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>

          {user && (
            <p className="text-xs text-slate-700 mt-3">
              Default Company:{" "}
              <b>
                {companies.find((c) => c.id === defaultCompanyId)?.name ?? "—"}
              </b>
            </p>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-slate-900 text-xl font-semibold mb-4">
            Prototype Notes
          </h2>
          <ul className="list-disc pl-6 text-slate-700 space-y-1">
            <li>Color-coded big buttons for drivers (accessibility).</li>
            <li>Trip start/end with gate pass photo + timestamp.</li>
            <li>Diesel bill upload & mileage calc.</li>
            <li>Admin approvals; virtual amount visible after approval.</li>
            <li>Vehicle docs upload + expiry badges/reminders.</li>
            <li>GPS trail mocked on-driver phone; shows last 10 pings.</li>
            <li>Excel (XLSX) export for Admin.</li>
            <li>Super user bulk/one-click payments.</li>
          </ul>
        </section>
      </main>
    </>
  );
}
