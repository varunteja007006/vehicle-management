"use client";

import { useApp } from "@/lib/store";
import { Pill } from "@/components/ui";
import { utils, writeFileXLSX } from "xlsx";
import { format } from "date-fns";
import { useState } from "react";

export default function AdminPage() {
  const {
    users, vehicles, trips, companies, routes,
    approveTrip, createCompany, createGroup, createSubgroup, createRoute,
    assignVehicle, uploadVehicleDoc, addPayment
  } = useApp();

  const drivers = users.filter(u => u.role === "driver");

  function exportTrips() {
    const rows = trips.map(t => ({
      TripId: t.id,
      Driver: users.find(u => u.id === t.driverId)?.name ?? "",
      Company: companies.find(c => c.id === t.companyId)?.name ?? "",
      Status: t.status,
      StartKm: t.startKm ?? "",
      EndKm: t.endKm ?? "",
      Rate: t.ratePerKm ?? "",
      VirtualAmount: t.virtualAmount ?? "",
      Approved: t.approved ? "Yes" : "No",
      StartTime: t.startTimestamp ? format(t.startTimestamp, "yyyy-MM-dd HH:mm") : "",
      EndTime: t.endTimestamp ? format(t.endTimestamp, "yyyy-MM-dd HH:mm") : "",
    }));
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(rows);
    utils.book_append_sheet(wb, ws, "Trips");
    writeFileXLSX(wb, "trips.xlsx");
  }

  const [newCompanyName, setNewCompanyName] = useState("");
  const [routeName, setRouteName] = useState("");
  const [routeAmt, setRouteAmt] = useState(0);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Approvals */}
      <section className="card p-5">
        <h2 className="text-slate-900 text-xl font-semibold mb-3">Trip Approvals</h2>
        <table className="w-full text-sm text-slate-800">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Trip</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Virtual</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          {trips.map(t => (
            <tr key={t.id} className="border-b last:border-0">
              <td className="py-2">{t.id.slice(0,8)}...</td>
              <td>{users.find(u => u.id === t.driverId)?.name ?? "—"}</td>
              <td>{t.approved ? <Pill color="green">Approved</Pill> : <Pill color={t.status==="Completed"?"blue":"yellow"}>{t.status}</Pill>}</td>
              <td>₹{t.virtualAmount ?? 0}</td>
              <td>
                {!t.approved && t.status==="Completed" && (
                  <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={() => approveTrip(t.id)}>
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
        <button onClick={exportTrips} className="mt-4 px-4 py-2 rounded bg-blue-600 text-white">Download Excel</button>
      </section>

      {/* Companies & Routes */}
      <section className="card p-5 space-y-4">
        <h2 className="text-slate-900 text-xl font-semibold">Companies / Routes</h2>

        <div className="grid grid-cols-3 gap-2">
          <input className="rounded border border-slate-300 px-3 py-2 col-span-2" placeholder="New Company Name"
                 value={newCompanyName} onChange={e=>setNewCompanyName(e.target.value)} />
          <button className="rounded bg-blue-600 text-white px-3" onClick={()=>{ if(newCompanyName.trim()) { createCompany(newCompanyName.trim()); setNewCompanyName(""); }}}>
            Create
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <input className="rounded border border-slate-300 px-3 py-2" placeholder="Route name"
                 value={routeName} onChange={e=>setRouteName(e.target.value)} />
          <input className="rounded border border-slate-300 px-3 py-2" type="number" placeholder="Amount"
                 value={routeAmt} onChange={e=>setRouteAmt(Number(e.target.value))} />
          <button className="rounded bg-blue-600 text-white px-3" onClick={()=>{ if(routeName) { createRoute(routeName, routeAmt); setRouteName(""); setRouteAmt(0);} }}>
            Add Route
          </button>
        </div>

        <div className="text-slate-800 text-sm">
          <h4 className="font-semibold">Existing Routes</h4>
          <ul className="list-disc pl-5">
            {routes.map(r => <li key={r.id}>{r.name} — ₹{r.baseAmount}</li>)}
          </ul>
        </div>
      </section>

      {/* Vehicles & Docs */}
      <section className="card p-5">
        <h2 className="text-slate-900 text-xl font-semibold mb-3">Vehicles & Documents</h2>
        {vehicles.map(v => {
          const assigned = users.find(u => u.id === v.assignedUserId);
          return (
            <div key={v.id} className="border-b last:border-0 py-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-slate-900">{v.plate}</div>
                <div className="text-sm">{assigned ? <Pill color="blue">Assigned: {assigned.name}</Pill> : <Pill color="slate">Unassigned</Pill>}</div>
              </div>
              <div className="mt-2 flex gap-2">
                <select id={`ass-${v.id}`} className="rounded border border-slate-300 px-2 py-1">
                  <option value="">Pick driver</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button className="px-3 py-1 rounded bg-slate-800 text-white" onClick={()=>{
                  // @ts-ignore
                  const sel = (document.getElementById(`ass-${v.id}`) as HTMLSelectElement).value;
                  if (sel) assignVehicle(v.id, sel);
                }}>Assign</button>
              </div>
              <div className="mt-3 grid md:grid-cols-3 gap-2">
                {["VehicleRC","Insurance"].map(kind => (
                  <div key={kind} className="bg-white rounded border p-2">
                    <div className="text-slate-800 text-sm mb-1">{kind} Doc</div>
                    <input type="file" className="w-full text-sm"
                           onChange={(e)=>{
                             const f = e.target.files?.[0];
                             if (!f) return;
                             const url = URL.createObjectURL(f);
                             const expiry = new Date(Date.now()+1000*60*60*24*90).toISOString();
                             uploadVehicleDoc(v.id, kind, url, expiry);
                           }}/>
                    {v.docs?.[kind as any]?.expiry && (
                      <div className="mt-1">
                        <ExpiryBadge iso={v.docs?.[kind as any]?.expiry!}/>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Payments */}
      <section className="card p-5">
        <h2 className="text-slate-900 text-xl font-semibold mb-3">Record Payment / Debit</h2>
        <div className="grid grid-cols-4 gap-2 items-center">
          <select id="p-user" className="rounded border border-slate-300 px-2 py-2 col-span-2">
            {drivers.map(d => <option key={d.id} value={d.id}>{d.name} (₹{(d.balance ?? 0).toFixed(2)})</option>)}
          </select>
          <input id="p-amt" type="number" className="rounded border border-slate-300 px-2 py-2" placeholder="Amount (₹+/-)"/>
          <input id="p-ss" type="file" className="rounded border border-slate-300 px-2 py-2 bg-white"/>
        </div>
        <button className="mt-3 px-4 py-2 rounded bg-green-600 text-white" onClick={()=>{
          // @ts-ignore
          const userId = (document.getElementById("p-user") as HTMLSelectElement).value;
          // @ts-ignore
          const amt = Number((document.getElementById("p-amt") as HTMLInputElement).value||0);
          // @ts-ignore
          const file = (document.getElementById("p-ss") as HTMLInputElement).files?.[0];
          const url = file ? URL.createObjectURL(file) : undefined;
          addPayment(userId, Math.abs(amt), url, "admin");
        }}>Save</button>
        <p className="text-xs text-slate-600 mt-2">Positive amount = payout to driver (reduces their balance). Use negative by entering -X to record a debit.</p>
      </section>
    </div>
  );
}

function ExpiryBadge({ iso }: { iso: string }) {
  const daysLeft = Math.round((new Date(iso).getTime() - Date.now())/(1000*60*60*24));
  const color = daysLeft < 0 ? "red" : daysLeft <= 30 ? "yellow" : "green";
  return <span className={`badge ${color==="red"?"bg-red-100 text-red-700":color==="yellow"?"bg-yellow-100 text-yellow-800":"bg-green-100 text-green-700"}`}>
    Expires in {daysLeft} days
  </span>;
}
