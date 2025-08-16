"use client";

import { useApp } from "@/lib/store";
import { Pill } from "@/components/ui";

export default function SuperPage() {
  const { users, trips, payments, payAllDrivers, addPayment } = useApp();
  const drivers = users.filter(u => u.role === "driver");

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="card p-5">
        <h2 className="text-slate-900 text-xl font-semibold mb-3">One‑Click Payouts</h2>
        <div className="flex gap-2">
          <input id="bulk" type="number" className="rounded border border-slate-300 px-3 py-2" placeholder="Amount per driver" />
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={()=>{
            // @ts-ignore
            const amt = Number((document.getElementById("bulk") as HTMLInputElement).value||0);
            if (amt>0) payAllDrivers(amt);
          }}>Pay All Approved</button>
        </div>
        <p className="text-xs text-slate-600 mt-2">Pays all drivers with at least one approved trip.</p>
      </section>

      <section className="card p-5">
        <h2 className="text-slate-900 text-xl font-semibold mb-3">Driver Balances</h2>
        <table className="w-full text-sm text-slate-800">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Driver</th>
              <th>Balance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {drivers.map(d => (
            <tr key={d.id} className="border-b last:border-0">
              <td className="py-2">{d.name}</td>
              <td>₹{(d.balance ?? 0).toFixed(2)}</td>
              <td>
                <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={()=>addPayment(d.id, Math.max(0, d.balance ?? 0), undefined, "super")}>
                  Pay Balance
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </section>

      <section className="card p-5 lg:col-span-2">
        <h2 className="text-slate-900 text-xl font-semibold mb-3">Recent Payments</h2>
        <table className="w-full text-sm text-slate-800">
          <thead><tr className="text-left border-b">
            <th className="py-2">When</th><th>Driver</th><th>Amount</th><th>By</th><th>Proof</th>
          </tr></thead>
          <tbody>
          {payments.slice(-10).reverse().map(p => (
            <tr key={p.id} className="border-b last:border-0">
              <td className="py-2">{new Date(p.createdAt).toLocaleString()}</td>
              <td>{users.find(u => u.id === p.userId)?.name ?? "—"}</td>
              <td>₹{p.amount}</td>
              <td><Pill color={p.by==="super"?"blue":"slate"}>{p.by}</Pill></td>
              <td>{p.screenshotUrl ? <a className="text-blue-700 underline" href={p.screenshotUrl} target="_blank">View</a> : "—"}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
