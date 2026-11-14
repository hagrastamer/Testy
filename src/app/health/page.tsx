
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { HealthContent } from '@/components/health/health-content';

export default async function HealthPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/health');
  }

  return (
    <MainLayout>
      <HealthContent userId={user.id} />
    </MainLayout>
  );
}
