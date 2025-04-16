"use client";

import { createContext } from "react";
import { User } from "@supabase/supabase-js";

export const UserContext = createContext<User | null>(null);

export default function UserProvider({ user, children }: Readonly<{ user: User | null; children: React.ReactNode }>) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
