"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { companies as seedCompanies, users as seedUsers, vehicles as seedVehicles, trips as seedTrips, routes as seedRoutes, payments as seedPayments } from "./seed";
import { Company, Payment, RouteDef, Trip, User, Vehicle } from "./types";
import { v4 as uuid } from "uuid";

type State = {
  currentUserId?: string;
  companies: Company[];
  users: User[];
  vehicles: Vehicle[];
  trips: Trip[];
  routes: RouteDef[];
  payments: Payment[];
  setCurrentUser(id?: string): void;

  // Driver
  startTrip(params: { tripId: string; startKm: number; ratePerKm: number; startGatePassUrl: string }): void;
  endTrip(params: { tripId: string; endKm: number; endGatePassUrl: string }): void;
  logDiesel(params: { tripId: string; liters: number; billUrl: string; currentKm: number }): void;
  pushGPSPoint(params: { tripId: string; lat: number; lng: number }): void;
  uploadUserDoc(params: { userId: string; kind: string; url: string; expiry?: string }): void;
  updateBank(userId: string, accountNumber: string, ifsc: string): void;

  // Admin
  approveTrip(tripId: string): void;
  createCompany(name: string): void;
  createGroup(companyId: string, name: string): void;
  createSubgroup(companyId: string, groupId: string, name: string): void;
  createRoute(name: string, baseAmount: number): void;
  assignVehicle(vehicleId: string, userId: string): void;
  uploadVehicleDoc(vehicleId: string, kind: string, url: string, expiry?: string): void;
  addPayment(userId: string, amount: number, screenshotUrl?: string, by?: "admin"|"super"): void;

  // Super
  payAllDrivers(amountPerTripApproved: number): void;
};

export const useApp = create<State>()(persist((set, get) => ({
  currentUserId: undefined,
  companies: seedCompanies,
  users: seedUsers,
  vehicles: seedVehicles,
  trips: seedTrips,
  routes: seedRoutes,
  payments: seedPayments,

  setCurrentUser(id) { set({ currentUserId: id }); },

  startTrip({ tripId, startKm, ratePerKm, startGatePassUrl }) {
    set({
      trips: get().trips.map(t => t.id === tripId ? {
        ...t,
        status: "InProgress",
        startKm,
        ratePerKm,
        startGatePassUrl,
        startTimestamp: new Date().toISOString(),
      } : t)
    });
  },

  endTrip({ tripId, endKm, endGatePassUrl }) {
    set({
      trips: get().trips.map(t => {
        if (t.id !== tripId) return t;
        const dist = (endKm ?? 0) - (t.startKm ?? 0);
        const baseVirtual = (t.ratePerKm ?? 0) * (dist > 0 ? dist : 0);
        const routeAmt = t.routeId ? (get().routes.find(r => r.id === t.routeId)?.baseAmount ?? 0) : 0;
        return {
          ...t,
          status: "Completed",
          endKm,
          endGatePassUrl,
          endTimestamp: new Date().toISOString(),
          virtualAmount: baseVirtual + routeAmt,
        };
      })
    });
  },

  logDiesel({ tripId, liters, billUrl, currentKm }) {
    set({
      trips: get().trips.map(t => t.id === tripId ? {
        ...t,
        dieselLiters: liters,
        dieselBillUrl: billUrl,
        mileage: liters > 0 && (currentKm ?? 0) > (t.startKm ?? 0) ? ((currentKm - (t.startKm ?? 0)) / liters) : t.mileage,
      } : t)
    });
  },

  pushGPSPoint({ tripId, lat, lng }) {
    set({
      trips: get().trips.map(t => t.id === tripId ? {
        ...t,
        gpsTrail: [...(t.gpsTrail ?? []), { lat, lng, t: Date.now() }]
      } : t)
    });
  },

  uploadUserDoc({ userId, kind, url, expiry }) {
    set({
      users: get().users.map(u => u.id === userId ? {
        ...u,
        uploads: { ...(u.uploads ?? {}), [kind]: { url, expiry } }
      } : u)
    });
  },

  updateBank(userId, accountNumber, ifsc) {
    set({
      users: get().users.map(u => u.id === userId ? {
        ...u, bank: { accountNumber, ifsc }
      } : u)
    });
  },

  approveTrip(tripId) {
    const trips = get().trips.map(t => t.id === tripId ? { ...t, approved: true } : t);
    // show virtual amount to driver by crediting it (pending payout logic handled by payments)
    const t = trips.find(tr => tr.id === tripId);
    if (t?.virtualAmount && t.driverId) {
      const users = get().users.map(u => u.id === t.driverId ? { ...u, balance: (u.balance ?? 0) + t.virtualAmount! } : u);
      set({ trips, users });
    } else {
      set({ trips });
    }
  },

  createCompany(name) {
    const id = uuid();
    set({ companies: [...get().companies, { id, name, groups: [], defaultForUserIds: [] }] });
  },

  createGroup(companyId, name) {
    set({
      companies: get().companies.map(c => c.id === companyId ? ({
        ...c,
        groups: [...c.groups, { id: uuid(), name, subgroups: [] }]
      }) : c)
    });
  },

  createSubgroup(companyId, groupId, name) {
    set({
      companies: get().companies.map(c => c.id === companyId ? ({
        ...c,
        groups: c.groups.map(g => g.id === groupId ? ({
          ...g, subgroups: [...g.subgroups, { id: uuid(), name }]
        }) : g)
      }) : c)
    });
  },

  createRoute(name, baseAmount) {
    set({ routes: [...get().routes, { id: uuid(), name, baseAmount }] });
  },

  assignVehicle(vehicleId, userId) {
    set({
      vehicles: get().vehicles.map(v => v.id === vehicleId ? { ...v, assignedUserId: userId } : v),
      users: get().users.map(u => u.id === userId ? { ...u, assignedVehicleIds: [...u.assignedVehicleIds, vehicleId] } : u),
    });
  },

  uploadVehicleDoc(vehicleId, kind, url, expiry) {
    set({
      vehicles: get().vehicles.map(v => v.id === vehicleId ? ({
        ...v, docs: { ...(v.docs ?? {}), [kind]: { url, expiry } }
      }) : v)
    });
  },

  addPayment(userId, amount, screenshotUrl, by = "admin") {
    const p: Payment = { id: uuid(), userId, amount, screenshotUrl, createdAt: new Date().toISOString(), by };
    set({
      payments: [...get().payments, p],
      users: get().users.map(u => u.id === userId ? { ...u, balance: (u.balance ?? 0) - amount } : u) // reduce driver balance when paid out
    });
  },

  payAllDrivers(amountPerTripApproved) {
    // super-user bulk pay: just an example — pay flat amount to each driver with at least one approved trip
    const approvedByDriver = new Set(get().trips.filter(t => t.approved).map(t => t.driverId));
    const updates: Payment[] = [];
    const users = get().users.map(u => {
      if (approvedByDriver.has(u.id)) {
        updates.push({ id: uuid(), userId: u.id, amount: amountPerTripApproved, createdAt: new Date().toISOString(), by: "super" });
        return { ...u, balance: (u.balance ?? 0) - amountPerTripApproved };
      }
      return u;
    });
    set({ users, payments: [...get().payments, ...updates] });
  },

}), { name: "vehicle-mgmt-demo" }));
