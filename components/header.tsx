import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { HeaderClient } from "./header-client";

export async function Header() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background neo-shadow-sm pb-1">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <HeaderClient user={session?.user} />
      </div>
    </header>
  );
}
