"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { ButtonBig, Pill } from "@/components/ui";
import { format } from "date-fns";
import { v4 as uuid } from "uuid";

export default function DriverPage() {
  const {
    currentUserId,
    users,
    companies,
    trips,
    vehicles,
    startTrip,
    endTrip,
    logDiesel,
    pushGPSPoint,
    uploadUserDoc,
    updateBank,
  } = useApp();
  const me = users.find((u) => u.id === currentUserId)!;
  const myTrips = trips.filter((t) => t.driverId === me.id);
  const currentTrip =
    myTrips.find((t) => t.status === "InProgress") ??
    myTrips.find((t) => t.status === "Draft");
  const myCompanyId =
    companies.find((c) => c.defaultForUserIds.includes(me.id))?.id ??
    companies[0]?.id;

  // ensure a draft trip exists
  useEffect(() => {
    if (!currentTrip) {
      // make a draft
      const { trips, users } = useApp.getState();
      useApp.setState({
        trips: [
          ...trips,
          {
            id: uuid(),
            driverId: me.id,
            companyId: myCompanyId!,
            status: "Draft",
            gpsTrail: [],
          },
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trip = useMemo(
    () =>
      trips.find(
        (t) =>
          t.driverId === me.id &&
          (t.status === "InProgress" || t.status === "Draft")
      ),
    [trips, me.id]
  );

  // GPS mock
  useEffect(() => {
    if (!trip) return;
    const id = setInterval(() => {
      const base = { lat: 13.04, lng: 80.23 };
      const jitter = () => (Math.random() - 0.5) * 0.01;
      pushGPSPoint({
        tripId: trip.id,
        lat: base.lat + jitter(),
        lng: base.lng + jitter(),
      });
    }, 5000);
    return () => clearInterval(id);
  }, [trip, pushGPSPoint]);

  const [startKm, setStartKm] = useState<number>(0);
  const [rate, setRate] = useState<number>(12);
  const [endKm, setEndKm] = useState<number>(0);

  // simple “timestamp overlay” -> we store file URL + save timestamp in trip fields
  function fileToObjectURL(file: File) {
    return URL.createObjectURL(file);
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* left: trip controls */}
      <section className="card p-5 lg:col-span-2">
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 text-xl font-semibold">Trip Control</h2>
          <div className="space-x-2">
            {trip?.status && (
              <Pill
                color={
                  trip.status === "InProgress"
                    ? "yellow"
                    : trip.status === "Completed"
                      ? "blue"
                      : "slate"
                }
              >
                {trip.status}
              </Pill>
            )}
            {trip?.approved && <Pill color="green">Approved</Pill>}
          </div>
        </header>

        {/* START */}
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="text-sm text-slate-700">Start Kilometer</label>
            <input
              type="number"
              value={startKm}
              onChange={(e) => setStartKm(Number(e.target.value))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-sm text-slate-700">Rate (per km)</label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-sm text-slate-700">Gate Pass (Photo)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f || !trip) return;
                startTrip({
                  tripId: trip.id,
                  startKm,
                  ratePerKm: rate,
                  startGatePassUrl: fileToObjectURL(f),
                });
              }}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 bg-white"
            />
          </div>
        </div>

        <div className="mt-3">
          <ButtonBig
            color="green"
            label="Start Trip"
            onClick={() => {
              if (!trip) return;
              startTrip({
                tripId: trip.id,
                startKm,
                ratePerKm: rate,
                startGatePassUrl: trip.startGatePassUrl ?? "",
              });
            }}
          />
          <p className="text-xs text-slate-600 mt-1">
            Timestamp recorded automatically on start.
          </p>
        </div>

        {/* END */}
        <div className="mt-6 grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-slate-700">End Kilometer</label>
            <input
              type="number"
              value={endKm}
              onChange={(e) => setEndKm(Number(e.target.value))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-700">
              Gate Pass Received (Photo)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f || !trip) return;
                endTrip({
                  tripId: trip.id,
                  endKm,
                  endGatePassUrl: fileToObjectURL(f),
                });
              }}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 bg-white"
            />
          </div>
        </div>

        <div className="mt-3">
          <ButtonBig
            color="red"
            label="Finish Trip"
            onClick={() => {
              if (!trip) return;
              endTrip({
                tripId: trip.id,
                endKm,
                endGatePassUrl: trip.endGatePassUrl ?? "",
              });
            }}
          />
          <p className="text-xs text-slate-600 mt-1">
            Virtual amount will be visible after Admin approval.
          </p>
        </div>

        {/* Diesel */}
        <div className="mt-6">
          <h3 className="text-slate-900 font-semibold mb-2">
            Diesel & Mileage
          </h3>
          <div className="grid md:grid-cols-4 gap-3">
            <input
              id="liters"
              placeholder="Liters"
              type="number"
              className="rounded border border-slate-300 px-3 py-2"
            />
            <input
              id="curkm"
              placeholder="Current Km"
              type="number"
              className="rounded border border-slate-300 px-3 py-2"
            />
            <input
              id="bill"
              type="file"
              accept="image/*"
              className="rounded border border-slate-300 px-3 py-2 bg-white"
            />
            <ButtonBig
              color="yellow"
              label="Upload & Calc"
              onClick={() => {
                if (!trip) return;
                // @ts-ignore
                const liters = Number(
                  (document.getElementById("liters") as HTMLInputElement)
                    .value || 0
                );
                // @ts-ignore
                const curkm = Number(
                  (document.getElementById("curkm") as HTMLInputElement)
                    .value || 0
                );
                // @ts-ignore
                const file = (
                  document.getElementById("bill") as HTMLInputElement
                ).files?.[0];
                if (!file) return;
                logDiesel({
                  tripId: trip.id,
                  liters,
                  billUrl: URL.createObjectURL(file),
                  currentKm: curkm,
                });
              }}
            />
          </div>
          {trip && (
            <p className="text-sm text-slate-700 mt-2">
              Mileage:{" "}
              <b>{trip.mileage ? trip.mileage.toFixed(2) : "—"} km/L</b>
            </p>
          )}
        </div>

        {/* GPS */}
        <div className="mt-6">
          <h3 className="text-slate-900 font-semibold mb-2">
            GPS Trail (mock)
          </h3>
          <div className="rounded border bg-white p-3 text-slate-800">
            {trip?.gpsTrail?.slice(-10).map((p) => (
              <div key={p.t} className="text-xs">
                {format(p.t, "HH:mm:ss")} → {p.lat.toFixed(4)},{" "}
                {p.lng.toFixed(4)}
              </div>
            ))}
            {!trip?.gpsTrail?.length && (
              <div className="text-xs text-slate-500">No pings yet…</div>
            )}
          </div>
        </div>
      </section>

      {/* right: profile & docs */}
      <aside className="card p-5 space-y-4">
        <h3 className="text-slate-900 font-semibold">My Profile</h3>
        <div className="text-slate-800 text-sm">
          <div>
            <b>Name:</b> {me.name}
          </div>
          <div>
            <b>Balance:</b> ₹{(me.balance ?? 0).toFixed(2)}
          </div>
          <div>
            <b>Assigned Vehicle(s):</b>{" "}
            {me.assignedVehicleIds.length
              ? me.assignedVehicleIds
                  .map((id) => vehicles.find((v) => v.id === id)?.plate)
                  .join(", ")
              : "—"}
          </div>
        </div>

        <div>
          <h4 className="text-slate-900 font-semibold mb-1">Bank Details</h4>
          <div className="grid grid-cols-1 gap-2">
            <input
              id="acc"
              placeholder="Account Number"
              className="rounded border border-slate-300 px-3 py-2"
            />
            <input
              id="ifsc"
              placeholder="IFSC"
              className="rounded border border-slate-300 px-3 py-2"
            />
            <button
              className="px-3 py-2 rounded bg-blue-600 text-white"
              onClick={() => {
                // @ts-ignore
                const acc = (document.getElementById("acc") as HTMLInputElement)
                  .value;
                // @ts-ignore
                const ifsc = (
                  document.getElementById("ifsc") as HTMLInputElement
                ).value;
                updateBank(me.id, acc, ifsc);
              }}
            >
              Save
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-slate-900 font-semibold mb-1">KYC Documents</h4>
          {["Aadhaar", "PAN", "DL", "BankPassbook"].map((k) => (
            <div key={k} className="flex items-center gap-2 mb-2">
              <span className="w-28 text-sm">{k}:</span>
              <input
                type="file"
                accept="image/*"
                className="bg-white rounded border border-slate-300 px-3 py-1"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = URL.createObjectURL(f);
                  const expiry =
                    k === "DL"
                      ? new Date(
                          Date.now() + 1000 * 60 * 60 * 24 * 180
                        ).toISOString()
                      : undefined;
                  uploadUserDoc({ userId: me.id, kind: k, url, expiry });
                }}
              />
              {me.uploads?.[k as any]?.url && (
                <Pill color="green">Uploaded</Pill>
              )}
            </div>
          ))}
        </div>

        {/* trip summary */}
        {trip && (
          <div className="border-t pt-3">
            <h4 className="text-slate-900 font-semibold">Trip Summary</h4>
            <div className="text-sm text-slate-800">
              <div>
                Start: {trip.startKm ?? "—"} | End: {trip.endKm ?? "—"}
              </div>
              <div>
                Rate: ₹{trip.ratePerKm ?? 0}/km | Virtual:{" "}
                <b>₹{trip.virtualAmount ?? 0}</b>
              </div>
              <div>Approved: {trip.approved ? "Yes" : "No"}</div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
