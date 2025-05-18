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
import { ResetAllProgressButton } from "@/components/profile/reset-all-progress-button";
import { ProfileForm } from "@/components/profile/profile-form";

export async function generateMetadata() {
  return {
    title: "Profile - Kubeasy",
  };
}

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

  return (
    <Container className='py-12 md:py-24 lg:py-32'>
      <ProfileHeader user={user} />
      <div className='mx-auto mt-12 max-w-4xl flex flex-col gap-8'>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your profile settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm />
          </CardContent>
        </Card>
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
                <PrefetchWrapper queries={[queries.apiToken.list(supabase)]}>
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
        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>Be careful with these actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResetAllProgressButton />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
