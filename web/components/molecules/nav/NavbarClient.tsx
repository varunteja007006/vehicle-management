"use client";

import { useConvexAuth } from "convex/react";
import { SignIn } from "../auth/sign-in-btn";
import SignOut from "../auth/sign-out-btn";
import UserCard from "./UserCard";
import { ModeToggle } from "../toggle-theme";
import Swiggler from "../loader/swiggler";

export default function NavbarClient() {
  const { isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex flex-row gap-4 items-center text-sm">
        <Swiggler className="!h-8 !w-8" />
        Loading profile....
      </div>
    );
  }

  return (
    <>
      <SignIn />
      <UserCard />
      <SignOut />
      <ModeToggle />
    </>
  );
}
