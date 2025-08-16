// import { mutation } from "./_generated/server";
// import { v } from "convex/values";

// export const addVehicle = mutation({
//   args: {
//     companyId: v.id("companies"),
//     plate: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new Error("Not authenticated");
//     }
//     const adminUser = await ctx.db
//       .query("app_users")
//       .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
//       .unique();

//     if (
//       !adminUser ||
//       (adminUser.appRole !== "admin" && adminUser.appRole !== "super")
//     ) {
//       throw new Error("Unauthorized");
//     }

//     return await ctx.db.insert("vehicles", {
//       companyId: args.companyId,
//       plate: args.plate,
//       active: true,
//       createdAt: Date.now(),
//     });
//   },
// });

// export const uploadVehicleDoc = mutation({
//   args: {
//     vehicleId: v.id("vehicles"),
//     fileId: v.id("_storage"),
//     kind: v.union(
//       v.literal("VehicleRC"),
//       v.literal("Insurance"),
//       v.literal("Permit"),
//       v.literal("Fitness")
//     ),
//     expiry: v.optional(v.number()),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new Error("Not authenticated");
//     }
//     const adminUser = await ctx.db
//       .query("app_users")
//       .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
//       .unique();

//     if (
//       !adminUser ||
//       (adminUser.appRole !== "admin" && adminUser.appRole !== "super")
//     ) {
//       throw new Error("Unauthorized");
//     }
//     return await ctx.db.insert("vehicle_docs", {
//       vehicleId: args.vehicleId,
//       kind: args.kind,
//       fileId: args.fileId,
//       expiry: args.expiry,
//       uploadedBy: adminUser._id,
//       uploadedAt: Date.now(),
//     });
//   },
// });
