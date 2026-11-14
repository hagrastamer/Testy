
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { SubscriptionContent } from '@/components/subscription/subscription-content';

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Allow both authenticated and unauthenticated users to view pricing
  return (
    <MainLayout>
      <SubscriptionContent userId={user?.id || null} />
    </MainLayout>
  );
}
