import Google from "@auth/core/providers/google";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { MutationCtx, query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx: MutationCtx, { userId, profile }) {
      const appUser = await ctx.db.insert("app_users", {
        userId,
        createdAt: Date.now(),
        email: profile.email,
      });

      await ctx.db.insert("userRoles", {
        userId: appUser,
        role: "driver",
      });
    },
  },
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});
