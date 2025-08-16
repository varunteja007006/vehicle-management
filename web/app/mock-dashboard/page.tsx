"use client";

import { useApp } from "@/lib/store";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function DashboardRoot() {
  const { currentUserId, users } = useApp();
  if (!currentUserId) return redirect("/");
  const user = users.find(u => u.id === currentUserId)!;

  const map: Record<string, string> = {
    driver: "/mock-dashboard/driver",
    admin: "/mock-dashboard/admin",
    super: "/mock-dashboard/super",
  };

  return (
    <div className="card p-6">
      <h2 className="text-slate-900 text-xl font-semibold">Welcome, {user.name}</h2>
      <p className="text-slate-700">Role: {user.role.toUpperCase()}</p>
      <Link className="inline-block mt-4 px-4 py-2 rounded bg-blue-600 text-white" href={map[user.role]}>
        Open {user.role} workspace
      </Link>
    </div>
  );
}
