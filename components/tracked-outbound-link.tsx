"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";
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
  const resolvedUrl = useMemo(() => {
    if (typeof href === "string") return href;
    const { pathname = "", query, hash = "" } = href;
    let queryString = "";
    if (query) {
      if (typeof query === "string") {
        queryString = query.startsWith("?") ? query : `?${query}`;
      } else {
        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
          if (value != null) {
            if (Array.isArray(value)) {
              for (const v of value) {
                params.append(key, String(v));
              }
            } else {
              params.append(key, String(value));
            }
          }
        });
        const qs = params.toString();
        queryString = qs ? `?${qs}` : "";
      }
    }
    return `${pathname}${queryString}${hash}`;
  }, [href]);

  const handleClick = () => {
    trackOutboundLinkClicked(resolvedUrl, linkType, location);
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
