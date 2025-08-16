import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** Common literals */
const Role = v.union(
  v.literal("driver"),
  v.literal("admin"),
  v.literal("super")
);

const TripStatus = v.union(
  v.literal("Draft"),
  v.literal("InProgress"),
  v.literal("Completed"),
  v.literal("Approved")
);

const UserDocKind = v.union(
  v.literal("Aadhaar"),
  v.literal("PAN"),
  v.literal("DL"),
  v.literal("BankPassbook")
);

const VehicleDocKind = v.union(
  v.literal("VehicleRC"),
  v.literal("Insurance"),
  v.literal("Permit"),
  v.literal("Fitness")
);

const PaymentMethod = v.union(
  v.literal("manual"),
  v.literal("bulk"),
  v.literal("external")
);

const schema = defineSchema({
  ...authTables,
  // Your other tables...

  // This is the new table for your custom user profiles
  app_users: defineTable({
    // Link to Auth identity (optional pattern—store subject for multi-provider)
    userId: v.string(), // This is now a required link to the auth user
    email: v.optional(v.string()),
    // Optional default company for driver convenience
    // defaultCompanyId: v.optional(v.id("companies")),
    // Bank/account details for payouts
    // bank: v.optional(
    //   v.object({
    //     accountNumber: v.optional(v.string()),
    //     ifsc: v.optional(v.string()),
    //   })
    // ),
    // Cached running balance (credits from trips – payouts). Keep source of truth in payments & approved trip earnings.
    // balance: v.optional(v.number()),
    createdAt: v.number(), // Date.now()
  })
    // .index("by_subject", ["subject"]) // ! remove later
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  // New table for user roles (optional, if you want a separate table)
  userRoles: defineTable({
    userId: v.id("app_users"),
    role: Role,
  })
    .index("by_user_id", ["userId"])
    .index("by_role", ["role"]),

  companies: defineTable({
    name: v.string(),
    createdBy: v.id("app_users"),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  company_memberships: defineTable({
    userId: v.id("app_users"),
    companyId: v.id("companies"),
    role: Role, // driver/admin/super within the company
    isDefault: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_company", ["companyId"])
    .index("by_company_role", ["companyId", "role"])
    .index("by_user_default", ["userId", "isDefault"]),

  groups: defineTable({
    companyId: v.id("companies"),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_company", ["companyId"]),

  subgroups: defineTable({
    companyId: v.id("companies"),
    groupId: v.id("groups"),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_company_group", ["companyId", "groupId"]),

  routes: defineTable({
    companyId: v.id("companies"),
    name: v.string(),
    baseAmount: v.number(), // fixed amount added to virtual amount
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_company_name", ["companyId", "name"]),
  // ========== Assets ==========
  vehicles: defineTable({
    companyId: v.id("companies"),
    plate: v.string(),
    active: v.boolean(),
    assignedUserId: v.optional(v.id("app_users")), // convenience current assignee
    assignedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_plate", ["plate"])
    .index("by_assigned_user", ["assignedUserId"]),

  // Historical assignment trail (so you can audit who/when)
  vehicle_assignments: defineTable({
    vehicleId: v.id("vehicles"),
    userId: v.id("app_users"),
    assignedBy: v.id("app_users"),
    assignedAt: v.number(),
    unassignedAt: v.optional(v.number()),
  })
    .index("by_vehicle", ["vehicleId"])
    .index("by_user", ["userId"])
    .index("active", ["vehicleId", "unassignedAt"]),

  // Vehicle documents with expiries
  vehicle_docs: defineTable({
    vehicleId: v.id("vehicles"),
    kind: VehicleDocKind,
    fileId: v.id("_storage"),
    expiry: v.optional(v.number()), // ms epoch
    uploadedBy: v.id("app_users"),
    uploadedAt: v.number(),
  })
    .index("by_vehicle", ["vehicleId"])
    .index("by_vehicle_kind", ["vehicleId", "kind"])
    .index("by_expiry", ["expiry"]),

  // Driver KYC docs
  user_docs: defineTable({
    userId: v.id("app_users"),
    kind: UserDocKind,
    fileId: v.id("_storage"),
    expiry: v.optional(v.number()), // for DL etc
    uploadedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_kind", ["userId", "kind"])
    .index("by_expiry", ["expiry"]),
  // ========== Trips ==========
  trips: defineTable({
    companyId: v.id("companies"),
    driverId: v.id("app_users"),
    vehicleId: v.optional(v.id("vehicles")),
    groupId: v.optional(v.id("groups")),
    subgroupId: v.optional(v.id("subgroups")),
    routeId: v.optional(v.id("routes")),

    status: TripStatus,

    startKm: v.optional(v.number()),
    endKm: v.optional(v.number()),
    ratePerKm: v.optional(v.number()),

    // File storage IDs for gate passes
    startGatePassId: v.optional(v.id("_storage")),
    endGatePassId: v.optional(v.id("_storage")),
    startTimestamp: v.optional(v.number()),
    endTimestamp: v.optional(v.number()),
    // Diesel/mileage
    dieselLiters: v.optional(v.number()),
    dieselBillId: v.optional(v.id("_storage")),
    mileage: v.optional(v.number()), // km/L (derived but cached)

    // Earnings
    virtualAmount: v.optional(v.number()), // computed endKm-startKm * rate + route.baseAmount
    approved: v.boolean(),
    approvedBy: v.optional(v.id("app_users")),
    approvedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_driver", ["driverId"])
    .index("by_vehicle", ["vehicleId"])
    .index("by_status", ["status"])
    .index("by_approval", ["approved"])
    .index("by_createdAt", ["createdAt"]),
  // High-frequency GPS stream (separate table for scalable writes)
  gps_pings: defineTable({
    tripId: v.id("trips"),
    driverId: v.id("app_users"),
    lat: v.number(),
    lng: v.number(),
    t: v.number(), // ms epoch (server time preferred)
  })
    .index("by_trip_time", ["tripId", "t"])
    .index("by_driver_time", ["driverId", "t"]),

  // Diesel uploads can also be split out if you expect multiple entries per trip
  diesel_logs: defineTable({
    tripId: v.id("trips"),
    liters: v.number(),
    billId: v.id("_storage"),
    odometerAtFill: v.optional(v.number()),
    loggedAt: v.number(),
    loggedBy: v.id("app_users"),
  }).index("by_trip_time", ["tripId", "loggedAt"]),
  // ========== Finance ==========
  payments: defineTable({
    userId: v.id("app_users"), // driver who receives money (or debit)
    amount: v.number(), // + = payout to driver; - = debit
    screenshotId: v.optional(v.id("_storage")),
    method: PaymentMethod,
    note: v.optional(v.string()),
    createdAt: v.number(),
    byUserId: v.id("app_users"), // admin/super who made it
    byRole: Role,
    // Optional linkage to a trip (if this was a per-trip payout)
    tripId: v.optional(v.id("trips")),
  })
    .index("by_user", ["userId"])
    .index("by_createdAt", ["createdAt"]),
  // ========== Ops & automation ==========
  reminders: defineTable({
    // Expiry reminders etc.
    kind: v.union(
      v.literal("vehicleDocExpiry"),
      v.literal("userDocExpiry"),
      v.literal("custom")
    ),
    companyId: v.optional(v.id("companies")),
    targetTable: v.union(
      v.literal("vehicle_docs"),
      v.literal("user_docs"),
      v.literal("trips"),
      v.literal("vehicles"),
      v.literal("app_users")
    ),
    targetId: v.id("any"), // Corrected from v.idAny() to v.id("any")
    dueAt: v.number(),
    createdForUserId: v.optional(v.id("app_users")), // who to notify
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_dueAt", ["dueAt"])
    .index("by_company", ["companyId"])
    .index("by_target", ["targetTable", "targetId"]),

  audit_logs: defineTable({
    actorUserId: v.id("app_users"),
    action: v.string(), // e.g., "trip.approve", "vehicle.assign"
    entityTable: v.string(),
    entityId: v.id("any"), // Corrected from v.idAny() to v.id("any")
    before: v.optional(v.any()),
    after: v.optional(v.any()),
    ts: v.number(),
    companyId: v.optional(v.id("companies")),
  })
    .index("by_entity", ["entityTable", "entityId"])
    .index("by_actor", ["actorUserId", "ts"])
    .index("by_ts", ["ts"]),
});

export default schema;
