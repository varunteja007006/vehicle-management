// import { mutation } from "./_generated/server";
// import { v } from "convex/values";

// export const updateBankDetails = mutation({
//   args: {
//     accountNumber: v.string(),
//     ifsc: v.string(),
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
//       throw new Error("User not found");
//     }

//     await ctx.db.patch(appUser._id, {
//       bank: {
//         accountNumber: args.accountNumber,
//         ifsc: args.ifsc,
//       },
//     });
//   },
// });