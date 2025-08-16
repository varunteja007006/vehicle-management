"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "../ui/button";

export function SignIn() {
  const { signIn } = useAuthActions();
  return (
    <Button
      onClick={() =>
        void signIn("google", {
          redirectTo: "/dashboard",
        })
      }
    >
      Sign in with Google
    </Button>
  );
}
