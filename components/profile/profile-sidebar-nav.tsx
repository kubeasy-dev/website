"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ProfileSidebarNavProps = {
  sections: Array<{
    id: string;
    label: string;
  }>;
};

export function ProfileSidebarNav({ sections }: ProfileSidebarNavProps) {
  const [currentSection, setCurrentSection] = useState<string | null>(sections[0]?.id ?? null);

  useEffect(() => {
    const handleScroll = () => {
      let found = sections[0]?.id;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            found = section.id;
          }
        }
      }
      setCurrentSection(found);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <nav className='flex flex-col gap-2 w-full text-right'>
      {sections.map((section) => (
        <Link
          key={section.id}
          href={`#${section.id}`}
          scroll={true}
          className={cn("px-4 py-2 rounded-md transition-colors text-sm font-medium", currentSection === section.id ? "bg-primary text-primary-foreground" : "hover:bg-muted hover:text-foreground")}
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
