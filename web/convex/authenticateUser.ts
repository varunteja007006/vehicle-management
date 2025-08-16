import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// export const authenticateUser = mutation({
//   args: {},
//   handler: async (ctx) => {
//     // Get the user's identity from the authentication context.
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new Error("Called without authenticated user");
//     }

//     // Check if a user document already exists in your custom 'app_users' table
//     const existingAppUser = await ctx.db
//       .query("app_users")
//       .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
//       .unique();

//     if (existingAppUser) {
//       // If the user exists, return their data.
//       return existingAppUser;
//     } else {
//       // If the user does not exist, create a new entry.
//       const newAppUser = await ctx.db.insert("app_users", {
//         // subject: identity.subject,
//         userId: identity.subject,
//         // Access name and email directly from the identity object.
//         // name: identity.name || "Unknown User",
//         email: identity.email,
//         createdAt: Date.now(),
//       });

//       // Insert the default role for the new user.
//       await ctx.db.insert("userRoles", {
//         userId: newAppUser, // Use the ID of the newly created app_user.
//         role: "driver",
//       });

//       return newAppUser;
//     }
//   },
// });

// export const getUserRole = query({
//   handler: async (ctx) => {
//     // Get the user's identity.
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       return null;
//     }

//     // Find the user's document in the `app_users` table first.
//     const appUser = await ctx.db
//       .query("app_users")
//       .withIndex("by_subject", (q) => q.eq("subject", identity.subject))
//       .unique();

//     if (!appUser) {
//       return null;
//     }

//     // Find the user's role in the `userRoles` table using their app_user ID.
//     const userRole = await ctx.db
//       .query("userRoles")
//       .withIndex("by_user_id", (q) => q.eq("userId", appUser._id))
//       .unique();

//     // Return the role from the found document.
//     return userRole?.role || null;
//   },
// });
