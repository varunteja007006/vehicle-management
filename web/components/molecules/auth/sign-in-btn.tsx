"use client";

import { Button } from "@/components/ui/button";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

export function SignIn() {
  const { signIn } = useAuthActions();

  const { isAuthenticated } = useConvexAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <Button
      onClick={() =>
        void signIn("google", {
          redirectTo: "/dashboard",
        })
      }
      className="cursor-pointer"
    >
      Sign in with Google
    </Button>
  );
}
