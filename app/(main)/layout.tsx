import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/server";
import { queries } from "@/lib/queries";
import { PrefetchWrapper } from "@/components/prefetch-wrapper";
import { Container } from "@/components/ui/container";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const prefetchQueries = [queries.profile.get(supabase)];
  return (
    <PrefetchWrapper queries={prefetchQueries}>
      <div className='flex flex-col min-h-screen'>
        <SiteHeader />
        <main className='grow'>
          <Container className='py-24 lg:py-32'>{children}</Container>
        </main>
        <Toaster />
        <SiteFooter />
      </div>
    </PrefetchWrapper>
  );
}
