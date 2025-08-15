import { Company, Group, Subgroup, RouteDef, User, Vehicle, Trip, Payment } from "./types";
import { v4 as uuid } from "uuid";

const mkId = () => uuid();

const sg: Subgroup = { id: mkId(), name: "Last Mile" };
const g: Group = { id: mkId(), name: "Primary Logistics", subgroups: [sg] };

export const companies: Company[] = [
  { id: mkId(), name: "Nexus Logistics", groups: [g], defaultForUserIds: [] },
  { id: mkId(), name: "BlueWheel Transport", groups: [], defaultForUserIds: [] },
];

export const routes: RouteDef[] = [
  { id: mkId(), name: "Chennai → Coimbatore", baseAmount: 3200 },
  { id: mkId(), name: "Chennai → Bengaluru", baseAmount: 2800 },
];

export const users: User[] = [
  { id: mkId(), name: "Ravi (Driver)", role: "driver", assignedVehicleIds: [], balance: 0 },
  { id: mkId(), name: "Meena (Admin)", role: "admin", assignedVehicleIds: [] },
  { id: mkId(), name: "AKP (Super)", role: "super", assignedVehicleIds: [], balance: 0 },
];

export const vehicles: Vehicle[] = [
  { id: mkId(), plate: "TN-11-AA-1234", docs: {} },
  { id: mkId(), plate: "TN-14-BB-5678", docs: {} },
];

export const trips: Trip[] = [
  {
    id: mkId(),
    driverId: users[0].id,
    companyId: companies[0].id,
    status: "Draft",
    gpsTrail: [],
  }
];

export const payments: Payment[] = [];

export function linkDefaults() {
  // assign default company to driver for demo
  companies[0].defaultForUserIds.push(users[0].id);
  // assign vehicle
  vehicles[0].assignedUserId = users[0].id;
  users[0].assignedVehicleIds.push(vehicles[0].id);
}
linkDefaults();
