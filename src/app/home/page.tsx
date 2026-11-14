
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { DashboardContent } from '@/components/dashboard/dashboard-content';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/home');
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .single();

  if (!profile?.username) {
    redirect('/onboarding');
  }

  return (
    <MainLayout>
      <DashboardContent userId={user.id} />
    </MainLayout>
  );
}
