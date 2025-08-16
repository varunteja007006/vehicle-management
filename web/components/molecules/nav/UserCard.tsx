"use client";

import { Authenticated, useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Mail } from "lucide-react";

export default function UserCard() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const { isAuthenticated } = useConvexAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-row items-center gap-2 text-sm">
      {loggedInUser?.image && (
        <Avatar>
          <AvatarImage src={loggedInUser?.image} />
          <AvatarFallback>{loggedInUser?.name?.slice(0, 1)}</AvatarFallback>
        </Avatar>
      )}
      <HoverCard>
        <HoverCardTrigger>{loggedInUser?.name}</HoverCardTrigger>
        <HoverCardContent className="p-2">
          <div className="flex flex-row items-center gap-4 text-sm">
            {loggedInUser?.email && (
              <>
                <Mail size={20} />
                {loggedInUser.email}
              </>
            )}
          </div>
          <p className="text-sm">{loggedInUser?.phone}</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
