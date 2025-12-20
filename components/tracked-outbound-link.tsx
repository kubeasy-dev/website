"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { trackOutboundLinkClicked } from "@/lib/analytics";

type LinkType = "github" | "docs" | "npm" | "twitter" | "other";

interface TrackedOutboundLinkProps
  extends Omit<ComponentProps<typeof Link>, "onClick"> {
  linkType: LinkType;
  location: string;
  children: ReactNode;
}

export function TrackedOutboundLink({
  href,
  linkType,
  location,
  children,
  ...props
}: TrackedOutboundLinkProps) {
  const handleClick = () => {
    const url = typeof href === "string" ? href : href.toString();
    trackOutboundLinkClicked(url, linkType, location);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
