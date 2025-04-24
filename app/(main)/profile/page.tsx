import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProfileHeader } from "@/components/profile/profile-header";
import { Suspense } from "react";
import { ApiTokensList } from "@/components/profile/api-tokens-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PrefetchWrapper } from "@/components/prefetch-wrapper";
import { queries } from "@/lib/queries";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { CreateApiTokenForm } from "@/components/profile/create-api-token-form";

export default async function Profile() {
  const supabase = await createClient();
  const {
    error,
    data: { user },
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Authentication error:", error);
    redirect("/login");
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = user.user_metadata?.full_name || "Anonymous User";

  const prefetchedQueries = [queries.apiTokens.list(supabase)];

  return (
    <Container className='py-12 md:py-24 lg:py-32'>
      <ProfileHeader avatarUrl={avatarUrl} fullName={fullName} email={user.email || ""} />
      <div className='mx-auto mt-12 max-w-4xl flex flex-col gap-8'>
        <Dialog>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='flex flex-col gap-1'>
                  <CardTitle>API Tokens</CardTitle>
                  <CardDescription>Create and manage your API tokens. These tokens can be used to authenticate with the CLI tool.</CardDescription>
                </div>
                <DialogTrigger asChild>
                  <Button variant='default' size='icon'>
                    <PlusIcon />
                  </Button>
                </DialogTrigger>
              </div>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Loading />}>
                <PrefetchWrapper queries={prefetchedQueries}>
                  <ApiTokensList />
                </PrefetchWrapper>
              </Suspense>
            </CardContent>
          </Card>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Api Token</DialogTitle>
            </DialogHeader>
            <CreateApiTokenForm />
          </DialogContent>
        </Dialog>
      </div>
    </Container>
  );
}
