// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";

// export const logGpsPing = mutation({
//   args: {
//     lat: v.number(),
//     lng: v.number(),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new Error("Not authenticated");
//     }
//     const driverUser = await ctx.db
//       .query("app_users")
//       .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
//       .unique();

//     if (!driverUser || driverUser.appRole !== "driver") {
//       throw new Error("Unauthorized");
//     }

//     // Find the driver's active trip
//     const activeTrip = await ctx.db
//       .query("trips")
//       .withIndex("by_driver", (q) => q.eq("driverId", driverUser._id))
//       .filter((q) => q.neq(q.field("status"), "Completed"))
//       .unique();

//     if (activeTrip) {
//       await ctx.db.insert("gps_pings", {
//         tripId: activeTrip._id,
//         driverId: driverUser._id,
//         lat: args.lat,
//         lng: args.lng,
//         t: Date.now(),
//       });
//     }
//   },
// });

// export const getLiveLocation = query({
//   args: { tripId: v.id("trips") },
//   handler: async (ctx, args) => {
//     const latestPing = await ctx.db
//       .query("gps_pings")
//       .withIndex("by_trip_time", (q) => q.eq("tripId", args.tripId))
//       .order("desc")
//       .first();

//     return latestPing;
//   },
// });
