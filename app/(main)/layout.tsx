import type React from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-32 pb-20">{children}</main>
      <Footer />
    </>
  );
}
