// import { mutation } from "./_generated/server";
// import { v } from "convex/values";

// export const uploadUserDoc = mutation({
//   args: {
//     fileId: v.id("_storage"),
//     kind: v.union(v.literal("Aadhaar"), v.literal("PAN"), v.literal("DL"), v.literal("BankPassbook")),
//     expiry: v.optional(v.number()),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new Error("Not authenticated");
//     }

//     const appUser = await ctx.db
//       .query("app_users")
//       .withIndex("by_subject", (q) =>
//         q.eq("subject", identity.subject)
//       )
//       .unique();

//     if (!appUser) {
//       throw new Error("User not found in app_users table");
//     }

//     return await ctx.db.insert("user_docs", {
//       userId: appUser._id,
//       fileId: args.fileId,
//       kind: args.kind,
//       expiry: args.expiry,
//       uploadedAt: Date.now(),
//     });
//   },
// });