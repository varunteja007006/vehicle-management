import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx: MutationCtx, x) {
      await ctx.db.insert("app_users", {
        userId: x.userId,
        createdAt: Date.now(),
        email: x.profile.email,
      });
    },
  },
});
