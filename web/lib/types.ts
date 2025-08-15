export type Role = "driver" | "admin" | "super";

export type DocumentType = "Aadhaar" | "PAN" | "DL" | "BankPassbook" | "VehicleRC" | "Insurance";
export type TripStatus = "Draft" | "InProgress" | "Completed" | "Approved";

export interface Company {
  id: string;
  name: string;
  groups: Group[];
  defaultForUserIds: string[]; // demo: controls default company
}
export interface Group {
  id: string;
  name: string;
  subgroups: Subgroup[];
}
export interface Subgroup {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  companyId?: string;
  assignedVehicleIds: string[];
  bank?: {
    accountNumber?: string;
    ifsc?: string;
  }
  uploads?: {
    [key in DocumentType]?: { url: string; expiry?: string };
  }
  balance?: number; // net balance (credit - debits)
}

export interface Vehicle {
  id: string;
  plate: string;
  docs: {
    [key in DocumentType]?: { url: string; expiry?: string };
  }
  assignedUserId?: string;
}

export interface RouteDef {
  id: string;
  name: string;
  baseAmount: number; // allocated amount
}

export interface Trip {
  id: string;
  driverId: string;
  companyId: string;
  groupId?: string;
  subgroupId?: string;
  routeId?: string;
  status: TripStatus;
  startKm?: number;
  endKm?: number;
  ratePerKm?: number;
  mileage?: number; // computed from diesel log
  dieselLiters?: number;
  dieselBillUrl?: string;
  startGatePassUrl?: string;
  endGatePassUrl?: string;
  startTimestamp?: string;
  endTimestamp?: string;
  virtualAmount?: number;
  approved?: boolean;
  gpsTrail?: { lat: number; lng: number; t: number }[];
}

export interface Payment {
  id: string;
  userId: string;
  amount: number; // positive = paid to driver, negative = debit
  screenshotUrl?: string;
  createdAt: string;
  by: "admin" | "super";
}
