import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/toaster";
import { Container } from "@/components/ui/container";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <React.Fragment>
      <SiteHeader />
      <main>
        <Container className='py-16'>{children}</Container>
      </main>
      <Toaster />
      <SiteFooter />
    </React.Fragment>
  );
}
