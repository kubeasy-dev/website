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
import { EmailPreferencesList } from "@/components/profile/email-preferences-list";
import { ProfileSidebarNav } from "@/components/profile/profile-sidebar-nav";

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
    <Container className='py-12 md:py-24 lg:py-32 space-y-8'>
      <ProfileHeader user={user} />
      <div className='w-full max-w-5xl mx-auto flex gap-8'>
        <aside className='hidden md:flex flex-col min-w-[180px] sticky top-32 self-start'>
          <ProfileSidebarNav
            sections={[
              { id: "profile", label: "Profile" },
              { id: "api-tokens", label: "API Tokens" },
              { id: "email-preferences", label: "Email Preferences" },
              { id: "danger-zone", label: "Danger Zone" },
            ]}
          />
        </aside>
        <div className='flex-1 flex flex-col gap-8'>
          <Card id='profile'>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your profile settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
          <Dialog>
            <Card id='api-tokens'>
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
          <Card id='email-preferences'>
            <CardHeader>
              <CardTitle>Email Preferences</CardTitle>
              <CardDescription>Manage your email preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Loading />}>
                <PrefetchWrapper queries={[queries.emailSubscriptions.list(supabase)]}>
                  <EmailPreferencesList />
                </PrefetchWrapper>
              </Suspense>
            </CardContent>
          </Card>
          <Card id='danger-zone'>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Be careful with these actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResetAllProgressButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
